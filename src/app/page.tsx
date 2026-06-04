'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import { AestheticBackground } from '../components/AestheticBackground';
import { WeatherDashboard } from '../components/WeatherDashboard';
import { PinnedLocations } from '../components/PinnedLocations';
import { WeatherJournal } from '../components/WeatherJournal';
import { SidebarWidgets } from '../components/SidebarWidgets';
import { 
  LayoutDashboard, 
  Map, 
  Wind, 
  Newspaper, 
  Heart, 
  Settings as SettingsIcon, 
  BookOpen, 
  Search, 
  Mic, 
  User, 
  CloudSun, 
  ShieldAlert, 
  X, 
  Compass, 
  Gauge, 
  Eye, 
  Info,
  Calendar,
  CloudRain,
  Flame,
  Globe,
  Bell,
  Terminal,
  Sun,
  Moon,
  MapPin
} from 'lucide-react';
import { calculateEPAAQI } from '../services/aqiCalculator';

export default function Home() {
  return (
    <AppProvider>
      <WeatherSphereApp />
    </AppProvider>
  );
}

function WeatherSphereApp() {
  const { 
    activeWeather, 
    isLoadingWeather, 
    weatherError, 
    loadWeather, 
    pinnedCities, 
    pinCity,
    tempUnit,
    setTempUnit,
    windUnit,
    setWindUnit,
    notificationsEnabled,
    toggleNotifications,
    themeMode,
    setThemeMode,
    selectedLanguage,
    setSelectedLanguage,
    formatTemp,
    formatWind,
    t,
    isHydrated
  } = useApp();

  // Tab State: 'dashboard' | 'maps' | 'airQuality' | 'news' | 'favorites' | 'journal' | 'settings'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Smart Search & Suggestions
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  
  // Map States
  const [mapLayer, setMapLayer] = useState<'radar' | 'rain' | 'temp' | 'wind' | 'satellite'>('radar');
  const [mapZoom, setMapZoom] = useState(6);

  // Favorites Comparison States
  const [selectedCitiesToCompare, setSelectedCitiesToCompare] = useState<string[]>([]);

  // Clock
  const [currentTime, setCurrentTime] = useState<string>('');

  const searchRef = useRef<HTMLDivElement>(null);

  // Popular and suggested locations
  const POPULAR_LOCATIONS = [
    { name: 'Moscow', code: 'RU', id: 'Moscow' },
    { name: 'London', code: 'GB', id: 'London' },
    { name: 'New York', code: 'US', id: 'New York' },
    { name: 'Tokyo', code: 'JP', id: 'Tokyo' },
    { name: 'Paris', code: 'FR', id: 'Paris' },
    { name: 'Sydney', code: 'AU', id: 'Sydney' }
  ];

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hydrate recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('weathersphere_recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Handle clicking outside search suggestions
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    performSearch(searchQuery);
  };

  const performSearch = (city: string) => {
    loadWeather(city);
    // Add to recent searches
    const updated = [city, ...recentSearches.filter(s => s.toLowerCase() !== city.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('weathersphere_recent_searches', JSON.stringify(updated));
    }
    setSearchQuery('');
    setShowSuggestions(false);
    setActiveTab('dashboard'); // Always switch to dashboard to view result
  };

  // Mock Voice Search
  const handleVoiceSearch = () => {
    if (isVoiceListening) return;
    setIsVoiceListening(true);
    // Simulate listening for 2.5 seconds
    setTimeout(() => {
      setIsVoiceListening(false);
      // Automatically choose Paris or Tokyo etc
      const simulationCities = ['New York', 'Tokyo', 'Paris', 'Moscow', 'London'];
      const randomCity = simulationCities[Math.floor(Math.random() * simulationCities.length)];
      performSearch(randomCity);
    }, 2500);
  };

  const handleCompareCityToggle = (cityName: string) => {
    if (selectedCitiesToCompare.includes(cityName)) {
      setSelectedCitiesToCompare(prev => prev.filter(c => c !== cityName));
    } else {
      if (selectedCitiesToCompare.length >= 10) {
        alert(t('compareMaxAlert').replace('5', '10'));
        return;
      }
      setSelectedCitiesToCompare(prev => [...prev, cityName]);
    }
  };

  return (
    <AestheticBackground>
      <div className="app-layout">
        
        {/* Sidebar Nav (Desktop only) */}
        <aside className="app-sidebar lg-flex" style={{ display: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div className="brand-logo-container">
              <CloudSun size={24} style={{ filter: 'drop-shadow(0 0 4px rgba(0, 209, 255, 0.4))' }} />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '1.35rem', 
                fontWeight: 900, 
                letterSpacing: '-0.02em', 
                lineHeight: 1.1,
                background: 'var(--logo-gradient, linear-gradient(to right, #ffffff, #a4e6ff))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                {t('brand')}
              </h1>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: '0.1rem' }}>
                {t('brandSubtitle')}
              </span>
            </div>
          </div>

          {activeWeather && (
            <div className="sidebar-location-pill">
              <MapPin size={12} style={{ color: 'var(--accent-color)' }} />
              <span>{activeWeather.city}, {activeWeather.country}</span>
            </div>
          )}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '1.5rem' }}>
            <button onClick={() => setActiveTab('dashboard')} className={`sidebar-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}>
              <LayoutDashboard size={16} /> {t('dashboard')}
            </button>
            <button onClick={() => setActiveTab('maps')} className={`sidebar-nav-btn ${activeTab === 'maps' ? 'active' : ''}`}>
              <Map size={16} /> {t('radar')}
            </button>
            <button onClick={() => setActiveTab('airQuality')} className={`sidebar-nav-btn ${activeTab === 'airQuality' ? 'active' : ''}`}>
              <Wind size={16} /> {t('airQuality') || 'Air Quality'}
            </button>
            <button onClick={() => setActiveTab('favorites')} className={`sidebar-nav-btn ${activeTab === 'favorites' ? 'active' : ''}`}>
              <Heart size={16} /> {t('pinnedFavorites')}
            </button>
            <button onClick={() => setActiveTab('journal')} className={`sidebar-nav-btn ${activeTab === 'journal' ? 'active' : ''}`}>
              <BookOpen size={16} /> {t('travelDiary')}
            </button>
            <button onClick={() => setActiveTab('settings')} className={`sidebar-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}>
              <SettingsIcon size={16} /> {t('settings')}
            </button>
          </nav>

          {/* Pinned Favorites list in sidebar */}
          <div className="sidebar-favorites-box">
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.35rem', marginBottom: '0.5rem' }}>
              Pinned Favorites
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto', maxHeight: '180px' }}>
              {pinnedCities.map(city => (
                <div 
                  key={city.id}
                  onClick={() => performSearch(city.name)}
                  className="sidebar-favorite-item"
                >
                  <span style={{ fontWeight: 650, color: 'var(--text-primary)' }}>{city.name}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{city.country}</span>
                </div>
              ))}
              {pinnedCities.length === 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No favorites pinned yet.</span>
              )}
            </div>
          </div>

          {/* Profile Card */}
          <div className="sidebar-profile-card">
            <div className="sidebar-avatar-circle">
              <User size={14} />
            </div>
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">My Account</span>
              <span className="sidebar-profile-role">Premium Member</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="app-main-content">
          
          {/* Header Navigation */}
          <header className="sticky-navbar">
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              
              {/* Brand Logo (Visible on mobile only) */}
              <div 
                onClick={() => setActiveTab('dashboard')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                className="lg-hide"
              >
                <div className="brand-logo-container">
                  <CloudSun size={22} style={{ filter: 'drop-shadow(0 0 4px rgba(0, 209, 255, 0.4))' }} />
                </div>
                <div>
                  <h1 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 900, 
                    letterSpacing: '-0.02em', 
                    lineHeight: 1.1,
                    background: 'var(--logo-gradient, linear-gradient(to right, #ffffff, #a4e6ff))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block'
                  }}>
                    {t('brand')}
                  </h1>
                </div>
              </div>

              {/* Title Header (Visible on desktop only) */}
              <div className="lg-flex" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'capitalize', letterSpacing: '-0.01em' }}>
                  {activeTab === 'dashboard' ? 'Forecast Overview' : activeTab === 'favorites' ? 'Pinned Favorites' : activeTab === 'journal' ? 'Weather Diary' : 'Settings'}
                </h2>
              </div>

              {/* Smart Search Bar */}
              <div ref={searchRef} style={{ position: 'relative', width: '320px' }} className="md-flex">
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    className="input-glass"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    style={{ paddingRight: '2.5rem', height: '36px', fontSize: '0.85rem' }}
                  />
                  <button 
                    type="button" 
                    onClick={handleVoiceSearch} 
                    className="btn-icon" 
                    style={{ position: 'absolute', right: '8px', padding: '0.2rem' }}
                    title={t('voiceSearch')}
                  >
                    <Mic size={15} className={isVoiceListening ? 'animate-bounce text-red-500' : ''} style={{ color: isVoiceListening ? '#ef4444' : 'inherit' }} />
                  </button>
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="glass-panel" style={{ position: 'absolute', top: '105%', left: 0, right: 0, padding: '0.75rem', zIndex: 110, display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--dropdown-bg, rgba(10, 12, 22, 0.95))' }}>
                    {recentSearches.length > 0 && (
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('recent')}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                          {recentSearches.map((city, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => performSearch(city)}
                              className="glass-card" 
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                              <span>{city}</span>
                              <ChevronRightIcon size={12} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('popularLocations')}</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginTop: '0.25rem' }}>
                        {POPULAR_LOCATIONS.map((loc) => (
                          <div 
                            key={loc.id} 
                            onClick={() => performSearch(loc.id)}
                            className="glass-card" 
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'center' }}
                          >
                            <strong>{loc.name}</strong> <span style={{ opacity: 0.6 }}>{loc.code}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile / Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Clock */}
                <div style={{ display: 'none', background: 'rgba(255,255,255,0.03)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-stats)', color: 'var(--text-secondary)' }} className="sm-flex">
                  {currentTime}
                </div>

                <button className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)', width: '34px', height: '34px' }} title="WeatherSphere Profile">
                  <User size={16} />
                </button>
              </div>

            </div>
          </header>

          {/* Voice Search Animated Listening Dialog */}
          {isVoiceListening && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', width: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '8px', height: '30px', background: 'var(--accent-color)', borderRadius: '4px', animation: 'voice-bar 1.2s infinite ease-in-out' }}></div>
                  <div style={{ width: '8px', height: '50px', background: 'var(--accent-color)', borderRadius: '4px', animation: 'voice-bar 1.2s infinite ease-in-out', animationDelay: '0.15s' }}></div>
                  <div style={{ width: '8px', height: '40px', background: 'var(--accent-color)', borderRadius: '4px', animation: 'voice-bar 1.2s infinite ease-in-out', animationDelay: '0.3s' }}></div>
                  <div style={{ width: '8px', height: '20px', background: 'var(--accent-color)', borderRadius: '4px', animation: 'voice-bar 1.2s infinite ease-in-out', animationDelay: '0.45s' }}></div>
                </div>
                <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>{t('listening')}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('sayCity')}</p>
                <style jsx>{`
                  @keyframes voice-bar {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(1.8); }
                  }
                `}</style>
              </div>
            </div>
          )}

          {/* Main Area */}
          <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.5rem' }}>
            
            {/* Weather Alerts Center Widget */}
            {activeWeather && activeWeather.pop !== undefined && activeWeather.pop > 65 && notificationsEnabled && (
              <div 
                className="glass-panel pulse-amber" 
                style={{ 
                  padding: '0.85rem 1.25rem', 
                  marginBottom: '1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  gap: '1rem', 
                  background: 'rgba(245, 158, 11, 0.08)',
                  borderColor: 'rgba(245, 158, 11, 0.25)' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#f59e0b', color: '#000', padding: '0.35rem', borderRadius: '8px', display: 'flex' }}>
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>{t('warningTitle')}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('warningDesc', { pop: activeWeather.pop })}</p>
                  </div>
                </div>
                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>{t('advisory')}</span>
              </div>
            )}

            {/* TAB CONTENTS */}
            
            {/* 1. Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="animate-fade-in">
                
                {/* Mobile Search Widget */}
                <div style={{ marginBottom: '1.5rem', display: 'none' }} className="mobile-search-wrapper">
                  <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="input-glass"
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>
                      <Search size={18} />
                    </button>
                  </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <WeatherDashboard onSwitchTab={setActiveTab} />
                </div>
              </div>
            )}

            {/* 2. Interactive Maps Tab */}
            {activeTab === 'maps' && (
              <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-color)' }}>{t('radarTitle')}</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{t('radarSubtitle')}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <button 
                      onClick={() => setMapLayer('radar')}
                      className={`btn-icon ${mapLayer === 'radar' ? 'active' : ''}`}
                      style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.35rem 0.65rem', background: mapLayer === 'radar' ? 'rgba(56, 189, 248, 0.08)' : 'transparent', color: mapLayer === 'radar' ? 'var(--accent-color)' : 'inherit' }}
                    >
                      {t('radar')}
                    </button>
                    <button 
                      onClick={() => setMapLayer('rain')}
                      className={`btn-icon ${mapLayer === 'rain' ? 'active' : ''}`}
                      style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.35rem 0.65rem', background: mapLayer === 'rain' ? 'rgba(56, 189, 248, 0.08)' : 'transparent', color: mapLayer === 'rain' ? 'var(--accent-color)' : 'inherit' }}
                    >
                      {t('precipitation')}
                    </button>
                    <button 
                      onClick={() => setMapLayer('temp')}
                      className={`btn-icon ${mapLayer === 'temp' ? 'active' : ''}`}
                      style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.35rem 0.65rem', background: mapLayer === 'temp' ? 'rgba(56, 189, 248, 0.08)' : 'transparent', color: mapLayer === 'temp' ? 'var(--accent-color)' : 'inherit' }}
                    >
                      {t('temperature')}
                    </button>
                    <button 
                      onClick={() => setMapLayer('wind')}
                      className={`btn-icon ${mapLayer === 'wind' ? 'active' : ''}`}
                      style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.35rem 0.65rem', background: mapLayer === 'wind' ? 'rgba(56, 189, 248, 0.08)' : 'transparent', color: mapLayer === 'wind' ? 'var(--accent-color)' : 'inherit' }}
                    >
                      {t('windFlow')}
                    </button>
                    <button 
                      onClick={() => setMapLayer('satellite')}
                      className={`btn-icon ${mapLayer === 'satellite' ? 'active' : ''}`}
                      style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.35rem 0.65rem', background: mapLayer === 'satellite' ? 'rgba(56, 189, 248, 0.08)' : 'transparent', color: mapLayer === 'satellite' ? 'var(--accent-color)' : 'inherit' }}
                    >
                      {t('satellite')}
                    </button>
                  </div>
                </div>

                {/* Radar Map Canvas Simulation */}
                <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '12px', background: '#0e111d', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  
                  {/* Grid Lines */}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                  {/* Coordinate Overlay */}
                  <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', zIndex: 10 }}>
                    <div style={{ color: 'var(--accent-color)', fontWeight: 800 }}>{t('radarNode')}</div>
                    <div>{t('location')}: {activeWeather ? `${activeWeather.city}, ${activeWeather.country}` : 'Moscow, RU'}</div>
                    <div style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '0.15rem' }}>
                      {t('coordinates')}: {activeWeather?.lat?.toFixed(4)}°N, {activeWeather?.lon?.toFixed(4)}°E
                    </div>
                  </div>

                  {/* Zoom Controls */}
                  <div style={{ position: 'absolute', bottom: '15px', right: '15px', display: 'flex', flexDirection: 'column', gap: '0.25rem', zIndex: 10 }}>
                    <button 
                      onClick={() => setMapZoom(prev => Math.min(prev + 1, 12))}
                      className="btn-icon" 
                      style={{ background: 'rgba(0,0,0,0.6)', width: '32px', height: '32px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                    <button 
                      onClick={() => setMapZoom(prev => Math.max(prev - 1, 2))}
                      className="btn-icon" 
                      style={{ background: 'rgba(0,0,0,0.6)', width: '32px', height: '32px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                  </div>

                  {/* Layer Color Legend */}
                  <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', zIndex: 10 }}>
                    <span style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>{t('radarLegend')} ({mapLayer.toUpperCase()})</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.65rem' }}>Min</span>
                      <div style={{ 
                        width: '100px', 
                        height: '8px', 
                        background: mapLayer === 'radar' || mapLayer === 'rain' 
                          ? 'linear-gradient(to right, #60a5fa, #34d399, #fbbf24, #ef4444)'
                          : mapLayer === 'temp' 
                          ? 'linear-gradient(to right, #3b82f6, #60a5fa, #f59e0b, #ef4444)'
                          : mapLayer === 'wind'
                          ? 'linear-gradient(to right, #e0f2fe, #38bdf8, #1d4ed8)'
                          : 'linear-gradient(to right, #111827, #374151, #9ca3af, #f9fafb)',
                        borderRadius: '4px' 
                      }} />
                      <span style={{ fontSize: '0.65rem' }}>Max</span>
                    </div>
                  </div>

                  {/* Simulated Moving Radar Sweep / Clouds */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: '25%',
                      left: '30%',
                      width: '280px',
                      height: '280px',
                      borderRadius: '50%',
                      background: mapLayer === 'radar' || mapLayer === 'rain'
                        ? 'radial-gradient(circle, rgba(52, 211, 153, 0.25) 0%, rgba(96, 165, 250, 0.1) 40%, rgba(239, 68, 68, 0.04) 70%, transparent 100%)'
                        : mapLayer === 'temp'
                        ? 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.08) 50%, transparent 80%)'
                        : mapLayer === 'wind'
                        ? 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
                      filter: 'blur(20px)',
                      animation: 'radar-pulse 4s infinite linear',
                      transform: `scale(${mapZoom / 6})`
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
                    <div style={{ width: '12px', height: '12px', background: 'var(--accent-color)', borderRadius: '50%', border: '2.5px solid #fff', boxShadow: '0 0 10px var(--accent-color)' }} />
                    <span style={{ fontSize: '0.65rem', background: '#000', padding: '0.1rem 0.35rem', borderRadius: '4px', marginTop: '0.2rem', whiteSpace: 'nowrap' }}>
                      {activeWeather?.city || 'Moscow'}
                    </span>
                  </div>

                  {/* Radar sweep line */}
                  {mapLayer === 'radar' && (
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

                  <style jsx>{`
                    @keyframes radar-pulse {
                      0%, 100% { transform: scale(1) translate(-10px, -10px); opacity: 0.7; }
                      50% { transform: scale(1.15) translate(10px, 10px); opacity: 0.95; }
                    }
                    @keyframes radar-sweep {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
                
                <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Info size={16} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                  <span>{t('radarInfo')}</span>
                </div>
              </div>
            )}

            {/* 3. Air Quality Tab */}
            {activeTab === 'airQuality' && (() => {
              const aqiVal = activeWeather?.aqi || 2;
              
              const getAqiDetails = (val: number) => {
                switch (val) {
                  case 1:
                    return {
                      score: 95,
                      status: 'Good',
                      color: '#10b981',
                      bg: 'rgba(16, 185, 129, 0.15)',
                      border: 'rgba(16, 185, 129, 0.3)',
                      desc: 'Air quality is satisfactory, and air pollution poses little or no risk. Excellent conditions for outdoor exercises!'
                    };
                  case 2:
                    return {
                      score: 78,
                      status: 'Fair',
                      color: '#84cc16',
                      bg: 'rgba(132, 204, 22, 0.15)',
                      border: 'rgba(132, 204, 22, 0.3)',
                      desc: 'Air quality is acceptable. However, for some pollutants, there may be a moderate health concern for a very small number of individuals.'
                    };
                  case 3:
                    return {
                      score: 55,
                      status: 'Moderate',
                      color: '#eab308',
                      bg: 'rgba(234, 179, 8, 0.15)',
                      border: 'rgba(234, 179, 8, 0.3)',
                      desc: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.'
                    };
                  case 4:
                    return {
                      score: 35,
                      status: 'Poor',
                      color: '#f97316',
                      bg: 'rgba(249, 115, 22, 0.15)',
                      border: 'rgba(249, 115, 22, 0.3)',
                      desc: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.'
                    };
                  case 5:
                    return {
                      score: 12,
                      status: 'Very Poor',
                      color: '#ef4444',
                      bg: 'rgba(239, 68, 68, 0.15)',
                      border: 'rgba(239, 68, 68, 0.3)',
                      desc: 'Health alert: everyone may experience more serious health effects. Outdoor activities should be restricted.'
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

              const pm2_5 = activeWeather?.aqiBreakdown?.pm2_5 ?? 9.2;
              const pm10 = activeWeather?.aqiBreakdown?.pm10 ?? 18.4;
              const no2 = activeWeather?.aqiBreakdown?.no2 ?? 24.1;
              const o3 = activeWeather?.aqiBreakdown?.o3 ?? 48.0;
              const so2 = activeWeather?.aqiBreakdown?.so2 ?? 2.5;
              const co = activeWeather?.aqiBreakdown?.co ?? 245.3;

              const computedUsAqi = calculateEPAAQI({ pm2_5, pm10, co, no2, so2, o3 });
              const aqiDetails = getAqiDetails(aqiVal);
              const dashOffset = 264 - (264 * Math.min(100, Math.max(8, (computedUsAqi / 300) * 100))) / 100;

              // Helper status functions
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

              const getNo2Status = (val: number) => {
                if (val <= 40) return { label: 'Low', color: '#10b981', pct: Math.min(100, Math.max(5, (val / 40) * 30)) };
                if (val <= 100) return { label: 'Moderate', color: '#fbbf24', pct: Math.min(100, 30 + ((val - 40) / 60) * 30) };
                return { label: 'High', color: '#ef4444', pct: Math.min(100, 70 + ((val - 100) / 100) * 30) };
              };

              const getO3Status = (val: number) => {
                if (val <= 60) return { label: 'Low', color: '#10b981', pct: Math.min(100, Math.max(5, (val / 60) * 40)) };
                if (val <= 120) return { label: 'Moderate', color: '#fbbf24', pct: Math.min(100, 40 + ((val - 60) / 60) * 40) };
                return { label: 'High', color: '#ef4444', pct: 90 };
              };

              const getSo2Status = (val: number) => {
                if (val <= 20) return { label: 'Low', color: '#10b981', pct: Math.min(100, Math.max(5, (val / 20) * 40)) };
                return { label: 'Moderate', color: '#fbbf24', pct: 75 };
              };

              const pm25St = getPm25Status(pm2_5);
              const pm10St = getPm10Status(pm10);
              const no2St = getNo2Status(no2);
              const o3St = getO3Status(o3);
              const so2St = getSo2Status(so2);

              return (
                <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="lg-grid-2">
                    
                    {/* Left Column: AQI Progress Gauge */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.06)' }} className="lg-border-right-none">
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-color)', alignSelf: 'flex-start', marginBottom: '1.5rem' }}>Air Quality Index (AQI)</h2>
                      
                      <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="180" height="180" viewBox="0 0 100 100">
                          {/* Background track */}
                          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                          {/* Colored progress arc */}
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="42" 
                            fill="none" 
                            stroke={aqiDetails.color} 
                            strokeWidth="7" 
                            strokeDasharray="264" 
                            strokeDashoffset={dashOffset} 
                            strokeLinecap="round" 
                            transform="rotate(-90 50 50)"
                            style={{ transition: 'stroke-dashoffset 1s ease' }}
                          />
                        </svg>
                        
                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                          <div className="stat-val" style={{ fontSize: '2.8rem', fontWeight: 900, color: aqiDetails.color, lineHeight: 1 }}>{computedUsAqi}</div>
                          <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '0.25rem' }}>EPA AQI Value</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <span className="badge" style={{ background: aqiDetails.bg, color: aqiDetails.color, border: `1px solid ${aqiDetails.border}`, padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '20px' }}>
                          <strong>{aqiDetails.status}</strong>
                          <span style={{ opacity: 0.4 }}>•</span>
                          <span>EPA AQI: <strong className="stat-val">{computedUsAqi}</strong></span>
                          <span style={{ opacity: 0.4 }}>•</span>
                          <span>Scale: <strong className="stat-val">{aqiVal}/5</strong></span>
                        </span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.65rem', maxWidth: '300px' }}>
                          {aqiDetails.desc}
                        </p>
                      </div>
                    </div>

                    {/* Right Column: Pollutants breakdown */}
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Pollutants Concentration Breakdown ({activeWeather?.city})</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        
                        {/* PM 2.5 */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 600 }}>PM2.5 (Fine Particulate Matter)</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{pm2_5.toFixed(1)} µg/m³ <span style={{ color: pm25St.color, fontSize: '0.75rem' }}>({pm25St.label})</span></span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pm25St.pct}%`, height: '100%', background: pm25St.color, borderRadius: '3px' }}></div>
                          </div>
                        </div>

                        {/* PM 10 */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 600 }}>PM10 (Coarse Particulate Matter)</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{pm10.toFixed(1)} µg/m³ <span style={{ color: pm10St.color, fontSize: '0.75rem' }}>({pm10St.label})</span></span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pm10St.pct}%`, height: '100%', background: pm10St.color, borderRadius: '3px' }}></div>
                          </div>
                        </div>

                        {/* NO2 */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 600 }}>NO₂ (Nitrogen Dioxide)</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{no2.toFixed(1)} µg/m³ <span style={{ color: no2St.color, fontSize: '0.75rem' }}>({no2St.label})</span></span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${no2St.pct}%`, height: '100%', background: no2St.color, borderRadius: '3px' }}></div>
                          </div>
                        </div>

                        {/* O3 */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 600 }}>O₃ (Ozone)</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{o3.toFixed(1)} µg/m³ <span style={{ color: o3St.color, fontSize: '0.75rem' }}>({o3St.label})</span></span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${o3St.pct}%`, height: '100%', background: o3St.color, borderRadius: '3px' }}></div>
                          </div>
                        </div>

                        {/* SO2 */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 600 }}>SO₂ (Sulfur Dioxide)</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{so2.toFixed(1)} µg/m³ <span style={{ color: so2St.color, fontSize: '0.75rem' }}>({so2St.label})</span></span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${so2St.pct}%`, height: '100%', background: so2St.color, borderRadius: '3px' }}></div>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {activeTab === 'favorites' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-color)' }}>{t('pinnedFavorites')}</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{t('crossCitySelect')}</p>
                </div>

                <div className="dashboard-grid">
                  <div>
                    <PinnedLocations />
                  </div>

                  <div>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-color)' }}>
                        <Globe size={18} /> {t('crossCityTitle')}
                      </h3>
                      
                      {pinnedCities.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {t('crossCityEmpty')}
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            {t('crossCitySelect')}
                          </p>
                          
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            {pinnedCities.map(city => (
                              <button 
                                key={city.id}
                                onClick={() => handleCompareCityToggle(city.name)}
                                className="btn-secondary"
                                style={{ 
                                  padding: '0.4rem 0.85rem', 
                                  fontSize: '0.75rem', 
                                  borderRadius: '6px',
                                  borderColor: selectedCitiesToCompare.includes(city.name) ? 'var(--accent-color)' : 'rgba(255,255,255,0.08)',
                                  background: selectedCitiesToCompare.includes(city.name) ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                                  color: selectedCitiesToCompare.includes(city.name) ? 'var(--accent-color)' : 'var(--text-primary)'
                                }}
                              >
                                {city.name}
                              </button>
                            ))}
                          </div>

                          {selectedCitiesToCompare.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {t('crossCityBadgeToggle')}
                            </div>
                          ) : (
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{t('crossCityParameter')}</th>
                                    {selectedCitiesToCompare.map((city, idx) => (
                                      <th key={idx} style={{ padding: '0.75rem 0.5rem', color: 'var(--accent-color)', fontWeight: 800 }}>{city}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{t('crossCityActiveTemp')}</td>
                                    {selectedCitiesToCompare.map((city, idx) => (
                                      <td key={idx} className="stat-val" style={{ padding: '0.75rem 0.5rem' }}>
                                        {formatTemp(Math.abs(city.charCodeAt(0) % 15) + 12)}
                                      </td>
                                    ))}
                                  </tr>
                                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{t('crossCityCondition')}</td>
                                    {selectedCitiesToCompare.map((city, idx) => (
                                      <td key={idx} style={{ padding: '0.75rem 0.5rem' }}>
                                        {city.charCodeAt(0) % 2 === 0 ? t('clearSkies') : t('partlyCloudy')}
                                      </td>
                                    ))}
                                  </tr>
                                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{t('crossCityWindSpeed')}</td>
                                    {selectedCitiesToCompare.map((city, idx) => (
                                      <td key={idx} className="stat-val" style={{ padding: '0.75rem 0.5rem' }}>
                                        {formatWind(Math.abs(city.charCodeAt(1) % 25) + 5)}
                                      </td>
                                    ))}
                                  </tr>
                                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{t('crossCityHumidity')}</td>
                                    {selectedCitiesToCompare.map((city, idx) => (
                                      <td key={idx} className="stat-val" style={{ padding: '0.75rem 0.5rem' }}>
                                        {Math.abs(city.charCodeAt(2) % 40) + 45}%
                                      </td>
                                    ))}
                                  </tr>
                                  <tr>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{t('crossCityPrecipProb')}</td>
                                    {selectedCitiesToCompare.map((city, idx) => (
                                      <td key={idx} className="stat-val" style={{ padding: '0.75rem 0.5rem' }}>
                                        {Math.abs(city.charCodeAt(0) % 10) * 10}%
                                      </td>
                                    ))}
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Travel Diary Tab */}
            {activeTab === 'journal' && (
              <div className="animate-fade-in">
                <WeatherJournal />
              </div>
            )}

            {/* 7. Settings Tab */}
            {activeTab === 'settings' && (
              <div className="glass-panel animate-fade-in" style={{ padding: '2rem', maxWidth: '750px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-color)', marginBottom: '1.5rem' }}>{t('settingsTitle')}</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  
                  {/* Temperature unit */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>{t('tempUnitsTitle')}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{t('tempUnitsDesc')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem', borderRadius: '6px' }}>
                      <button 
                        onClick={() => setTempUnit('C')} 
                        className="btn-secondary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: tempUnit === 'C' ? 'var(--accent-color)' : 'transparent', color: tempUnit === 'C' ? '#000' : '#fff', border: 'none', borderRadius: '4px' }}
                      >
                        °C (Celsius)
                      </button>
                      <button 
                        onClick={() => setTempUnit('F')} 
                        className="btn-secondary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: tempUnit === 'F' ? 'var(--accent-color)' : 'transparent', color: tempUnit === 'F' ? '#000' : '#fff', border: 'none', borderRadius: '4px' }}
                      >
                        °F (Fahrenheit)
                      </button>
                    </div>
                  </div>

                  {/* Wind speed unit */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>{t('windUnitsTitle')}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{t('windUnitsDesc')}</p>
                    </div>
                    <select 
                      value={windUnit} 
                      onChange={(e) => setWindUnit(e.target.value)}
                      className="input-glass"
                      style={{ width: '120px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      <option value="km/h">km/h</option>
                      <option value="mph">mph</option>
                      <option value="m/s">m/s</option>
                    </select>
                  </div>

                  {/* Notifications */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>{t('notificationsTitle')}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{t('notificationsDesc')}</p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                      <input 
                        type="checkbox" 
                        checked={notificationsEnabled} 
                        onChange={toggleNotifications}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span 
                        style={{ 
                          position: 'absolute', 
                          cursor: 'pointer', 
                          top: 0, left: 0, right: 0, bottom: 0, 
                          backgroundColor: notificationsEnabled ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)', 
                          transition: '.4s', 
                          borderRadius: '24px' 
                        }}
                      >
                        <span 
                          style={{ 
                            position: 'absolute', 
                            content: '""', 
                            height: '18px', width: '18px', 
                            left: '3px', bottom: '3px', 
                            backgroundColor: notificationsEnabled ? '#000' : '#fff', 
                            transition: '.4s', 
                            borderRadius: '50%',
                            transform: notificationsEnabled ? 'translateX(20px)' : 'none'
                          }} 
                        />
                      </span>
                    </label>
                  </div>

                  {/* Theme presets */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>{t('aestheticTitle')}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{t('aestheticDesc')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {['Dynamic', 'Classic Dark', 'Frosted'].map((tName) => (
                        <button 
                          key={tName}
                          onClick={() => setThemeMode(tName)}
                          className="btn-secondary"
                          style={{ 
                            padding: '0.35rem 0.65rem', 
                            fontSize: '0.75rem', 
                            borderRadius: '4px',
                            background: themeMode === tName ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                            borderColor: themeMode === tName ? 'var(--accent-color)' : 'rgba(255,255,255,0.08)',
                            color: themeMode === tName ? 'var(--accent-color)' : 'inherit'
                          }}
                        >
                          {tName}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language selection */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>{t('languageTitle')}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{t('languageDesc')}</p>
                    </div>
                    <select 
                      value={selectedLanguage} 
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="input-glass"
                      style={{ width: '120px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      <option value="English">English</option>
                      <option value="Español">Español</option>
                      <option value="Français">Français</option>
                      <option value="Deutsch">Deutsch</option>
                      <option value="Russian">Russian</option>
                    </select>
                  </div>

                </div>
              </div>
            )}

          </main>

          {/* Sticky/Floating Bottom Navigation (Mobile & Tablet) */}
          <nav className="mobile-bottom-nav lg-hide">
            <button onClick={() => setActiveTab('dashboard')} className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} style={{ padding: '0.35rem 0.4rem' }}>
              <LayoutDashboard size={18} />
              <span>{t('dashboard')}</span>
            </button>
            <button onClick={() => setActiveTab('maps')} className={`mobile-nav-item ${activeTab === 'maps' ? 'active' : ''}`} style={{ padding: '0.35rem 0.4rem' }}>
              <Map size={18} />
              <span>{t('radar')}</span>
            </button>
            <button onClick={() => setActiveTab('airQuality')} className={`mobile-nav-item ${activeTab === 'airQuality' ? 'active' : ''}`} style={{ padding: '0.35rem 0.4rem' }}>
              <Wind size={18} />
              <span>{t('airQuality') || 'AQI'}</span>
            </button>
            <button onClick={() => setActiveTab('favorites')} className={`mobile-nav-item ${activeTab === 'favorites' ? 'active' : ''}`} style={{ padding: '0.35rem 0.4rem' }}>
              <Heart size={18} />
              <span>{t('pinnedFavorites')}</span>
            </button>
            <button onClick={() => setActiveTab('journal')} className={`mobile-nav-item ${activeTab === 'journal' ? 'active' : ''}`} style={{ padding: '0.35rem 0.4rem' }}>
              <BookOpen size={18} />
              <span>{t('travelDiary')}</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`mobile-nav-item ${activeTab === 'settings' ? 'active' : ''}`} style={{ padding: '0.35rem 0.4rem' }}>
              <SettingsIcon size={18} />
              <span>{t('settings')}</span>
            </button>
          </nav>

          {/* Footer */}
          <footer style={{ marginTop: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', paddingBottom: '2.5rem' }}>
            <p>© 2026 WeatherSphere. Built with Next.js App Router and Vanilla CSS.</p>
            <p style={{ marginTop: '0.25rem', opacity: 0.65 }}>Designed as a top-tier meteorological dashboard for millions of global users.</p>
          </footer>


        </div>
      </div>
    </AestheticBackground>
  );
}

// Simple Helper Component
function ChevronRightIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
