import { useState } from 'react';
import { useColorScheme } from 'react-native';

export interface Theme {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    primary: string;
    text: string;
    textSecondary: string;
    border: string;
    card: string;
    overlay: string;
  };
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    primary: '#1A73E8',
    text: '#202124',
    textSecondary: '#5F6368',
    border: '#E8EAED',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#4285F4',
    text: '#FFFFFF',
    textSecondary: '#9AA0A6',
    border: '#3C4043',
    card: '#1F1F1F',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return { theme, toggleTheme, isDark };
};