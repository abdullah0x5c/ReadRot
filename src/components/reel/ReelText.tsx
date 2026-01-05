'use client';

// ==========================================
// Reel Text Component
// ==========================================
// Displays the text passage at the top of the reel

import { motion } from 'framer-motion';

interface ReelTextProps {
  text: string;
  words: string[];
  currentWordIndex: number;
}

/**
 * Text overlay component for a reel
 * Shows the full passage with word-by-word highlighting
 */
export function ReelText({ text, words, currentWordIndex }: ReelTextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute top-0 left-0 right-0 p-6 pt-12"
    >
      {/* Semi-transparent background for readability */}
      <div className="glass rounded-2xl p-5 max-w-lg mx-auto">
        <p className="text-base leading-relaxed">
          {words.map((word, index) => (
            <span
              key={index}
              className={`inline-block mr-1 transition-all duration-150 ${
                index === currentWordIndex
                  ? 'text-[var(--accent-secondary)] font-semibold scale-105'
                  : index < currentWordIndex
                  ? 'text-[var(--text-secondary)]'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </motion.div>
  );
}

