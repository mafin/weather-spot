import { getFavorites, addFavorite, removeFavorite, isFavorite } from '../local-storage';
import { FavoriteLocation } from '@/types/weather';

describe('local-storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getFavorites', () => {
    it('should return empty array when no favorites stored', () => {
      expect(getFavorites()).toEqual([]);
    });

    it('should return stored favorites', () => {
      const mockFavorites: FavoriteLocation[] = [
        { id: '50.08,14.42', name: 'Prague', country: 'Czechia', lat: 50.08, lon: 14.42 }
      ];
      localStorage.setItem('weather-favorites', JSON.stringify(mockFavorites));

      expect(getFavorites()).toEqual(mockFavorites);
    });
  });

  describe('addFavorite', () => {
    it('should add a new favorite location', () => {
      const location: FavoriteLocation = {
        id: '50.08,14.42',
        name: 'Prague',
        country: 'Czechia',
        lat: 50.08,
        lon: 14.42
      };

      addFavorite(location);
      const favorites = getFavorites();

      expect(favorites).toHaveLength(1);
      expect(favorites[0]).toEqual(location);
    });

    it('should not add duplicate favorite', () => {
      const location: FavoriteLocation = {
        id: '50.08,14.42',
        name: 'Prague',
        country: 'Czechia',
        lat: 50.08,
        lon: 14.42
      };

      addFavorite(location);
      addFavorite(location);

      expect(getFavorites()).toHaveLength(1);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite by id', () => {
      const location: FavoriteLocation = {
        id: '50.08,14.42',
        name: 'Prague',
        country: 'Czechia',
        lat: 50.08,
        lon: 14.42
      };

      addFavorite(location);
      expect(getFavorites()).toHaveLength(1);

      removeFavorite('50.08,14.42');
      expect(getFavorites()).toHaveLength(0);
    });

    it('should not affect other favorites when removing', () => {
      const location1: FavoriteLocation = {
        id: '50.08,14.42',
        name: 'Prague',
        country: 'Czechia',
        lat: 50.08,
        lon: 14.42
      };
      const location2: FavoriteLocation = {
        id: '51.51,-0.13',
        name: 'London',
        country: 'UK',
        lat: 51.51,
        lon: -0.13
      };

      addFavorite(location1);
      addFavorite(location2);
      removeFavorite('50.08,14.42');

      const favorites = getFavorites();
      expect(favorites).toHaveLength(1);
      expect(favorites[0].id).toBe('51.51,-0.13');
    });
  });

  describe('isFavorite', () => {
    it('should return false when location is not favorite', () => {
      expect(isFavorite('50.08,14.42')).toBe(false);
    });

    it('should return true when location is favorite', () => {
      const location: FavoriteLocation = {
        id: '50.08,14.42',
        name: 'Prague',
        country: 'Czechia',
        lat: 50.08,
        lon: 14.42
      };

      addFavorite(location);
      expect(isFavorite('50.08,14.42')).toBe(true);
    });
  });
});