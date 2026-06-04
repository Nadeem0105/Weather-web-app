# Skyline Weather App

Skyline Weather is a premium, high-fidelity Next.js web application built with TypeScript and Vanilla CSS. It provides a beautiful glassmorphic atmosphere dashboard with full CRUD features for API configuration, location pinning, and a travel weather journal.

## ✨ Features

- **API Configuration Manager (CRUD)**: Easily add, modify, delete, and test your own weather API keys (supports **OpenWeatherMap**, **WeatherAPI.com**, and a built-in deterministic **Mock Provider**).
- **Pinned Locations (CRUD)**: Pin your favorite places with custom tag labels. The app performs background weather fetches for all pins to keep you updated.
- **Weather Diary (CRUD)**: Record notes, travel memories, or custom weather observations for different locations. Easily search through your journal logs.
- **Visual Sparkline Trend**: Custom SVG chart rendering a smooth temperature line connecting the 5-day forecast, built without any external chart libraries.
- **Dynamic Backgrounds**: Glowing ambient backdrops that change colors automatically based on the active weather condition (sunny, rainy, cloudy, snowy, stormy, misty).
- **Fully Responsive**: Designed with a fluid CSS layout that scales perfectly on mobile, tablet, and desktop devices.

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

- `src/types/weather.ts`: Unified interfaces for configs, unified weather data, pinned cities, and diary notes.
- `src/services/weatherService.ts`: Fetching, geocoding, and mapping APIs (with custom connection testing).
- `src/context/AppContext.tsx`: Client-side React context for state and localStorage synchronization.
- `src/components/AestheticBackground.tsx`: Responsive theme wrappers and ambient glow blobs.
- `src/components/ApiConfigManager.tsx`: Interactive API configurations panel.
- `src/components/PinnedLocations.tsx`: CRUD for favorite cities and quick monitoring cards.
- `src/components/WeatherDashboard.tsx`: Search bar, current weather stats, and 5-day forecast with SVG sparkline.
- `src/components/WeatherJournal.tsx`: Weather travel diary panel with text search and editor.
