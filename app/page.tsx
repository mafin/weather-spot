'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import CurrentWeather from '@/components/CurrentWeather';
import ForecastCard from '@/components/ForecastCard';
import FavoritesBar from '@/components/FavoritesBar';
import { WeatherResponse, GeocodingResult, FavoriteLocation } from '@/types/weather';
import { getWeather } from '@/lib/weather-api';
import { getFavorites, addFavorite, removeFavorite, isFavorite as checkIsFavorite } from '@/lib/local-storage';

export default function Home() {
  const [currentWeather, setCurrentWeather] = useState<WeatherResponse | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeocodingResult | null>(null);
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    if (currentLocation) {
      const locationId = `${currentLocation.latitude},${currentLocation.longitude}`;
      setIsFavorite(checkIsFavorite(locationId));
    }
  }, [currentLocation]);

  const handleSearch = async (city: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { weather, location } = await getWeather(city);
      setCurrentWeather(weather);
      setCurrentLocation(location);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setCurrentWeather(null);
      setCurrentLocation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!currentLocation) return;

    const locationId = `${currentLocation.latitude},${currentLocation.longitude}`;

    if (isFavorite) {
      removeFavorite(locationId);
      setIsFavorite(false);
    } else {
      const newFavorite: FavoriteLocation = {
        id: locationId,
        name: currentLocation.name,
        country: currentLocation.country,
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
      };
      addFavorite(newFavorite);
      setIsFavorite(true);
    }

    setFavorites(getFavorites());
  };

  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id);
    setFavorites(getFavorites());

    if (currentLocation) {
      const currentLocationId = `${currentLocation.latitude},${currentLocation.longitude}`;
      if (currentLocationId === id) {
        setIsFavorite(false);
      }
    }
  };

  // Get daily forecasts (skip today, show next 5 days)
  const getDailyForecasts = () => {
    if (!currentWeather?.daily) return [];

    const { time, weather_code, temperature_2m_max, temperature_2m_min } = currentWeather.daily;

    return time.slice(1, 6).map((date, index) => ({
      date,
      weatherCode: weather_code[index + 1],
      tempMax: temperature_2m_max[index + 1],
      tempMin: temperature_2m_min[index + 1],
    }));
  };

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
              onSelect={handleSearch}
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

          {currentWeather && getDailyForecasts().length > 0 && (
            <div className="w-full max-w-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                5-day forecast
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {getDailyForecasts().map((item, index) => (
                  <ForecastCard
                    key={index}
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
