import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeColors = {
  background: string;
  card: string;
  surface: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  primaryBg: string;
  accent: string;
  inputBg: string;
  modalBg: string;
  badgeBg: string;
  badgeText: string;
  isDark: boolean;
};

const lightColors: ThemeColors = {
  background: '#f8fafc',
  card: '#ffffff',
  surface: '#f1f5f9',
  text: '#0f172a',
  subtext: '#64748b',
  border: '#e2e8f0',
  primary: '#2563eb',
  primaryBg: '#eff6ff',
  accent: '#3b82f6',
  inputBg: '#ffffff',
  modalBg: '#ffffff',
  badgeBg: '#e0f2fe',
  badgeText: '#0369a1',
  isDark: false,
};

const darkColors: ThemeColors = {
  background: '#0f172a',
  card: '#1e293b',
  surface: '#334155',
  text: '#f8fafc',
  subtext: '#94a3b8',
  border: '#334155',
  primary: '#3b82f6',
  primaryBg: '#1e3a8a',
  accent: '#60a5fa',
  inputBg: '#1e293b',
  modalBg: '#1e293b',
  badgeBg: '#1e3a8a',
  badgeText: '#93c5fd',
  isDark: true,
};

type ThemeContextType = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  setMode: () => {},
  colors: lightColors,
  isDark: false,
});

const ASYNC_STORAGE_THEME_KEY = '@app_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(ASYNC_STORAGE_THEME_KEY).then((savedMode) => {
      if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
        setModeState(savedMode as ThemeMode);
      }
    });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(ASYNC_STORAGE_THEME_KEY, newMode).catch(() => {});
  };

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, setMode, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
