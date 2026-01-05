'use client';

// ==========================================
// Reel Container Component
// ==========================================
// Scroll-snap container that holds all reels

import { useState, useRef, useEffect, useCallback } from 'react';
import { Book } from '@/types';
import { Reel } from './Reel';
import { useBookStore } from '@/stores/useBookStore';

interface ReelContainerProps {
  book: Book;
  initialChunkIndex?: number;
}

/**
 * Main container for the reel experience
 * Handles:
 * - Vertical scroll-snap behavior
 * - Detecting which reel is currently visible
 * - Keyboard navigation (up/down arrows)
 * - Progress saving
 */
export function ReelContainer({ book, initialChunkIndex = 0 }: ReelContainerProps) {
  const [activeIndex, setActiveIndex] = useState(initialChunkIndex);
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
      // Save progress
      updateProgress(book.id, newIndex);
    }
  }, [activeIndex, book.chunks.length, book.id, updateProgress]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      
      const reelHeight = window.innerHeight;
      
      if (e.key === 'ArrowDown' || e.key === 'j') {
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
    <div className="relative w-full h-screen">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 control-btn"
        aria-label="Go back"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className="w-5 h-5"
        >
          <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Book title */}
      <div className="absolute top-4 left-16 right-16 z-40 text-center">
        <h1 className="text-sm font-medium text-[var(--text-secondary)] truncate">
          {book.title}
        </h1>
      </div>
      
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
      
      {/* Scroll hint for first-time users */}
      {activeIndex === 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 animate-bounce">
          <div className="text-[var(--text-muted)] text-xs flex flex-col items-center gap-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="w-5 h-5"
            >
              <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
            </svg>
            <span>Scroll to continue</span>
          </div>
        </div>
      )}
    </div>
  );
}

