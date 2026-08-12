'use client';

import { useState, useEffect, useRef, useMemo, useCallback, useSyncExternalStore } from 'react';
import SearchBar from '@/components/SearchBar';
import CurrentWeather from '@/components/CurrentWeather';
import ForecastCard from '@/components/ForecastCard';
import FavoritesBar from '@/components/FavoritesBar';
import { WeatherResponse, SelectedLocation, FavoriteLocation } from '@/types/weather';
import { getWeather, getWeatherByCoordinates } from '@/lib/weather-api';
import {
  addFavorite,
  removeFavorite,
  subscribeToFavorites,
  getFavoritesSnapshot,
  getFavoritesServerSnapshot,
} from '@/lib/local-storage';

export default function Home() {
  const [currentWeather, setCurrentWeather] = useState<WeatherResponse | null>(null);
  const [currentLocation, setCurrentLocation] = useState<SelectedLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRequest = useRef<AbortController | null>(null);

  const favorites = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesSnapshot,
    getFavoritesServerSnapshot
  );

  // Derived from favorites, so it never needs to be synced in an effect
  const currentLocationId = currentLocation
    ? `${currentLocation.latitude},${currentLocation.longitude}`
    : null;
  const isFavorite = favorites.some(fav => fav.id === currentLocationId);

  // Abort any in-flight lookup so a slow earlier response cannot overwrite a newer one
  useEffect(() => () => pendingRequest.current?.abort(), []);

  const runLookup = useCallback(
    async (
      lookup: (signal: AbortSignal) => Promise<{ weather: WeatherResponse; location: SelectedLocation }>
    ) => {
      pendingRequest.current?.abort();
      const controller = new AbortController();
      pendingRequest.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const { weather, location } = await lookup(controller.signal);
        if (controller.signal.aborted) return;
        setCurrentWeather(weather);
        setCurrentLocation(location);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setCurrentWeather(null);
        setCurrentLocation(null);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(
    (city: string) => runLookup((signal) => getWeather(city, signal)),
    [runLookup]
  );

  // Favorites already carry exact coordinates, so skip the geocoding round-trip
  const handleSelectFavorite = useCallback(
    (fav: FavoriteLocation) =>
      runLookup(async (signal) => ({
        weather: await getWeatherByCoordinates(fav.lat, fav.lon, signal),
        location: { name: fav.name, country: fav.country, latitude: fav.lat, longitude: fav.lon },
      })),
    [runLookup]
  );

  const handleToggleFavorite = () => {
    if (!currentLocation || !currentLocationId) return;

    if (isFavorite) {
      removeFavorite(currentLocationId);
      return;
    }

    addFavorite({
      id: currentLocationId,
      name: currentLocation.name,
      country: currentLocation.country,
      lat: currentLocation.latitude,
      lon: currentLocation.longitude,
    });
  };

  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id);
  };

  // Get daily forecasts (skip today, show next 5 days)
  const dailyForecasts = useMemo(() => {
    if (!currentWeather?.daily) return [];

    const { time, weather_code, temperature_2m_max, temperature_2m_min } = currentWeather.daily;

    return time.slice(1, 6).map((date, index) => ({
      date,
      weatherCode: weather_code[index + 1],
      tempMax: temperature_2m_max[index + 1],
      tempMin: temperature_2m_min[index + 1],
    }));
  }, [currentWeather]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            Weather Dashboard
          </h1>
          <p className="text-gray-600">
            Search for a city to get current weather and forecast
          </p>
        </header>

        <div className="flex flex-col items-center gap-6">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />

          {favorites.length > 0 && (
            <FavoritesBar
              favorites={favorites}
              onSelect={handleSelectFavorite}
              onRemove={handleRemoveFavorite}
            />
          )}

          {error && (
            <div className="w-full max-w-2xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {currentWeather && currentLocation && (
            <CurrentWeather
              data={currentWeather}
              location={currentLocation}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite}
            />
          )}

          {currentWeather && dailyForecasts.length > 0 && (
            <div className="w-full max-w-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                5-day forecast
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {dailyForecasts.map((item) => (
                  <ForecastCard
                    key={item.date}
                    date={item.date}
                    tempMax={item.tempMax}
                    tempMin={item.tempMin}
                    weatherCode={item.weatherCode}
                  />
                ))}
              </div>
            </div>
          )}

          {!currentWeather && !isLoading && !error && (
            <div className="text-center text-gray-500 mt-12">
              <p className="text-xl">
                Start by searching for a city to get weather 🌤️
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
