'use client';

// ==========================================
// Reel Controls Component
// ==========================================
// Play/pause, TTS, and settings controls

import { motion } from 'framer-motion';

interface ReelControlsProps {
  isPlaying: boolean;
  isTTSEnabled: boolean;
  onPlayPause: () => void;
  onToggleTTS: () => void;
  progress: number;        // 0 to 100
  chunkIndex: number;
  totalChunks: number;
}

/**
 * Control buttons and progress indicator for a reel
 */
export function ReelControls({
  isPlaying,
  isTTSEnabled,
  onPlayPause,
  onToggleTTS,
  progress,
  chunkIndex,
  totalChunks,
}: ReelControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="absolute bottom-0 left-0 right-0 p-6 pb-8"
    >
      <div className="max-w-lg mx-auto space-y-4">
        {/* Control buttons */}
        <div className="flex items-center justify-center gap-4">
          {/* Play/Pause button */}
          <button
            onClick={onPlayPause}
            className="control-btn w-14 h-14"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              // Pause icon
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                className="w-6 h-6"
              >
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            ) : (
              // Play icon
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                className="w-6 h-6"
              >
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          {/* TTS Toggle button */}
          <button
            onClick={onToggleTTS}
            className={`control-btn ${isTTSEnabled ? 'bg-[var(--accent-primary)] bg-opacity-30' : ''}`}
            aria-label={isTTSEnabled ? 'Disable TTS' : 'Enable TTS'}
          >
            {isTTSEnabled ? (
              // Speaker on icon
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
              </svg>
            ) : (
              // Speaker off icon
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="progress-bar">
            <div 
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Progress text */}
          <div className="flex justify-between text-xs text-[var(--text-muted)] mono-text">
            <span>{chunkIndex + 1} / {totalChunks}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

