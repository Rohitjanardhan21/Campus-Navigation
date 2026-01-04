import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export interface Theme {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    border: string;
    card: string;
    shadow: string;
    overlay: string;
    success: string;
    warning: string;
    error: string;
  };
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    primary: '#1A73E8',
    secondary: '#34A853',
    text: '#202124',
    textSecondary: '#5F6368',
    border: '#E8EAED',
    card: '#FFFFFF',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
    success: '#34A853',
    warning: '#FBBC04',
    error: '#EA4335',
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#4285F4',
    secondary: '#34A853',
    text: '#FFFFFF',
    textSecondary: '#9AA0A6',
    border: '#3C4043',
    card: '#1F1F1F',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
    success: '#34A853',
    warning: '#FBBC04',
    error: '#EA4335',
  },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};