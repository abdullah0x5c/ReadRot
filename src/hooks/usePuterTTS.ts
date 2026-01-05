'use client';

// ==========================================
// Puter.js TTS Hook - FREE & UNLIMITED
// ==========================================
// High-quality text-to-speech using Puter.js
// No API keys, no limits, no cost!

import { useState, useCallback, useRef, useEffect } from 'react';

// Puter.js types
declare global {
  interface Window {
    puter?: {
      ai: {
        txt2speech: (
          text: string,
          options?: string | {
            voice?: string;
            engine?: 'standard' | 'neural' | 'generative';
            language?: string;
          }
        ) => Promise<HTMLAudioElement>;
      };
    };
  }
}

interface UsePuterTTSOptions {
  engine?: 'standard' | 'neural' | 'generative';
  voice?: string;
  language?: string;
  onWordChange?: (index: number) => void;
  onComplete?: () => void;
}

interface UsePuterTTSReturn {
  speak: (text: string, words: string[]) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentWordIndex: number;
  error: string | null;
  isReady: boolean;
}

// Load Puter.js script
let puterLoaded = false;
let puterLoadPromise: Promise<void> | null = null;

function loadPuterScript(): Promise<void> {
  if (puterLoaded && window.puter) {
    return Promise.resolve();
  }
  
  if (puterLoadPromise) {
    return puterLoadPromise;
  }
  
  puterLoadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Not in browser'));
      return;
    }
    
    // Check if already loaded
    if (window.puter) {
      puterLoaded = true;
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    
    script.onload = () => {
      puterLoaded = true;
      console.log('✓ Puter.js loaded');
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Puter.js'));
    };
    
    document.head.appendChild(script);
  });
  
  return puterLoadPromise;
}

/**
 * Hook for FREE text-to-speech using Puter.js
 * 
 * @example
 * const { speak, isPlaying, currentWordIndex } = usePuterTTS({
 *   engine: 'neural', // or 'generative' for best quality
 *   onComplete: () => console.log('Done!')
 * });
 * 
 * await speak("Hello world!", ["Hello", "world!"]);
 */
export function usePuterTTS(options: UsePuterTTSOptions = {}): UsePuterTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordsRef = useRef<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const {
    engine = 'neural',
    voice = 'Joanna',
    language = 'en-US',
    onWordChange,
    onComplete,
  } = options;
  
  // Load Puter.js on mount
  useEffect(() => {
    loadPuterScript()
      .then(() => setIsReady(true))
      .catch((err) => {
        console.error('Failed to load Puter.js:', err);
        setError('Failed to load TTS service');
      });
  }, []);
  
  const clearWordTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  const stop = useCallback(() => {
    clearWordTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  }, [clearWordTimer]);
  
  const speak = useCallback(async (text: string, words: string[]) => {
    if (!isReady || !window.puter) {
      setError('TTS not ready yet');
      return;
    }
    
    stop();
    setIsLoading(true);
    setError(null);
    wordsRef.current = words;
    
    try {
      console.log(`🎙️ Generating speech with ${engine} engine...`);
      
      const audio = await window.puter.ai.txt2speech(text, {
        voice,
        engine,
        language,
      });
      
      audioRef.current = audio;
      
      // Calculate word timing based on audio duration
      const setupWordTimer = () => {
        const duration = audio.duration * 1000; // ms
        const msPerWord = duration / words.length;
        
        let wordIdx = 0;
        setCurrentWordIndex(0);
        onWordChange?.(0);
        
        intervalRef.current = setInterval(() => {
          wordIdx++;
          if (wordIdx < words.length) {
            setCurrentWordIndex(wordIdx);
            onWordChange?.(wordIdx);
          } else {
            clearWordTimer();
          }
        }, msPerWord);
      };
      
      audio.onloadedmetadata = () => {
        setupWordTimer();
      };
      
      audio.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setIsLoading(false);
        console.log('✓ Playing audio');
      };
      
      audio.onpause = () => {
        if (!audio.ended) {
          setIsPaused(true);
          clearWordTimer();
        }
      };
      
      audio.onended = () => {
        console.log('✓ Audio ended');
        clearWordTimer();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
        onComplete?.();
      };
      
      audio.onerror = () => {
        setError('Audio playback failed');
        setIsPlaying(false);
        setIsLoading(false);
        clearWordTimer();
      };
      
      await audio.play();
      
    } catch (err) {
      console.error('TTS Error:', err);
      setError(err instanceof Error ? err.message : 'TTS failed');
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [isReady, engine, voice, language, stop, clearWordTimer, onWordChange, onComplete]);
  
  const pause = useCallback(() => {
    if (audioRef.current && isPlaying && !isPaused) {
      audioRef.current.pause();
    }
  }, [isPlaying, isPaused]);
  
  const resume = useCallback(() => {
    if (audioRef.current && isPaused) {
      audioRef.current.play();
      setIsPaused(false);
      
      // Resume word timer
      const audio = audioRef.current;
      const remainingTime = (audio.duration - audio.currentTime) * 1000;
      const remainingWords = wordsRef.current.length - currentWordIndex;
      const msPerWord = remainingTime / remainingWords;
      
      let wordIdx = currentWordIndex;
      intervalRef.current = setInterval(() => {
        wordIdx++;
        if (wordIdx < wordsRef.current.length) {
          setCurrentWordIndex(wordIdx);
          onWordChange?.(wordIdx);
        } else {
          clearWordTimer();
        }
      }, msPerWord);
    }
  }, [isPaused, currentWordIndex, clearWordTimer, onWordChange]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);
  
  return {
    speak,
    stop,
    pause,
    resume,
    isPlaying,
    isPaused,
    isLoading,
    currentWordIndex,
    error,
    isReady,
  };
}

