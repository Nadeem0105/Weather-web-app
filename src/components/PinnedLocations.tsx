'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PinnedCity, UnifiedWeather } from '../types/weather';
import { fetchWeather } from '../services/weatherService';
import { Trash2, Pin, Tag, Sun, Cloud, CloudRain, Snowflake, CloudLightning, CloudFog, MapPin } from 'lucide-react';

// Sub-component for individual pinned city card to manage its own weather loading
const PinnedCityCard: React.FC<{
  city: PinnedCity;
  onSelect: (name: string) => void;
  onUnpin: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
}> = ({ city, onSelect, onUnpin, onUpdateLabel }) => {
  const { formatTemp, t } = useApp();
  const [weather, setWeather] = useState<UnifiedWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelText, setLabelText] = useState(city.label || '');

  useEffect(() => {
    let active = true;
    const getMiniWeather = async () => {
      setLoading(true);
      try {
        const data = await fetchWeather(city.name);
        if (active) setWeather(data);
      } catch (err) {
        console.error(`Error loading pinned weather for ${city.name}`, err);
      } finally {
        if (active) setLoading(false);
      }
    };
    getMiniWeather();
    return () => { active = false; };
  }, [city.name]);

  const handleSaveLabel = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateLabel(city.id, labelText);
    setEditingLabel(false);
  };

  const getWeatherIcon = (iconName?: string) => {
    switch (iconName) {
      case 'sunny': return <Sun size={18} style={{ color: '#fbbf24' }} className="animate-spin-slow" />;
      case 'cloudy': return <Cloud size={18} style={{ color: '#9ca3af' }} />;
      case 'rainy': return <CloudRain size={18} style={{ color: '#60a5fa' }} />;
      case 'snowy': return <Snowflake size={18} style={{ color: '#93c5fd' }} />;
      case 'stormy': return <CloudLightning size={18} style={{ color: '#c084fc' }} />;
      case 'misty': return <CloudFog size={18} style={{ color: '#2dd4bf' }} />;
      default: return <Sun size={18} style={{ color: '#fbbf24' }} />;
    }
  };

  const getWeatherIllustration = (iconName?: string) => {
    if (!iconName) return '/images/weather_sunny.png';
    switch (iconName.toLowerCase()) {
      case 'sunny': return '/images/weather_sunny.png';
      case 'cloudy': return '/images/weather_cloudy.png';
      case 'rainy': return '/images/weather_rainy.png';
      case 'snowy': return '/images/weather_snowy.png';
      case 'stormy': return '/images/weather_stormy.png';
      case 'misty': return '/images/weather_misty.png';
      default: return '/images/weather_sunny.png';
    }
  };

  return (
    <div 
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        cursor: 'pointer',
        padding: '0.85rem 1rem',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0
      }}
      onClick={() => onSelect(city.name)}
    >
      {weather && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '100px',
          height: '100%',
          opacity: 0.12,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 10%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 10%, rgba(0,0,0,0) 100%)',
        }}>
          <img 
            src={getWeatherIllustration(weather.icon)} 
            alt="" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={13} style={{ color: 'var(--accent-color)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{city.name}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{city.country}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
          <button 
            className="btn-icon" 
            style={{ padding: '0.25rem' }}
            title="Edit Label"
            onClick={() => setEditingLabel(!editingLabel)}
          >
            <Tag size={12} />
          </button>
          <button 
            className="btn-icon danger" 
            style={{ padding: '0.25rem' }}
            title="Unpin location"
            onClick={() => onUnpin(city.id)}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {editingLabel ? (
        <form 
          onSubmit={handleSaveLabel} 
          onClick={(e) => e.stopPropagation()} 
          style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}
        >
          <input 
            type="text" 
            className="input-glass"
            placeholder={t('tagLabel')}
            value={labelText}
            onChange={(e) => setLabelText(e.target.value)}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}
            autoFocus
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}>
            {t('save')}
          </button>
        </form>
      ) : (
        city.label && (
          <span style={{ 
            fontSize: '0.7rem', 
            background: 'rgba(56, 189, 248, 0.08)', 
            border: '1px solid rgba(56, 189, 248, 0.15)',
            color: 'var(--accent-color)',
            alignSelf: 'flex-start',
            padding: '0.1rem 0.35rem',
            borderRadius: '4px',
            marginTop: '-0.15rem'
          }}>
            {city.label}
          </span>
        )
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
        {loading ? (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('updating')}</span>
        ) : weather ? (
          <>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t(weather.icon.toLowerCase()) || weather.condition}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {getWeatherIcon(weather.icon)}
              <span className="stat-val" style={{ fontSize: '1rem', fontWeight: 700 }}>{formatTemp(weather.temp)}</span>
            </div>
          </>
        ) : (
          <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{t('offline')}</span>
        )}
      </div>
    </div>
  );
};

export const PinnedLocations: React.FC = () => {
  const { pinnedCities, pinCity, unpinCity, updatePinnedCityLabel, loadWeather, activeWeather, t } = useApp();
  const [newCityName, setNewCityName] = useState('');
  const [newCityCountry, setNewCityCountry] = useState('GB');
  const [newCityLabel, setNewCityLabel] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) {
      alert('Please enter a city name');
      return;
    }
    pinCity(newCityName.trim(), newCityCountry, newCityLabel.trim());
    setNewCityName('');
    setNewCityLabel('');
    setShowAddForm(false);
  };

  const handlePinCurrent = () => {
    if (!activeWeather) return;
    pinCity(activeWeather.city, activeWeather.country, 'Favorite');
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>{t('pinnedPlaces')}</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('pinnedSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {activeWeather && !pinnedCities.some(c => c.name.toLowerCase() === activeWeather.city.toLowerCase()) && (
            <button 
              className="btn-secondary" 
              onClick={handlePinCurrent} 
              title="Pin Current City"
              style={{ padding: '0.5rem', borderRadius: '50%' }}
            >
              <Pin size={14} />
            </button>
          )}
          <button 
            className="btn-primary" 
            onClick={() => setShowAddForm(!showAddForm)} 
            style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
          >
            {t('pinCity')}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddPin} className="glass-card animate-fade-in" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('cityName')}</label>
            <input 
              type="text" 
              className="input-glass" 
              placeholder="e.g. New York" 
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              required
              style={{ padding: '0.5rem', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('countryCode')}</label>
              <input 
                type="text" 
                className="input-glass" 
                placeholder="e.g. US" 
                maxLength={3}
                value={newCityCountry}
                onChange={(e) => setNewCityCountry(e.target.value.toUpperCase())}
                style={{ padding: '0.5rem', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('tagLabel')}</label>
              <input 
                type="text" 
                className="input-glass" 
                placeholder="e.g. Office" 
                value={newCityLabel}
                onChange={(e) => setNewCityLabel(e.target.value)}
                style={{ padding: '0.5rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => setShowAddForm(false)}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}>
              {t('addPin')}
            </button>
          </div>
        </form>
      )}

      {pinnedCities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.85rem' }}>{t('noPinnedTitle')}</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{t('noPinnedDesc')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1, maxHeight: '600px', overflowY: 'auto', paddingRight: '2px' }}>
          {pinnedCities.map((city) => (
            <PinnedCityCard 
              key={city.id} 
              city={city} 
              onSelect={loadWeather} 
              onUnpin={unpinCity} 
              onUpdateLabel={updatePinnedCityLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
};
