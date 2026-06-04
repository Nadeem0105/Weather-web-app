'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Navigation, Heart, ArrowRight } from 'lucide-react';

interface SidebarWidgetsProps {
  onSwitchTab: (tab: string) => void;
}

export const SidebarWidgets: React.FC<SidebarWidgetsProps> = ({ onSwitchTab }) => {
  const { activeWeather, t } = useApp();

  if (!activeWeather) return null;

  // Dynamic travel recommendations based on weather
  const getTravelTips = () => {
    const cond = activeWeather.icon?.toLowerCase() || 'sunny';
    switch (cond) {
      case 'sunny':
        return {
          title: 'Sunny & Clear Skies',
          text: 'Perfect for city walking tours, sightseeing, or hiking. Wear sunscreen, bring sunglasses, and stay hydrated!',
          activity: 'Outdoor tours / Scenic viewpoints'
        };
      case 'cloudy':
        return {
          title: 'Overcast & Cool',
          text: 'Optimal soft lighting for outdoor photography and walking without the heat. Great day for historical tours.',
          activity: 'Photography walk / Food tour'
        };
      case 'rainy':
        return {
          title: 'Rain & Drizzles Active',
          text: 'Rain showers present. Perfect opportunity to check out local indoor museums, galleries, cafes, or theatres.',
          activity: 'Art Museum visit / Specialty Coffee'
        };
      case 'snowy':
        return {
          title: 'Snow & Frosty Vibe',
          text: 'Freezing conditions. Layer up with thermals, thick gloves, and waterproof footwear. Enjoy winter sights safely.',
          activity: 'Winter market visit / Hot chocolate'
        };
      case 'stormy':
        return {
          title: 'Thunderstorms Expected',
          text: 'High winds and heavy rain. Best to remain indoors in safe structures, charge devices, and defer road travel.',
          activity: 'Cozy up indoors / Virtual museum tour'
        };
      case 'misty':
        return {
          title: 'Mist & Low Visibility',
          text: 'Foggy conditions. Walk carefully in parks; if driving, ensure fog lights are active. Mystical city visuals.',
          activity: 'Quiet park walk / Historic library'
        };
      default:
        return {
          title: 'Temperate Conditions',
          text: 'Generally safe and clear for sightseeing. Pack a light jacket and go explore the local hotspots!',
          activity: 'Explore city attractions'
        };
    }
  };

  const tips = getTravelTips();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Smart Travel Tips Card */}
      <div className="glass-panel" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ffb020' }}>
          <Sparkles size={16} /> Traveler Companion
        </h3>
        
        <div style={{ marginBottom: '0.85rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '0.25rem' }}>
            {tips.title}
          </div>
          <p style={{ fontSize: '0.75rem', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
            {tips.text}
          </p>
        </div>

        <div style={{ 
          background: 'var(--glass-bg)', 
          padding: '0.65rem 0.85rem', 
          borderRadius: '8px', 
          borderLeft: '3px solid #ffb020', 
          marginBottom: '0.85rem' 
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Recommended Highlight</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{tips.activity}</div>
        </div>

        <button 
          className="btn-primary" 
          onClick={() => onSwitchTab('journal')}
          style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem', 
            padding: '0.55rem', 
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: '8px'
          }}
        >
          <Heart size={12} /> Record Memory in Diary
        </button>
      </div>
      
    </div>
  );
};

export default SidebarWidgets;
