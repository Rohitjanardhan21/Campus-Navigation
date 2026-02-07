import { CampusPlace } from '@/src/domain/campus';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface NavigationHistoryItem {
  destination: CampusPlace;
  timestamp: number;
  duration?: number;
  distance?: number;
}

interface NavigationHistoryContextType {
  history: NavigationHistoryItem[];
  addToHistory: (item: Omit<NavigationHistoryItem, 'timestamp'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  getRecentDestinations: (limit?: number) => NavigationHistoryItem[];
}

const NavigationHistoryContext = createContext<NavigationHistoryContextType | undefined>(undefined);

const HISTORY_STORAGE_KEY = '@campus_nav_history';
const MAX_HISTORY_ITEMS = 50;

export const NavigationHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<NavigationHistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const addToHistory = async (item: Omit<NavigationHistoryItem, 'timestamp'>) => {
    try {
      const newItem: NavigationHistoryItem = {
        ...item,
        timestamp: Date.now(),
      };

      const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      setHistory(newHistory);
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const getRecentDestinations = (limit: number = 10) => {
    return history.slice(0, limit);
  };

  return (
    <NavigationHistoryContext.Provider value={{ history, addToHistory, clearHistory, getRecentDestinations }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
};

export const useNavigationHistory = () => {
  const context = useContext(NavigationHistoryContext);
  if (!context) {
    throw new Error('useNavigationHistory must be used within NavigationHistoryProvider');
  }
  return context;
};
