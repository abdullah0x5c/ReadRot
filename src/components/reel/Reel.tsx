'use client';

// ==========================================
// Single Reel Component
// ==========================================
// Displays one chunk of text with all layers

import { useEffect, useCallback } from 'react';
import { Chunk } from '@/types';
import { ReelBackground } from './ReelBackground';
import { ReelText } from './ReelText';
import { ReelHighlight } from './ReelHighlight';
import { ReelControls } from './ReelControls';
import { useTTS } from '@/hooks/useTTS';

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
 * Single reel component that displays:
 * 1. Background video/animation
 * 2. Dark overlay for readability
 * 3. Text passage at top
 * 4. Highlighted word in center
 * 5. Controls at bottom
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
  // TTS hook for text-to-speech with word tracking
  const {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    currentWordIndex,
    isSupported: isTTSSupported,
  } = useTTS();
  
  // Start TTS when this reel becomes active (if autoPlay enabled)
  useEffect(() => {
    if (isActive && autoPlay && isTTSSupported) {
      // Small delay to let the visual transition complete
      const timer = setTimeout(() => {
        speak(chunk.text, chunk.words);
      }, 300);
      return () => clearTimeout(timer);
    } else if (!isActive) {
      // Stop TTS when scrolling away
      stop();
    }
  }, [isActive, autoPlay, isTTSSupported, chunk.text, chunk.words, speak, stop]);
  
  // Handle play/pause toggle
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(chunk.text, chunk.words);
    }
  }, [isPlaying, isPaused, pause, resume, speak, chunk.text, chunk.words]);
  
  // Handle TTS toggle
  const handleToggleTTS = useCallback(() => {
    if (isPlaying || isPaused) {
      stop();
    } else {
      speak(chunk.text, chunk.words);
    }
  }, [isPlaying, isPaused, stop, speak, chunk.text, chunk.words]);
  
  // Calculate progress
  const progress = ((chunkIndex + 1) / totalChunks) * 100;
  
  // Current word for center highlight
  const currentWord = currentWordIndex >= 0 && currentWordIndex < chunk.words.length
    ? chunk.words[currentWordIndex]
    : '';
  
  return (
    <div className="reel relative w-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Layer 1: Background video/animation */}
      <ReelBackground 
        backgroundId={backgroundId} 
        isActive={isActive} 
      />
      
      {/* Layer 2: Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Layer 3: Text passage at top */}
      <ReelText 
        text={chunk.text}
        words={chunk.words}
        currentWordIndex={currentWordIndex}
      />
      
      {/* Layer 4: Large centered word highlight */}
      <ReelHighlight 
        word={currentWord}
        isVisible={isPlaying && currentWordIndex >= 0}
      />
      
      {/* Layer 5: Controls at bottom */}
      <ReelControls
        isPlaying={isPlaying}
        isTTSEnabled={isPlaying || isPaused}
        onPlayPause={handlePlayPause}
        onToggleTTS={handleToggleTTS}
        progress={progress}
        chunkIndex={chunkIndex}
        totalChunks={totalChunks}
      />
    </div>
  );
}

