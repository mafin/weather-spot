'use client';

import { WeatherResponse, GeocodingResult } from '@/types/weather';
import { interpretWeatherCode } from '@/lib/weather-api';

interface CurrentWeatherProps {
  data: WeatherResponse;
  location: GeocodingResult;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

export default function CurrentWeather({ data, location, onToggleFavorite, isFavorite }: CurrentWeatherProps) {
  if (!data.current) {
    return null;
  }

  const current = data.current;
  const weatherInfo = interpretWeatherCode(current.weather_code);

  return (
    <div className="w-full max-w-2xl bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-4xl font-bold">{location.name}</h2>
          <p className="text-blue-100">{location.country}</p>
        </div>
        <button
          onClick={onToggleFavorite}
          className="text-3xl hover:scale-110 transition-transform"
          title={isFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="text-6xl mr-4">{weatherInfo.icon}</div>
          <div>
            <div className="text-6xl font-bold">{Math.round(current.temperature_2m)}°C</div>
            <div className="text-xl capitalize">{weatherInfo.description}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-blue-400">
        <div>
          <p className="text-blue-100 text-sm">Pocitová</p>
          <p className="text-2xl font-semibold">{Math.round(current.apparent_temperature)}°C</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm">Vlhkost</p>
          <p className="text-2xl font-semibold">{current.relative_humidity_2m}%</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm">Vítr</p>
          <p className="text-2xl font-semibold">{Math.round(current.wind_speed_10m)} km/h</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm">Tlak</p>
          <p className="text-2xl font-semibold">{Math.round(current.pressure_msl)} hPa</p>
        </div>
      </div>
    </div>
  );
}
