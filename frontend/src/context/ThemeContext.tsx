import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Theme {
  name: string;
  background: string;
  sidebar: string;
  cards: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  borders: string;
  accent: string;
  mapTile: string;
  scrollbar: string;
  focusRing: string;
}

export const THEMES: Record<string, Theme> = {
  apple: {
    name: 'Apple',
    background:
      'radial-gradient(120% 80% at 70% 0%, rgba(255, 255, 255, 0.18) 0%, transparent 55%), radial-gradient(90% 70% at 10% 100%, rgba(80, 110, 150, 0.55) 0%, transparent 60%), linear-gradient(170deg, #6f8aa8 0%, #5a7591 35%, #4a627c 65%, #3c5066 100%)',
    sidebar: 'bg-black/20 backdrop-blur-2xl',
    cards: 'bg-white/[0.06] backdrop-blur-xl border-white/10',
    text: {
      primary: 'text-white',
      secondary: 'text-white/90',
      tertiary: 'text-white/60',
    },
    borders: 'border-white/10',
    accent: 'text-white/85',
    mapTile: '#8ea2b1',
    scrollbar: 'rgba(255, 255, 255, 0.18)',
    focusRing: 'ring-white/40',
  },
  'midnight-storm': {
    name: 'Midnight Storm',
    background:
      'radial-gradient(150% 100% at 50% 0%, rgba(0, 200, 255, 0.15) 0%, transparent 50%), radial-gradient(120% 120% at 80% 100%, rgba(138, 43, 226, 0.2) 0%, transparent 60%), linear-gradient(135deg, #0a0e27 0%, #1a1f3a 25%, #2d1b4e 50%, #1a0f2e 100%)',
    sidebar: 'bg-slate-900/30 backdrop-blur-xl border-cyan-400/10',
    cards: 'bg-slate-800/20 backdrop-blur-lg border-cyan-400/15',
    text: {
      primary: 'text-white',
      secondary: 'text-slate-100',
      tertiary: 'text-slate-400',
    },
    borders: 'border-cyan-400/20',
    accent: 'text-cyan-300',
    mapTile: '#1a2d4a',
    scrollbar: 'rgba(0, 200, 255, 0.25)',
    focusRing: 'ring-cyan-400/60',
  },
  'sunrise-warmth': {
    name: 'Sunrise Warmth',
    background:
      'radial-gradient(120% 90% at 30% 10%, rgba(255, 200, 87, 0.25) 0%, transparent 45%), radial-gradient(100% 100% at 70% 100%, rgba(255, 107, 107, 0.2) 0%, transparent 55%), linear-gradient(135deg, #fff5e1 0%, #ffe0b2 20%, #ffcc80 40%, #ffb74d 70%, #ff8a65 100%)',
    sidebar: 'bg-amber-50/40 backdrop-blur-xl border-amber-400/30',
    cards: 'bg-orange-50/30 backdrop-blur-lg border-amber-300/40',
    text: {
      primary: 'text-amber-950',
      secondary: 'text-amber-900',
      tertiary: 'text-amber-700',
    },
    borders: 'border-amber-300/50',
    accent: 'text-orange-600',
    mapTile: '#deb887',
    scrollbar: 'rgba(255, 152, 0, 0.35)',
    focusRing: 'ring-amber-400/70',
  },
  'minimalist-monochrome': {
    name: 'Minimalist Monochrome',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    sidebar: 'bg-gray-900 border-0',
    cards: 'bg-gray-800 backdrop-blur-none border-gray-700',
    text: {
      primary: 'text-white',
      secondary: 'text-gray-100',
      tertiary: 'text-gray-400',
    },
    borders: 'border-gray-600',
    accent: 'text-gray-200',
    mapTile: '#3a3a3a',
    scrollbar: 'rgba(255, 255, 255, 0.25)',
    focusRing: 'ring-gray-500',
  },
  'forest-canopy': {
    name: 'Forest Canopy',
    background:
      'radial-gradient(120% 100% at 50% 0%, rgba(74, 222, 128, 0.12) 0%, transparent 50%), radial-gradient(100% 120% at 20% 100%, rgba(92, 51, 23, 0.25) 0%, transparent 60%), linear-gradient(135deg, #1b4332 0%, #2d6a4f 20%, #40916c 40%, #2d6a4f 70%, #1b4332 100%)',
    sidebar: 'bg-emerald-950/40 backdrop-blur-lg border-emerald-700/40',
    cards: 'bg-emerald-900/30 backdrop-blur-md border-emerald-700/50',
    text: {
      primary: 'text-emerald-50',
      secondary: 'text-emerald-100',
      tertiary: 'text-emerald-300',
    },
    borders: 'border-emerald-700/60',
    accent: 'text-emerald-400',
    mapTile: '#2d5a3d',
    scrollbar: 'rgba(74, 222, 128, 0.35)',
    focusRing: 'ring-emerald-400/70',
  },
  'retro-70s': {
    name: 'Retro 70s',
    background:
      'radial-gradient(120% 90% at 30% 20%, rgba(218, 165, 32, 0.2) 0%, transparent 45%), radial-gradient(100% 100% at 70% 100%, rgba(139, 69, 19, 0.15) 0%, transparent 55%), linear-gradient(135deg, #8b6914 0%, #a0826d 20%, #c9a961 40%, #d2691e 70%, #bf5700 100%)',
    sidebar: 'bg-yellow-900/30 backdrop-blur-lg border-yellow-700/30',
    cards: 'bg-orange-900/20 backdrop-blur-md border-yellow-600/40',
    text: {
      primary: 'text-amber-50',
      secondary: 'text-yellow-100',
      tertiary: 'text-yellow-700',
    },
    borders: 'border-yellow-600/40',
    accent: 'text-yellow-400',
    mapTile: '#8b6914',
    scrollbar: 'rgba(218, 165, 32, 0.35)',
    focusRing: 'ring-yellow-500/60',
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeName: string) => void;
  themeNames: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<string>('apple');

  useEffect(() => {
    const saved = localStorage.getItem('weather-app-theme');
    if (saved && THEMES[saved]) {
      setThemeName(saved);
    }
  }, []);

  const handleSetTheme = (name: string) => {
    if (THEMES[name]) {
      setThemeName(name);
      localStorage.setItem('weather-app-theme', name);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: THEMES[themeName],
        setTheme: handleSetTheme,
        themeNames: Object.keys(THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
