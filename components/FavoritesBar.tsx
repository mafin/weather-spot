'use client';

import { FavoriteLocation } from '@/types/weather';

interface FavoritesBarProps {
  favorites: FavoriteLocation[];
  onSelect: (name: string) => void;
  onRemove: (id: string) => void;
}

export default function FavoritesBar({ favorites, onSelect, onRemove }: FavoritesBarProps) {
  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">Favorite Locations</h3>
      <div className="flex flex-wrap gap-2">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="group flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <button
              onClick={() => onSelect(fav.name)}
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              {fav.name}, {fav.country}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(fav.id);
              }}
              className="text-gray-400 hover:text-red-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
