'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PinnedCity, WeatherJournalEntry, UnifiedWeather } from '../types/weather';
import { fetchWeather } from '../services/weatherService';
import { TRANSLATIONS } from './translations';

interface AppContextProps {
  pinnedCities: PinnedCity[];
  journalEntries: WeatherJournalEntry[];
  activeWeather: UnifiedWeather | null;
  isLoadingWeather: boolean;
  weatherError: string | null;
  isHydrated: boolean;
  
  // CRUD Pinned Cities
  pinCity: (name: string, country: string, label?: string) => void;
  unpinCity: (id: string) => void;
  updatePinnedCityLabel: (id: string, label: string) => void;

  // CRUD Journal Entries
  addJournalEntry: (entry: Omit<WeatherJournalEntry, 'id' | 'createdAt'>) => void;
  updateJournalEntry: (id: string, notes: string, temp?: number, condition?: string, city?: string, date?: string) => void;
  deleteJournalEntry: (id: string) => void;

  // Weather Actions
  loadWeather: (city: string) => Promise<void>;

  // Settings States
  tempUnit: 'C' | 'F';
  setTempUnit: (unit: 'C' | 'F') => void;
  windUnit: string;
  setWindUnit: (unit: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  toggleNotifications: () => void;
  themeMode: string;
  setThemeMode: (theme: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;

  // Helpers
  formatTemp: (tempCelsius: number, withUnit?: boolean) => string;
  formatWind: (speedKmh: number) => string;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  triggerNotification: (title: string, options?: NotificationOptions) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const DEFAULT_PINNED: PinnedCity[] = [
  { id: '1', name: 'Moscow', country: 'RU', label: 'Moscow (User City)', addedAt: new Date().toISOString() },
  { id: '2', name: 'London', country: 'GB', label: 'Classic Rain', addedAt: new Date().toISOString() },
  { id: '3', name: 'Tokyo', country: 'JP', label: 'Neon Skies', addedAt: new Date().toISOString() }
];

const DEFAULT_WEATHER: UnifiedWeather = {
  city: 'London',
  country: 'GB',
  temp: 18,
  feelsLike: 17,
  tempMin: 12,
  tempMax: 22,
  condition: 'Cloudy',
  description: 'partly cloudy',
  icon: 'cloudy',
  humidity: 72,
  windSpeed: 14,
  pressure: 1012,
  uvIndex: 4,
  visibility: 10,
  sunrise: '04:45',
  sunset: '21:15',
  forecast: [
    { date: 'Sun', tempMin: 12, tempMax: 20, condition: 'Cloudy', icon: 'cloudy' },
    { date: 'Mon', tempMin: 13, tempMax: 21, condition: 'Rainy', icon: 'rainy' },
    { date: 'Tue', tempMin: 14, tempMax: 22, condition: 'Sunny', icon: 'sunny' },
    { date: 'Wed', tempMin: 11, tempMax: 19, condition: 'Stormy', icon: 'stormy' },
    { date: 'Thu', tempMin: 10, tempMax: 17, condition: 'Misty', icon: 'misty' }
  ],
  threeHourly: [
    { time: '09:00 AM', date: 'Jun 4', temp: 15, condition: 'Cloudy', icon: 'cloudy', pop: 10, windSpeed: 12 },
    { time: '12:00 PM', date: 'Jun 4', temp: 18, condition: 'Cloudy', icon: 'cloudy', pop: 15, windSpeed: 14 },
    { time: '03:00 PM', date: 'Jun 4', temp: 20, condition: 'Cloudy', icon: 'cloudy', pop: 20, windSpeed: 15 },
    { time: '06:00 PM', date: 'Jun 4', temp: 19, condition: 'Cloudy', icon: 'cloudy', pop: 25, windSpeed: 13 },
    { time: '09:00 PM', date: 'Jun 4', temp: 16, condition: 'Cloudy', icon: 'cloudy', pop: 30, windSpeed: 10 },
    { time: '12:00 AM', date: 'Jun 5', temp: 14, condition: 'Cloudy', icon: 'cloudy', pop: 20, windSpeed: 8 },
    { time: '03:00 AM', date: 'Jun 5', temp: 13, condition: 'Cloudy', icon: 'cloudy', pop: 10, windSpeed: 7 },
    { time: '06:00 AM', date: 'Jun 5', temp: 13, condition: 'Cloudy', icon: 'cloudy', pop: 5, windSpeed: 8 }
  ],
  pop: 15,
  clouds: 75,
  windGust: 22,
  windDeg: 240,
  grndLevel: 1008,
  seaLevel: 1012,
  population: 8900000,
  lat: 51.5074,
  lon: -0.1278,
  aqi: 2,
  aqiBreakdown: {
    aqi: 2,
    co: 245.3,
    no2: 18.2,
    o3: 65.4,
    so2: 1.5,
    pm2_5: 8.7,
    pm10: 15.4
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pinnedCities, setPinnedCities] = useState<PinnedCity[]>(DEFAULT_PINNED);
  const [journalEntries, setJournalEntries] = useState<WeatherJournalEntry[]>([]);
  const [activeWeather, setActiveWeather] = useState<UnifiedWeather | null>(DEFAULT_WEATHER);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Styled Browser Console Logger (visible in Google Inspect Options)
  const getMethodColor = (method: 'GET' | 'POST' | 'PUT' | 'DELETE') => {
    switch (method) {
      case 'GET': return '#10b981'; // Green
      case 'POST': return '#3b82f6'; // Blue
      case 'PUT': return '#f59e0b'; // Amber
      case 'DELETE': return '#ef4444'; // Red
      default: return '#9ca3af';
    }
  };

  const logApiCall = (method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, status: number, payload?: any, response?: any) => {
    if (typeof window === 'undefined') return;
    const methodColor = getMethodColor(method);
    
    console.groupCollapsed(
      `%c[API Operation] %c${method.padEnd(6)} %c${url} %c(HTTP ${status})`,
      'color: #9e9e9e; font-weight: bold;',
      `color: ${methodColor}; font-weight: 900; background: rgba(255,255,255,0.05); padding: 1px 4px; border-radius: 3px;`,
      'color: #38bdf8; font-family: monospace;',
      `color: ${status < 300 ? '#10b981' : '#ef4444'}; font-weight: bold;`
    );
    
    console.log('%cTimestamp:', 'color: #7c3aed; font-weight: bold;', new Date().toLocaleTimeString());
    if (payload) {
      console.log('%cRequest Payload:', 'color: #f59e0b; font-weight: bold;', JSON.parse(JSON.stringify(payload)));
    }
    if (response) {
      console.log('%cResponse Body:', 'color: #10b981; font-weight: bold;', JSON.parse(JSON.stringify(response)));
    }
    console.groupEnd();
  };

  // Settings states
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [windUnit, setWindUnit] = useState<string>('km/h');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [themeMode, setThemeMode] = useState('Dynamic');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  // 1. Hydrate state from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPinned = localStorage.getItem('weather_pinned_cities');
      const storedJournal = localStorage.getItem('weather_journal');
      
      const storedTempUnit = localStorage.getItem('weathersphere_temp_unit') as 'C' | 'F' | null;
      const storedWindUnit = localStorage.getItem('weathersphere_wind_unit');
      const storedNotifications = localStorage.getItem('weathersphere_notifications');
      const storedTheme = localStorage.getItem('weathersphere_theme');
      const storedLang = localStorage.getItem('weathersphere_lang');

      if (storedPinned) {
        setPinnedCities(JSON.parse(storedPinned));
      } else {
        setPinnedCities(DEFAULT_PINNED);
      }

      if (storedJournal) {
        setJournalEntries(JSON.parse(storedJournal));
      } else {
        setJournalEntries([]);
      }

      if (storedTempUnit) setTempUnit(storedTempUnit);
      if (storedWindUnit) setWindUnit(storedWindUnit);
      if (storedNotifications !== null) setNotificationsEnabled(storedNotifications === 'true');
      if (storedTheme) setThemeMode(storedTheme);
      if (storedLang) setSelectedLanguage(storedLang);
      
      setIsHydrated(true);
    }
  }, []);

  // 2. Sync to localStorage when state changes (after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('weather_pinned_cities', JSON.stringify(pinnedCities));
    }
  }, [pinnedCities, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('weather_journal', JSON.stringify(journalEntries));
    }
  }, [journalEntries, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('weathersphere_temp_unit', tempUnit);
    }
  }, [tempUnit, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('weathersphere_wind_unit', windUnit);
    }
  }, [windUnit, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('weathersphere_notifications', String(notificationsEnabled));
    }
  }, [notificationsEnabled, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('weathersphere_theme', themeMode);
    }
  }, [themeMode, isHydrated]);



  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('weathersphere_lang', selectedLanguage);
    }
  }, [selectedLanguage, isHydrated]);

  // Automatically fetch weather for first pinned city or default once hydrated
  useEffect(() => {
    if (isHydrated) {
      const lastSearches = localStorage.getItem('weathersphere_recent_searches');
      if (lastSearches) {
        try {
          const parsed = JSON.parse(lastSearches);
          if (parsed && parsed.length > 0) {
            loadWeather(parsed[0]);
            return;
          }
        } catch (e) {
          console.error('Error parsing recent searches:', e);
        }
      }
      const firstCity = pinnedCities[0]?.name || 'London';
      loadWeather(firstCity);
    }
  }, [isHydrated]);

  // CRUD - Pinned Cities
  const pinCity = async (name: string, country: string, label?: string) => {
    // Avoid double pinning
    const exists = pinnedCities.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      alert(`${name} is already pinned!`);
      return;
    }

    const newPinned: PinnedCity = {
      id: crypto.randomUUID(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      country,
      label: label || undefined,
      addedAt: new Date().toISOString()
    };

    setPinnedCities(prev => [newPinned, ...prev]);
    logApiCall('POST', '/api/pinned', 201, { name, country, label }, newPinned);
  };

  const unpinCity = (id: string) => {
    setPinnedCities(prev => prev.filter(c => c.id !== id));
    logApiCall('DELETE', `/api/pinned/${id}`, 200, { id }, { success: true });
  };

  const updatePinnedCityLabel = (id: string, label: string) => {
    setPinnedCities(prev => prev.map(c => c.id === id ? { ...c, label: label || undefined } : c));
    logApiCall('PUT', `/api/pinned/${id}`, 200, { label }, { success: true, id, label });
  };

  // CRUD - Weather Journal Entries
  const addJournalEntry = (entry: Omit<WeatherJournalEntry, 'id' | 'createdAt'>) => {
    const newEntry: WeatherJournalEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setJournalEntries(prev => [newEntry, ...prev]);
    logApiCall('POST', '/api/journal', 201, entry, newEntry);
  };

  const updateJournalEntry = (id: string, notes: string, temp?: number, condition?: string, city?: string, date?: string) => {
    setJournalEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        return {
          ...entry,
          notes,
          temp: temp !== undefined ? temp : entry.temp,
          condition: condition !== undefined ? condition : entry.condition,
          city: city !== undefined ? city : entry.city,
          date: date !== undefined ? date : entry.date
        };
      }
      return entry;
    }));
    logApiCall('PUT', `/api/journal/${id}`, 200, { notes, temp, condition, city, date }, { success: true, id });
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== id));
    logApiCall('DELETE', `/api/journal/${id}`, 200, { id }, { success: true });
  };

  // Trigger Notification helper
  const triggerNotification = (title: string, options?: NotificationOptions) => {
    if (!notificationsEnabled) return;
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, options);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, options);
          }
        });
      }
    }
  };

  // Toggle notifications toggle with permission request
  const toggleNotifications = () => {
    const nextVal = !notificationsEnabled;
    setNotificationsEnabled(nextVal);
    if (nextVal && typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('WeatherSphere', {
            body: t('notificationsTitle') + ': ' + t('connected'),
            icon: '/images/weather_sunny.png'
          });
        }
      });
    }
  };

  // Load weather
  const loadWeather = async (city: string) => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    try {
      const data = await fetchWeather(city);
      setActiveWeather(data);
      logApiCall('GET', `/api/weather?q=${encodeURIComponent(city)}`, 200, null, data);
      
      // Trigger a push notification on successful load if conditions warrant
      if (data) {
        let title = `Weather in ${data.city}`;
        let body = `${formatTemp(data.temp)} • ${data.condition}`;
        if (data.pop !== undefined && data.pop > 65) {
          title = `⚠️ Precipitation Warning: ${data.city}`;
          body = `Precipitation index is at ${data.pop}%. Make sure to carry an umbrella! (${formatTemp(data.temp)})`;
        }
        triggerNotification(title, {
          body,
          tag: 'weathersphere_alert',
          silent: false
        });
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || 'Failed to fetch weather data.';
      setWeatherError(errMsg);
      logApiCall('GET', `/api/weather?q=${encodeURIComponent(city)}`, 500, null, { error: errMsg });
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Temperature unit helpers
  const formatTemp = (tempCelsius: number, withUnit = true) => {
    if (tempUnit === 'F') {
      const tempF = (tempCelsius * 9) / 5 + 32;
      return `${Math.round(tempF)}${withUnit ? '°F' : '°'}`;
    }
    return `${Math.round(tempCelsius)}${withUnit ? '°C' : '°'}`;
  };

  // Wind speed helpers
  const formatWind = (speedKmh: number) => {
    if (windUnit === 'mph') {
      return `${(speedKmh * 0.621371).toFixed(1)} mph`;
    }
    if (windUnit === 'm/s') {
      return `${(speedKmh / 3.6).toFixed(1)} m/s`;
    }
    return `${speedKmh.toFixed(1)} km/h`;
  };

  // Translation lookup engine
  const t = (key: string, replacements?: Record<string, string | number>) => {
    const langDict = TRANSLATIONS[selectedLanguage] || TRANSLATIONS['English'];
    let val = langDict[key] || TRANSLATIONS['English'][key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        val = val.replace(`{${k}}`, String(v));
      });
    }
    return val;
  };

  return (
    <AppContext.Provider value={{
      pinnedCities,
      journalEntries,
      activeWeather,
      isLoadingWeather,
      weatherError,
      isHydrated,
      pinCity,
      unpinCity,
      updatePinnedCityLabel,
      addJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
      loadWeather,
      tempUnit,
      setTempUnit,
      windUnit,
      setWindUnit,
      notificationsEnabled,
      setNotificationsEnabled,
      toggleNotifications,
      themeMode,
      setThemeMode,
      selectedLanguage,
      setSelectedLanguage,
      formatTemp,
      formatWind,
      t,
      triggerNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
