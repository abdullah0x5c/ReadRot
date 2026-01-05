'use client';

// ==========================================
// ElevenLabs TTS Hook with Word Tracking
// ==========================================
// Provides high-quality TTS using ElevenLabs API
// Features word-level timestamps for karaoke highlighting

import { useState, useCallback, useRef, useEffect } from 'react';

// ==========================================
// Types
// ==========================================

interface WordTiming {
  word: string;
  start: number;  // milliseconds
  end: number;    // milliseconds
}

interface TTSResponse {
  audioBase64: string;
  wordTimings: WordTiming[];
}

interface VoiceInfo {
  id: string;
  name: string;
  category: string;
  accent?: string;
  gender?: string;
  age?: string;
  previewUrl: string;
}

interface UseElevenLabsTTSOptions {
  voiceId?: string;     // ElevenLabs voice ID
  speed?: number;       // Speech speed (0.5 - 2.0)
  onWordChange?: (index: number, word: string) => void;  // Callback when word changes
  onComplete?: () => void;  // Callback when speech completes
}

interface UseElevenLabsTTSReturn {
  speak: (text: string, words: string[]) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentWordIndex: number;
  error: string | null;
  voices: VoiceInfo[];
  loadVoices: () => Promise<void>;
  setVoiceId: (id: string) => void;
  setSpeed: (speed: number) => void;
}

// Simple in-memory cache for audio to avoid re-generating
const audioCache = new Map<string, TTSResponse>();

/**
 * Custom hook for ElevenLabs Text-to-Speech with word-level tracking
 * 
 * Features:
 * - High-quality AI voices from ElevenLabs
 * - Precise word-level timestamps for karaoke effect
 * - Audio caching to save API calls
 * - Pause/resume support
 * 
 * @example
 * const { speak, stop, isPlaying, currentWordIndex } = useElevenLabsTTS({
 *   voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
 *   onComplete: () => console.log('Done!')
 * });
 * 
 * // Start speaking
 * await speak("Hello world!", ["Hello", "world!"]);
 */
export function useElevenLabsTTS(options: UseElevenLabsTTSOptions = {}): UseElevenLabsTTSReturn {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [voiceId, setVoiceId] = useState(options.voiceId || '21m00Tcm4TlvDq8ikWAM');
  const [speed, setSpeed] = useState(options.speed || 1.0);
  
  // Refs for audio playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordTimingsRef = useRef<WordTiming[]>([]);
  const wordsRef = useRef<string[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  
  // Callbacks from options
  const onWordChangeRef = useRef(options.onWordChange);
  const onCompleteRef = useRef(options.onComplete);
  
  // Update refs when options change
  useEffect(() => {
    onWordChangeRef.current = options.onWordChange;
    onCompleteRef.current = options.onComplete;
  }, [options.onWordChange, options.onComplete]);
  
  /**
   * Generate a cache key for the text and voice combination
   */
  const getCacheKey = useCallback((text: string) => {
    return `${voiceId}:${speed}:${text}`;
  }, [voiceId, speed]);
  
  /**
   * Update current word based on playback time
   */
  const updateCurrentWord = useCallback(() => {
    if (!audioRef.current || !isPlaying || isPaused) return;
    
    const currentTime = audioRef.current.currentTime * 1000; // Convert to ms
    const timings = wordTimingsRef.current;
    
    // Find the word being spoken at current time
    let newIndex = -1;
    for (let i = 0; i < timings.length; i++) {
      if (currentTime >= timings[i].start && currentTime < timings[i].end) {
        newIndex = i;
        break;
      }
      // Handle gaps between words - show the next word if we're past the previous
      if (currentTime >= timings[i].end && i < timings.length - 1 && currentTime < timings[i + 1].start) {
        newIndex = i + 1;
        break;
      }
    }
    
    // If we're past all words, show the last one
    if (newIndex === -1 && timings.length > 0 && currentTime >= timings[timings.length - 1].start) {
      newIndex = timings.length - 1;
    }
    
    if (newIndex !== currentWordIndex && newIndex >= 0) {
      setCurrentWordIndex(newIndex);
      onWordChangeRef.current?.(newIndex, wordsRef.current[newIndex]);
    }
    
    // Continue the animation loop
    animationFrameRef.current = requestAnimationFrame(updateCurrentWord);
  }, [isPlaying, isPaused, currentWordIndex]);
  
  /**
   * Start the word tracking animation loop
   */
  const startWordTracking = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(updateCurrentWord);
  }, [updateCurrentWord]);
  
  /**
   * Stop the word tracking animation loop
   */
  const stopWordTracking = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);
  
  /**
   * Generate speech from text using ElevenLabs API
   */
  const generateSpeech = useCallback(async (text: string): Promise<TTSResponse> => {
    const cacheKey = getCacheKey(text);
    
    // Check cache first
    if (audioCache.has(cacheKey)) {
      return audioCache.get(cacheKey)!;
    }
    
    // Call our API route
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceId,
        speed,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate speech');
    }
    
    const data: TTSResponse = await response.json();
    
    // Cache the result
    audioCache.set(cacheKey, data);
    
    return data;
  }, [getCacheKey, voiceId, speed]);
  
  /**
   * Speak the given text with word tracking
   */
  const speak = useCallback(async (text: string, words: string[]) => {
    try {
      // Stop any current playback
      stop();
      
      setIsLoading(true);
      setError(null);
      wordsRef.current = words;
      
      // Generate or retrieve from cache
      const { audioBase64, wordTimings } = await generateSpeech(text);
      wordTimingsRef.current = wordTimings;
      
      // Create audio element
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audioRef.current = audio;
      
      // Set up event handlers
      audio.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setIsLoading(false);
        startWordTracking();
      };
      
      audio.onpause = () => {
        if (!audio.ended) {
          setIsPaused(true);
          setIsPlaying(true);
          pausedTimeRef.current = audio.currentTime;
          stopWordTracking();
        }
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
        stopWordTracking();
        onCompleteRef.current?.();
      };
      
      audio.onerror = () => {
        setError('Failed to play audio');
        setIsPlaying(false);
        setIsLoading(false);
        stopWordTracking();
      };
      
      // Start playing
      setCurrentWordIndex(0);
      await audio.play();
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setIsLoading(false);
      setIsPlaying(false);
      console.error('TTS Error:', err);
    }
  }, [generateSpeech, startWordTracking, stopWordTracking]);
  
  /**
   * Stop speech completely
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    stopWordTracking();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
    pausedTimeRef.current = 0;
  }, [stopWordTracking]);
  
  /**
   * Pause speech
   */
  const pause = useCallback(() => {
    if (audioRef.current && isPlaying && !isPaused) {
      audioRef.current.pause();
    }
  }, [isPlaying, isPaused]);
  
  /**
   * Resume paused speech
   */
  const resume = useCallback(() => {
    if (audioRef.current && isPaused) {
      audioRef.current.play();
      startWordTracking();
    }
  }, [isPaused, startWordTracking]);
  
  /**
   * Load available voices from API
   */
  const loadVoices = useCallback(async () => {
    try {
      const response = await fetch('/api/tts/voices');
      const data = await response.json();
      setVoices(data.voices);
    } catch (err) {
      console.error('Failed to load voices:', err);
    }
  }, []);
  
  /**
   * Set the voice ID
   */
  const setVoiceIdHandler = useCallback((id: string) => {
    setVoiceId(id);
  }, []);
  
  /**
   * Set speech speed
   */
  const setSpeedHandler = useCallback((newSpeed: number) => {
    setSpeed(Math.max(0.5, Math.min(2.0, newSpeed)));
  }, []);
  
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
    voices,
    loadVoices,
    setVoiceId: setVoiceIdHandler,
    setSpeed: setSpeedHandler,
  };
}

/**
 * Clear the audio cache
 * Useful when you want to force regeneration of audio
 */
export function clearTTSCache() {
  audioCache.clear();
}

/**
 * Remove a specific text from cache
 */
export function removeTTSFromCache(voiceId: string, speed: number, text: string) {
  const key = `${voiceId}:${speed}:${text}`;
  audioCache.delete(key);
}

