'use client';

import Image from 'next/image';
import { WeatherData } from '@/types/weather';
import { getWeatherIconUrl } from '@/lib/weather-api';

interface CurrentWeatherProps {
  data: WeatherData;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

export default function CurrentWeather({ data, onToggleFavorite, isFavorite }: CurrentWeatherProps) {
  return (
    <div className="w-full max-w-2xl bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-4xl font-bold">{data.name}</h2>
          <p className="text-blue-100">{data.sys.country}</p>
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
          <Image
            src={getWeatherIconUrl(data.weather[0].icon)}
            alt={data.weather[0].description}
            width={100}
            height={100}
            className="w-24 h-24"
          />
          <div className="ml-4">
            <div className="text-6xl font-bold">{Math.round(data.main.temp)}°C</div>
            <div className="text-xl capitalize">{data.weather[0].description}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-blue-400">
        <div>
          <p className="text-blue-100 text-sm">Pocitová</p>
          <p className="text-2xl font-semibold">{Math.round(data.main.feels_like)}°C</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm">Vlhkost</p>
          <p className="text-2xl font-semibold">{data.main.humidity}%</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm">Vítr</p>
          <p className="text-2xl font-semibold">{Math.round(data.wind.speed * 3.6)} km/h</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm">Tlak</p>
          <p className="text-2xl font-semibold">{data.main.pressure} hPa</p>
        </div>
      </div>
    </div>
  );
}
