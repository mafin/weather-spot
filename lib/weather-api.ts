import {
  GeocodingResponse,
  WeatherResponse,
  WeatherInterpretation,
  GeocodingResult
} from '@/types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export async function searchCity(query: string): Promise<GeocodingResult[]> {
  const response = await fetch(
    `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=10&language=cs&format=json`
  );

  if (!response.ok) {
    throw new Error('Chyba při vyhledávání města');
  }

  const data: GeocodingResponse = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('Město nenalezeno');
  }

  return data.results;
}

export async function getWeatherByCoordinates(
  lat: number,
  lon: number
): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
    timezone: 'auto',
    forecast_days: '7'
  });

  const response = await fetch(`${WEATHER_URL}?${params}`);

  if (!response.ok) {
    throw new Error('Chyba při načítání počasí');
  }

  return response.json();
}

export async function getWeather(cityName: string): Promise<{
  weather: WeatherResponse;
  location: GeocodingResult;
}> {
  const cities = await searchCity(cityName);
  const firstCity = cities[0];

  const weather = await getWeatherByCoordinates(
    firstCity.latitude,
    firstCity.longitude
  );

  return { weather, location: firstCity };
}

// WMO Weather interpretation codes
// https://open-meteo.com/en/docs
export function interpretWeatherCode(code: number): WeatherInterpretation {
  const interpretations: Record<number, WeatherInterpretation> = {
    0: { description: 'Jasno', icon: '☀️' },
    1: { description: 'Převážně jasno', icon: '🌤️' },
    2: { description: 'Polojasno', icon: '⛅' },
    3: { description: 'Oblačno', icon: '☁️' },
    45: { description: 'Mlha', icon: '🌫️' },
    48: { description: 'Námrazová mlha', icon: '🌫️' },
    51: { description: 'Lehké mrholení', icon: '🌦️' },
    53: { description: 'Mrholení', icon: '🌦️' },
    55: { description: 'Husté mrholení', icon: '🌧️' },
    56: { description: 'Lehké mrznoucí mrholení', icon: '🌧️' },
    57: { description: 'Mrznoucí mrholení', icon: '🌧️' },
    61: { description: 'Slabý déšť', icon: '🌧️' },
    63: { description: 'Déšť', icon: '🌧️' },
    65: { description: 'Silný déšť', icon: '⛈️' },
    66: { description: 'Lehký mrznoucí déšť', icon: '🌧️' },
    67: { description: 'Mrznoucí déšť', icon: '🌧️' },
    71: { description: 'Slabé sněžení', icon: '🌨️' },
    73: { description: 'Sněžení', icon: '❄️' },
    75: { description: 'Silné sněžení', icon: '❄️' },
    77: { description: 'Sněhové vločky', icon: '❄️' },
    80: { description: 'Slabé přeháňky', icon: '🌦️' },
    81: { description: 'Přeháňky', icon: '🌧️' },
    82: { description: 'Silné přeháňky', icon: '⛈️' },
    85: { description: 'Slabé sněhové přeháňky', icon: '🌨️' },
    86: { description: 'Sněhové přeháňky', icon: '❄️' },
    95: { description: 'Bouřka', icon: '⛈️' },
    96: { description: 'Bouřka s lehkým kroupami', icon: '⛈️' },
    99: { description: 'Bouřka s kroupami', icon: '⛈️' }
  };

  return interpretations[code] || { description: 'Neznámé', icon: '❓' };
}
