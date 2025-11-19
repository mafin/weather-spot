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
    throw new Error('Error searching for city');
  }

  const data: GeocodingResponse = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('City not found');
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
    throw new Error('Error loading weather');
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
    0: { description: 'Clear sky', icon: '☀️' },
    1: { description: 'Mainly clear', icon: '🌤️' },
    2: { description: 'Partly cloudy', icon: '⛅' },
    3: { description: 'Overcast', icon: '☁️' },
    45: { description: 'Fog', icon: '🌫️' },
    48: { description: 'Depositing rime fog', icon: '🌫️' },
    51: { description: 'Light drizzle', icon: '🌦️' },
    53: { description: 'Moderate drizzle', icon: '🌦️' },
    55: { description: 'Dense drizzle', icon: '🌧️' },
    56: { description: 'Light freezing drizzle', icon: '🌧️' },
    57: { description: 'Freezing drizzle', icon: '🌧️' },
    61: { description: 'Slight rain', icon: '🌧️' },
    63: { description: 'Moderate rain', icon: '🌧️' },
    65: { description: 'Heavy rain', icon: '⛈️' },
    66: { description: 'Light freezing rain', icon: '🌧️' },
    67: { description: 'Freezing rain', icon: '🌧️' },
    71: { description: 'Slight snow', icon: '🌨️' },
    73: { description: 'Moderate snow', icon: '❄️' },
    75: { description: 'Heavy snow', icon: '❄️' },
    77: { description: 'Snow grains', icon: '❄️' },
    80: { description: 'Slight rain showers', icon: '🌦️' },
    81: { description: 'Moderate rain showers', icon: '🌧️' },
    82: { description: 'Violent rain showers', icon: '⛈️' },
    85: { description: 'Slight snow showers', icon: '🌨️' },
    86: { description: 'Heavy snow showers', icon: '❄️' },
    95: { description: 'Thunderstorm', icon: '⛈️' },
    96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
    99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' }
  };

  return interpretations[code] || { description: 'Unknown', icon: '❓' };
}
