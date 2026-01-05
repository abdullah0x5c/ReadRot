'use client';

// ==========================================
// Single Reel Component - BRAIN ROT EDITION
// ==========================================
// Maximum dopamine, maximum engagement

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
 * BRAIN ROT REEL - Full dopamine experience
 * - Giant animated words in center
 * - Word-by-word display synced with TTS
 * - Satisfying visual effects
 * - Auto-play TTS with user interaction
 */
export function Reel({
  chunk,
  isActive,
  backgroundId,
  chunkIndex,
  totalChunks,
  autoPlay = true,
  onComplete,
}: ReelProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showCompletedEffect, setShowCompletedEffect] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate progress
  const progress = ((chunkIndex + 1) / totalChunks) * 100;
  
  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  }, []);
  
  // Stop when not active
  useEffect(() => {
    if (!isActive) {
      cleanup();
    }
  }, [isActive, cleanup]);
  
  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  // Start the reading experience
  const startReading = useCallback(() => {
    if (!isActive || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    setHasInteracted(true);
    cleanup();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(chunk.text);
    utterance.rate = 0.9; // Slightly slower for dramatic effect
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to get a good voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Word timing - estimate based on speech rate
    const wordsPerSecond = 2.5 * utterance.rate; // ~150 WPM at rate 1.0
    const msPerWord = 1000 / wordsPerSecond;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentWordIndex(0);
      
      // Start word timer
      let wordIndex = 0;
      timerRef.current = setInterval(() => {
        wordIndex++;
        if (wordIndex < chunk.words.length) {
          setCurrentWordIndex(wordIndex);
        } else {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        }
      }, msPerWord);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setShowCompletedEffect(true);
      setTimeout(() => setShowCompletedEffect(false), 1000);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      onComplete?.();
    };
    
    utterance.onerror = () => {
      cleanup();
    };
    
    // Use boundary events if available for better accuracy
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        let charCount = 0;
        for (let i = 0; i < chunk.words.length; i++) {
          if (charCount >= event.charIndex) {
            setCurrentWordIndex(Math.max(0, i));
            break;
          }
          charCount += chunk.words[i].length + 1;
        }
      }
    };
    
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isActive, chunk.text, chunk.words, cleanup, onComplete]);
  
  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      speechSynthesis.pause();
      setIsPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else if (currentWordIndex >= 0) {
      speechSynthesis.resume();
      setIsPlaying(true);
    } else {
      startReading();
    }
  }, [isPlaying, currentWordIndex, startReading]);
  
  // Auto-start on tap if first time
  const handleTap = useCallback(() => {
    if (!hasInteracted && isActive) {
      startReading();
    }
  }, [hasInteracted, isActive, startReading]);
  
  // Current word for giant display
  const currentWord = currentWordIndex >= 0 && currentWordIndex < chunk.words.length
    ? chunk.words[currentWordIndex].replace(/[.,!?;:'"()\-]/g, '')
    : '';
  
  return (
    <div 
      className="reel relative w-full overflow-hidden bg-black cursor-pointer"
      onClick={handleTap}
    >
      {/* Layer 1: Animated Background */}
      <ReelBackground backgroundId={backgroundId} isActive={isActive} />
      
      {/* Layer 2: Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      
      {/* Layer 3: Top text passage (faded, context) */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 right-0 p-4 pt-16"
      >
        <div className="glass rounded-2xl p-4 max-w-md mx-auto">
          <p className="text-sm leading-relaxed text-white/70">
            {chunk.words.map((word, index) => (
              <span
                key={index}
                className={`inline transition-all duration-100 ${
                  index === currentWordIndex
                    ? 'text-[#00ffcc] font-bold'
                    : index < currentWordIndex
                    ? 'text-white/50'
                    : 'text-white/70'
                }`}
              >
                {word}{' '}
              </span>
            ))}
          </p>
        </div>
      </motion.div>
      
      {/* Layer 4: GIANT CENTER WORD - The main dopamine hit */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {currentWord && isPlaying && (
            <motion.div
              key={currentWord + currentWordIndex}
              initial={{ scale: 0.3, opacity: 0, rotateX: -30 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 1.5, opacity: 0, y: -50 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 20,
                duration: 0.15,
              }}
              className="text-center relative"
            >
              {/* Glow effect */}
              <div 
                className="absolute inset-0 blur-[60px] opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #ff3366 0%, #ffcc00 100%)',
                }}
              />
              
              {/* The word */}
              <span 
                className="display-text text-6xl sm:text-7xl md:text-8xl font-black relative block"
                style={{
                  background: 'linear-gradient(135deg, #ff3366 0%, #ff6b35 50%, #ffcc00 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 80px rgba(255, 51, 102, 0.8)',
                  filter: 'drop-shadow(0 0 30px rgba(255, 51, 102, 0.5))',
                }}
              >
                {currentWord}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tap to start indicator */}
        {!hasInteracted && isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-6xl mb-4"
            >
              👆
            </motion.div>
            <p className="text-white text-xl font-semibold">Tap to Start</p>
            <p className="text-white/60 text-sm mt-2">Sound on for best experience</p>
          </motion.div>
        )}
      </div>
      
      {/* Layer 5: Completed effect - celebration! */}
      <AnimatePresence>
        {showCompletedEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="text-8xl"
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Layer 6: Bottom controls */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 p-6 pb-10"
      >
        <div className="max-w-md mx-auto space-y-4">
          {/* Play/Pause Button */}
          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isPlaying 
                  ? 'bg-white/20 border-2 border-white/40' 
                  : 'bg-gradient-to-r from-[#ff3366] to-[#ffcc00]'
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
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #ff3366 0%, #ffcc00 100%)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-white/50 font-mono">
              <span>{chunkIndex + 1} / {totalChunks}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Scroll hint */}
      {!isPlaying && hasInteracted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="flex flex-col items-center text-white/40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Swipe for next</span>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
