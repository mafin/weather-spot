# Kubernetes deployment

Manifests for running WeatherSpot in a home lab cluster.

## What is here

| File | Purpose |
|---|---|
| `namespace.yaml` | Namespace, labelled for the `restricted` Pod Security Standard |
| `deployment.yaml` | 2 replicas, hardened pod, health probes |
| `service.yaml` | ClusterIP, port 80 → 3000 |
| `ingress.yaml` | Host routing via Traefik, TLS block ready to uncomment |
| `poddisruptionbudget.yaml` | Keeps 1 pod up while draining a node |
| `networkpolicy.yaml` | Default-deny plus the minimum the app needs (enforced on k3s) |
| `cloudflared.yaml` | Cloudflare Tunnel connector, publishes the app to the internet |
| `hpa.yaml` | CPU autoscaling, 2–6 replicas (needs metrics-server) |
| `kustomization.yaml` | Ties it together, lets you swap the image tag |

## Before you start

The app is stateless and needs **no secrets, no ConfigMap and no database** — the
Open-Meteo API takes no key, so there is nothing to configure before deploying.

The image lives in a public Docker Hub repo, so **there is nothing to prepare**:
k3s pulls `docker.io/mafin/weather-spot:latest` on its own. No pull secret, no
side-loading onto the nodes, no local registry.

To publish a new build:

```bash
# from the repository root
docker build -t mafin/weather-spot:latest .
docker push mafin/weather-spot:latest
```

`kustomization.yaml` is the single place that decides which image is pulled, so to
move to a pinned version later:

```bash
cd k8s
kustomize edit set image weatherspot=docker.io/mafin/weather-spot:0.2.0
```

## Deploy

```bash
# from the repository root
kubectl apply -k ./k8s

# watch it come up
kubectl -n weatherspot rollout status deployment/weatherspot
kubectl -n weatherspot get pods,svc,ingress
```

Reach it without an ingress controller:

```bash
kubectl -n weatherspot port-forward svc/weatherspot 8080:80
# then open http://localhost:8080
```

## Things you will probably need to change

**Ingress host.** `weatherspot.homelab.lan` is a placeholder. Set your own host and
make sure it resolves to the ingress controller — either in your DNS (Pi-hole,
AdGuard, router) or in `/etc/hosts`.

**Ingress class.** Set to `traefik` for k3s. Verify the class actually exists:

```bash
kubectl get ingressclass
```

If nothing named `traefik` comes back, delete the `ingressClassName` line — Traefik
on k3s also serves Ingresses that declare no class.

**HPA.** Requires metrics-server. k3s does **not** bundle it, so unless you
installed it yourself the HPA will report an unknown metric and never scale — delete
`hpa.yaml` and remove it from `kustomization.yaml`.

**NetworkPolicy is enforced on k3s.** k3s ships an embedded network policy
controller (kube-router's netpol library) and enforces policies out of the box,
unless the server runs with `--disable-network-policy`. These manifests are
therefore live rules, not decoration: the app pods accept traffic only from Traefik
in `kube-system` and from the `cloudflared` pods, and nothing else. Move or replace
either component and you must fix the selector, or that path goes dark. To debug,
temporarily delete `weatherspot-default-deny`.

## Public access via Cloudflare Tunnel

The app is published at **https://weather.box325.cz** through a Cloudflare Tunnel.
`cloudflared` dials *out* to Cloudflare's edge and traffic returns down that
connection, so there is **no port forwarding, no public IP and no inbound firewall
rule** on your network. TLS terminates at Cloudflare's edge; inside the cluster the
traffic is plain HTTP.

Traefik is not involved in the public path — the tunnel talks straight to the
Service. The `weatherspot.homelab.lan` Ingress keeps working for LAN access,
independently.

```
internet → Cloudflare edge → tunnel → cloudflared pod → Service → app pod
LAN      → Traefik         → Service → app pod
```

### 1. Create the tunnel

In the [Zero Trust dashboard](https://one.dash.cloudflare.com/) go to
**Networks → Tunnels → Create a tunnel**, pick **Cloudflared**, name it (e.g.
`homelab`), and copy the token from the install command it shows. You do not need to
run that command — the Deployment does the same job.

### 2. Store the token

The token is a credential. Create the Secret yourself and do not commit it:

```bash
kubectl -n weatherspot create secret generic cloudflared-token \
  --from-literal=token='YOUR-TUNNEL-TOKEN'
```

The name `cloudflared-token` and key `token` are what `cloudflared.yaml` expects.

### 3. Route the hostname

Still in the tunnel's config, add a **Public Hostname**:

| Field | Value |
|---|---|
| Subdomain | `weather` |
| Domain | `box325.cz` |
| Type | `HTTP` |
| URL | `weatherspot.weatherspot.svc.cluster.local:80` |

`HTTP` is correct — TLS is already terminated at the edge, and the Service speaks
plain HTTP. Cloudflare creates the `weather` DNS record for you; there is nothing to
add in the DNS tab by hand.

### 4. Deploy and check

```bash
kubectl apply -k ./k8s
kubectl -n weatherspot rollout status deployment/cloudflared
curl -sS -o /dev/null -w "%{http_code}\n" https://weather.box325.cz/
```

`/ready` on port 2000 returns 200 only while a tunnel connection is actually
established, so a pod reaching `Ready` means the tunnel is genuinely up:

```bash
kubectl -n weatherspot logs -l app.kubernetes.io/name=cloudflared --tail=20
```

### If the public URL does not work

| Symptom | Cause |
|---|---|
| cloudflared pods never become Ready | Bad or missing token — check the Secret and the pod logs |
| Cloudflare error 1033 | Tunnel is not connected; the connector is down |
| Cloudflare error 502 | Tunnel is up but cannot reach the origin — wrong Service URL, or the NetworkPolicy is blocking it |
| `ImagePullBackOff` on cloudflared | Tag `2026.7.3` no longer exists; pick a current one |

A 502 is almost always one of those two. Confirm the origin is reachable from inside
the tunnel's namespace:

```bash
kubectl -n weatherspot run neterr --rm -it --image=curlimages/curl --restart=Never \
  -- curl -sS -o /dev/null -w "%{http_code}\n" http://weatherspot.weatherspot.svc.cluster.local:80
```

Note that this debug pod is **not** allowed by the NetworkPolicy, so a failure here
does not by itself prove the origin is broken — it proves the policy works. To test
the real path, exec into a cloudflared pod instead.

## If the image will not pull

```bash
kubectl -n weatherspot describe pod -l app.kubernetes.io/name=weatherspot | tail -20
```

The `Events` section names the cause:

| Message | Cause |
|---|---|
| `repository does not exist` / `pull access denied` | Image path typo, or the repo was flipped to private — Docker Hub reports both the same way |
| `manifest unknown` | The tag was never pushed |
| `toomanyrequests` | Docker Hub anonymous pull rate limit. Rare in a home lab, but `imagePullPolicy: Always` pulls on every pod start |

Check what is actually being requested:

```bash
kubectl -n weatherspot get deploy weatherspot -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
```

## Notes on the choices

**The pod needs no outbound internet access.** Every Open-Meteo call happens in the
browser, because the whole UI is client components. The egress policy therefore only
opens DNS. If you ever move a fetch server-side, you must widen it or the call will
hang.

**`readOnlyRootFilesystem: true` is safe here.** This was verified by running the
image with a read-only root: the Next.js standalone server starts and serves fine
with only `/tmp` writable, so that is the sole `emptyDir`. Adding server-side
rendering with caching later may require a writable `.next/cache` volume.

**Probes hit `/`.** That route is statically prerendered, so probing it is cheap and
does not touch the weather API. There is no dedicated `/healthz` endpoint; add one if
you want probes fully decoupled from the UI route.

**No CPU limit.** Requests are set but CPU is deliberately unlimited — throttling a
web server only adds latency. Add one if your cluster policy demands it.

**The tunnel makes this genuinely public.** Anyone who finds the hostname can load
it — there is no authentication. That is fine for this app: it stores nothing
server-side, has no login, and favourites live in the visitor's own browser. If you
later put something less harmless behind the same tunnel, gate it with Cloudflare
Access rather than assuming obscurity. Cloudflare's proxy also gives you WAF and
rate limiting on the way in.

**cloudflared is pinned, unlike the app image.** It is the one component directly
exposed to the internet, so an upgrade should be a decision rather than something
that happens on a pod restart.

**`:latest` forces `imagePullPolicy: Always`.** A moving tag and `IfNotPresent` are a
bad pair: a node that already cached the layer would keep serving the old build after
you push a new one. `Always` avoids that, at the cost of a registry round-trip per pod
start.

The bigger catch is that pushing a new `:latest` does **not** restart anything —
nothing in the Deployment changed, so Kubernetes has no reason to act. Roll it
manually:

```bash
kubectl -n weatherspot rollout restart deployment/weatherspot
```

Pinning real version tags (`0.2.0`, `0.3.0`) removes both problems: `kustomize edit
set image` changes the pod spec, which triggers a rollout on its own, and it tells you
exactly which build is running. Worth doing once this stops being a toy.

**UID 1001** in the pod security context matches the `nextjs` user created in the
Dockerfile. If you change the Dockerfile user, change it here too or the pod will
fail to start under `runAsNonRoot`.

## Uninstall

```bash
kubectl delete -k ./k8s
```
