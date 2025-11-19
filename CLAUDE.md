# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Weather Dashboard aplikace postavená s Next.js 14+, React, TypeScript a Tailwind CSS. Zobrazuje aktuální počasí a 5-denní předpověď pomocí OpenWeatherMap API s možností ukládat oblíbená místa do localStorage.

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
```

## Setup Requirements

### API Key Configuration

1. Zaregistruj se na https://openweathermap.org/api (zdarma)
2. Vygeneruj API klíč v sekci "API keys"
3. Otevři `.env.local` a nahraď `your_api_key_here` svým API klíčem:
   ```
   NEXT_PUBLIC_OPENWEATHER_API_KEY=tvůj_api_klíč
   ```
4. Restartuj dev server

**Důležité:** API klíč je `NEXT_PUBLIC_*` protože je potřeba na klientovi. Pro produkci zvažte použití Next.js API routes jako proxy.

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
lib/
  weather-api.ts    # API calls pro OpenWeatherMap
  local-storage.ts  # Utility pro práci s localStorage
types/
  weather.ts        # TypeScript typy pro weather data
```

### Data Flow

1. **Vyhledávání**: SearchBar → page.tsx `handleSearch()` → parallel API calls (current + forecast)
2. **Oblíbené**: Ukládá se `{id, name, country, lat, lon}` do localStorage pod klíčem `weather-favorites`
3. **Forecast**: Filtruje data na polední hodnoty (12:00) pro každý den, zobrazuje max 5 dní

### Key Patterns

- **Client Components**: Celá aplikace je client-side kvůli interaktivitě a localStorage
- **Error Handling**: Try-catch v async funkcích s user-friendly error messages
- **State Management**: React useState/useEffect, žádný external state manager
- **API Layer**: Centralized v `lib/weather-api.ts` s TypeScript types

### OpenWeatherMap API Usage

- **Current Weather**: `/weather?q={city}&units=metric&lang=cz`
- **5-day Forecast**: `/forecast?q={city}&units=metric&lang=cz` (3-hour intervals)
- **Icons**: `https://openweathermap.org/img/wn/{icon}@2x.png`

### localStorage Schema

```typescript
// Key: 'weather-favorites'
FavoriteLocation[] = [{
  id: "lat,lon",          // Unique identifier
  name: "Prague",
  country: "CZ",
  lat: 50.0880,
  lon: 14.4208
}]
```

## Tailwind Configuration

Používá Tailwind CSS v4 s výchozím nastavením. Gradient pozadí a responzivní grid jsou hlavní stylingové prvky.

## Common Tasks

### Přidání nového weather parametru

1. Aktualizuj `types/weather.ts` s novým fieldem
2. Přidej zobrazení v `components/CurrentWeather.tsx`

### Změna language/units

Uprav query parametry v `lib/weather-api.ts`:
- `lang=cz` → jiný jazyk
- `units=metric` → `imperial` pro Fahrenheit
