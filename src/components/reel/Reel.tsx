'use client';

// ==========================================
// Single Reel Component - BRAIN ROT EDITION
// ==========================================
// Maximum dopamine with REAL TTS and video backgrounds

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

/**
 * BRAIN ROT REEL
 * - Real video backgrounds
 * - Working TTS with word highlighting
 * - Giant animated words
 */
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
  const [showDone, setShowDone] = useState(false);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Progress percentage
  const progress = ((chunkIndex + 1) / totalChunks) * 100;
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);
  
  // Cleanup when not active or unmount
  useEffect(() => {
    if (!isActive) {
      stopSpeaking();
    }
    return () => {
      stopSpeaking();
    };
  }, [isActive]);
  
  // Stop everything
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
  
  // Start speaking
  const startSpeaking = useCallback(() => {
    if (!synthRef.current || !isActive) return;
    
    // Cancel any existing speech
    synthRef.current.cancel();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setHasStarted(true);
    setShowDone(false);
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(chunk.text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Get voices and pick a good one
    const voices = synthRef.current.getVoices();
    const englishVoice = voices.find(v => 
      v.lang.startsWith('en') && v.name.toLowerCase().includes('google')
    ) || voices.find(v => 
      v.lang.startsWith('en') && v.localService === false
    ) || voices.find(v => 
      v.lang.startsWith('en')
    );
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    // Word timing estimation
    const totalDuration = (chunk.words.length / 2.5) * 1000; // ~2.5 words per second
    const wordDuration = totalDuration / chunk.words.length;
    
    // Events
    utterance.onstart = () => {
      console.log('TTS Started!');
      setIsPlaying(true);
      setCurrentWordIndex(0);
      
      // Interval to advance words
      let idx = 0;
      intervalRef.current = setInterval(() => {
        idx++;
        if (idx < chunk.words.length) {
          setCurrentWordIndex(idx);
        }
      }, wordDuration);
    };
    
    utterance.onend = () => {
      console.log('TTS Ended!');
      setIsPlaying(false);
      setShowDone(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentWordIndex(-1);
      setTimeout(() => setShowDone(false), 1500);
      onComplete?.();
    };
    
    utterance.onerror = (e) => {
      console.error('TTS Error:', e);
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    
    // Use boundary for better word tracking (when supported)
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Calculate word index from character position
        let charCount = 0;
        for (let i = 0; i < chunk.words.length; i++) {
          if (event.charIndex <= charCount) {
            setCurrentWordIndex(Math.max(0, i));
            break;
          }
          charCount += chunk.words[i].length + 1;
        }
      }
    };
    
    utteranceRef.current = utterance;
    
    // SPEAK!
    synthRef.current.speak(utterance);
  }, [chunk.text, chunk.words, isActive, onComplete]);
  
  // Toggle play/pause
  const handlePlayPause = useCallback(() => {
    if (!synthRef.current) return;
    
    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else if (synthRef.current.paused) {
      synthRef.current.resume();
      setIsPlaying(true);
    } else {
      startSpeaking();
    }
  }, [isPlaying, startSpeaking]);
  
  // Handle tap to start
  const handleTap = useCallback(() => {
    if (!hasStarted && isActive) {
      startSpeaking();
    }
  }, [hasStarted, isActive, startSpeaking]);
  
  // Current word for display
  const currentWord = currentWordIndex >= 0 && currentWordIndex < chunk.words.length
    ? chunk.words[currentWordIndex].replace(/[.,!?;:'"()\-\[\]]/g, '')
    : '';
  
  return (
    <div 
      className="reel relative w-full overflow-hidden bg-black"
      onClick={handleTap}
    >
      {/* Layer 1: Video Background */}
      <ReelBackground backgroundId={backgroundId} isActive={isActive} />
      
      {/* Layer 2: Top text with word highlighting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-0 left-0 right-0 p-4 pt-16 z-10"
      >
        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 max-w-md mx-auto border border-white/10">
          <p className="text-sm leading-relaxed">
            {chunk.words.map((word, idx) => (
              <span
                key={idx}
                className={`inline transition-all duration-75 ${
                  idx === currentWordIndex
                    ? 'text-[#00ffcc] font-bold text-base'
                    : idx < currentWordIndex
                    ? 'text-white/40'
                    : 'text-white/80'
                }`}
              >
                {word}{' '}
              </span>
            ))}
          </p>
        </div>
      </motion.div>
      
      {/* Layer 3: GIANT CENTER WORD */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <AnimatePresence mode="popLayout">
          {currentWord && isPlaying && (
            <motion.div
              key={currentWord + currentWordIndex}
              initial={{ scale: 0.5, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.3, opacity: 0, y: -30 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 25,
                mass: 0.5,
              }}
              className="relative"
            >
              {/* Glow */}
              <div 
                className="absolute inset-0 blur-[80px] opacity-70 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #ff3366, #ffcc00)',
                  transform: 'scale(2)',
                }}
              />
              {/* Word */}
              <span 
                className="display-text text-7xl sm:text-8xl md:text-9xl font-black relative"
                style={{
                  background: 'linear-gradient(135deg, #ff3366 0%, #ff6b35 40%, #ffcc00 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 40px rgba(255, 51, 102, 0.6))',
                }}
              >
                {currentWord}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tap to Start */}
        {!hasStarted && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center cursor-pointer"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-7xl mb-6"
            >
              👆
            </motion.div>
            <p className="text-white text-2xl font-bold mb-2">TAP TO START</p>
            <p className="text-white/50 text-sm">🔊 Sound ON for the experience</p>
          </motion.div>
        )}
        
        {/* Done indicator */}
        {showDone && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-8xl"
          >
            ✨
          </motion.div>
        )}
      </div>
      
      {/* Layer 4: Bottom Controls */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 p-6 pb-10 z-30"
      >
        <div className="max-w-md mx-auto space-y-4">
          {/* Play/Pause */}
          {hasStarted && (
            <div className="flex justify-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause();
                }}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isPlaying 
                    ? 'bg-white/20 backdrop-blur-md border-2 border-white/30' 
                    : 'bg-gradient-to-br from-[#ff3366] to-[#ffcc00]'
                }`}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                )}
              </motion.button>
            </div>
          )}
          
          {/* Swipe hint */}
          {hasStarted && !isPlaying && (
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="flex flex-col items-center text-white/50 text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
              </svg>
              <span>Swipe for next</span>
            </motion.div>
          )}
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-[#ff3366] to-[#ffcc00]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/40 font-mono">
              <span>{chunkIndex + 1} / {totalChunks}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Side progress dots */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5">
        {Array.from({ length: totalChunks }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-300 ${
              i === chunkIndex 
                ? 'h-8 bg-gradient-to-b from-[#ff3366] to-[#ffcc00]' 
                : i < chunkIndex
                ? 'h-2 bg-white/50'
                : 'h-2 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
