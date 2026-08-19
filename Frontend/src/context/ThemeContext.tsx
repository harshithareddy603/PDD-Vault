import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, Platform, Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeColors = {
  background: string;
  card: string;
  surface: string;
  surfaceHover: string;
  text: string;
  subtext: string;
  mutedText: string;
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
  surfaceHover: '#e2e8f0',
  text: '#0f172a',
  subtext: '#64748b',
  mutedText: '#94a3b8',
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
  surfaceHover: '#475569',
  text: '#f8fafc',
  subtext: '#94a3b8',
  mutedText: '#64748b',
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
  toggleTheme: () => void;
  colors: ThemeColors;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  setMode: () => {},
  toggleTheme: () => {},
  colors: lightColors,
  isDark: false,
});

const ASYNC_STORAGE_THEME_KEY = '@app_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(
    useColorScheme() === 'dark' ? 'dark' : 'light'
  );
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    // Listen to OS scheme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });

    // Restore saved theme preference
    AsyncStorage.getItem(ASYNC_STORAGE_THEME_KEY).then((savedMode) => {
      if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
        setModeState(savedMode as ThemeMode);
      }
    });

    return () => subscription.remove();
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(ASYNC_STORAGE_THEME_KEY, newMode).catch(() => {});
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(ASYNC_STORAGE_THEME_KEY, newMode);
      } catch (e) {
        // ignore
      }
    }
  };

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const toggleTheme = () => {
    if (isDark) {
      setMode('light');
    } else {
      setMode('dark');
    }
  };

  const colors = isDark ? darkColors : lightColors;

  // Keep Web DOM in sync with current theme
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
        document.body.style.backgroundColor = darkColors.background;
        document.body.style.color = darkColors.text;
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
        document.body.style.backgroundColor = lightColors.background;
        document.body.style.color = lightColors.text;
      }
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

