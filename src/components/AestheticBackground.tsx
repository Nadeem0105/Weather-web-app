'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export const AestheticBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeWeather, themeMode } = useApp();
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number; duration: number; size: number }[]>([]);
  const [clouds, setClouds] = useState<{ id: number; top: number; size: number; duration: number; opacity: number }[]>([]);
  
  const weatherIcon = activeWeather?.icon?.toLowerCase() || 'sunny';
  
  let themeClass = 'theme-sunny';
  if (themeMode === 'Classic Dark') {
    themeClass = 'theme-classic-dark';
  } else if (themeMode === 'Frosted') {
    themeClass = 'theme-frosted';
  } else {
    themeClass = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'misty'].includes(weatherIcon)
      ? `theme-${weatherIcon}`
      : 'theme-sunny';
  }

  // Generate particles for rain/snow/stars once weather changes
  useEffect(() => {
    if (themeMode === 'Classic Dark') {
      setParticles([]);
      setClouds([]);
      return;
    }

    const newParticles = [];
    const count = weatherIcon === 'rainy' || weatherIcon === 'stormy' ? 40 : weatherIcon === 'snowy' ? 30 : 25; // number of stars/droplets/flakes
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 1 + Math.random() * 3,
        size: Math.random() * 3 + (weatherIcon === 'snowy' ? 3 : 1)
      });
    }
    setParticles(newParticles);

    // Generate floating clouds for cloudy/misty weather
    if (weatherIcon === 'cloudy' || weatherIcon === 'misty' || weatherIcon === 'stormy') {
      const newClouds = [];
      for (let i = 0; i < 5; i++) {
        newClouds.push({
          id: i,
          top: 5 + Math.random() * 30,
          size: 150 + Math.random() * 200,
          duration: 30 + Math.random() * 40,
          opacity: 0.08 + Math.random() * 0.1
        });
      }
      setClouds(newClouds);
    } else {
      setClouds([]);
    }
  }, [weatherIcon, themeMode]);

  return (
    <div 
      className={`${themeClass} dark-mode`}
      style={{
        minHeight: '100vh',
        background: 'var(--bg-gradient)',
        transition: 'background 1s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: 0,
        overflow: 'hidden'
      }}
      suppressHydrationWarning
    >
      {/* Decorative blurred background blobs */}
      <div 
        style={{
          position: 'absolute',
          top: '-10%',
          left: '10%',
          width: '60vw',
          height: '60vw',
          maxWidth: '600px',
          maxHeight: '600px',
          borderRadius: '50%',
          background: 'var(--glow-color)',
          filter: 'blur(130px)',
          opacity: 0.6,
          zIndex: -2,
          animation: 'aurora-1 25s ease-in-out infinite',
          pointerEvents: 'none',
          transition: 'background 1.5s ease'
        }}
      />
      
      <div 
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '5%',
          width: '50vw',
          height: '50vw',
          maxWidth: '500px',
          maxHeight: '500px',
          borderRadius: '50%',
          background: 'var(--glow-color-secondary)',
          filter: 'blur(120px)',
          opacity: 0.5,
          zIndex: -2,
          animation: 'aurora-2 30s ease-in-out infinite alternate',
          pointerEvents: 'none',
          transition: 'background 1.5s ease'
        }}
      />

      <div 
        style={{
          position: 'absolute',
          top: '30%',
          left: '35%',
          width: '45vw',
          height: '45vw',
          maxWidth: '450px',
          maxHeight: '450px',
          borderRadius: '50%',
          background: 'var(--glow-color-tertiary)',
          filter: 'blur(140px)',
          opacity: 0.4,
          zIndex: -2,
          animation: 'aurora-3 28s ease-in-out infinite',
          pointerEvents: 'none',
          transition: 'background 1.5s ease'
        }}
      />

      {/* Weather Particle Overlay */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
        {/* Rainy / Stormy Droplets */}
        {(weatherIcon === 'rainy' || weatherIcon === 'stormy') && particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              top: '-20px',
              left: `${p.left}%`,
              width: '1px',
              height: `${p.size * 12}px`,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.4))',
              animation: `rain-fall ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              opacity: 0.7
            }}
          />
        ))}

        {/* Snowy Flakes */}
        {weatherIcon === 'snowy' && particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              top: '-15px',
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              animation: `snow-drift ${p.duration + 2}s linear infinite`,
              animationDelay: `${p.delay}s`,
              opacity: 0.8,
              filter: 'blur(0.5px)'
            }}
          />
        ))}

        {/* Floating Clouds */}
        {clouds.map(c => (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              top: `${c.top}%`,
              left: '-300px',
              width: `${c.size}px`,
              height: `${c.size * 0.6}px`,
              background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
              borderRadius: '50%',
              animation: `cloud-drift ${c.duration}s linear infinite`,
              opacity: c.opacity,
              filter: 'blur(30px)'
            }}
          />
        ))}

        {/* Storm Lightning Flash */}
        {weatherIcon === 'stormy' && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: '#ffffff',
              animation: 'lightning-flash 8s infinite ease-out-in',
              zIndex: -1,
              opacity: 0
            }}
          />
        )}

        {/* Sunny Rays */}
        {weatherIcon === 'sunny' && (
          <div 
            style={{
              position: 'absolute',
              top: '-10%',
              right: '-10%',
              width: '50vw',
              height: '50vw',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0) 70%)',
              animation: 'spin-slow 60s linear infinite',
              borderRadius: '50%',
              filter: 'blur(40px)'
            }}
          />
        )}
      </div>



      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default AestheticBackground;
