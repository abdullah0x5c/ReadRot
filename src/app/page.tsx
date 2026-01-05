'use client';

// ==========================================
// Landing Page - Clean & Minimal
// ==========================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBookStore } from '@/stores/useBookStore';

export default function HomePage() {
  const router = useRouter();
  const { books, loadBooks, isLoading } = useBookStore();
  const [hasLoaded, setHasLoaded] = useState(false);
  
  useEffect(() => {
    loadBooks().then(() => setHasLoaded(true));
  }, [loadBooks]);
  
  const hasBooks = books.length > 0;
  
  return (
    <main className="min-h-screen min-h-dvh flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Animated background */}
      <div className="absolute inset-0 animated-gradient opacity-15" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="display-text text-4xl sm:text-5xl md:text-6xl mb-3">
            <span 
              style={{
                background: 'var(--gradient-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ReadRot
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg">
            Scroll through books like TikTok
          </p>
        </motion.div>
        
        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <button
            onClick={() => router.push('/upload')}
            className="btn-primary text-base py-4"
          >
            Start Reading
          </button>
          
          {hasLoaded && hasBooks && (
            <button
              onClick={() => router.push('/library')}
              className="btn-secondary text-base py-4"
            >
              My Library ({books.length})
            </button>
          )}
        </motion.div>
        
        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-sm text-[var(--text-muted)]"
        >
          Paste any text and start scrolling
        </motion.p>
      </div>
    </main>
  );
}
