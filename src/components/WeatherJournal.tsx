'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Calendar, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Plus, 
  MapPin, 
  Sun, 
  Cloud, 
  CloudRain, 
  Snowflake, 
  CloudLightning, 
  Wind, 
  Compass 
} from 'lucide-react';
import { WeatherJournalEntry } from '../types/weather';
import { fetchWeather } from '../services/weatherService';

// Helper to define weather card themes based on the condition
const getWeatherTheme = (cond: string) => {
  const c = cond ? cond.toLowerCase() : '';
  if (c.includes('sun') || c.includes('clear')) {
    return {
      accent: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.2)',
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
      border: 'rgba(245, 158, 11, 0.2)',
      emoji: '☀️'
    };
  }
  if (c.includes('cloud') || c.includes('overcast')) {
    return {
      accent: '#94a3b8',
      glow: 'rgba(148, 163, 184, 0.15)',
      bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.06) 0%, rgba(15, 23, 42, 0.6) 100%)',
      border: 'rgba(148, 163, 184, 0.15)',
      emoji: '☁️'
    };
  }
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
    return {
      accent: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.2)',
      bg: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
      border: 'rgba(56, 189, 248, 0.2)',
      emoji: '🌧️'
    };
  }
  if (c.includes('snow') || c.includes('ice') || c.includes('flurry')) {
    return {
      accent: '#cbd5e1',
      glow: 'rgba(203, 213, 225, 0.2)',
      bg: 'linear-gradient(135deg, rgba(203, 213, 225, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
      border: 'rgba(203, 213, 225, 0.2)',
      emoji: '❄️'
    };
  }
  if (c.includes('storm') || c.includes('thunder')) {
    return {
      accent: '#c084fc',
      glow: 'rgba(192, 132, 252, 0.25)',
      bg: 'linear-gradient(135deg, rgba(192, 132, 252, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
      border: 'rgba(192, 132, 252, 0.2)',
      emoji: '⛈️'
    };
  }
  return { // Misty / Windy / Default
    accent: '#2dd4bf',
    glow: 'rgba(45, 212, 191, 0.2)',
    bg: 'linear-gradient(135deg, rgba(45, 212, 191, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
    border: 'rgba(45, 212, 191, 0.2)',
    emoji: '🌫️'
  };
};

// Helper to return the lucide icon matching the condition
const getWeatherIcon = (cond: string, size = 18) => {
  const c = cond ? cond.toLowerCase() : '';
  if (c.includes('sun') || c.includes('clear')) {
    return <Sun size={size} style={{ color: '#f59e0b' }} />;
  }
  if (c.includes('cloud') || c.includes('overcast')) {
    return <Cloud size={size} style={{ color: '#94a3b8' }} />;
  }
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
    return <CloudRain size={size} style={{ color: '#38bdf8' }} />;
  }
  if (c.includes('snow') || c.includes('ice') || c.includes('flurry')) {
    return <Snowflake size={size} style={{ color: '#cbd5e1' }} />;
  }
  if (c.includes('storm') || c.includes('thunder')) {
    return <CloudLightning size={size} style={{ color: '#c084fc' }} />;
  }
  return <Wind size={size} style={{ color: '#2dd4bf' }} />;
};

export const WeatherJournal: React.FC = () => {
  const { 
    journalEntries, 
    addJournalEntry, 
    updateJournalEntry, 
    deleteJournalEntry, 
    activeWeather,
    formatTemp,
    tempUnit,
    t,
    selectedLanguage
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Unified Form States for Adding/Editing
  const [city, setCity] = useState('');
  const [temp, setTemp] = useState(20);
  const [condition, setCondition] = useState('Sunny');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Weather auto-matching states
  const [isMatchingWeather, setIsMatchingWeather] = useState(false);
  const [matchingStatus, setMatchingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fetchedWeatherData, setFetchedWeatherData] = useState<any | null>(null);

  // Auto-select first entry
  useEffect(() => {
    if (journalEntries.length > 0 && !selectedEntryId) {
      setSelectedEntryId(journalEntries[0].id);
    } else if (journalEntries.length === 0) {
      setSelectedEntryId(null);
    }
  }, [journalEntries, selectedEntryId]);

  // Handle deleted selection fallback
  useEffect(() => {
    if (selectedEntryId && !journalEntries.some(e => e.id === selectedEntryId)) {
      setSelectedEntryId(journalEntries[0]?.id || null);
    }
  }, [journalEntries, selectedEntryId]);

  const handleOpenAdd = () => {
    if (activeWeather) {
      setCity(activeWeather.city);
      setTemp(activeWeather.temp);
      setCondition(activeWeather.condition);
    } else {
      setCity('');
      setTemp(20);
      setCondition('Sunny');
    }
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
    setFetchedWeatherData(null);
    setIsMatchingWeather(false);
    setMatchingStatus('idle');
    setShowAddForm(true);
  };

  const handleOpenEdit = (entry: WeatherJournalEntry) => {
    setEditingId(entry.id);
    setCity(entry.city);
    setTemp(entry.temp);
    setCondition(entry.condition);
    setNotes(entry.notes);
    setDate(entry.date);
    setFetchedWeatherData(null);
    setIsMatchingWeather(false);
    setMatchingStatus('idle');
    setShowAddForm(false);
  };

  // Weather API parsing mapper
  const mapWeatherCondition = (apiCond: string): string => {
    const c = apiCond ? apiCond.toLowerCase() : '';
    if (c.includes('clear') || c.includes('sun')) return 'Sunny';
    if (c.includes('cloud') || c.includes('overcast') || c.includes('haze')) return 'Cloudy';
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'Rainy';
    if (c.includes('snow') || c.includes('ice') || c.includes('flurry')) return 'Snowy';
    if (c.includes('storm') || c.includes('thunder')) return 'Stormy';
    if (c.includes('mist') || c.includes('fog') || c.includes('smoke') || c.includes('dust')) return 'Misty';
    return 'Sunny';
  };

  // Date and Forecast correlation logic
  const matchWeatherForDate = (weatherData: any, selectedDateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDateStr === todayStr) {
      return {
        temp: weatherData.temp,
        condition: mapWeatherCondition(weatherData.condition)
      };
    }
    
    try {
      const dateObj = new Date(selectedDateStr);
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = daysOfWeek[dateObj.getDay()];
      
      const match = weatherData.forecast?.find((f: any) => f.date === dayName);
      if (match) {
        return {
          temp: Math.round((match.tempMin + match.tempMax) / 2),
          condition: mapWeatherCondition(match.condition)
        };
      }
    } catch (e) {
      console.error('Error matching date forecast:', e);
    }
    
    return {
      temp: weatherData.temp,
      condition: mapWeatherCondition(weatherData.condition)
    };
  };

  const fetchAndMatchWeather = async (cityName: string, targetDate: string) => {
    if (!cityName.trim()) return;
    setIsMatchingWeather(true);
    setMatchingStatus('idle');
    try {
      const data = await fetchWeather(cityName.trim());
      setFetchedWeatherData(data);
      const matched = matchWeatherForDate(data, targetDate);
      setTemp(matched.temp);
      setCondition(matched.condition);
      setMatchingStatus('success');
    } catch (err) {
      console.error('Failed to auto-fetch weather details:', err);
      setMatchingStatus('error');
    } finally {
      setIsMatchingWeather(false);
    }
  };

  const handleCityBlur = () => {
    fetchAndMatchWeather(city, date);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (fetchedWeatherData) {
      const matched = matchWeatherForDate(fetchedWeatherData, newDate);
      setTemp(matched.temp);
      setCondition(matched.condition);
    } else {
      fetchAndMatchWeather(city, newDate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) {
      alert('City name is required');
      return;
    }
    if (!notes.trim()) {
      alert('Please write some notes');
      return;
    }

    if (editingId) {
      updateJournalEntry(editingId, notes.trim(), Number(temp), condition, city.trim(), date);
      setEditingId(null);
    } else {
      addJournalEntry({
        date,
        city: city.trim(),
        temp: Number(temp),
        condition,
        notes: notes.trim()
      });
      setShowAddForm(false);
    }
    setNotes('');
  };

  const filteredEntries = journalEntries.filter(entry => 
    entry.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLocale = (lang: string) => {
    switch (lang) {
      case 'Español': return 'es-ES';
      case 'Français': return 'fr-FR';
      case 'Deutsch': return 'de-DE';
      case 'Russian': return 'ru-RU';
      default: return 'en-US';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(getLocale(selectedLanguage), { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const selectedEntry = journalEntries.find(e => e.id === selectedEntryId) || null;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.75rem', minHeight: '620px' }}>
      <div className="journal-container">
        
        {/* LEFT COLUMN: LIST & SEARCH */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-primary)' }}>
                <BookOpen size={20} style={{ color: 'var(--accent-color)' }} />
                {t('weatherJournalTitle')}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{t('weatherJournalDesc')}</p>
            </div>
            <button className="btn-primary" onClick={handleOpenAdd} style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              <Plus size={15} /> {t('newEntry')}
            </button>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <div className="journal-stats-card">
              <div className="stat-val" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-color)' }}>{journalEntries.length}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginTop: '0.1rem' }}>
                {t('totalMemories') || 'Memories'}
              </div>
            </div>
            <div className="journal-stats-card">
              <div className="stat-val" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399' }}>
                {new Set(journalEntries.map(e => e.city.toLowerCase())).size}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginTop: '0.1rem' }}>
                {t('citiesVisited') || 'Cities'}
              </div>
            </div>
            <div className="journal-stats-card">
              <div className="stat-val" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b' }}>
                {journalEntries.length > 0 
                  ? formatTemp(Math.round(journalEntries.reduce((acc, curr) => acc + curr.temp, 0) / journalEntries.length)) 
                  : '--'}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginTop: '0.1rem' }}>
                {t('avgTemp') || 'Avg Temp'}
              </div>
            </div>
          </div>

          {/* Search Input */}
          {journalEntries.length > 0 && (
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="input-glass" 
                placeholder={t('searchDiaryPlaceholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.2rem', paddingRight: '1rem', paddingTop: '0.55rem', paddingBottom: '0.55rem', fontSize: '0.82rem', borderRadius: '8px' }}
              />
              <Search size={13} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Diary Entries List */}
          <div className="journal-list-pane">
            {filteredEntries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'var(--glass-bg)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                <BookOpen size={24} style={{ margin: '0 auto 0.75rem auto', strokeWidth: 1.5, opacity: 0.35, color: 'var(--text-muted)' }} />
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('noDiaryEntries')}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                  {journalEntries.length > 0 ? t('trySearchingElse') : t('logDailyExperience')}
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const theme = getWeatherTheme(entry.condition);
                const isSelected = selectedEntryId === entry.id;

                return (
                  <div 
                    key={entry.id} 
                    onClick={() => {
                      setSelectedEntryId(entry.id);
                      setShowAddForm(false);
                      setEditingId(null);
                    }}
                    style={{ 
                      padding: '0.85rem 1rem', 
                      position: 'relative',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(255, 255, 255, 0.06)' : theme.bg,
                      borderRadius: '10px',
                      border: '1px solid',
                      borderLeftWidth: '4px',
                      borderLeftColor: theme.accent,
                      borderTopColor: isSelected ? theme.border : 'rgba(255, 255, 255, 0.03)',
                      borderRightColor: isSelected ? theme.border : 'rgba(255, 255, 255, 0.03)',
                      borderBottomColor: isSelected ? theme.border : 'rgba(255, 255, 255, 0.03)',
                      boxShadow: isSelected ? `0 0 10px ${theme.glow}` : 'none',
                      transform: isSelected ? 'translateY(-1px)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={11} style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{entry.city}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {formatDate(entry.date)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4.rem', marginBottom: '0.35rem' }}>
                      <span className="stat-val" style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.accent }}>
                        {formatTemp(entry.temp)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {getWeatherIcon(entry.condition, 12)}
                        <span>{t(entry.condition.toLowerCase()) || entry.condition}</span>
                      </div>
                    </div>

                    <p style={{ 
                      fontSize: '0.78rem', 
                      color: 'var(--text-muted)', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      margin: 0
                    }}>
                      {entry.notes}
                    </p>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: DETAIL VIEW / FORM EDITOR */}
        <div className="journal-detail-pane">
          
          {/* 1. RENDER FORM (ADD OR EDIT) */}
          {(showAddForm || editingId !== null) ? (
            <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', border: '1px solid var(--journal-detail-border)', background: 'var(--journal-form-bg)', flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Edit3 size={16} style={{ color: 'var(--accent-color)' }} />
                  {editingId ? t('editEntry') || 'Edit Weather Entry' : t('addWeatherEntry')}
                </h3>
                <button 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                  }} 
                  className="btn-icon" 
                  style={{ width: '26px', height: '26px', borderRadius: '6px' }}
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      {t('location')}
                    </label>
                    <input 
                      type="text" 
                      className="input-glass" 
                      placeholder="e.g. Paris" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      onBlur={handleCityBlur}
                      style={{ fontSize: '0.85rem', padding: '0.55rem 0.75rem', borderRadius: '6px' }}
                      required
                    />
                    {isMatchingWeather && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--accent-color)', marginTop: '0.25rem', display: 'block' }}>
                        {t('matchingWeather') || 'Matching weather...'}
                      </span>
                    )}
                    {!isMatchingWeather && matchingStatus === 'success' && (
                      <span style={{ fontSize: '0.65rem', color: '#34d399', marginTop: '0.25rem', display: 'block' }}>
                        ✓ {t('weatherAutofilled') || 'Weather auto-filled'}
                      </span>
                    )}
                    {!isMatchingWeather && matchingStatus === 'error' && (
                      <span style={{ fontSize: '0.65rem', color: '#f87171', marginTop: '0.25rem', display: 'block' }}>
                        ⚠ {t('weatherMatchError') || 'City not found'}
                      </span>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      {t('date')}
                    </label>
                    <input 
                      type="date" 
                      className="input-glass" 
                      value={date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '0.55rem 0.75rem', borderRadius: '6px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      {t('tempLabel')} (°{tempUnit})
                    </label>
                    <input 
                      type="number" 
                      className="input-glass" 
                      value={tempUnit === 'F' ? Math.round((temp * 9) / 5 + 32) : temp}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const celsiusVal = tempUnit === 'F' ? Math.round(((val - 32) * 5) / 9) : val;
                        setTemp(celsiusVal);
                      }}
                      style={{ fontSize: '0.85rem', padding: '0.55rem 0.75rem', borderRadius: '6px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      {t('condition')}
                    </label>
                    <select 
                      className="input-glass" 
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      style={{ appearance: 'none', WebkitAppearance: 'none', fontSize: '0.85rem', padding: '0.55rem 0.75rem', borderRadius: '6px' }}
                    >
                      <option value="Sunny" style={{ background: '#0f172a' }}>{t('sunny')}</option>
                      <option value="Cloudy" style={{ background: '#0f172a' }}>{t('cloudy')}</option>
                      <option value="Rainy" style={{ background: '#0f172a' }}>{t('rainy')}</option>
                      <option value="Snowy" style={{ background: '#0f172a' }}>{t('snowy')}</option>
                      <option value="Stormy" style={{ background: '#0f172a' }}>{t('stormy')}</option>
                      <option value="Misty" style={{ background: '#0f172a' }}>{t('misty')}</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    {t('diaryNotes')}
                  </label>
                  <textarea 
                    className="input-glass" 
                    placeholder={t('notesPlaceholder')} 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ minHeight: '130px', fontSize: '0.85rem', padding: '0.65rem', borderRadius: '6px', resize: 'none', flexGrow: 1 }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem', borderRadius: '6px' }} 
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                    }}
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem', borderRadius: '6px' }}
                  >
                    {t('saveEntry')}
                  </button>
                </div>

              </form>

            </div>
          ) : selectedEntry ? (
            
            /* 2. RENDER SELECTED ENTRY DETAILED CARD */
            (() => {
              const theme = getWeatherTheme(selectedEntry.condition);
              return (
                <div 
                  className="glass-card animate-fade-in" 
                  style={{ 
                    padding: '1.5rem', 
                    borderRadius: '14px', 
                    border: `1px solid ${theme.border}`, 
                    background: theme.bg,
                    boxShadow: `0 0 20px ${theme.glow}`, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%', 
                    flexGrow: 1, 
                    transition: 'all 0.3s ease' 
                  }}
                >
                  
                  {/* Detailed Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <MapPin size={15} style={{ color: theme.accent }} />
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {selectedEntry.city}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                        <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {formatDate(selectedEntry.date)}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4.rem' }}>
                        {getWeatherIcon(selectedEntry.condition, 24)}
                        <span className="stat-val" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {formatTemp(selectedEntry.temp)}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.accent, marginTop: '0.15rem', textTransform: 'uppercase' }}>
                        {t(selectedEntry.condition.toLowerCase()) || selectedEntry.condition}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Card Notes */}
                  <div style={{ flexGrow: 1, overflowY: 'auto', background: 'var(--journal-notes-bg, rgba(0,0,0,0.15))', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', minHeight: '160px' }}>
                    <p style={{ 
                      fontSize: '0.92rem', 
                      color: 'var(--text-primary)', 
                      lineHeight: '1.6', 
                      whiteSpace: 'pre-wrap', 
                      letterSpacing: '0.01em',
                      margin: 0 
                    }}>
                      {selectedEntry.notes}
                    </p>
                  </div>

                  {/* Detailed Card Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem' }}>
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleOpenEdit(selectedEntry)}
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', borderRadius: '6px', gap: '0.35rem' }}
                    >
                      <Edit3 size={13} />
                      {t('editEntry') || 'Edit Note'}
                    </button>
                    <button 
                      className="btn-danger" 
                      onClick={() => deleteJournalEntry(selectedEntry.id)}
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', borderRadius: '6px', gap: '0.35rem' }}
                    >
                      <Trash2 size={13} />
                      {t('delete') || 'Delete'}
                    </button>
                  </div>

                </div>
              );
            })()

          ) : (

            /* 3. RENDER EMPTY STATE DECORATION PANEL */
            <div className="glass-card animate-fade-in" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, height: '100%' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.06)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                <Compass size={32} className="animate-float" style={{ color: 'var(--accent-color)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {t('noEntrySelected') || 'No Journal Selected'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '280px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                {t('selectOrWriteEntry') || 'Select a trip memory from the left panel to review weather telemetry, or create a brand new journal memory.'}
              </p>
              <button className="btn-primary" onClick={handleOpenAdd} style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}>
                <Plus size={16} /> {t('newEntry')}
              </button>
            </div>

          )}

        </div>

      </div>
    </div>
  );
};
