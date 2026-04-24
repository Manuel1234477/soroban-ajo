import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'ajo_theme';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  isDark: boolean;
  isLoaded: boolean;
  initialize: () => Promise<void>;
  toggleTheme: () => Promise<void>;
  setTheme: (isDark: boolean) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,
  isLoaded: false,

  initialize: async () => {
    try {
      const stored = await SecureStore.getItemAsync(THEME_KEY);
      set({ isDark: stored === 'dark', isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  toggleTheme: async () => {
    const newIsDark = !get().isDark;
    await SecureStore.setItemAsync(THEME_KEY, newIsDark ? 'dark' : 'light');
    set({ isDark: newIsDark });
  },

  setTheme: async (isDark: boolean) => {
    await SecureStore.setItemAsync(THEME_KEY, isDark ? 'dark' : 'light');
    set({ isDark });
  },
}));