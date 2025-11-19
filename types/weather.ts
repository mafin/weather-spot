// Open-Meteo Geocoding API types
export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  feature_code: string;
  country_code: string;
  country: string;
  admin1?: string;
  admin2?: string;
  population?: number;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
  generationtime_ms: number;
}

// Open-Meteo Weather API types
export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  pressure_msl: number;
}

export interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  wind_speed_10m_max: number[];
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current?: CurrentWeather;
  daily?: DailyWeather;
  current_units?: Record<string, string>;
  daily_units?: Record<string, string>;
}

export interface FavoriteLocation {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

// WMO Weather interpretation codes
export interface WeatherInterpretation {
  description: string;
  icon: string;
}
