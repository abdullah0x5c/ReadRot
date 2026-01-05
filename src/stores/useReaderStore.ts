'use client';

// ==========================================
// Reader Store (Zustand)
// ==========================================
// Manages the state for the reading experience

import { create } from 'zustand';
import { AppSettings, DEFAULT_APP_SETTINGS } from '@/types';
import * as db from '@/lib/db';

interface ReaderState {
  // State
  settings: AppSettings;
  isSettingsLoaded: boolean;
  currentChunkIndex: number;
  isTTSPlaying: boolean;
  isMusicPlaying: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  setCurrentChunkIndex: (index: number) => void;
  setTTSPlaying: (playing: boolean) => void;
  setMusicPlaying: (playing: boolean) => void;
  toggleTTS: () => void;
  toggleMusic: () => void;
}

/**
 * Zustand store for reader/settings state management
 */
export const useReaderStore = create<ReaderState>((set, get) => ({
  // Initial state
  settings: DEFAULT_APP_SETTINGS,
  isSettingsLoaded: false,
  currentChunkIndex: 0,
  isTTSPlaying: false,
  isMusicPlaying: false,
  
  /**
   * Loads settings from IndexedDB
   */
  loadSettings: async () => {
    try {
      const settings = await db.getSettings();
      set({ settings, isSettingsLoaded: true });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isSettingsLoaded: true });
    }
  },
  
  /**
   * Updates and persists settings
   */
  updateSettings: async (updates: Partial<AppSettings>) => {
    const newSettings = { ...get().settings, ...updates };
    await db.saveSettings(newSettings);
    set({ settings: newSettings });
  },
  
  /**
   * Sets the current chunk index being viewed
   */
  setCurrentChunkIndex: (index: number) => {
    set({ currentChunkIndex: index });
  },
  
  /**
   * Sets TTS playing state
   */
  setTTSPlaying: (playing: boolean) => {
    set({ isTTSPlaying: playing });
  },
  
  /**
   * Sets music playing state
   */
  setMusicPlaying: (playing: boolean) => {
    set({ isMusicPlaying: playing });
  },
  
  /**
   * Toggles TTS on/off
   */
  toggleTTS: () => {
    set(state => ({ isTTSPlaying: !state.isTTSPlaying }));
  },
  
  /**
   * Toggles music on/off
   */
  toggleMusic: () => {
    set(state => ({ isMusicPlaying: !state.isMusicPlaying }));
  },
}));

