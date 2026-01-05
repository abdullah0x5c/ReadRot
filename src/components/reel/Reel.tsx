'use client';

// ==========================================
// TIKTOK CAPTION STYLE REEL - Puter.js TTS
// ==========================================
// FREE, UNLIMITED, HIGH-QUALITY text-to-speech!

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chunk } from '@/types';
import { ReelBackground } from './ReelBackground';
import { usePuterTTS } from '@/hooks/usePuterTTS';

interface ReelProps {
  chunk: Chunk;
  isActive: boolean;
  backgroundId: string;
  chunkIndex: number;
  totalChunks: number;
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
  const [hasStarted, setHasStarted] = useState(false);
  
  const progress = ((chunkIndex + 1) / totalChunks) * 100;
  
  // Use Puter.js TTS - FREE & HIGH QUALITY
  const {
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
  } = usePuterTTS({
    engine: 'neural', // 'neural' for quality, 'generative' for most human-like
    voice: 'Joanna',
    language: 'en-US',
    onComplete,
  });
  
  // Stop when inactive
  useEffect(() => {
    if (!isActive) {
      stop();
      setHasStarted(false);
    }
  }, [isActive, stop]);
  
  const startSpeaking = useCallback(async () => {
    if (!isActive || !isReady) return;
    setHasStarted(true);
    await speak(chunk.text, chunk.words);
  }, [isActive, isReady, chunk.text, chunk.words, speak]);
  
  const handleTap = useCallback(() => {
    if (isLoading) return;
    
    if (!hasStarted) {
      startSpeaking();
    } else if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      startSpeaking();
    }
  }, [hasStarted, isPlaying, isPaused, isLoading, startSpeaking, pause, resume]);
  
  const currentWord = currentWordIndex >= 0 && currentWordIndex < chunk.words.length
    ? chunk.words[currentWordIndex].replace(/[.,!?;:'"()\-\[\]""'']/g, '')
    : '';

  return (
    <div className="reel relative w-full overflow-hidden bg-black" onClick={handleTap}>
      <ReelBackground backgroundId={backgroundId} isActive={isActive} />
      
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full mx-auto mb-4"
              />
              <p className="text-white/70 text-sm">Generating voice...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center px-6"
            >
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-white/90 font-semibold mb-1">Error</p>
              <p className="text-white/60 text-sm max-w-xs">{error}</p>
              <p className="text-white/40 text-xs mt-3">Tap to retry</p>
            </motion.div>
          ) : currentWord && isPlaying && !isPaused ? (
            <motion.span
              key={`word-${currentWordIndex}`}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="text-white text-5xl sm:text-6xl md:text-7xl font-black text-center px-4 uppercase"
              style={{
                textShadow: `
                  0 0 30px rgba(0,0,0,0.9),
                  0 4px 20px rgba(0,0,0,0.8),
                  2px 2px 0 rgba(0,0,0,0.9),
                  -2px -2px 0 rgba(0,0,0,0.9)
                `,
              }}
            >
              {currentWord}
            </motion.span>
          ) : isPaused ? (
            <motion.div
              key="paused"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="text-5xl mb-3">▶️</div>
              <p className="text-white text-lg font-bold">PAUSED</p>
              <p className="text-white/60 text-sm mt-1">Tap to continue</p>
            </motion.div>
          ) : !hasStarted && isActive ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-5xl mb-3"
              >
                👆
              </motion.div>
              <p className="text-white text-lg font-bold">TAP TO START</p>
              <p className="text-white/60 text-sm mt-1">
                {isReady ? '🎙️ AI Voice Ready' : '⏳ Loading...'}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      
      {/* Playing indicator */}
      {isPlaying && !isPaused && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full">
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="w-2 h-2 bg-green-400 rounded-full"
          />
          <span className="text-white/80 text-xs font-medium">AI VOICE</span>
        </div>
      )}
      
      {/* Progress */}
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
