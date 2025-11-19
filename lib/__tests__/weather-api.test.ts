import { interpretWeatherCode, searchCity, getWeatherByCoordinates } from '../weather-api';

describe('weather-api', () => {
  describe('interpretWeatherCode', () => {
    it('should return correct interpretation for clear sky', () => {
      const result = interpretWeatherCode(0);
      expect(result).toEqual({ description: 'Clear sky', icon: '☀️' });
    });

    it('should return correct interpretation for partly cloudy', () => {
      const result = interpretWeatherCode(2);
      expect(result).toEqual({ description: 'Partly cloudy', icon: '⛅' });
    });

    it('should return correct interpretation for moderate rain', () => {
      const result = interpretWeatherCode(63);
      expect(result).toEqual({ description: 'Moderate rain', icon: '🌧️' });
    });

    it('should return correct interpretation for thunderstorm', () => {
      const result = interpretWeatherCode(95);
      expect(result).toEqual({ description: 'Thunderstorm', icon: '⛈️' });
    });

    it('should return unknown for unrecognized code', () => {
      const result = interpretWeatherCode(999);
      expect(result).toEqual({ description: 'Unknown', icon: '❓' });
    });
  });

  describe('searchCity', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return cities when search is successful', async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            name: 'Prague',
            latitude: 50.0880,
            longitude: 14.4208,
            country: 'Czechia',
            admin1: 'Prague'
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await searchCity('Prague');

      expect(result).toEqual(mockResponse.results);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('geocoding-api.open-meteo.com')
      );
    });

    it('should throw error when API request fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(searchCity('InvalidCity')).rejects.toThrow('Error searching for city');
    });

    it('should throw error when no results found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      await expect(searchCity('NonexistentCity')).rejects.toThrow('City not found');
    });
  });

  describe('getWeatherByCoordinates', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return weather data when request is successful', async () => {
      const mockWeatherData = {
        current: {
          temperature_2m: 20,
          relative_humidity_2m: 65,
          apparent_temperature: 18,
          weather_code: 0,
          wind_speed_10m: 10,
          wind_direction_10m: 180,
          pressure_msl: 1013
        },
        daily: {
          time: ['2024-01-01', '2024-01-02'],
          weather_code: [0, 1],
          temperature_2m_max: [22, 23],
          temperature_2m_min: [15, 16],
          precipitation_sum: [0, 0],
          wind_speed_10m_max: [12, 14]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData
      });

      const result = await getWeatherByCoordinates(50.08, 14.42);

      expect(result).toEqual(mockWeatherData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.open-meteo.com')
      );
    });

    it('should throw error when weather API request fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(getWeatherByCoordinates(50.08, 14.42)).rejects.toThrow('Error loading weather');
    });
  });
});