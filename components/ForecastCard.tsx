'use client';

import Image from 'next/image';
import { getWeatherIconUrl } from '@/lib/weather-api';

interface ForecastCardProps {
  date: string;
  temp: number;
  description: string;
  icon: string;
  tempMin: number;
  tempMax: number;
}

export default function ForecastCard({ date, temp, description, icon, tempMin, tempMax }: ForecastCardProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    return `${days[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
      <p className="text-sm font-semibold text-gray-600 mb-2">{formatDate(date)}</p>
      <div className="flex flex-col items-center">
        <Image
          src={getWeatherIconUrl(icon)}
          alt={description}
          width={64}
          height={64}
          className="w-16 h-16"
        />
        <div className="text-2xl font-bold text-gray-800">{Math.round(temp)}°C</div>
        <div className="text-xs text-gray-500">
          {Math.round(tempMin)}° / {Math.round(tempMax)}°
        </div>
        <p className="text-sm text-gray-600 text-center mt-2 capitalize">{description}</p>
      </div>
    </div>
  );
}
