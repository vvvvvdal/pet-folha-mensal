'use client';

import { useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlTheme = urlParams?.get('theme') as ThemeMode;
    if (urlTheme === 'light' || urlTheme === 'dark') {
      setTheme(urlTheme);
      document.documentElement.setAttribute('data-theme', urlTheme);
      localStorage.setItem('pet_theme', urlTheme);
      return;
    }

    const saved = localStorage.getItem('pet_theme') as ThemeMode;
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('pet_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return { theme, toggleTheme };
}
