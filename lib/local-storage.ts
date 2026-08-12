import { FavoriteLocation } from '@/types/weather';

const FAVORITES_KEY = 'weather-favorites';

export function getFavorites(): FavoriteLocation[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(FAVORITES_KEY);
  if (!stored) return [];

  // Corrupted storage must not break the whole app on load
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addFavorite(location: FavoriteLocation): void {
  if (typeof window === 'undefined') return;

  const favorites = getFavorites();

  // Check if already exists
  if (favorites.some(fav => fav.id === location.id)) {
    return;
  }

  favorites.push(location);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  emitChange();
}

export function removeFavorite(id: string): void {
  if (typeof window === 'undefined') return;

  const favorites = getFavorites();
  const filtered = favorites.filter(fav => fav.id !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  emitChange();
}

export function isFavorite(id: string): boolean {
  const favorites = getFavorites();
  return favorites.some(fav => fav.id === id);
}

// --- useSyncExternalStore adapter ---------------------------------------
// Reading localStorage during render would desync hydration, and reading it in
// an effect means a setState cascade. useSyncExternalStore handles both, but it
// requires a snapshot that is referentially stable between renders, hence the cache.

const listeners = new Set<() => void>();
const EMPTY_FAVORITES: FavoriteLocation[] = [];
let snapshot: FavoriteLocation[] | null = null;

function emitChange(): void {
  snapshot = null;
  listeners.forEach(listener => listener());
}

export function subscribeToFavorites(listener: () => void): () => void {
  listeners.add(listener);
  // Keep other tabs in sync
  window.addEventListener('storage', emitChange);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', emitChange);
  };
}

export function getFavoritesSnapshot(): FavoriteLocation[] {
  snapshot ??= getFavorites();
  return snapshot;
}

export function getFavoritesServerSnapshot(): FavoriteLocation[] {
  return EMPTY_FAVORITES;
}
