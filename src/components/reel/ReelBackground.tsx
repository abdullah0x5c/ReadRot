'use client';

// ==========================================
// Reel Background - REAL VIDEO EDITION
// ==========================================
// Actual ASMR/satisfying videos for that brain-rot experience

import { useRef, useEffect } from 'react';

interface ReelBackgroundProps {
  backgroundId: string;
  isActive: boolean;
}

/**
 * Video background component
 * Plays looping muted video for that TikTok brain-rot feel
 */
export function ReelBackground({ backgroundId, isActive }: ReelBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Play/pause based on active state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isActive) {
      // Play the video when this reel is active
      video.play().catch((err) => {
        console.log('Video autoplay blocked:', err);
      });
    } else {
      // Pause when not active to save resources
      video.pause();
    }
  }, [isActive]);
  
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* The actual video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="/backgrounds/asmr-1.mp4"
        loop
        muted
        playsInline
        preload="auto"
        style={{
          // Slight zoom to hide any edges
          transform: 'scale(1.05)',
        }}
      />
      
      {/* Dark overlay so text is readable */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
}
