'use client';

// ==========================================
// Reel Container Component
// ==========================================
// Scroll-snap container that holds all reels

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from '@/types';
import { Reel } from './Reel';
import { useBookStore } from '@/stores/useBookStore';

interface ReelContainerProps {
  book: Book;
  initialChunkIndex?: number;
}

/**
 * Main container for the reel experience
 */
export function ReelContainer({ book, initialChunkIndex = 0 }: ReelContainerProps) {
  const [activeIndex, setActiveIndex] = useState(initialChunkIndex);
  const [showCelebration, setShowCelebration] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { updateProgress } = useBookStore();
  
  // Scroll to initial position on mount
  useEffect(() => {
    if (containerRef.current && initialChunkIndex > 0) {
      const reelHeight = window.innerHeight;
      containerRef.current.scrollTop = initialChunkIndex * reelHeight;
    }
  }, [initialChunkIndex]);
  
  // Handle scroll to detect active reel
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const reelHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / reelHeight);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < book.chunks.length) {
      setActiveIndex(newIndex);
      updateProgress(book.id, newIndex);
      
      // Show celebration on last chunk
      if (newIndex === book.chunks.length - 1) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  }, [activeIndex, book.chunks.length, book.id, updateProgress]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      
      const reelHeight = window.innerHeight;
      
      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === ' ') {
        e.preventDefault();
        const nextIndex = Math.min(activeIndex + 1, book.chunks.length - 1);
        containerRef.current.scrollTo({
          top: nextIndex * reelHeight,
          behavior: 'smooth',
        });
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        const prevIndex = Math.max(activeIndex - 1, 0);
        containerRef.current.scrollTo({
          top: prevIndex * reelHeight,
          behavior: 'smooth',
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, book.chunks.length]);
  
  // Back button handler
  const handleBack = useCallback(() => {
    window.history.back();
  }, []);
  
  return (
    <div className="relative w-full h-screen bg-black">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 w-12 h-12 rounded-full bg-black/50 backdrop-blur-lg border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        aria-label="Go back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
        </svg>
      </motion.button>
      
      {/* Book title */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-20 right-4 z-40"
      >
        <h1 className="text-sm font-medium text-white/60 truncate">
          {book.title}
        </h1>
      </motion.div>
      
      {/* Scrollable reel container */}
      <div
        ref={containerRef}
        className="reel-container hide-scrollbar"
        onScroll={handleScroll}
      >
        {book.chunks.map((chunk, index) => (
          <Reel
            key={chunk.id}
            chunk={chunk}
            isActive={index === activeIndex}
            backgroundId={book.settings.backgroundId}
            chunkIndex={index}
            totalChunks={book.chunks.length}
            autoPlay={true}
          />
        ))}
      </div>
      
      {/* Side progress indicator */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1">
        {book.chunks.map((_, index) => (
          <motion.div
            key={index}
            className={`w-1 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'h-6 bg-gradient-to-b from-[#ff3366] to-[#ffcc00]' 
                : index < activeIndex
                ? 'h-2 bg-white/40'
                : 'h-2 bg-white/20'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
          />
        ))}
      </div>
      
      {/* Completion celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="text-center"
            >
              <div className="text-8xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-2">Finished!</h2>
              <p className="text-white/60">You completed the book!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
