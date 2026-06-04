import { UnifiedWeather, ForecastDay, ThreeHourlyForecast } from '../types/weather';

// Map OpenWeatherMap description to our unified icons
function mapOWMToIcon(id: number): string {
  if (id >= 200 && id < 300) return 'stormy';
  if (id >= 300 && id < 600) return 'rainy';
  if (id >= 600 && id < 700) return 'snowy';
  if (id >= 700 && id < 800) return 'misty';
  if (id === 800) return 'sunny';
  return 'cloudy';
}

// Ensure base URL starts with http/https
function cleanBaseUrl(url: string): string {
  let cleaned = url.trim();
  if (!cleaned) return '';
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

// Fetch Unified Weather from OpenWeatherMap
export async function fetchWeather(city: string): Promise<UnifiedWeather> {
  const cleanCity = city.trim();
  if (!cleanCity) {
    throw new Error('City name or ID cannot be empty');
  }

  const envKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || 'cb487872e914725fa0efd4e133211daa';
  const envUrl = process.env.NEXT_PUBLIC_OPENWEATHERMAP_BASE_URL || 'https://api.openweathermap.org/data/2.5';
  
  const apiKey = envKey.trim();
  const baseUrl = cleanBaseUrl(envUrl);

  // Determine if user searched by ID (digits only) or by name
  const isId = /^\d+$/.test(cleanCity);
  const queryParam = isId ? `id=${cleanCity}` : `q=${encodeURIComponent(cleanCity)}`;
  
  // Fetch forecast data containing all features (3-hourly slots, city population, pressure details, wind gust etc.)
  const forecastUrl = `${baseUrl}/forecast?${queryParam}&units=metric&appid=${apiKey}`;

  const res = await fetch(forecastUrl);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch forecast details: HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.list || data.list.length === 0) {
    throw new Error(`Location details not found in API response.`);
  }

  // Fetch live air quality index data using coord
  let aqi: number | undefined;
  let aqiBreakdown: any | undefined;
  if (data.city && data.city.coord && data.city.coord.lat !== undefined && data.city.coord.lon !== undefined) {
    try {
      const airUrl = `${baseUrl}/air_pollution?lat=${data.city.coord.lat}&lon=${data.city.coord.lon}&appid=${apiKey}`;
      const airRes = await fetch(airUrl);
      if (airRes.ok) {
        const airData = await airRes.json();
        if (airData.list && airData.list.length > 0) {
          const mainAir = airData.list[0];
          aqi = mainAir.main.aqi;
          aqiBreakdown = {
            aqi: mainAir.main.aqi,
            co: mainAir.components.co,
            no2: mainAir.components.no2,
            o3: mainAir.components.o3,
            so2: mainAir.components.so2,
            pm2_5: mainAir.components.pm2_5,
            pm10: mainAir.components.pm10
          };
        }
      }
    } catch (e) {
      console.error('Error fetching live air quality data:', e);
    }
  }

  // 1. Current state is represented by list[0]
  const current = data.list[0];

  // 2. Map 3-hourly slider (First 8 intervals = 24 hours)
  const threeHourly: ThreeHourlyForecast[] = data.list.slice(0, 8).map((item: any) => {
    const dateObj = new Date(item.dt * 1000);
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      time: timeStr,
      date: dateStr,
      temp: Math.round(item.main.temp),
      condition: item.weather[0].main,
      icon: mapOWMToIcon(item.weather[0].id),
      pop: Math.round(item.pop * 100),
      windSpeed: Math.round(item.wind.speed * 3.6) // m/s to km/h
    };
  });

  // 3. Map 5-day daily forecast (grouping by day)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyForecast: { [key: string]: { min: number; max: number; conditions: { [cond: string]: number }; iconCode: number } } = {};

  data.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000);
    const dayName = daysOfWeek[date.getDay()];
    const todayName = daysOfWeek[new Date().getDay()];

    // Skip today
    if (dayName === todayName) return;

    const temp = item.main.temp;
    const cond = item.weather[0].main;
    const icon = item.weather[0].id;

    if (!dailyForecast[dayName]) {
      dailyForecast[dayName] = {
        min: temp,
        max: temp,
        conditions: { [cond]: 1 },
        iconCode: icon
      };
    } else {
      dailyForecast[dayName].min = Math.min(dailyForecast[dayName].min, temp);
      dailyForecast[dayName].max = Math.max(dailyForecast[dayName].max, temp);
      dailyForecast[dayName].conditions[cond] = (dailyForecast[dayName].conditions[cond] || 0) + 1;
      
      // Use afternoon forecasts for representative day icon
      if (date.getHours() >= 12 && date.getHours() <= 15) {
        dailyForecast[dayName].iconCode = icon;
      }
    }
  });

  const mappedForecast: ForecastDay[] = Object.keys(dailyForecast).slice(0, 5).map((dayName) => {
    const dayData = dailyForecast[dayName];
    const mostFrequentCond = Object.keys(dayData.conditions).reduce((a, b) => 
      dayData.conditions[a] > dayData.conditions[b] ? a : b
    );

    return {
      date: dayName,
      tempMin: Math.round(dayData.min),
      tempMax: Math.round(dayData.max),
      condition: mostFrequentCond,
      icon: mapOWMToIcon(dayData.iconCode)
    };
  });

  const formatTime = (timestamp: number, timezoneOffset: number) => {
    // Calculate local time in targeted city using timezone offset
    const d = new Date((timestamp + timezoneOffset) * 1000);
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const nd = new Date(utc + (3600000 * (timezoneOffset / 3600)));
    return nd.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return {
    city: data.city.name,
    country: data.city.country,
    temp: Math.round(current.main.temp),
    feelsLike: Math.round(current.main.feels_like),
    tempMin: Math.round(current.main.temp_min),
    tempMax: Math.round(current.main.temp_max),
    condition: current.weather[0].main,
    description: current.weather[0].description,
    icon: mapOWMToIcon(current.weather[0].id),
    humidity: current.main.humidity,
    windSpeed: Math.round(current.wind.speed * 3.6),
    pressure: current.main.pressure,
    uvIndex: Math.min(11, Math.max(1, Math.round((Math.max(1, 12 - Math.abs(data.city.coord?.lat || 0) / 5)) * (1 - (current.clouds?.all || 0) / 150)))),
    visibility: Math.round(current.visibility / 1000), // meters to km
    sunrise: formatTime(data.city.sunrise, data.city.timezone),
    sunset: formatTime(data.city.sunset, data.city.timezone),
    forecast: mappedForecast,

    // Advanced features map
    pop: Math.round(current.pop * 100),
    clouds: current.clouds?.all,
    windGust: current.wind?.gust ? Math.round(current.wind.gust * 3.6) : undefined,
    windDeg: current.wind?.deg,
    grndLevel: current.main?.grnd_level,
    seaLevel: current.main?.sea_level,
    rain3h: current.rain?.['3h'] || current.snow?.['3h'] || undefined,
    population: data.city.population,
    lat: data.city.coord?.lat,
    lon: data.city.coord?.lon,
    threeHourly,
    aqi,
    aqiBreakdown
  };
}
