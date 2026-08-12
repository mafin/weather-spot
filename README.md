# WeatherSpot

Modern weather dashboard built with Next.js 16, React 19, TypeScript and Tailwind CSS. Get current weather conditions and 5-day forecasts for any location using the free Open-Meteo API.

## Features

- **Current Weather**: Real-time temperature, humidity, wind speed, and atmospheric pressure
- **5-Day Forecast**: Daily weather predictions with min/max temperatures and conditions
- **City Search**: Find weather for any location worldwide
- **Favorites**: Save your favorite locations for quick access (stored in localStorage)
- **No API Key Required**: Uses the free Open-Meteo API with no registration needed
- **Docker Ready**: Containerized deployment with docker-compose

## Requirements

- **Node.js 20.9 or newer** (the Docker image ships Node 24)
- npm (the repo is npm-based and ships a `package-lock.json`)

No API key or registration is needed — Open-Meteo is open access.

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker

```bash
# Build and run with docker-compose
docker-compose up -d

# Rebuild after changes
docker-compose up --build -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f weatherspot
```

The app runs on [http://localhost:3000](http://localhost:3000)

The image is a multi-stage build on `node:24.19.0-alpine` and runs as the non-root
`nextjs` user against Next.js standalone output.

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Linting and types

```bash
# ESLint
npm run lint

# TypeScript (no emit)
npx tsc --noEmit
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Language**: TypeScript 5
- **Testing**: Jest 30, React Testing Library
- **Linting**: ESLint 9 with `eslint-config-next`
- **API**: Open-Meteo (Geocoding + Weather Forecast)
- **Storage**: localStorage for favorites, read via `useSyncExternalStore`
- **Container**: Docker multi-stage build on Node 24 Alpine

> ESLint is intentionally held at 9.x. `eslint-plugin-react`, which
> `eslint-config-next` depends on, does not yet support ESLint 10 and crashes on it.

## Project Structure

```
app/
  page.tsx              # Main dashboard component
  layout.tsx            # Root layout with metadata
components/
  SearchBar.tsx         # City search form
  CurrentWeather.tsx    # Current conditions card
  ForecastCard.tsx      # Individual forecast day card
  FavoritesBar.tsx      # Saved locations list
  __tests__/            # Component tests
lib/
  weather-api.ts        # Open-Meteo API client
  local-storage.ts      # localStorage utilities + favorites store
  __tests__/            # Unit tests
types/
  weather.ts            # TypeScript type definitions
  jest-dom.d.ts         # Pulls jest-dom matcher types into the TS program
```

## How It Works

1. **Search**: Enter a city name → Geocoding API finds coordinates
2. **Fetch**: Coordinates → Weather Forecast API returns current + daily data
3. **Display**: Weather codes interpreted into human-readable conditions with emoji
4. **Save**: Click ⭐ to save locations to localStorage

A few details worth knowing:

- **Favorites skip geocoding.** Saved locations already carry their exact
  coordinates, so selecting one goes straight to the forecast endpoint. This is both
  faster and avoids re-resolving a name to a different city than the one you saved.
- **Searches are abortable.** Each lookup cancels the previous one, so a slow earlier
  response can never overwrite a newer result.
- **Favorites are a subscribed store.** `useSyncExternalStore` reads localStorage
  without breaking hydration on the statically prerendered page, and keeps the
  favorites bar and the ⭐ toggle in sync from a single source — including across tabs.

## API Details

WeatherSpot uses two Open-Meteo endpoints:

- **Geocoding**: `https://geocoding-api.open-meteo.com/v1/search`
- **Weather**: `https://api.open-meteo.com/v1/forecast`

Both are free, unlimited, and require no authentication.

## License

MIT

---

Built with Next.js and powered by Open-Meteo