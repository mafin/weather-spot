# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Weather Dashboard aplikace postavená s Next.js 14+, React, TypeScript a Tailwind CSS. Zobrazuje aktuální počasí a 5-denní předpověď pomocí Open-Meteo API (free, bez API klíče) s možností ukládat oblíbená místa do localStorage.

## Development Commands

```bash
# Development server (port 3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Tests
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
```

## Docker

Aplikace je připravená pro Docker deployment:

```bash
# Build a spuštění pomocí docker-compose
docker-compose up -d

# Rebuild po změnách
docker-compose up --build -d

# Zastavení
docker-compose down

# Logs
docker-compose logs -f weatherspot
```

Aplikace běží na http://localhost:3000

**Dockerfile** používá multi-stage build pro optimální velikost image (Node 20 Alpine).

## Setup Requirements

**Žádné!** Open-Meteo API nevyžaduje registraci ani API klíč. Aplikace funguje okamžitě po `npm install && npm run dev`.

## Architecture

### App Structure

```
app/
  page.tsx          # Hlavní dashboard (Client Component)
components/
  SearchBar.tsx     # Vyhledávací formulář
  CurrentWeather.tsx # Karta aktuálního počasí
  ForecastCard.tsx  # Jednotlivá karta předpovědi
  FavoritesBar.tsx  # Seznam oblíbených měst
  __tests__/        # Component tests
lib/
  weather-api.ts    # API calls pro Open-Meteo (Geocoding + Weather)
  local-storage.ts  # Utility pro práci s localStorage
  __tests__/        # Unit tests for lib functions
types/
  weather.ts        # TypeScript typy pro Open-Meteo data
```

### Data Flow

1. **Vyhledávání města**:
   - SearchBar → `searchCity()` (Geocoding API) → získá souřadnice
   - Pak `getWeatherByCoordinates()` → získá počasí

2. **Oblíbené**: Ukládá se `{id, name, country, lat, lon}` do localStorage pod klíčem `weather-favorites`

3. **Forecast**: Zobrazuje daily data (max/min teploty, weather code) pro následujících 5 dní

### Key Patterns

- **Client Components**: Celá aplikace je client-side kvůli interaktivitě a localStorage
- **Error Handling**: Try-catch v async funkcích s user-friendly error messages
- **State Management**: React useState/useEffect, žádný external state manager
- **API Layer**: Centralized v `lib/weather-api.ts` s TypeScript types

### Open-Meteo API Usage

**Geocoding API** (vyhledávání měst):
```
GET https://geocoding-api.open-meteo.com/v1/search?name={city}&count=10&language=cs
```

**Weather Forecast API**:
```
GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}
  &current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl
  &daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max
  &timezone=auto
  &forecast_days=7
```

**WMO Weather Codes**: Používá standardní WMO kódy (0-99) pro interpretaci počasí:
- 0 = Jasno ☀️
- 1-3 = Různé stupně oblačnosti
- 45/48 = Mlha
- 51-67 = Různé typy deště
- 71-86 = Sníh a sněhové přeháňky
- 95-99 = Bouřky

Kompletní mapování v `lib/weather-api.ts:interpretWeatherCode()`

### localStorage Schema

```typescript
// Key: 'weather-favorites'
FavoriteLocation[] = [{
  id: "lat,lon",          // Unique identifier
  name: "Prague",
  country: "Czechia",
  lat: 50.0880,
  lon: 14.4208
}]
```

## Testing

Projekt používá **Jest 30** a **React Testing Library** pro unit testy.

### Test Structure

```
lib/__tests__/
  local-storage.test.ts   # Tests for localStorage utilities
  weather-api.test.ts     # Tests for API functions (with mocked fetch)
components/__tests__/
  SearchBar.test.tsx      # Tests for SearchBar component
  ForecastCard.test.tsx   # Tests for ForecastCard component
```

### Running Tests

```bash
npm test                  # Run all tests once
npm run test:watch        # Run in watch mode (auto re-run on changes)
npm run test:coverage     # Generate coverage report
```

### Test Coverage

Essential tests cover:
- **localStorage utilities**: getFavorites, addFavorite, removeFavorite, isFavorite
- **API functions**: searchCity, getWeatherByCoordinates, interpretWeatherCode (with mocked fetch)
- **Components**: SearchBar, ForecastCard (user interactions, rendering, state)

All tests use mocked dependencies (localStorage, fetch API) to ensure fast, reliable unit tests.

## Tailwind Configuration

Používá Tailwind CSS v4 s výchozím nastavením. Gradient pozadí, emoji ikony a responzivní grid jsou hlavní stylingové prvky.

## Common Tasks

### Přidání nového weather parametru

1. Aktualizuj query parametry v `lib/weather-api.ts` (current nebo daily)
2. Aktualizuj `types/weather.ts` s novým fieldem
3. Přidej zobrazení v příslušném komponentu

### Přidání nového weather code

Uprav `interpretWeatherCode()` v `lib/weather-api.ts` a přidej mapování pro nový kód.

### Změna jednotek

Open-Meteo defaultně vrací metrické jednotky (°C, km/h, mm). Pro změnu přidej parametry do API callu:
- `temperature_unit=fahrenheit`
- `wind_speed_unit=mph`
- `precipitation_unit=inch`
