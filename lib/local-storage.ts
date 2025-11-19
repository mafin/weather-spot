import { FavoriteLocation } from '@/types/weather';

const FAVORITES_KEY = 'weather-favorites';

export function getFavorites(): FavoriteLocation[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addFavorite(location: FavoriteLocation): void {
  const favorites = getFavorites();

  // Check if already exists
  if (favorites.some(fav => fav.id === location.id)) {
    return;
  }

  favorites.push(location);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function removeFavorite(id: string): void {
  const favorites = getFavorites();
  const filtered = favorites.filter(fav => fav.id !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

export function isFavorite(id: string): boolean {
  const favorites = getFavorites();
  return favorites.some(fav => fav.id === id);
}
