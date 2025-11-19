# WeatherSpot

Modern weather dashboard built with Next.js 14+, React, TypeScript and Tailwind CSS. Get current weather conditions and 5-day forecasts for any location using the free Open-Meteo API.

## Features

- **Current Weather**: Real-time temperature, humidity, wind speed, and atmospheric pressure
- **5-Day Forecast**: Daily weather predictions with min/max temperatures and conditions
- **City Search**: Find weather for any location worldwide
- **Favorites**: Save your favorite locations for quick access (stored in localStorage)
- **No API Key Required**: Uses the free Open-Meteo API with no registration needed
- **Docker Ready**: Containerized deployment with docker-compose

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker

```bash
# Build and run with docker-compose
docker-compose up -d

# Rebuild after changes
docker-compose up --build -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f weatherspot
```

The app runs on [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Language**: TypeScript 5
- **API**: Open-Meteo (Geocoding + Weather Forecast)
- **Storage**: localStorage for favorites
- **Container**: Docker with multi-stage builds

## Project Structure

```
app/
  page.tsx              # Main dashboard component
  layout.tsx            # Root layout with metadata
components/
  SearchBar.tsx         # City search form
  CurrentWeather.tsx    # Current conditions card
  ForecastCard.tsx      # Individual forecast day card
  FavoritesBar.tsx      # Saved locations list
lib/
  weather-api.ts        # Open-Meteo API client
  local-storage.ts      # localStorage utilities
types/
  weather.ts            # TypeScript type definitions
```

## How It Works

1. **Search**: Enter a city name → Geocoding API finds coordinates
2. **Fetch**: Coordinates → Weather Forecast API returns current + daily data
3. **Display**: Weather codes interpreted into human-readable conditions with emoji
4. **Save**: Click ⭐ to save locations to localStorage

## API Details

WeatherSpot uses two Open-Meteo endpoints:

- **Geocoding**: `https://geocoding-api.open-meteo.com/v1/search`
- **Weather**: `https://api.open-meteo.com/v1/forecast`

Both are free, unlimited, and require no authentication.

## License

MIT

---

Built with Next.js and powered by Open-Meteo