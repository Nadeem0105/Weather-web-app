'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, Sun, Cloud, CloudRain, Snowflake, CloudLightning, CloudFog, 
  Droplets, Wind, Gauge, Compass, Eye, Sunrise, Sunset, Pin, AlertCircle, RefreshCw, Shield, MapPin, Calendar, Clock, Navigation, Info, Map
} from 'lucide-react';
import { calculateEPAAQI } from '../services/aqiCalculator';
import { SidebarWidgets } from './SidebarWidgets';

interface WeatherDashboardProps {
  onSwitchTab?: (tab: string) => void;
}

export const WeatherDashboard: React.FC<WeatherDashboardProps> = ({ onSwitchTab }) => {
  const { 
    activeWeather, 
    isLoadingWeather, 
    weatherError, 
    loadWeather, 
    pinnedCities, 
    pinCity, 
    unpinCity,
    tempUnit,
    formatTemp,
    formatWind,
    t
  } = useApp();

  const [searchVal, setSearchVal] = useState('');
  const [dashboardMapLayer, setDashboardMapLayer] = useState<'radar' | 'rain' | 'temp' | 'wind' | 'satellite'>('radar');
  const [dashboardMapZoom, setDashboardMapZoom] = useState(6);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      loadWeather(searchVal.trim());
    }
  };

  const isPinned = activeWeather 
    ? pinnedCities.some(c => c.name.toLowerCase() === activeWeather.city.toLowerCase()) 
    : false;

  const handleTogglePin = () => {
    if (!activeWeather) return;
    if (isPinned) {
      const pinnedItem = pinnedCities.find(c => c.name.toLowerCase() === activeWeather.city.toLowerCase());
      if (pinnedItem) unpinCity(pinnedItem.id);
    } else {
      pinCity(activeWeather.city, activeWeather.country);
    }
  };

  const getWeatherIcon = (iconName: string, size = 48, className = '') => {
    switch (iconName.toLowerCase()) {
      case 'sunny':
        return <Sun size={size} className={`animate-spin-slow ${className}`} style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.45))' }} />;
      case 'cloudy':
        return <Cloud size={size} className={className} style={{ color: '#9ca3af', filter: 'drop-shadow(0 0 8px rgba(156, 163, 175, 0.3))' }} />;
      case 'rainy':
        return <CloudRain size={size} className={className} style={{ color: '#60a5fa', filter: 'drop-shadow(0 0 10px rgba(96, 165, 250, 0.4))' }} />;
      case 'snowy':
        return <Snowflake size={size} className={className} style={{ color: '#93c5fd', filter: 'drop-shadow(0 0 10px rgba(147, 197, 253, 0.4))' }} />;
      case 'stormy':
        return <CloudLightning size={size} className={className} style={{ color: '#c084fc', filter: 'drop-shadow(0 0 12px rgba(192, 132, 252, 0.5))' }} />;
      case 'misty':
        return <CloudFog size={size} className={className} style={{ color: '#2dd4bf', filter: 'drop-shadow(0 0 8px rgba(45, 212, 191, 0.3))' }} />;
      default:
        return <Sun size={size} className={className} style={{ color: '#fbbf24' }} />;
    }
  };

  const getWeatherIllustration = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'sunny':
        return '/images/weather_sunny.png';
      case 'cloudy':
        return '/images/weather_cloudy.png';
      case 'rainy':
        return '/images/weather_rainy.png';
      case 'snowy':
        return '/images/weather_snowy.png';
      case 'stormy':
        return '/images/weather_stormy.png';
      case 'misty':
        return '/images/weather_misty.png';
      default:
        return '/images/weather_sunny.png';
    }
  };

  // Render SVG Sparkline / Temperature Trend Chart
  const renderTrendChart = () => {
    if (!activeWeather || !activeWeather.forecast || activeWeather.forecast.length === 0) return null;

    const forecast = activeWeather.forecast;
    const padding = 20;
    const chartWidth = 500;
    const chartHeight = 85;
    
    // Extract min/max values to scale
    const convertRaw = (celsius: number) => {
      if (tempUnit === 'F') {
        return (celsius * 9) / 5 + 32;
      }
      return celsius;
    };
    const maxTemps = forecast.map(d => convertRaw(d.tempMax));
    const minTemps = forecast.map(d => convertRaw(d.tempMin));
    const absoluteMax = Math.max(...maxTemps);
    const absoluteMin = Math.min(...minTemps);
    const tempRange = (absoluteMax - absoluteMin) || 1;

    // Map coordinates: 5 points along X axis [0, 4]
    const getX = (index: number) => padding + (index * (chartWidth - padding * 2)) / 4;
    const getY = (temp: number) => {
      const scale = (temp - absoluteMin) / tempRange;
      // Invert Y because SVG coordinates start from top-left
      return chartHeight - padding - scale * (chartHeight - padding * 2);
    };

    // Build SVG Path strings
    let maxPath = '';
    let minPath = '';
    
    forecast.forEach((day, i) => {
      const x = getX(i);
      const yMax = getY(convertRaw(day.tempMax));
      const yMin = getY(convertRaw(day.tempMin));

      if (i === 0) {
        maxPath = `M ${x} ${yMax}`;
        minPath = `M ${x} ${yMin}`;
      } else {
        maxPath += ` L ${x} ${yMax}`;
        minPath += ` L ${x} ${yMin}`;
      }
    });

    return (
      <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', minWidth: '350px', height: `${chartHeight}px` }}>
          {/* Gradients */}
          <defs>
            <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill under Max line */}
          <path
            d={`${maxPath} L ${getX(4)} ${chartHeight - 5} L ${getX(0)} ${chartHeight - 5} Z`}
            fill="url(#maxGrad)"
          />

          {/* Trend lines */}
          <path d={maxPath} fill="none" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" />
          <path d={minPath} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round" />

          {/* Data Points & Value text */}
          {forecast.map((day, i) => {
            const x = getX(i);
            const yMax = getY(convertRaw(day.tempMax));
            const yMin = getY(convertRaw(day.tempMin));

            return (
              <g key={i}>
                {/* Max nodes */}
                <circle cx={x} cy={yMax} r="4" fill="var(--accent-color)" stroke="#000" strokeWidth="1" />
                <text x={x} y={yMax - 8} textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--text-primary)" fontFamily="var(--font-stats)">
                  {formatTemp(day.tempMax)}
                </text>
                
                {/* Min nodes */}
                <circle cx={x} cy={yMin} r="3" fill="#60a5fa" />
                <text x={x} y={yMin + 12} textAnchor="middle" fontSize="9" fill="var(--text-secondary)" fontFamily="var(--font-stats)">
                  {formatTemp(day.tempMin)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Search Header for Mobile/Fallback */}
      <div className="glass-panel lg-hide" style={{ padding: '1rem 1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              className="input-glass" 
              placeholder={t('searchPlaceholderDashboard')} 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-sm)' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoadingWeather}>
            {isLoadingWeather ? <RefreshCw size={16} className="animate-spin-slow" /> : t('searchBtn')}
          </button>
        </form>
      </div>

      {/* Error state */}
      {weatherError && (
        <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#f87171' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t('failedToRetrieve')}</h4>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>{weatherError}</p>
          </div>
        </div>
      )}

      {/* Main Weather Content in 2-Column Layout */}
      {activeWeather && !isLoadingWeather ? (
        <div className="forecast-grid-container animate-fade-in">
          
          {/* Left Column: Hero main weather card and details grid */}
          <div className="hero-weather-column">
            
            {/* Hero Main Card */}
            <div className="hero-primary-card">
              {/* Weather Illustration Background */}
              <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                overflow: 'hidden'
              }}>
                <img 
                  src={getWeatherIllustration(activeWeather.icon)} 
                  alt="" 
                  fetchPriority="high"
                  loading="eager"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    opacity: 0.58,
                    filter: 'blur(3px) saturate(140%)',
                    transition: 'opacity 0.5s ease',
                  }} 
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'var(--hero-overlay)',
                  backdropFilter: 'blur(1px)',
                  WebkitBackdropFilter: 'blur(1px)',
                }} />
              </div>

              {/* Elevated content */}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <MapPin size={18} style={{ color: 'var(--accent-color)' }} />
                      <h2 style={{ fontSize: '1.8rem', fontWeight: 850, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                        {activeWeather.city}
                      </h2>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                      <span>{activeWeather.country}</span>
                      {activeWeather.population !== undefined && activeWeather.population > 0 && (
                        <>
                          <span style={{ opacity: 0.55 }}>•</span>
                          <span>Population: {activeWeather.population.toLocaleString()}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <button 
                    onClick={handleTogglePin} 
                    className="btn-icon" 
                    title={isPinned ? 'Unpin location' : 'Pin location'}
                    style={{ 
                      color: isPinned ? 'var(--accent-color)' : 'var(--text-secondary)',
                      background: isPinned ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                      border: isPinned ? '1px solid rgba(56, 189, 248, 0.15)' : 'none'
                    }}
                  >
                    <Pin size={18} style={{ transform: isPinned ? 'rotate(45deg)' : 'none', transition: 'var(--transition-smooth)' }} />
                  </button>
                </div>

                {/* Massive temperature readout */}
                <div className="hero-temp-value">
                  {formatTemp(activeWeather.temp)}
                </div>

                <div className="hero-condition-text">
                  {t(activeWeather.icon.toLowerCase()) || activeWeather.condition}
                </div>

                {/* High/Low tag */}
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <span className="weather-highlow-pill">
                    H: {formatTemp(activeWeather.tempMax)}
                  </span>
                  <span className="weather-highlow-pill">
                    L: {formatTemp(activeWeather.tempMin)}
                  </span>
                </div>

                {/* dynamic weather summary paragraph */}
                <p className="hero-desc-paragraph">
                  Today, expect a {activeWeather.condition.toLowerCase()} day in {activeWeather.city} with temperatures reaching a high of {formatTemp(activeWeather.tempMax)} and a low of {formatTemp(activeWeather.tempMin)}. Humidity is currently at {activeWeather.humidity}% with winds blowing at {formatWind(activeWeather.windSpeed)}. Perfect for staying tuned to local details!
                </p>
              </div>
            </div>

            {/* Redesigned 2x2 Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              
              {/* Feels Like Card */}
              <div className="widget-card">
                <div className="widget-title-bar">
                  <Compass size={14} /> Feels Like
                </div>
                <div className="widget-value-large">
                  {formatTemp(activeWeather.feelsLike)}
                </div>
                <div className="widget-subtext">
                  {activeWeather.feelsLike > activeWeather.temp 
                    ? 'Humidity is making it feel warmer than the actual temperature.' 
                    : 'Wind chill is making it feel cooler than the actual temperature.'
                  }
                </div>
              </div>

              {/* Precipitation Card */}
              <div className="widget-card">
                <div className="widget-title-bar">
                  <CloudRain size={14} /> Precipitation
                </div>
                <div className="widget-value-large">
                  {activeWeather.pop !== undefined ? `${activeWeather.pop}%` : '15%'}
                </div>
                <div className="widget-subtext">
                  {activeWeather.pop && activeWeather.pop > 50 
                    ? `Rain expected soon. Accumulation is around ${activeWeather.rain3h || 2} mm.` 
                    : 'No significant precipitation expected in the next 24 hours.'
                  }
                </div>
              </div>

              {/* Visibility Card */}
              <div className="widget-card">
                <div className="widget-title-bar">
                  <Eye size={14} /> Visibility
                </div>
                <div className="widget-value-large">
                  {activeWeather.visibility} km
                </div>
                <div className="widget-subtext">
                  {activeWeather.visibility > 8 
                    ? 'Perfectly clear view. Excellent driving and flying conditions.' 
                    : 'Haze or light mist affecting long range view. Drive with care.'
                  }
                </div>
              </div>

              {/* Humidity & Dew Point Card */}
              <div className="widget-card">
                <div className="widget-title-bar">
                  <Droplets size={14} /> Humidity
                </div>
                <div className="widget-value-large">
                  {activeWeather.humidity}%
                </div>
                <div className="widget-subtext">
                  The dew point is currently {(() => {
                    // Simple dew point formula: Td = T - ((100 - RH)/5)
                    const td = activeWeather.temp - ((100 - activeWeather.humidity) / 5);
                    return formatTemp(Math.round(td));
                  })()} right now.
                </div>
              </div>

            </div>

            {/* Air Quality Index (AQI) Widget */}
            {(() => {
              const aqiVal = activeWeather.aqi || 2;
              
              const getAqiDetails = (val: number) => {
                switch (val) {
                  case 1:
                    return {
                      score: 95,
                      status: 'Good',
                      color: '#10b981',
                      bg: 'rgba(16, 185, 129, 0.15)',
                      border: 'rgba(16, 185, 129, 0.3)',
                      desc: 'Satisfactory, air pollution poses little/no risk.'
                    };
                  case 2:
                    return {
                      score: 78,
                      status: 'Fair',
                      color: '#84cc16',
                      bg: 'rgba(132, 204, 22, 0.15)',
                      border: 'rgba(132, 204, 22, 0.3)',
                      desc: 'Acceptable; moderate concern for some people.'
                    };
                  case 3:
                    return {
                      score: 55,
                      status: 'Moderate',
                      color: '#eab308',
                      bg: 'rgba(234, 179, 8, 0.15)',
                      border: 'rgba(234, 179, 8, 0.3)',
                      desc: 'Sensitive groups may experience health effects.'
                    };
                  case 4:
                    return {
                      score: 35,
                      status: 'Poor',
                      color: '#f97316',
                      bg: 'rgba(249, 115, 22, 0.15)',
                      border: 'rgba(249, 115, 22, 0.3)',
                      desc: 'Everyone may begin to experience health effects.'
                    };
                  case 5:
                    return {
                      score: 12,
                      status: 'Very Poor',
                      color: '#ef4444',
                      bg: 'rgba(239, 68, 68, 0.15)',
                      border: 'rgba(239, 68, 68, 0.3)',
                      desc: 'Health alert: everyone may experience serious effects.'
                    };
                  default:
                    return {
                      score: 78,
                      status: 'Fair',
                      color: '#84cc16',
                      bg: 'rgba(132, 204, 22, 0.15)',
                      border: 'rgba(132, 204, 22, 0.3)',
                      desc: 'Air quality details are standard.'
                    };
                }
              };

              const pm2_5 = activeWeather.aqiBreakdown?.pm2_5 ?? 9.2;
              const pm10 = activeWeather.aqiBreakdown?.pm10 ?? 18.4;
              const no2 = activeWeather.aqiBreakdown?.no2 ?? 24.1;
              const o3 = activeWeather.aqiBreakdown?.o3 ?? 48.0;
              const so2 = activeWeather.aqiBreakdown?.so2 ?? 2.5;
              const co = activeWeather.aqiBreakdown?.co ?? 245.3;

              const computedUsAqi = calculateEPAAQI({ pm2_5, pm10, co, no2, so2, o3 });
              const aqiDetails = getAqiDetails(aqiVal);
              const dashOffset = 264 - (264 * Math.min(100, Math.max(8, (computedUsAqi / 300) * 100))) / 100;

              const getPm25Status = (val: number) => {
                if (val <= 10) return { label: 'Low', color: '#10b981', pct: Math.min(100, Math.max(5, (val / 10) * 20)) };
                if (val <= 25) return { label: 'Fair', color: '#84cc16', pct: Math.min(100, 20 + ((val - 10) / 15) * 20) };
                if (val <= 50) return { label: 'Moderate', color: '#eab308', pct: Math.min(100, 40 + ((val - 25) / 25) * 20) };
                return { label: 'High', color: '#ef4444', pct: Math.min(100, 80 + ((val - 50) / 50) * 20) };
              };

              const getPm10Status = (val: number) => {
                if (val <= 20) return { label: 'Low', color: '#10b981', pct: Math.min(100, Math.max(5, (val / 20) * 20)) };
                if (val <= 50) return { label: 'Fair', color: '#84cc16', pct: Math.min(100, 20 + ((val - 20) / 30) * 20) };
                if (val <= 100) return { label: 'Moderate', color: '#eab308', pct: Math.min(100, 50 + ((val - 50) / 50) * 20) };
                return { label: 'High', color: '#ef4444', pct: Math.min(100, 80 + ((val - 100) / 100) * 20) };
              };

              return (
                <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  <div className="widget-title-bar" style={{ marginBottom: '0.5rem' }}>
                    <Wind size={14} /> Air Quality Index
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="84" height="84" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="42" 
                          fill="none" 
                          stroke={aqiDetails.color} 
                          strokeWidth="9" 
                          strokeDasharray="264" 
                          strokeDashoffset={dashOffset} 
                          strokeLinecap="round" 
                          transform="rotate(-90 50 50)"
                          style={{ transition: 'stroke-dashoffset 1s ease' }}
                        />
                      </svg>
                      <div style={{ position: 'absolute', textAlign: 'center' }}>
                        <span className="stat-val" style={{ fontSize: '1.5rem', fontWeight: 900, color: aqiDetails.color, lineHeight: 1 }}>{computedUsAqi}</span>
                        <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>AQI</div>
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <span className="badge" style={{ background: aqiDetails.bg, color: aqiDetails.color, border: `1px solid ${aqiDetails.border}`, padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '12px', fontWeight: 800 }}>
                        {aqiDetails.status} ({aqiVal}/5)
                      </span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: '1.3' }}>
                        {aqiDetails.desc}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                      <span>PM2.5 (Fine Particulate)</span>
                      <span style={{ fontWeight: 700 }}>{pm2_5.toFixed(1)} µg/m³</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${getPm25Status(pm2_5).pct}%`, height: '100%', background: getPm25Status(pm2_5).color }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginTop: '0.15rem' }}>
                      <span>PM10 (Coarse Particulate)</span>
                      <span style={{ fontWeight: 700 }}>{pm10.toFixed(1)} µg/m³</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${getPm10Status(pm10).pct}%`, height: '100%', background: getPm10Status(pm10).color }}></div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Traveler Companion Widget */}
            <SidebarWidgets onSwitchTab={onSwitchTab || (() => {})} />

          </div>

          {/* Right Column: Hourly scroll, 10-day scroll, UV, Wind, Atmospheric graph */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Hourly Forecast */}
            {activeWeather.threeHourly && activeWeather.threeHourly.length > 0 && (
              <div className="widget-card">
                <div className="widget-title-bar" style={{ marginBottom: '1rem' }}>
                  <Clock size={14} /> Hourly Forecast
                </div>
                <div className="forecast-scroll-container">
                  {activeWeather.threeHourly.map((hour, idx) => (
                    <div key={idx} className="forecast-pill-card">
                      <span className="forecast-pill-time">{hour.time.split(' ')[0]} {hour.time.split(' ')[1]}</span>
                      {getWeatherIcon(hour.icon, 24)}
                      <span className="forecast-pill-temp">{formatTemp(hour.temp)}</span>
                      {hour.pop > 0 && (
                        <span style={{ fontSize: '0.65rem', color: '#60a5fa', fontWeight: 700, marginTop: '0.25rem' }}>
                          💧 {hour.pop}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10-Day Forecast rendered as premium horizontal list */}
            {activeWeather.forecast && activeWeather.forecast.length > 0 && (
              <div className="widget-card">
                <div className="widget-title-bar" style={{ marginBottom: '1rem' }}>
                  <Calendar size={14} /> 5-Day Outlook
                </div>
                <div className="forecast-scroll-container">
                  {activeWeather.forecast.map((day, idx) => (
                    <div key={idx} className="forecast-pill-card" style={{ flex: '0 0 110px' }}>
                      <span className="forecast-pill-time">{day.date}</span>
                      {getWeatherIcon(day.icon, 24)}
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', height: '1rem', overflow: 'hidden' }}>
                        {t(day.icon.toLowerCase()) || day.condition}
                      </span>
                      <span className="forecast-pill-temp" style={{ fontSize: '1.05rem', marginTop: '0.25rem' }}>
                        {formatTemp(day.tempMax)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UV and Wind Widgets side-by-side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              {/* UV Index Card */}
              <div className="widget-card">
                <div className="widget-title-bar">
                  <Sun size={14} /> UV Index
                </div>
                <div className="widget-value-large">
                  {activeWeather.uvIndex || '3'}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {activeWeather.uvIndex !== undefined && activeWeather.uvIndex >= 8 
                    ? 'Very High' 
                    : activeWeather.uvIndex !== undefined && activeWeather.uvIndex >= 6 
                    ? 'High' 
                    : activeWeather.uvIndex !== undefined && activeWeather.uvIndex >= 3 
                    ? 'Moderate' 
                    : 'Low'
                  }
                </div>
                
                {/* Rainbow Slider indicator */}
                <div className="rainbow-slider-bar">
                  <div 
                    className="rainbow-slider-dot" 
                    style={{ left: `${Math.min(100, Math.max(0, ((activeWeather.uvIndex || 3) / 11) * 100))}%` }}
                  />
                </div>
                <div className="widget-subtext" style={{ fontSize: '0.75rem' }}>
                  {activeWeather.uvIndex !== undefined && activeWeather.uvIndex >= 6 
                    ? 'Apply SPF 30+ sunscreen. Wear a hat, sunglasses, and avoid direct midday sun.' 
                    : 'Safe conditions. Minimal sun protection required for long outdoor stays.'
                  }
                </div>
              </div>

              {/* Wind Dial Card */}
              <div className="widget-card" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="widget-title-bar" style={{ marginBottom: '0.5rem' }}>
                    <Wind size={14} /> Wind
                  </div>
                  <div className="widget-value-large" style={{ fontSize: '1.8rem' }}>
                    {formatWind(activeWeather.windSpeed)}
                  </div>
                  
                  {activeWeather.windGust && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Gusts: {formatWind(activeWeather.windGust)}
                    </div>
                  )}

                  <div className="widget-subtext" style={{ fontSize: '0.72rem', marginTop: 'auto' }}>
                    Direction: {activeWeather.windDeg}° ({activeWeather.windDeg !== undefined && (activeWeather.windDeg > 337.5 || activeWeather.windDeg <= 22.5) ? 'N' : activeWeather.windDeg !== undefined && activeWeather.windDeg > 22.5 && activeWeather.windDeg <= 67.5 ? 'NE' : activeWeather.windDeg !== undefined && activeWeather.windDeg > 67.5 && activeWeather.windDeg <= 112.5 ? 'E' : activeWeather.windDeg !== undefined && activeWeather.windDeg > 112.5 && activeWeather.windDeg <= 157.5 ? 'SE' : activeWeather.windDeg !== undefined && activeWeather.windDeg > 157.5 && activeWeather.windDeg <= 202.5 ? 'S' : activeWeather.windDeg !== undefined && activeWeather.windDeg > 202.5 && activeWeather.windDeg <= 247.5 ? 'SW' : activeWeather.windDeg !== undefined && activeWeather.windDeg > 247.5 && activeWeather.windDeg <= 292.5 ? 'W' : 'NW'})
                  </div>
                </div>

                {/* Rotating needle compass dial */}
                <div className="wind-dial-ring">
                  <div 
                    className="wind-dial-pointer" 
                    style={{ transform: `rotate(${activeWeather.windDeg || 0}deg)` }}
                  />
                  <div style={{ position: 'absolute', top: '4px', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>N</div>
                  <div style={{ position: 'absolute', right: '6px', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>E</div>
                  <div style={{ position: 'absolute', bottom: '4px', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>S</div>
                  <div style={{ position: 'absolute', left: '6px', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>W</div>
                </div>
              </div>

            </div>

            {/* Sparkline Trend Graph / Atmospheric Analysis */}
            <div className="widget-card">
              <div className="widget-title-bar" style={{ marginBottom: '0.5rem' }}>
                <Gauge size={14} /> Atmospheric Analysis (Trend)
              </div>
              {renderTrendChart()}
              <div className="widget-subtext">
                Solid line represents maximum forecasted temperatures. Dashed line represents minimum forecasted temperatures.
              </div>
            </div>

            {/* Interactive Radar/Map Widget */}
            <div className="widget-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                    <Map size={14} /> Weather Radar Map
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.15rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {(['radar', 'rain', 'temp', 'wind'] as const).map((layer) => (
                    <button 
                      key={layer}
                      onClick={() => setDashboardMapLayer(layer)}
                      className={`btn-icon ${dashboardMapLayer === layer ? 'active' : ''}`}
                      style={{ 
                        borderRadius: '4px', 
                        fontSize: '0.65rem', 
                        padding: '0.25rem 0.5rem', 
                        background: dashboardMapLayer === layer ? 'rgba(56, 189, 248, 0.08)' : 'transparent', 
                        color: dashboardMapLayer === layer ? 'var(--accent-color)' : 'inherit',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {layer.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radar Map Canvas Simulation */}
              <div style={{ position: 'relative', width: '100%', height: '240px', borderRadius: '16px', background: '#0e111d', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                
                {/* Grid Lines */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                {/* Coordinate Overlay */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '0.35rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', zIndex: 10 }}>
                  <div style={{ color: 'var(--accent-color)', fontWeight: 800 }}>Radar Sweep Node</div>
                  <div>Lat: {activeWeather.lat?.toFixed(2)}°N / Lon: {activeWeather.lon?.toFixed(2)}°E</div>
                </div>

                {/* Zoom Controls */}
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '0.25rem', zIndex: 10 }}>
                  <button 
                    onClick={() => setDashboardMapZoom(prev => Math.min(prev + 1, 12))}
                    className="btn-icon" 
                    style={{ background: 'rgba(0,0,0,0.6)', width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', padding: 0 }}
                  >
                    +
                  </button>
                  <button 
                    onClick={() => setDashboardMapZoom(prev => Math.max(prev - 1, 2))}
                    className="btn-icon" 
                    style={{ background: 'rgba(0,0,0,0.6)', width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', padding: 0 }}
                  >
                    -
                  </button>
                </div>

                {/* Layer Color Legend */}
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '0.35rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', zIndex: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Min</span>
                    <div style={{ 
                      width: '60px', 
                      height: '6px', 
                      background: dashboardMapLayer === 'radar' || dashboardMapLayer === 'rain' 
                        ? 'linear-gradient(to right, #60a5fa, #34d399, #fbbf24, #ef4444)'
                        : dashboardMapLayer === 'temp' 
                        ? 'linear-gradient(to right, #3b82f6, #60a5fa, #f59e0b, #ef4444)'
                        : 'linear-gradient(to right, #e0f2fe, #38bdf8, #1d4ed8)',
                      borderRadius: '3px' 
                    }} />
                    <span>Max</span>
                  </div>
                </div>

                {/* Simulated Moving Radar Sweep / Clouds */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '20%',
                    left: '25%',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: dashboardMapLayer === 'radar' || dashboardMapLayer === 'rain'
                      ? 'radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, rgba(96, 165, 250, 0.08) 40%, transparent 80%)'
                      : dashboardMapLayer === 'temp'
                      ? 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, rgba(245, 158, 11, 0.06) 50%, transparent 80%)'
                      : 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 75%)',
                    filter: 'blur(15px)',
                    animation: 'radar-pulse 4s infinite linear',
                    transform: `scale(${dashboardMapZoom / 6})`
                  }}
                />

                {/* Map Pin Marker */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    zIndex: 8 
                  }}
                >
                  <div style={{ width: '10px', height: '10px', background: 'var(--accent-color)', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 0 8px var(--accent-color)' }} />
                  <span style={{ fontSize: '0.6rem', background: '#000', padding: '0.1rem 0.35rem', borderRadius: '4px', marginTop: '0.2rem', whiteSpace: 'nowrap' }}>
                    {activeWeather.city}
                  </span>
                </div>

                {/* Radar sweep line */}
                {dashboardMapLayer === 'radar' && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '50%',
                      height: '1px',
                      background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.4) 0%, transparent 100%)',
                      transformOrigin: 'left center',
                      animation: 'radar-sweep 8s linear infinite'
                    }}
                  />
                )}
              </div>
              
              <div style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.01)', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <Info size={14} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                <span>Simulated live {dashboardMapLayer} visualization. Use Radar tab for full-screen analysis.</span>
              </div>
            </div>

          </div>

        </div>
      ) : isLoadingWeather ? (
        <div className="glass-panel" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <RefreshCw size={36} className="animate-spin-slow" style={{ margin: '0 auto 1.5rem auto', color: 'var(--accent-color)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t('retrievingData')}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {t('fetchingForecast')}
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <Sun size={48} style={{ margin: '0 auto 1.5rem auto', color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t('noWeatherTitle')}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {t('noWeatherDesc')}
          </p>
        </div>
      )}
    </div>
  );
};
