'use client';

import React, { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setThemeState] = useState<'gentle-dark' | 'sepia' | 'soft-light'>('gentle-dark');

  useEffect(() => {
    const saved = (localStorage.getItem('pet_theme_preference') as 'gentle-dark' | 'sepia' | 'soft-light') || 'gentle-dark';
    setThemeState(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const setTheme = (newTheme: 'gentle-dark' | 'sepia' | 'soft-light') => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pet_theme_preference', newTheme);
  };

  return (
    <div className="inline-flex items-center p-1 rounded-lg border gap-1" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}>
      <button
        onClick={() => setTheme('gentle-dark')}
        className={`px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
          theme === 'gentle-dark' ? 'shadow-sm font-semibold' : 'opacity-70 hover:opacity-100'
        }`}
        style={{
          backgroundColor: theme === 'gentle-dark' ? 'var(--bg-elevated)' : 'transparent',
          color: theme === 'gentle-dark' ? 'var(--text-heading)' : 'var(--text-muted)'
        }}
        title="Modo Escuro Suave (Anti-fadiga)"
      >
        <span>🌙</span> Escuro
      </button>
      <button
        onClick={() => setTheme('sepia')}
        className={`px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
          theme === 'sepia' ? 'shadow-sm font-semibold' : 'opacity-70 hover:opacity-100'
        }`}
        style={{
          backgroundColor: theme === 'sepia' ? 'var(--bg-elevated)' : 'transparent',
          color: theme === 'sepia' ? 'var(--text-heading)' : 'var(--text-muted)'
        }}
        title="Modo Sépia / Papel Aconchegante"
      >
        <span>📜</span> Sépia
      </button>
      <button
        onClick={() => setTheme('soft-light')}
        className={`px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
          theme === 'soft-light' ? 'shadow-sm font-semibold' : 'opacity-70 hover:opacity-100'
        }`}
        style={{
          backgroundColor: theme === 'soft-light' ? 'var(--bg-elevated)' : 'transparent',
          color: theme === 'soft-light' ? 'var(--text-heading)' : 'var(--text-muted)'
        }}
        title="Modo Claro Confortável"
      >
        <span>☀️</span> Claro
      </button>
    </div>
  );
}
