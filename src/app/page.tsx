'use client';

// ==========================================
// Landing Page
// ==========================================
// The home page with intro and call-to-action

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBookStore } from '@/stores/useBookStore';

export default function HomePage() {
  const router = useRouter();
  const { books, loadBooks, isLoading } = useBookStore();
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Load books on mount
  useEffect(() => {
    loadBooks().then(() => setHasLoaded(true));
  }, [loadBooks]);
  
  // If user has books, show option to go to library
  const hasBooks = books.length > 0;
  
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 animated-gradient opacity-20" />
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Logo and title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="display-text text-5xl sm:text-6xl md:text-7xl mb-4">
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
          <p className="text-[var(--text-secondary)] text-lg sm:text-xl max-w-md mx-auto">
            Transform books into brain-rot style reels. Scroll through literature like TikTok.
          </p>
        </motion.div>
        
        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-10 max-w-md"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">📱</div>
            <div className="text-xs text-[var(--text-muted)]">Scroll to read</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔊</div>
            <div className="text-xs text-[var(--text-muted)]">TTS built-in</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🎨</div>
            <div className="text-xs text-[var(--text-muted)]">Visual vibes</div>
          </div>
        </motion.div>
        
        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => router.push('/upload')}
            className="btn-primary text-lg px-8 py-4"
          >
            Start Reading
          </button>
          
          {hasLoaded && hasBooks && (
            <button
              onClick={() => router.push('/library')}
              className="btn-secondary text-lg px-8 py-4"
            >
              My Library ({books.length})
            </button>
          )}
        </motion.div>
        
        {/* Demo text hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-sm text-[var(--text-muted)]"
        >
          Paste any text and start scrolling
        </motion.p>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-xs text-[var(--text-muted)]">
          Made for Gen Z readers 📖⚡
        </p>
      </footer>
    </main>
  );
}
