'use client';

// ==========================================
// TIKTOK CAPTION STYLE REEL
// ==========================================
// Just video + ONE BIG WORD in center - that's it!

import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chunk } from '@/types';
import { ReelBackground } from './ReelBackground';

interface ReelProps {
  chunk: Chunk;
  isActive: boolean;
  backgroundId: string;
  chunkIndex: number;
  totalChunks: number;
  autoPlay?: boolean;
  onComplete?: () => void;
}

export function Reel({
  chunk,
  isActive,
  backgroundId,
  chunkIndex,
  totalChunks,
  onComplete,
}: ReelProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Progress
  const progress = ((chunkIndex + 1) / totalChunks) * 100;
  
  // Init speech
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);
  
  // Cleanup
  useEffect(() => {
    if (!isActive) {
      stopSpeaking();
    }
    return () => stopSpeaking();
  }, [isActive]);
  
  const stopSpeaking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  }, []);
  
  const startSpeaking = useCallback(() => {
    if (!synthRef.current || !isActive) return;
    
    synthRef.current.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setHasStarted(true);
    
    const utterance = new SpeechSynthesisUtterance(chunk.text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Get a good voice
    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
    if (voice) utterance.voice = voice;
    
    // Word timing
    const msPerWord = 400; // ~2.5 words per second
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentWordIndex(0);
      
      let idx = 0;
      intervalRef.current = setInterval(() => {
        idx++;
        if (idx < chunk.words.length) {
          setCurrentWordIndex(idx);
        }
      }, msPerWord);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrentWordIndex(-1);
      onComplete?.();
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    
    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        let chars = 0;
        for (let i = 0; i < chunk.words.length; i++) {
          if (e.charIndex <= chars) {
            setCurrentWordIndex(Math.max(0, i));
            break;
          }
          chars += chunk.words[i].length + 1;
        }
      }
    };
    
    synthRef.current.speak(utterance);
  }, [chunk.text, chunk.words, isActive, onComplete]);
  
  const handleTap = useCallback(() => {
    if (!hasStarted && isActive) {
      startSpeaking();
    } else if (isPlaying) {
      synthRef.current?.pause();
      setIsPlaying(false);
    } else if (synthRef.current?.paused) {
      synthRef.current?.resume();
      setIsPlaying(true);
    } else {
      startSpeaking();
    }
  }, [hasStarted, isActive, isPlaying, startSpeaking]);
  
  // Current word - clean it up
  const currentWord = currentWordIndex >= 0 && currentWordIndex < chunk.words.length
    ? chunk.words[currentWordIndex].replace(/[.,!?;:'"()\-\[\]]/g, '').toLowerCase()
    : '';
  
  return (
    <div className="reel relative w-full overflow-hidden bg-black" onClick={handleTap}>
      {/* Full screen video */}
      <ReelBackground backgroundId={backgroundId} isActive={isActive} />
      
      {/* THE ONE BIG WORD - Center of screen */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <AnimatePresence mode="wait">
          {currentWord && isPlaying ? (
            <motion.span
              key={currentWord + currentWordIndex}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.15 }}
              className="text-white text-6xl sm:text-7xl md:text-8xl font-black text-center px-4"
              style={{
                textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {currentWord}
            </motion.span>
          ) : !hasStarted && isActive ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-6xl mb-4"
              >
                👆
              </motion.div>
              <p className="text-white text-xl font-bold">TAP TO START</p>
              <p className="text-white/60 text-sm mt-2">🔊 Turn sound ON</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      
      {/* Minimal bottom progress bar */}
      <div className="absolute bottom-8 left-4 right-4 z-30">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/40 mt-1 font-mono">
          <span>{chunkIndex + 1}/{totalChunks}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
