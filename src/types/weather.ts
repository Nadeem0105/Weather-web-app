export interface ForecastDay {
  date: string; // e.g., "Mon", "Tue"
  tempMin: number;
  tempMax: number;
  condition: string;
  icon: string;
}

export interface ThreeHourlyForecast {
  time: string; // e.g., "09:00 AM"
  date: string; // e.g., "Jun 3"
  temp: number;
  condition: string;
  icon: string;
  pop: number; // 0 to 100
  windSpeed: number; // km/h
}

export interface AirQualityBreakdown {
  aqi: number; // 1-5
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
}

export interface UnifiedWeather {
  city: string;
  country: string;
  temp: number; // Celsius
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  description: string;
  icon: string; // e.g., "sunny", "cloudy", "rainy", "snowy", "stormy", "misty"
  humidity: number; // %
  windSpeed: number; // km/h
  pressure: number; // hPa
  uvIndex: number;
  visibility: number; // km
  sunrise: string; // e.g. "06:12"
  sunset: string; // e.g. "19:45"
  forecast: ForecastDay[];
  
  // Advanced features provided by OpenWeatherMap forecast API
  pop?: number; // Probability of precipitation (0-100%)
  clouds?: number; // Cloudiness (0-100%)
  windGust?: number; // Wind gust speed (km/h)
  windDeg?: number; // Wind direction in degrees
  grndLevel?: number; // Ground level atmospheric pressure (hPa)
  seaLevel?: number; // Sea level atmospheric pressure (hPa)
  rain3h?: number; // Rain volume for last 3 hours (mm)
  population?: number; // City population
  lat?: number;
  lon?: number;
  threeHourly?: ThreeHourlyForecast[];
  aqi?: number;
  aqiBreakdown?: AirQualityBreakdown;
}

export interface PinnedCity {
  id: string;
  name: string;
  country: string;
  label?: string; // e.g., "Home", "Office"
  addedAt: string;
}

export interface WeatherJournalEntry {
  id: string;
  date: string;
  city: string;
  temp: number;
  condition: string;
  notes: string;
  createdAt: string;
}
