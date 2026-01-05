'use client';

// ==========================================
// Full Screen Video Background
// ==========================================

import { useRef, useEffect } from 'react';

interface ReelBackgroundProps {
  backgroundId: string;
  isActive: boolean;
}

export function ReelBackground({ isActive }: ReelBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive]);
  
  return (
    <div className="absolute inset-0 bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="/backgrounds/asmr-1.mp4"
        loop
        muted
        playsInline
        preload="auto"
      />
      {/* Very subtle darkening for text readability */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}
