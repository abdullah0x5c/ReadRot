'use client';

// ==========================================
// Text-to-Speech Hook with Word Tracking
// ==========================================
// Provides TTS functionality with word-level highlighting
// Uses the Web Speech API (SpeechSynthesis)

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTTSOptions {
  rate?: number;        // Speech rate (0.5 - 2.0)
  pitch?: number;       // Voice pitch (0 - 2)
  volume?: number;      // Volume (0 - 1)
  voiceName?: string;   // Preferred voice name
}

interface UseTTSReturn {
  speak: (text: string, words: string[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  currentWordIndex: number;
  voices: SpeechSynthesisVoice[];
  setVoice: (voiceName: string) => void;
  setRate: (rate: number) => void;
  isSupported: boolean;
}

/**
 * Custom hook for Text-to-Speech with word-level tracking
 * 
 * Features:
 * - Tracks which word is currently being spoken
 * - Supports pause/resume
 * - Voice and speed selection
 * - Works with the Web Speech API
 */
export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRateState] = useState(options.rate || 1.0);
  const [isSupported, setIsSupported] = useState(false);
  
  // Refs to track current utterance and word estimation
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordsRef = useRef<string[]>([]);
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Check for Web Speech API support and load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load available voices
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Try to find a good default English voice
        if (!selectedVoice && availableVoices.length > 0) {
          const preferred = availableVoices.find(v => 
            v.lang.startsWith('en') && v.name.includes('Google')
          ) || availableVoices.find(v => 
            v.lang.startsWith('en')
          ) || availableVoices[0];
          
          setSelectedVoice(preferred);
        }
      };
      
      // Voices might not be immediately available
      loadVoices();
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [selectedVoice]);
  
  /**
   * Estimates word timing and updates current word index
   * This is a fallback since not all browsers support boundary events
   */
  const startWordEstimation = useCallback((words: string[], rate: number) => {
    // Clear any existing timer
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
    }
    
    // Average speaking rate is ~150 words per minute at rate 1.0
    // Adjust for the current rate setting
    const wordsPerSecond = (150 / 60) * rate;
    const msPerWord = 1000 / wordsPerSecond;
    
    let currentIndex = 0;
    startTimeRef.current = Date.now();
    
    setCurrentWordIndex(0);
    
    wordTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const expectedIndex = Math.floor(elapsed / msPerWord);
      
      if (expectedIndex !== currentIndex && expectedIndex < words.length) {
        currentIndex = expectedIndex;
        setCurrentWordIndex(currentIndex);
      }
      
      if (expectedIndex >= words.length - 1) {
        if (wordTimerRef.current) {
          clearInterval(wordTimerRef.current);
        }
      }
    }, 50); // Check every 50ms for smooth updates
  }, []);
  
  /**
   * Speaks the given text and tracks words
   */
  const speak = useCallback((text: string, words: string[]) => {
    if (!isSupported) return;
    
    // Stop any current speech
    speechSynthesis.cancel();
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
    }
    
    wordsRef.current = words;
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Handle speech events
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      startWordEstimation(words, rate);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
      if (wordTimerRef.current) {
        clearInterval(wordTimerRef.current);
      }
    };
    
    utterance.onerror = (event) => {
      if (event.error !== 'canceled') {
        console.error('TTS Error:', event.error);
      }
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
      if (wordTimerRef.current) {
        clearInterval(wordTimerRef.current);
      }
    };
    
    // Try to use boundary events for more accurate word tracking
    // (Not all browsers support this)
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Find which word we're at based on character index
        let charCount = 0;
        for (let i = 0; i < words.length; i++) {
          if (charCount >= event.charIndex) {
            setCurrentWordIndex(i);
            break;
          }
          charCount += words[i].length + 1; // +1 for space
        }
      }
    };
    
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, rate, options.pitch, options.volume, selectedVoice, startWordEstimation]);
  
  /**
   * Pauses the current speech
   */
  const pause = useCallback(() => {
    if (isSupported && isPlaying) {
      speechSynthesis.pause();
      setIsPaused(true);
      if (wordTimerRef.current) {
        clearInterval(wordTimerRef.current);
      }
    }
  }, [isSupported, isPlaying]);
  
  /**
   * Resumes paused speech
   */
  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      // Resume word estimation from current position
      const remainingWords = wordsRef.current.slice(currentWordIndex);
      startWordEstimation(remainingWords, rate);
    }
  }, [isSupported, isPaused, currentWordIndex, rate, startWordEstimation]);
  
  /**
   * Stops speech completely
   */
  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
      if (wordTimerRef.current) {
        clearInterval(wordTimerRef.current);
      }
    }
  }, [isSupported]);
  
  /**
   * Sets the voice by name
   */
  const setVoice = useCallback((voiceName: string) => {
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
    }
  }, [voices]);
  
  /**
   * Sets the speech rate
   */
  const setRate = useCallback((newRate: number) => {
    setRateState(Math.max(0.5, Math.min(2.0, newRate)));
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        speechSynthesis.cancel();
      }
      if (wordTimerRef.current) {
        clearInterval(wordTimerRef.current);
      }
    };
  }, [isSupported]);
  
  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    currentWordIndex,
    voices,
    setVoice,
    setRate,
    isSupported,
  };
}

