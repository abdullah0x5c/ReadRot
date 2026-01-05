'use client';

// ==========================================
// Reel Background Component - HYPNOTIC EDITION
// ==========================================
// Mesmerizing animated backgrounds for maximum engagement

import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

interface ReelBackgroundProps {
  backgroundId: string;
  isActive: boolean;
}

/**
 * Animated background that keeps eyes glued to the screen
 * Creates mesmerizing patterns that don't distract from text
 */
export function ReelBackground({ backgroundId, isActive }: ReelBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  // Generate random but consistent blob positions
  const blobs = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 200 + Math.random() * 300,
      color: [
        'rgba(255, 51, 102, 0.4)',   // Hot pink
        'rgba(255, 107, 53, 0.4)',   // Orange
        'rgba(255, 204, 0, 0.3)',    // Gold
        'rgba(0, 255, 204, 0.3)',    // Cyan
        'rgba(51, 102, 255, 0.3)',   // Blue
        'rgba(255, 51, 102, 0.3)',   // Pink again
      ][i],
      duration: 15 + Math.random() * 10,
      delay: i * 0.5,
    }));
  }, []);
  
  // Canvas-based particle system for extra visual interest
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = ['#ff3366', '#ffcc00', '#00ffcc'][Math.floor(Math.random() * 3)];
      }
      
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        if (this.y > canvas.height) {
          this.y = 0;
          this.x = Math.random() * canvas.width;
        }
      }
      
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    
    // Create particles
    const particles: Particle[] = Array.from({ length: 50 }, () => new Particle());
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive]);
  
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a1a 50%, #0a1a1a 100%)',
        }}
      />
      
      {/* Animated blobs */}
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute rounded-full blur-[100px]"
          style={{
            width: blob.size,
            height: blob.size,
            background: blob.color,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 60, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: blob.delay,
          }}
        />
      ))}
      
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-60"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Scanline effect for retro vibe */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />
      
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
}
