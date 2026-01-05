'use client';

// ==========================================
// Reel Container - Clean TikTok Style
// ==========================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { Book } from '@/types';
import { Reel } from './Reel';
import { useBookStore } from '@/stores/useBookStore';

interface ReelContainerProps {
  book: Book;
  initialChunkIndex?: number;
}

export function ReelContainer({ book, initialChunkIndex = 0 }: ReelContainerProps) {
  const [activeIndex, setActiveIndex] = useState(initialChunkIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const { updateProgress } = useBookStore();
  
  useEffect(() => {
    if (containerRef.current && initialChunkIndex > 0) {
      containerRef.current.scrollTop = initialChunkIndex * window.innerHeight;
    }
  }, [initialChunkIndex]);
  
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const newIndex = Math.round(containerRef.current.scrollTop / window.innerHeight);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < book.chunks.length) {
      setActiveIndex(newIndex);
      updateProgress(book.id, newIndex);
    }
  }, [activeIndex, book.chunks.length, book.id, updateProgress]);
  
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const h = window.innerHeight;
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        containerRef.current.scrollTo({ top: Math.min(activeIndex + 1, book.chunks.length - 1) * h, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        containerRef.current.scrollTo({ top: Math.max(activeIndex - 1, 0) * h, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, book.chunks.length]);
  
  return (
    <div className="relative w-full h-screen bg-black">
      {/* Back button - minimal */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Reels */}
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
          />
        ))}
      </div>
    </div>
  );
}
