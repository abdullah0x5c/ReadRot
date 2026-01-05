'use client';

// ==========================================
// Reel Background Component
// ==========================================
// Displays the looping background video/animation

import { useEffect, useRef } from 'react';

interface ReelBackgroundProps {
  backgroundId: string;
  isActive: boolean;
}

/**
 * Background layer for a reel
 * Can display either a video or CSS animation
 * 
 * For MVP: Using animated CSS gradient instead of video
 * This keeps the bundle small and avoids video hosting
 */
export function ReelBackground({ backgroundId, isActive }: ReelBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Pause video when not active to save resources
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {
          // Autoplay might be blocked, that's OK
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);
  
  // For MVP, we're using CSS animations instead of videos
  // This can be extended to support actual video backgrounds
  if (backgroundId === 'gradient' || !backgroundId) {
    return (
      <div className="absolute inset-0 animated-gradient opacity-60" />
    );
  }
  
  // Video background (for future use)
  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover"
      src={`/backgrounds/${backgroundId}.mp4`}
      loop
      muted
      playsInline
      preload="auto"
    />
  );
}

