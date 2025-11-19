'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import CurrentWeather from '@/components/CurrentWeather';
import ForecastCard from '@/components/ForecastCard';
import FavoritesBar from '@/components/FavoritesBar';
import { WeatherData, ForecastData, FavoriteLocation } from '@/types/weather';
import { getCurrentWeather, getForecast } from '@/lib/weather-api';
import { getFavorites, addFavorite, removeFavorite, isFavorite as checkIsFavorite } from '@/lib/local-storage';

export default function Home() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    if (currentWeather) {
      const locationId = `${currentWeather.coord.lat},${currentWeather.coord.lon}`;
      setIsFavorite(checkIsFavorite(locationId));
    }
  }, [currentWeather]);

  const handleSearch = async (city: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(city),
        getForecast(city),
      ]);

      setCurrentWeather(weatherData);
      setForecast(forecastData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Něco se pokazilo');
      setCurrentWeather(null);
      setForecast(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!currentWeather) return;

    const locationId = `${currentWeather.coord.lat},${currentWeather.coord.lon}`;

    if (isFavorite) {
      removeFavorite(locationId);
      setIsFavorite(false);
    } else {
      const newFavorite: FavoriteLocation = {
        id: locationId,
        name: currentWeather.name,
        country: currentWeather.sys.country,
        lat: currentWeather.coord.lat,
        lon: currentWeather.coord.lon,
      };
      addFavorite(newFavorite);
      setIsFavorite(true);
    }

    setFavorites(getFavorites());
  };

  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id);
    setFavorites(getFavorites());

    if (currentWeather) {
      const currentLocationId = `${currentWeather.coord.lat},${currentWeather.coord.lon}`;
      if (currentLocationId === id) {
        setIsFavorite(false);
      }
    }
  };

  // Get daily forecasts (one per day at noon)
  const getDailyForecasts = () => {
    if (!forecast) return [];

    const dailyData = forecast.list.filter(item => {
      const hour = new Date(item.dt_txt).getHours();
      return hour === 12; // Noon forecasts
    }).slice(0, 5);

    return dailyData;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            Počasí Dashboard
          </h1>
          <p className="text-gray-600">
            Vyhledej město a zjisti aktuální počasí a předpověď
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

          {currentWeather && (
            <CurrentWeather
              data={currentWeather}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite}
            />
          )}

          {forecast && getDailyForecasts().length > 0 && (
            <div className="w-full max-w-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                5-denní předpověď
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {getDailyForecasts().map((item, index) => (
                  <ForecastCard
                    key={index}
                    date={item.dt_txt}
                    temp={item.main.temp}
                    tempMin={item.main.temp_min}
                    tempMax={item.main.temp_max}
                    description={item.weather[0].description}
                    icon={item.weather[0].icon}
                  />
                ))}
              </div>
            </div>
          )}

          {!currentWeather && !isLoading && !error && (
            <div className="text-center text-gray-500 mt-12">
              <p className="text-xl">
                Začni vyhledáním města a zjisti počasí 🌤️
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
