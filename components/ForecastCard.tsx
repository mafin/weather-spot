'use client';

import { interpretWeatherCode } from '@/lib/weather-api';

interface ForecastCardProps {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
}

export default function ForecastCard({ date, tempMax, tempMin, weatherCode }: ForecastCardProps) {
  const weatherInfo = interpretWeatherCode(weatherCode);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    return `${days[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
      <p className="text-sm font-semibold text-gray-600 mb-2">{formatDate(date)}</p>
      <div className="flex flex-col items-center">
        <div className="text-5xl mb-2">{weatherInfo.icon}</div>
        <div className="text-2xl font-bold text-gray-800">
          {Math.round((tempMax + tempMin) / 2)}°C
        </div>
        <div className="text-xs text-gray-500">
          {Math.round(tempMin)}° / {Math.round(tempMax)}°
        </div>
        <p className="text-sm text-gray-600 text-center mt-2">{weatherInfo.description}</p>
      </div>
    </div>
  );
}
