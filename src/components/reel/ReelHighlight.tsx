'use client';

// ==========================================
// Reel Highlight Component
// ==========================================
// Large centered word display (karaoke-style)

import { motion, AnimatePresence } from 'framer-motion';

interface ReelHighlightProps {
  word: string;
  isVisible: boolean;
}

/**
 * Large centered word highlight
 * This is the "karaoke" style word that appears in the center
 * Similar to how TikTok captions work
 */
export function ReelHighlight({ word, isVisible }: ReelHighlightProps) {
  // Clean the word of punctuation for display
  const cleanWord = word?.replace(/[.,!?;:'"()-]/g, '') || '';
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        {isVisible && cleanWord && (
          <motion.div
            key={cleanWord}
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.2, opacity: 0, y: -20 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
            className="text-center"
          >
            {/* Glow effect behind the word */}
            <div className="absolute inset-0 blur-3xl bg-[var(--accent-primary)] opacity-30" />
            
            {/* The word itself */}
            <span 
              className="display-text text-5xl sm:text-6xl md:text-7xl font-bold relative"
              style={{
                background: 'var(--gradient-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 60px rgba(255, 51, 102, 0.5)',
              }}
            >
              {cleanWord}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

