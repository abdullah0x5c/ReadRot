'use client';

// ==========================================
// Full Screen Video Background
// ==========================================
// Optimized for all screen sizes - phone-like on desktop

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
    <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Video container - constrained on large screens */}
      <div className="relative w-full h-full max-w-[500px] lg:max-w-[450px] xl:max-w-[400px] mx-auto">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="/backgrounds/asmr-1.mp4"
          loop
          muted
          playsInline
          preload="auto"
        />
      </div>
      
      {/* Side blur panels for desktop - when video doesn't fill width */}
      <div className="hidden lg:block absolute inset-y-0 left-0 w-[calc(50%-225px)] xl:w-[calc(50%-200px)] bg-black/90 backdrop-blur-xl" />
      <div className="hidden lg:block absolute inset-y-0 right-0 w-[calc(50%-225px)] xl:w-[calc(50%-200px)] bg-black/90 backdrop-blur-xl" />
      
      {/* Darkening overlay for text readability */}
      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}
