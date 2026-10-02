"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "motion/react";
import { 
  Plus, 
  Trash2, 
  Play, 
  Settings, 
  Users, 
  Trophy,
  Sparkles,
  Zap,
  Maximize2,
  Minimize2,
  Disc,
  Grid,
  Activity,
  Dna,
  PartyPopper,
  Crown,
  Medal,
  Bug,
  ChevronDown,
  Aperture,
  FileInput,
  Save,
  X,
  Gamepad2
} from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { PrizeRoulette } from "./components/PrizeRoulette";
import { CardFlipGame } from "./components/CardFlipGame";

// --- Types ---
interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

interface Winner {
  id: string;
  name: string;
  time: string;
  prize?: string;
}

export interface Prize {
  id: string;
  name: string;
  count: number;
  remaining: number;
  level: number;
}

type GameMode = 'DRUM' | 'GRID' | 'STREAM' | 'WHEEL';
type CelebrationMode = 'FIREWORKS' | 'CONFETTI' | 'GOLD_RUSH';

const MODES: {
  id: GameMode, 
  label: string, 
  icon: any, 
  color: string,
  bg: string,
  particleColors: string[]
}[] = [
  { 
    id: 'DRUM', 
    label: '3D 重力滚筒', 
    icon: Disc, 
    color: 'text-cyan-400',
    bg: 'https://images.unsplash.com/photo-1759926953612-e48779f26629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2klMjBmaSUyMGZ1dHVyaXN0aWMlMjBjeWxpbmRlciUyMHR1bm5lbCUyMGJsdWUlMjBhYnN0cmFjdHxlbnwxfHx8fDE3NzAzNTgwMTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    particleColors: ['#06b6d4', '#22d3ee', '#ecfeff', '#0891b2']
  },
  { 
    id: 'GRID', 
    label: '赛博矩阵', 
    icon: Grid, 
    color: 'text-purple-400',
    bg: 'https://images.unsplash.com/photo-1746470427617-91e8dd28298d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBkaWdpdGFsJTIwZ3JpZCUyMG1hdHJpeCUyMHB1cnBsZSUyMGFic3RyYWN0fGVufDF8fHx8MTc3MDM1ODAxOHww&ixlib=rb-4.1.0&q=80&w=1080',
    particleColors: ['#a855f7', '#d8b4fe', '#faf5ff', '#9333ea']
  },
  { 
    id: 'STREAM', 
    label: '霓虹光流', 
    icon: Activity, 
    color: 'text-pink-400',
    bg: 'https://images.unsplash.com/photo-1765026496084-1caba5abbaa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwbGlnaHQlMjB0cmFpbHMlMjBzcGVlZCUyMG1vdGlvbiUyMGJsdXIlMjBwaW5rJTIwYWJzdHJhY3R8ZW58MXx8fHwxNzcwMzU4MDE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    particleColors: ['#ec4899', '#fbcfe8', '#fff1f2', '#db2777']
  },
  { 
    id: 'WHEEL', 
    label: '命运转盘', 
    icon: Aperture, 
    color: 'text-yellow-400',
    bg: 'https://images.unsplash.com/photo-1766711081731-3f1d0de7fd98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwbmVvbiUyMGdsb3dpbmclMjByb3VsZXR0ZSUyMHdoZWVsJTIwY2FzaW5vJTIwYWJzdHJhY3QlMjBiYWNrZ3JvdW5kfGVufDF8fHx8MTc3MDM1ODU2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    particleColors: ['#fbbf24', '#f59e0b', '#fffbeb', '#d97706']
  },
];

// --- Constants ---
const DRUM_RADIUS = 220; 

// --- Helper ---
const getCryptoRandomIndex = (max: number) => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const randomFloat = array[0] / (0xffffffff + 1);
  return Math.floor(randomFloat * max);
};

// --- Components ---

const CelebrationCanvas = ({ isActive, colors, mode }: { isActive: boolean, colors: string[], mode: CelebrationMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    const particleColors = colors;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
      decay: number;
      type: CelebrationMode;
      wobble: number;

      constructor(x: number, y: number, type: CelebrationMode) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.alpha = 1;
        this.wobble = Math.random() * 10;
        
        if (type === 'FIREWORKS') {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 2;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
          this.size = Math.random() * 2 + 1;
          this.decay = Math.random() * 0.015 + 0.005;
          this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
        } else if (type === 'CONFETTI') {
          this.vx = (Math.random() - 0.5) * 2;
          this.vy = Math.random() * 3 + 2;
          this.size = Math.random() * 6 + 4;
          this.decay = 0.002;
          this.color = ['#FFD700', '#FF69B4', '#00FFFF', '#7FFF00', '#FF4500'][Math.floor(Math.random() * 5)];
        } else { // GOLD_RUSH
           this.vx = 0;
           this.vy = Math.random() * 10 + 5;
           this.size = Math.random() * 3 + 1;
           this.decay = 0.01;
           this.color = '#FCD34D'; // Gold
        }
      }

      update() {
        if (this.type === 'FIREWORKS') {
          this.x += this.vx;
          this.y += this.vy;
          this.vy += 0.05; 
          this.vx *= 0.98; 
          this.vy *= 0.98;
          this.alpha -= this.decay;
        } else if (this.type === 'CONFETTI') {
          this.x += Math.sin(this.wobble) * 2;
          this.y += this.vy;
          this.wobble += 0.1;
          this.alpha -= this.decay;
        } else { // GOLD_RUSH
           this.y += this.vy;
           this.alpha -= this.decay;
           if(Math.random() > 0.9) this.alpha = 1; // Twinkle
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        
        if (this.type === 'CONFETTI') {
             ctx.translate(this.x, this.y);
             ctx.rotate(this.wobble);
             ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size/2);
        } else if (this.type === 'GOLD_RUSH') {
             ctx.beginPath();
             ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
             ctx.fill();
             ctx.shadowBlur = 10;
             ctx.shadowColor = this.color;
        } else {
             ctx.beginPath();
             ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
             ctx.fill();
        }
        ctx.restore();
      }
    }

    const createExplosion = () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height * 0.6); 
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle(x, y, 'FIREWORKS'));
        }
    };

    const createConfetti = () => {
        const x = Math.random() * canvas.width;
        particles.push(new Particle(x, -10, 'CONFETTI'));
    };

    const createGoldRain = () => {
        const x = Math.random() * canvas.width;
        particles.push(new Particle(x, -10, 'GOLD_RUSH'));
    };

    let ticker = 0;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ticker++;
      
      if (mode === 'FIREWORKS') {
         if (ticker % 40 === 0) createExplosion();
      } else if (mode === 'CONFETTI') {
         if (ticker % 2 === 0) createConfetti();
         if (ticker % 2 === 0) createConfetti();
      } else if (mode === 'GOLD_RUSH') {
         if (ticker % 1 === 0) {
             createGoldRain();
             createGoldRain();
         }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0 || p.y > canvas.height + 50) {
          particles.splice(i, 1);
        }
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, colors, mode]);

  if (!isActive) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen z-0" />;
};

// --- Game Modes ---

const ThreeDRollingDrum = ({ participants, isSpinning, winnerIndex }: any) => {
  const controls = useAnimation();
  const [rotation, setRotation] = useState(0);
  
  const displayList = useMemo(() => {
    if (participants.length === 0) return [];
    let list = [...participants];
    // Ensure enough items to form a nice cylinder
    while (list.length < 16) {
      list = [...list, ...participants];
    }
    return list;
  }, [participants]);

  const angleStep = 360 / displayList.length;

  useEffect(() => {
    if (isSpinning) {
      controls.start({
        rotateX: [0, -360 * 5],
        transition: { duration: 3, ease: "linear", repeat: Infinity }
      });
    } else if (winnerIndex !== null) {
      // Find the index of the winner in the display list (closest to the current viewing angle ideally, but simple mapping works)
      // We need to land on the winner.
      // Since we duplicate the list, any instance of winner is fine, but we pick one.
      // Let's pick the one in the "middle" or calculate based on current rotation?
      // For simplicity, we just target a specific index.
      const idx = displayList.findIndex((p, i) => i % participants.length === winnerIndex % participants.length);
      
      const targetAngle = idx * angleStep;
      controls.stop();
      
      // We need to rotate to -targetAngle.
      // Add extra spins for effect.
      const currentRotation = rotation; // We assume 0 for now or track it? 
      // Framer motion 'animate' doesn't update state 'rotation'.
      
      const finalAngle = -(targetAngle + 360 * 5);

      controls.start({
        rotateX: finalAngle,
        transition: { duration: 4, type: "spring", damping: 20, stiffness: 40 }
      });
    }
  }, [isSpinning, winnerIndex, participants, displayList, angleStep, controls]);

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden [perspective:1000px]">
      <motion.div
        animate={controls}
        className="relative w-full h-20 z-30"
        style={{ transformStyle: "preserve-3d" }}
      >
        {displayList.map((p: any, i: number) => {
          const angle = i * angleStep;
          return (
            <div
              key={`${p.id}-${i}`}
              className="absolute inset-0 w-full h-20 flex items-center justify-center"
              style={{
                transform: `rotateX(${angle}deg) translateZ(${DRUM_RADIUS}px)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              <div className="px-8 py-4 bg-gradient-to-r from-transparent via-white/10 to-transparent border-y border-white/5 w-full text-center backdrop-blur-sm">
                <span className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                  {p.name}
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>
      
      {/* Selection Highlight */}
      <div className="absolute inset-x-0 h-24 border-y-2 border-cyan-500/50 bg-cyan-500/5 pointer-events-none z-40 flex items-center justify-between px-4 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
        <div className="w-1 h-full bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
        <div className="w-1 h-full bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
      </div>
      
      {/* Fade Gradients */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none z-40" />
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-40" />
    </div>
  );
};

const CyberGrid = ({ participants, isSpinning, winnerIndex }: any) => {
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);

  useEffect(() => {
    if (isSpinning) {
      const interval = setInterval(() => {
        setHighlightIdx(Math.floor(Math.random() * participants.length));
      }, 80); // Slightly faster scan
      return () => clearInterval(interval);
    } else if (winnerIndex !== null) {
      setHighlightIdx(winnerIndex);
    } else {
        setHighlightIdx(null);
    }
  }, [isSpinning, winnerIndex, participants]);

  return (
    <div className="w-full h-full p-4 overflow-y-auto custom-scrollbar flex flex-col items-center justify-start">
      {/* Top Floating Name - Sticky to viewport top */}
      <div className="sticky top-0 left-0 right-0 flex justify-center items-center z-30 pointer-events-none h-24 shrink-0 bg-gradient-to-b from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent">
          <AnimatePresence mode="popLayout">
            {(highlightIdx !== null || winnerIndex !== null) && (
              <motion.div
                key={winnerIndex !== null && !isSpinning ? `winner-${winnerIndex}` : highlightIdx}
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                className={`text-4xl md:text-5xl font-black uppercase tracking-wider whitespace-nowrap pt-4 ${
                   winnerIndex !== null && !isSpinning 
                   ? "text-purple-400 drop-shadow-[0_0_30px_rgba(168,85,247,1)]"
                   : "text-white/80 drop-shadow-md"
                }`}
              >
                {participants[winnerIndex !== null && !isSpinning ? winnerIndex : highlightIdx!]?.name}
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4 w-full px-4 mb-24 mt-4">
        {participants.map((p: any, i: number) => {
          const isWinner = winnerIndex === i && !isSpinning;
          const isHighlighted = highlightIdx === i;
          
          return (
            <motion.div
              key={p.id}
              layout
              animate={{
                scale: isWinner ? 1.15 : isHighlighted ? 1.05 : 1,
                borderColor: isWinner ? '#a855f7' : isHighlighted ? '#d8b4fe' : 'rgba(255,255,255,0.1)',
                backgroundColor: isWinner ? 'rgba(168, 85, 247, 0.4)' : isHighlighted ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0,0,0,0.4)',
                boxShadow: isWinner 
                    ? '0 0 40px rgba(168,85,247,0.6), inset 0 0 20px rgba(168,85,247,0.4)' 
                    : isHighlighted 
                        ? '0 0 20px rgba(168,85,247,0.3)' 
                        : 'none'
              }}
              transition={{ duration: 0.1 }}
              className={`
                relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden group
                ${isWinner ? 'z-20' : 'z-0'}
              `}
            >
              {/* Tech Corners */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-500/50" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-500/50" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-500/50" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-500/50" />

              {/* Digital Noise Background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />

              {/* Avatar / Icon Placeholder */}
              <div className={`mb-1 md:mb-2 p-1.5 md:p-2 rounded-full bg-white/5 ${isHighlighted || isWinner ? 'text-purple-300' : 'text-gray-600'} transition-colors`}>
                  <Users className="w-4 h-4 md:w-5 md:h-5" />
              </div>

              <span className={`font-black uppercase tracking-tight relative z-10 transition-all text-center px-1 ${isWinner ? 'text-lg md:text-2xl text-white drop-shadow-[0_0_10px_rgba(168,85,247,1)]' : isHighlighted ? 'text-sm md:text-base text-purple-200' : 'text-[10px] md:text-xs text-gray-500 group-hover:text-gray-300'}`}>
                {p.name}
              </span>
              
              {/* Scanline for highlighted */}
              {(isHighlighted || isWinner) && (
                 <motion.div 
                    initial={{ top: '-10%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[20%] bg-gradient-to-b from-transparent via-purple-500/20 to-transparent pointer-events-none" 
                 />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const NeonStream = ({ participants, isSpinning, winnerIndex }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [decryptionText, setDecryptionText] = useState("");

  // Duplicate list for infinite scroll
  const streamList = useMemo(() => {
      let list = [...participants];
      while(list.length < 50) list = [...list, ...participants]; // More duplicates for longer speed
      return [...list, ...list]; 
  }, [participants]);

  // Simulate decryption/calculation effect
  useEffect(() => {
    if (isSpinning) {
      const interval = setInterval(() => {
         const hex = Array(4).fill(0).map(() => Math.floor(Math.random() * 255).toString(16).padStart(2, '0').toUpperCase()).join(' ');
         setDecryptionText(`SCANNING_HASH: 0x${hex} // MATCHING_PATTERN...`);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isSpinning]);

  useEffect(() => {
    if (isSpinning) {
      controls.start({
        x: [0, -4000], // Faster distance
        transition: { duration: 4, ease: "linear", repeat: Infinity } // Faster speed
      });
    } else if (winnerIndex !== null) {
      controls.stop();
    }
  }, [isSpinning, winnerIndex]);

  return (
    <div className="w-full h-[400px] flex flex-col items-center justify-center overflow-hidden bg-black/40 rounded-3xl relative border border-pink-500/20">
       
       {/* Background Grid Animation */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-30" />

       {/* Center Line / Target */}
       <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-pink-500 z-20 shadow-[0_0_20px_rgba(236,72,153,1)]">
          <div className="absolute top-10 -left-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-pink-500" />
          <div className="absolute bottom-10 -left-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-pink-500" />
       </div>
       
       {/* Decryption Overlay */}
       {isSpinning && (
         <div className="absolute top-1/4 inset-x-0 text-center z-30">
            <div className="inline-block bg-black/60 backdrop-blur border border-pink-500/30 px-4 py-1 rounded text-xs font-mono text-pink-400 animate-pulse tracking-widest">
              {decryptionText}
            </div>
         </div>
       )}

       {winnerIndex !== null && !isSpinning && (
         <div className="absolute inset-0 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0, filter: "blur(20px)" }}
              animate={{ scale: 1.5, filter: "blur(0px)" }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="text-8xl font-black text-white whitespace-nowrap"
              style={{ 
                textShadow: "0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 40px #ec4899, 0 0 80px #ec4899" 
              }}
            >
              {participants[winnerIndex].name}
            </motion.div>
         </div>
       )}

       <div className="w-full overflow-hidden py-20 relative z-10">
         <motion.div 
            animate={controls}
            className="flex gap-16 items-center pl-[50%]"
            style={{ opacity: winnerIndex !== null && !isSpinning ? 0 : 1 }}
         >
             {streamList.map((p: any, i: number) => (
                <div 
                  key={`${p.id}-${i}`} 
                  className="text-6xl font-black whitespace-nowrap shrink-0 transition-all duration-300" 
                  style={{ 
                    color: "rgba(255,255,255,0.1)",
                    WebkitTextStroke: "2px rgba(236, 72, 153, 0.8)",
                    textShadow: "0 0 20px rgba(236, 72, 153, 0.3)"
                  }}
                >
                  {p.name}
                </div>
             ))}
         </motion.div>
       </div>
       
       <div className="absolute bottom-4 w-full flex justify-between px-8 text-[10px] text-pink-500/50 font-mono tracking-[0.2em] uppercase">
          <span>Speed: 12000/s</span>
          <span>Targeting...</span>
       </div>
    </div>
  );
};

const LuckyWheel = ({ participants, isSpinning, winnerIndex }: any) => {
  const controls = useAnimation();
  const [activeName, setActiveName] = useState("READY");
  
  // Calculate wheel segments
  const segments = participants.length;
  const anglePerSegment = 360 / segments;
  const colors = ['#F472B6', '#22D3EE', '#A78BFA', '#34D399', '#FBBF24', '#FB7185'];

  const updateActiveName = (latest: any) => {
      const rotation = latest.rotate;
      if (typeof rotation === 'number') {
          // Normalize rotation to positive equivalent in 0-360 range relative to pointer position
          // Pointer is at top. Initial Index 0 starts at top (due to SVG -90deg rotation).
          // Clockwise rotation moves Index 0 to the right.
          // So Pointer (Top) moves "left" (negative angle) relative to the wheel.
          const normalizedRotation = (-rotation % 360 + 360) % 360;
          const index = Math.floor(normalizedRotation / anglePerSegment);
          // Ensure index is within bounds
          const safeIndex = Math.min(Math.max(index, 0), segments - 1);
          setActiveName(participants[safeIndex].name);
      }
  };

  useEffect(() => {
    if (isSpinning) {
      controls.start({
        rotate: 360 * 10,
        transition: { duration: 10, ease: "linear", repeat: Infinity }
      });
    } else if (winnerIndex !== null) {
      controls.stop();
      
      // Rotate to land winner:
      const landingAngle = -(winnerIndex * anglePerSegment + anglePerSegment / 2);
      // Add multiple rotations
      const finalRotate = 360 * 5 + landingAngle;

      controls.start({
        rotate: finalRotate,
        transition: { duration: 4, type: "spring", damping: 15, stiffness: 20 }
      });
    } else {
       setActiveName("READY");
    }
  }, [isSpinning, winnerIndex, participants, anglePerSegment]);

  // SVG Helper for pie slices
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  return (
    <div className="flex flex-col items-center gap-8 relative">
       {/* Active Name Display */}
       <div className="absolute -top-32 left-0 right-0 flex justify-center items-center h-24 pointer-events-none">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeName}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -20 }}
              className={`text-6xl font-black uppercase tracking-wider whitespace-nowrap ${
                winnerIndex !== null && !isSpinning 
                  ? "text-yellow-400 drop-shadow-[0_0_30px_rgba(234,179,8,1)]" 
                  : "text-white/80 drop-shadow-md"
              }`}
            >
              {activeName}
            </motion.div>
          </AnimatePresence>
       </div>

    <div className="relative w-full max-w-[min(80vw,70vh)] aspect-square flex items-center justify-center">
      
      {/* The Wheel */}
      <motion.div 
        animate={controls}
        onUpdate={updateActiveName}
        className="relative w-full h-full rounded-full border-4 md:border-8 border-yellow-500/50 shadow-[0_0_80px_rgba(234,179,8,0.4)] overflow-hidden bg-black"
        style={{ rotate: 0 }} // Start rotation
      >
        <svg viewBox="-1 -1 2 2" className="w-full h-full rotate-[-90deg]">
           {participants.map((p: any, i: number) => {
             const startPercent = i / segments;
             const endPercent = (i + 1) / segments;
             const [startX, startY] = getCoordinatesForPercent(startPercent);
             const [endX, endY] = getCoordinatesForPercent(endPercent);
             const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;
             const pathData = [
               `M 0 0`,
               `L ${startX} ${startY}`,
               `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
               `L 0 0`,
             ].join(' ');

             return (
               <path 
                 key={p.id} 
                 d={pathData} 
                 fill={colors[i % colors.length]}
                 stroke="rgba(0,0,0,0.5)"
                 strokeWidth="0.005"
               />
             );
           })}
        </svg>

        {/* Labels - positioned absolute for better text handling than SVG */}
        {participants.map((p: any, i: number) => {
           const angle = (i * anglePerSegment) + (anglePerSegment / 2);
           return (
             <div
               key={p.id}
               className="absolute top-1/2 left-1/2 w-[50%] h-[40px] origin-left flex items-center justify-end pr-8"
               style={{ 
                 transform: `translateY(-50%) rotate(${angle - 90}deg)`,
               }}
             >
               <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-black text-white whitespace-nowrap drop-shadow-md uppercase tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(90deg)' }}>
                  {p.name}
                </div>
             </div>
           );
        })}
      </motion.div>

      {/* Center Cap */}
      <div className="absolute w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl z-20 flex items-center justify-center border-2 md:border-4 border-white/20">
         <div className="w-8 h-8 md:w-16 md:h-16 bg-black rounded-full flex items-center justify-center">
            <div className="w-2 h-2 md:w-4 md:h-4 bg-yellow-500 rounded-full animate-ping" />
         </div>
      </div>

      {/* Indicator - Fixed direction (pointing down) */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
        <div className="w-12 h-14 bg-gradient-to-b from-red-600 to-red-500" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-red-800 rounded-sm" />
      </div>

    </div>
    </div>
  );
};

const ModeSelector = ({ onComplete }: { onComplete: (mode: GameMode) => void }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let cycles = 0;
    const maxCycles = 15; // How many flips before stopping
    
    interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % MODES.length);
      cycles++;
      if (cycles > maxCycles) {
        clearInterval(interval);
        const randomIdx = Math.floor(Math.random() * MODES.length);
        const finalMode = MODES[randomIdx].id;
        setCurrentIdx(randomIdx);
        // Delay to show the final selection
        setTimeout(() => onComplete(finalMode), 5000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  const active = MODES[currentIdx];
  const Icon = active.icon;

  return (
    <div className="w-full h-[400px] flex flex-col items-center justify-center gap-8">
      <motion.div
        key={active.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="flex flex-col items-center gap-4"
      >
        <div className={`w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center ${active.color} shadow-[0_0_40px_rgba(255,255,255,0.1)]`}>
          <Icon className="w-16 h-16" />
        </div>
        <h3 className={`text-4xl font-black uppercase tracking-wider ${active.color}`}>
          {active.label}
        </h3>
      </motion.div>
      <div className="text-gray-500 font-mono tracking-[0.3em] text-xs animate-pulse">
        随机匹配游戏场景...
      </div>
    </div>
  );
};

const WinnerModal = ({ winner, prize, onClose, particleColors, celebrationMode, avatar }: { winner: string, prize?: string, onClose: () => void, particleColors: string[], celebrationMode: CelebrationMode, avatar?: string }) => {
  const [prizeImages, setPrizeImages] = useState<string[]>([]);
  const [showPrize, setShowPrize] = useState(false);

  useEffect(() => {
    const loadPrizeImages = async () => {
      if (prize) {
        try {
          const response = await fetch(`/apps/cyber-lottery/api/prizes?name=${encodeURIComponent(prize)}`);
          const data = await response.json();
          if (data.images && data.images.length > 0) {
            setPrizeImages(data.images);
            // Show prize panel after a delay
            setTimeout(() => setShowPrize(true), 800);
          }
        } catch (error) {
          console.error('Failed to load prize images:', error);
        }
      }
    };
    loadPrizeImages();
  }, [prize]);

  const getIcon = () => {
    switch(celebrationMode) {
      case 'GOLD_RUSH': return <Crown className="w-16 h-16 text-yellow-400" />;
      case 'CONFETTI': return <PartyPopper className="w-16 h-16 text-pink-500" />;
      default: return <Trophy className="w-16 h-16 text-white" />;
    }
  };

  const getTitle = () => {
    if (prize) return prize; // Show prize name as title if available
    switch(celebrationMode) {
      case 'GOLD_RUSH': return "皇冠时刻";
      case 'CONFETTI': return "狂欢时刻";
      default: return "中奖者已产生";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-hidden"
    >
      {/* Spotlights for specific modes */}
      {celebrationMode === 'GOLD_RUSH' && (
         <div className="absolute inset-0 pointer-events-none animate-spin-slow opacity-30">
            <div className="absolute top-0 left-1/2 w-[200px] h-[100vh] bg-gradient-to-b from-yellow-500/50 to-transparent blur-3xl origin-top -translate-x-1/2 rotate-45" />
            <div className="absolute top-0 left-1/2 w-[200px] h-[100vh] bg-gradient-to-b from-yellow-500/50 to-transparent blur-3xl origin-top -translate-x-1/2 -rotate-45" />
         </div>
      )}

      <motion.div
        initial={{ scale: 0.2, rotate: 20, y: 100 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        exit={{ scale: 1.5, opacity: 0 }}
        className="relative text-center max-w-2xl w-full z-10"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`inline-block mb-4 p-4 rounded-full shadow-[0_0_50px_rgba(6,182,212,0.5)] bg-gradient-to-tr ${celebrationMode === 'GOLD_RUSH' ? 'from-yellow-500 to-orange-600' : 'from-cyan-500 to-purple-600'}`}
        >
          {getIcon()}
        </motion.div>

        <h2 className={`text-2xl font-mono tracking-[0.5em] uppercase mb-8 ${celebrationMode === 'GOLD_RUSH' ? 'text-yellow-400' : 'text-cyan-400'}`}>
          {getTitle()}
        </h2>

        {/* Large avatar display */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="relative inline-block mb-12"
        >
          {avatar ? (
            <img
              src={avatar}
              alt={winner}
              className="w-64 h-64 md:w-80 md:h-80 rounded-full object-cover shadow-[0_0_80px_rgba(255,255,255,0.5)] border-8 border-white/20"
            />
          ) : (
            <motion.div
              className="w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_80px_rgba(6,182,212,0.5)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-8xl font-black text-white">
                {winner.charAt(0)}
              </span>
            </motion.div>
          )}
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-full blur-3xl opacity-50 -z-10 ${celebrationMode === 'GOLD_RUSH' ? 'bg-yellow-500' : 'bg-cyan-500'}`} />
        </motion.div>

        <button
          onClick={onClose}
          className="group relative px-12 py-4 overflow-hidden rounded-full bg-white text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
        >
          <span className="relative z-10">确认中奖</span>
          <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity ${celebrationMode === 'GOLD_RUSH' ? 'from-yellow-400 to-orange-500' : 'from-cyan-400 to-purple-500'}`} />
        </button>
      </motion.div>

      {/* Prize panel - slides in from right */}
      <AnimatePresence>
        {showPrize && prizeImages.length > 0 && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-black/90 to-black/50 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto custom-scrollbar"
          >
            <div className="sticky top-0">
              <h3 className="text-xl font-mono tracking-widest text-white/90 mb-6 border-b border-white/10 pb-4">
                奖品展示
              </h3>
              <div className="space-y-4">
                {prizeImages.map((image, index) => (
                  <motion.div
                    key={image}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-lg">
                      <img
                        src={image}
                        alt={`奖品 ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}} />
    </motion.div>
  );
};

// --- Debug Menu ---
const DebugMenu = ({ onSelectMode }: { onSelectMode: (mode: GameMode) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono tracking-widest text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/20"
      >
        <Bug className="w-4 h-4" />
        <span className="hidden md:inline">DEBUG</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[220] flex flex-col py-2"
          >
            <div className="px-4 py-2 text-[10px] uppercase text-gray-500 font-bold tracking-widest border-b border-white/5 mb-1">
              强制测试模式
            </div>
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => {
                  onSelectMode(mode.id);
                  setIsOpen(false);
                }}
                className="text-left px-4 py-2 text-xs font-mono text-gray-300 hover:bg-white/10 hover:text-cyan-400 transition-colors flex items-center gap-2"
              >
                <mode.icon className="w-3 h-3" />
                {mode.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SpeedMenu = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = [0.5, 0.75, 1, 1.5, 2, 3, 5];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono tracking-widest text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/20"
      >
        <Activity className="w-4 h-4" />
        <span className="hidden md:inline">SPEED x{value}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-32 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[220] flex flex-col py-2"
          >
             <div className="px-4 py-2 text-[10px] uppercase text-gray-500 font-bold tracking-widest border-b border-white/5 mb-1">
              抽奖时长倍率
            </div>
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`text-left px-4 py-2 text-xs font-mono transition-colors flex items-center justify-between ${value === opt ? 'text-cyan-400 bg-white/5' : 'text-gray-300 hover:bg-white/10'}`}
              >
                <span>x{opt}</span>
                {value === opt && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "张伟" },
    { id: "2", name: "李娜" },
    { id: "3", name: "王强" },
    { id: "4", name: "赵敏" },
    { id: "5", name: "刘波" },
    { id: "6", name: "陈静" },
    { id: "7", name: "杨勇" },
    { id: "8", name: "黄洋" },
  ]);
  const [newName, setNewName] = useState("");
  const [activeMode, setActiveMode] = useState<GameMode>('DRUM');
  const [celebrationMode, setCelebrationMode] = useState<CelebrationMode>('FIREWORKS');
  const [durationMultiplier, setDurationMultiplier] = useState(1);
  const [isSelectingMode, setIsSelectingMode] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [showCardGame, setShowCardGame] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [winnerAvatar, setWinnerAvatar] = useState<string | undefined>(undefined);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<Winner[]>([]);
  const [manualPrizeId, setManualPrizeId] = useState<string | null>(null);
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [isPrizeRolling, setIsPrizeRolling] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>([
    { id: '1', name: '一等奖', count: 1, remaining: 1, level: 1 },
    { id: '2', name: '二等奖', count: 2, remaining: 2, level: 2 },
    { id: '3', name: '三等奖', count: 3, remaining: 3, level: 3 },
    { id: '4', name: '幸运奖', count: 10, remaining: 10, level: 4 },
    { id: '5', name: '欢乐奖', count: 30, remaining: 30, level: 5 },
  ]);
  const [showPrizeSettings, setShowPrizeSettings] = useState(false);

  // Auto-calculate next prize to draw with probability control
  const currentPrize = useMemo(() => {
    // Priority: Manual selection
    if (manualPrizeId) {
       const manual = prizes.find(p => p.id === manualPrizeId);
       if (manual && manual.remaining > 0) return manual;
    }

    // Get available prizes
    const availablePrizes = prizes.filter(p => p.remaining > 0);
    if (availablePrizes.length === 0) return null;

    const drawCount = history.length;

    // First 20 draws: only level 3, 4, 5 (三等奖、幸运奖、欢乐奖)
    if (drawCount < 20) {
      const earlyPrizes = availablePrizes.filter(p => p.level >= 3);
      if (earlyPrizes.length > 0) {
        // Weighted random: higher level number = higher probability
        const weights = earlyPrizes.map(p => Math.pow(p.level, 2));
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < earlyPrizes.length; i++) {
          random -= weights[i];
          if (random <= 0) return earlyPrizes[i];
        }
        return earlyPrizes[earlyPrizes.length - 1];
      }
    }

    // After 20 draws: all prizes available, with dynamic probability
    // Base probability increases as more prizes are drawn
    const baseWeights = availablePrizes.map(p => {
      // Higher level = higher base weight
      let weight = Math.pow(p.level, 1.5);

      // Boost lower level prizes slightly after 20 draws
      if (p.level <= 2 && drawCount >= 20) {
        weight *= 0.3; // Still keep it rare but possible
      }

      return weight;
    });

    const totalWeight = baseWeights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < availablePrizes.length; i++) {
      random -= baseWeights[i];
      if (random <= 0) return availablePrizes[i];
    }

    return availablePrizes[availablePrizes.length - 1];
  }, [prizes, manualPrizeId, history]);

  const candidates = useMemo(() => {
    return participants.filter(p => !history.some(h => h.id === p.id));
  }, [participants, history]);

  // Auto-reset history when all participants have won but prizes remain
  const shouldResetHistory = useMemo(() => {
    const availablePrizes = prizes.filter(p => p.remaining > 0);
    return candidates.length === 0 && availablePrizes.length > 0 && history.length > 0;
  }, [candidates, prizes, history]);

  useEffect(() => {
    if (shouldResetHistory) {
      // Clear history to allow re-drawing
      setHistory([]);
    }
  }, [shouldResetHistory]);

  // Derived theme based on active mode
  const currentTheme = useMemo(() => {
    return MODES.find(m => m.id === activeMode) || MODES[0];
  }, [activeMode]);

  const [isImportMode, setIsImportMode] = useState(false);
  const [importText, setImportText] = useState("");

  const addParticipant = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newName.trim()) return;
    setParticipants([...participants, { id: Date.now().toString(), name: newName.trim() }]);
    setNewName("");
  };

  const loadFromFiles = async () => {
    try {
      const response = await fetch('/api/participants');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setParticipants(data);
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  };

  const handleBulkImport = () => {
     if (!importText.trim()) return;
     const names = importText.split(/[,，]/).map(s => s.trim()).filter(Boolean);
     if (names.length === 0) return;

     const newParticipants = names.map((name, i) => ({
        id: `${Date.now()}-${i}`,
        name
     }));

     setParticipants(newParticipants);
     setHistory([]); // Reset history on bulk import to avoid inconsistencies
     setImportText("");
     setIsImportMode(false);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const executeDraw = (mode: GameMode) => {
    // Shared draw execution logic
    setActiveMode(mode);
    setIsSelectingMode(false);
    setIsSpinning(true);

    // Dynamic duration based on mode
    const duration = (mode === 'STREAM' ? 6000 : 2000) * durationMultiplier;

    setTimeout(() => {
      const pool = candidates.length > 0 ? candidates : participants;
      const candidateIdx = getCryptoRandomIndex(pool.length);
      const selected = pool[candidateIdx];
      const originalIndex = participants.findIndex(p => p.id === selected.id);
      
      const celebModes: CelebrationMode[] = ['FIREWORKS', 'CONFETTI', 'GOLD_RUSH'];
      const randomCeleb = celebModes[Math.floor(Math.random() * celebModes.length)];
      setCelebrationMode(randomCeleb);

      setIsSpinning(false);
      setWinnerIndex(originalIndex);

      setTimeout(() => {
        setWinnerName(selected.name);
        setWinnerAvatar(selected.avatar);
        
        // Update prize count if we are using prizes
        let prizeName: string | undefined = undefined;
        if (currentPrize) {
           prizeName = currentPrize.name;
           setPrizes(prev => prev.map(p => 
              p.id === currentPrize.id ? { ...p, remaining: p.remaining - 1 } : p
           ));
        }

        if (candidates.length > 0) {
          setHistory(prev => [
            { id: selected.id, name: selected.name, time: new Date().toLocaleTimeString(), prize: prizeName },
            ...prev
          ]);
        }
      }, 4500);
    }, duration);
  };

  const startDrawSequence = () => {
    if (candidates.length === 0 || isSpinning || isSelectingMode || isPrizeRolling) return;
    
    // Check if we have prizes but none are available
    // If Random Mode is active, we need to check if ANY prize is available
    const availablePrizes = prizes.filter(p => p.remaining > 0);
    if (prizes.length > 0) {
       if (isRandomMode) {
          if (availablePrizes.length === 0) {
             alert("所有奖项已抽完！");
             return;
          }
       } else {
          if (!currentPrize) {
             alert("所有奖项已抽完！");
             return;
          }
       }
    }
    
    setWinnerName(null);
    setWinnerAvatar(undefined);
    setWinnerIndex(null);

    if (isRandomMode && prizes.length > 0 && availablePrizes.length > 0) {
       setIsPrizeRolling(true);
       return;
    }
    
    continueDrawFlow();
  };

  const continueDrawFlow = () => {
     setIsImmersive(true);
     setIsSelectingMode(true);
  };

  const startDebugDraw = (mode: GameMode) => {
    if (isSpinning || isSelectingMode) return;
    if (candidates.length === 0) {
       alert("所有人都已中奖，请先重置名单");
       return;
    }
    if (prizes.length > 0 && !currentPrize) {
        alert("所有奖项已抽完！");
        return;
    }
    
    setIsImmersive(true);
    setWinnerName(null);
    setWinnerAvatar(undefined);
    setWinnerIndex(null);
    
    // Direct execution bypassing selector
    executeDraw(mode);
  };

  const handleModeSelected = (mode: GameMode) => {
    executeDraw(mode);
  };

  const handleModalClose = () => {
    setWinnerName(null);
    setIsImmersive(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col">
      <div className="fixed inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
             key={currentTheme.id}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 1 }}
             className="absolute inset-0"
          >
            <ImageWithFallback 
              src={currentTheme.bg}
              alt="tech bg"
              className="w-full h-full object-cover opacity-40 scale-105 blur-[2px]"
            />
          </motion.div>
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050505_100%)]" />
        <CelebrationCanvas isActive={!!winnerName} colors={currentTheme.particleColors} mode={celebrationMode} />
      </div>

      {showCardGame && <CardFlipGame onClose={() => setShowCardGame(false)} />}
      
      <PrizeRoulette 
          active={isPrizeRolling} 
          prizes={prizes} 
          onComplete={(prizeId) => {
             setIsPrizeRolling(false);
             setManualPrizeId(prizeId);
             continueDrawFlow();
          }}
        />

      <motion.header 
        animate={{ y: isImmersive ? -150 : 0, opacity: isImmersive ? 0 : 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-[210] p-6 md:p-10 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 flex items-center justify-center rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.6)]">
            <Zap className="text-black fill-black w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">赛博抽奖 <span className="text-cyan-400">BUG版</span></h1>
        </div>
        
          <div className="flex items-center gap-4 md:gap-8">
           {/* Mini Game Trigger */}
           <button 
              onClick={() => setShowCardGame(true)}
              className="text-gray-400 hover:text-white transition-colors"
              title="随机抽卡"
           >
              <Gamepad2 className="w-5 h-5" />
           </button>

           <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest text-gray-400 uppercase">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              系统在线
            </div>
            <div>缓冲: 1024ms</div>
            <div>种子: CRYPTO_SECURE</div>
          </div>
          
          <SpeedMenu value={durationMultiplier} onChange={setDurationMultiplier} />
          
          {/* Debug Menu */}
          <DebugMenu onSelectMode={startDebugDraw} />
        </div>
      </motion.header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row p-4 md:p-8 gap-0 md:gap-8 max-w-[1600px] mx-auto w-full transition-all duration-500 items-center justify-center">
        
        <AnimatePresence>
          {!isImmersive && (
            <motion.section 
              initial={{ width: 320, opacity: 1, x: 0 }}
              animate={{ width: 320, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: -50, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
              className="hidden lg:flex flex-col gap-4 overflow-hidden whitespace-nowrap"
            >
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col h-[600px] w-full min-w-[320px]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-mono text-cyan-400 tracking-tighter uppercase flex items-center gap-2">
                    <Users className="w-4 h-4" /> 参与名单
                  </h2>
                  <div className="flex items-center gap-3">
                    <button 
                       onClick={() => setIsImportMode(!isImportMode)}
                       className={`text-[10px] font-bold px-2 py-1 rounded transition-colors flex items-center gap-1 ${isImportMode ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'}`}
                       title="批量导入"
                    >
                       {isImportMode ? <X className="w-3 h-3" /> : <FileInput className="w-3 h-3" />}
                       {isImportMode ? "取消" : "导入"}
                    </button>
                    <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">{participants.length}</span>
                  </div>
                </div>

                {isImportMode ? (
                   <div className="flex-1 flex flex-col gap-4">
                      <div className="relative flex-1">
                          <textarea
                             value={importText}
                             onChange={(e) => setImportText(e.target.value)}
                             placeholder="请输入名单，使用逗号(,)或中文逗号(，)分隔。&#10;&#10;注意：导入操作将覆盖当前所有名单！"
                             className="w-full h-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-mono tracking-wider focus:outline-none focus:border-cyan-500 transition-colors resize-none placeholder:text-gray-600 leading-relaxed"
                          />
                      </div>
                      <div className="flex gap-2">
                          <button 
                             onClick={handleBulkImport}
                             className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                          >
                             <Save className="w-3 h-3" /> 覆盖并导入
                          </button>
                      </div>
                   </div>
                ) : (
                  <>
                    <form onSubmit={addParticipant} className="relative mb-4">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="添加姓名"
                        className="w-full bg-white/5 border-b border-white/20 px-0 py-3 text-sm font-mono tracking-wider focus:outline-none focus:border-cyan-500 transition-colors uppercase placeholder:text-gray-600"
                      />
                      <button type="submit" className="absolute right-0 top-3 text-cyan-500 hover:text-white transition-colors">
                        <Plus className="w-5 h-5" />
                      </button>
                    </form>

                    <button
                      onClick={loadFromFiles}
                      className="w-full mb-4 py-2 px-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-mono tracking-wider hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <FileInput className="w-4 h-4" />
                      从文件加载名单
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      <AnimatePresence mode="popLayout">
                        {participants.map((p) => {
                          const isWinner = history.some(h => h.id === p.id);
                          return (
                            <motion.div
                              key={p.id}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: isWinner ? 0.5 : 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className={`group flex items-center justify-between py-2 px-3 rounded-lg border border-transparent transition-all ${isWinner ? 'grayscale' : 'hover:bg-white/5 hover:border-white/5'}`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {p.avatar && (
                                  <img
                                    src={p.avatar}
                                    alt={p.name}
                                    className={`w-8 h-8 rounded-full object-cover flex-shrink-0 ${isWinner ? 'opacity-50' : ''}`}
                                  />
                                )}
                                <span className={`text-sm font-medium tracking-tight uppercase truncate ${isWinner ? 'text-gray-600 line-through' : 'text-gray-300 group-hover:text-white'}`}>
                                  {p.name}
                                </span>
                              </div>
                              <button onClick={() => removeParticipant(p.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <motion.section 
          layout
          className="flex flex-col gap-8 justify-center items-center relative transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ 
            flex: isImmersive ? '0 0 100%' : '1 1 0%',
            height: isImmersive ? '100vh' : 'auto',
            width: isImmersive ? '100vw' : 'auto',
          }}
        >
          <motion.div 
            layout
            className={`
              relative w-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center
              ${isImmersive ? 'max-w-[95vw] h-[85vh] scale-100' : 'max-w-3xl min-h-[464px]'}
            `}
          >
            <div className={`absolute -inset-4 bg-cyan-500/5 rounded-[40px] blur-2xl transition-opacity ${isImmersive ? 'opacity-50' : 'opacity-100'}`} />
            <div className={`
                relative bg-black/40 backdrop-blur-3xl border border-white/5 shadow-2xl overflow-hidden flex items-center justify-center w-full h-full transition-all duration-1000
                ${isImmersive ? 'rounded-none border-0 bg-transparent shadow-none' : 'rounded-[40px] p-8'}
            `}>
              
              <div className={`
                w-full h-full flex flex-col transition-all duration-1000 
                ${activeMode === 'GRID' ? 'items-stretch justify-start' : 'items-center justify-center'}
                ${isImmersive && activeMode !== 'GRID' ? 'scale-125' : 'scale-100'}
              `}>
                {isSelectingMode ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <ModeSelector onComplete={handleModeSelected} />
                  </div>
                ) : (
                  <>
                    {activeMode === 'DRUM' && <ThreeDRollingDrum participants={participants} isSpinning={isSpinning} winnerIndex={winnerIndex} />}
                    {activeMode === 'GRID' && <CyberGrid participants={participants} isSpinning={isSpinning} winnerIndex={winnerIndex} />}
                    {activeMode === 'STREAM' && <NeonStream participants={participants} isSpinning={isSpinning} winnerIndex={winnerIndex} />}
                    {activeMode === 'WHEEL' && <LuckyWheel participants={participants} isSpinning={isSpinning} winnerIndex={winnerIndex} />}
                  </>
                )}
              </div>

            </div>
            
            {!isImmersive && (
              <>
                <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50" />
              </>
            )}
          </motion.div>

          <div className={`flex flex-col items-center gap-6 transition-all duration-500 ${isImmersive ? 'absolute bottom-10 z-50' : ''}`}>
            {!isImmersive && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startDrawSequence}
                disabled={isSpinning || isSelectingMode || candidates.length === 0}
                className={`
                  group relative px-20 py-8 rounded-full overflow-hidden transition-all duration-500
                  ${(isSpinning || isSelectingMode || candidates.length === 0) 
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700" 
                    : "bg-white text-black shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(6,182,212,0.4)]"}
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center gap-4">
                  <Play className={`w-10 h-10 ${isSpinning || isSelectingMode ? "animate-spin" : ""}`} />
                  <span className="text-3xl font-black uppercase tracking-tighter">
                    {isSelectingMode ? "匹配中..." : isSpinning ? "抽奖中..." : candidates.length === 0 ? "名单已抽完" : !currentPrize && prizes.length > 0 ? "奖品已抽完" : currentPrize ? `抽取：${currentPrize.name}` : "开始抽奖"}
                  </span>
                </div>
              </motion.button>
            )}

            {isImmersive && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-cyan-400 font-mono tracking-widest animate-pulse bg-black/50 px-4 py-2 rounded-full backdrop-blur"
               >
                 {isSelectingMode ? "正在随机匹配游戏场景..." : "高精度随机运算进行中..."}
               </motion.div>
            )}
            
            <p className={`text-[10px] font-mono tracking-[0.3em] text-gray-500 uppercase ${isImmersive ? 'hidden' : ''}`}>
              {candidates.length === 0 ? "请重置或添加新人员" : "Crypto API 真随机算法已启用"}
            </p>
          </div>
        </motion.section>

        <AnimatePresence>
          {!isImmersive && (
            <motion.section 
              initial={{ width: 320, opacity: 1, x: 0 }}
              animate={{ width: 320, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 50, transition: { duration: 0.5, ease: "easeInOut" } }}
              className="hidden lg:flex flex-col gap-4 overflow-hidden whitespace-nowrap"
            >
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col h-[600px] w-full min-w-[320px]">
                 <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                  <div className="flex gap-4">
                    <button 
                       onClick={() => setShowPrizeSettings(false)}
                       className={`text-sm font-mono tracking-tighter uppercase flex items-center gap-2 transition-colors ${!showPrizeSettings ? "text-purple-400 font-bold" : "text-gray-600 hover:text-gray-400"}`}
                    >
                      <Sparkles className="w-4 h-4" /> 记录
                    </button>
                    <button 
                       onClick={() => setShowPrizeSettings(true)}
                       className={`text-sm font-mono tracking-tighter uppercase flex items-center gap-2 transition-colors ${showPrizeSettings ? "text-purple-400 font-bold" : "text-gray-600 hover:text-gray-400"}`}
                    >
                      <Settings className="w-4 h-4" /> 奖品
                    </button>
                  </div>

                  {!showPrizeSettings && (
                    <button 
                      onClick={() => setHistory([])}
                      className="text-[10px] text-gray-500 hover:text-white uppercase transition-colors"
                    >
                      重置
                    </button>
                  )}
                </div>

                {showPrizeSettings ? (
                   <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                      <div className="mb-4 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                         <h4 className="text-xs text-purple-300 font-bold mb-1">抽奖顺序说明</h4>
                         <p className="text-[10px] text-purple-400/70">
                           {isRandomMode ? "随机抽奖模式已启用，点击开始后将随机决定奖品" : "系统将自动按照 级别数值从大到小 (Level 3 至 Level 1) 的顺序抽取奖品。"}
                         </p>
                         <label className="flex items-center gap-2 mt-2 cursor-pointer group">
                             <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors ${isRandomMode ? 'bg-purple-500 border-purple-500' : 'border-purple-500/50 group-hover:border-purple-400'}`}>
                                 {isRandomMode && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                             </div>
                             <input 
                                type="checkbox" 
                                className="hidden"
                                checked={isRandomMode}
                                onChange={(e) => setIsRandomMode(e.target.checked)}
                             />
                             <span className={`text-[10px] font-bold ${isRandomMode ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>启用随机奖品模式</span>
                         </label>
                      </div>

                      {prizes.sort((a,b) => a.level - b.level).map((prize) => (
                        <div key={prize.id} className={`bg-white/5 border rounded-xl p-3 flex flex-col gap-2 transition-colors ${currentPrize?.id === prize.id ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-white/5'}`}>
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-mono text-gray-500">LEVEL {prize.level}</span>
                              <div className="flex items-center gap-2">
                                {currentPrize?.id !== prize.id && prize.remaining > 0 && (
                                  <button 
                                    onClick={() => setManualPrizeId(prize.id)}
                                    className="text-[10px] bg-white/10 hover:bg-cyan-500 hover:text-black px-2 py-0.5 rounded transition-colors text-cyan-400"
                                  >
                                    设为当前
                                  </button>
                                )}
                                <button 
                                  onClick={() => setPrizes(prizes.filter(p => p.id !== prize.id))}
                                  className="text-gray-600 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={prize.name}
                                onChange={(e) => setPrizes(prizes.map(p => p.id === prize.id ? { ...p, name: e.target.value } : p))}
                                className="bg-black/20 rounded px-2 py-1 text-sm text-white w-full border border-white/10 focus:border-cyan-500 outline-none transition-colors"
                              />
                              <div className="flex items-center gap-1 bg-black/20 rounded px-2 border border-white/10">
                                 <span className="text-[10px] text-gray-500">数量</span>
                                 <input 
                                    type="number" 
                                    value={prize.count}
                                    onChange={(e) => {
                                       const count = parseInt(e.target.value) || 0;
                                       setPrizes(prizes.map(p => p.id === prize.id ? { ...p, count: count, remaining: count } : p))
                                    }}
                                    className="bg-transparent w-10 text-right text-sm outline-none"
                                 />
                              </div>
                           </div>
                           <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1">
                              <span>剩余: {prize.remaining}</span>
                              {currentPrize?.id === prize.id && (
                                <div className="flex items-center gap-1 text-cyan-400 font-bold animate-pulse">
                                  <Zap className="w-3 h-3" />
                                  <span>当前抽取</span>
                                </div>
                              )}
                           </div>
                        </div>
                      ))}
                      
                      <button 
                        onClick={() => {
                           const newLevel = prizes.length > 0 ? Math.max(...prizes.map(p => p.level)) + 1 : 1;
                           setPrizes([...prizes, { 
                              id: Date.now().toString(), 
                              name: `${newLevel}等奖`, 
                              count: 1, 
                              remaining: 1, 
                              level: newLevel 
                           }])
                        }}
                        className="w-full py-2 border border-dashed border-white/20 rounded-xl text-xs text-gray-500 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2"
                      >
                         <Plus className="w-3 h-3" /> 添加新奖项级别
                      </button>
                   </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                      {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                          <Trophy className="w-12 h-12 mb-4" />
                          <span className="text-xs uppercase tracking-widest">暂无记录</span>
                        </div>
                      ) : (
                        history.map((h, i) => (
                          <motion.div
                            key={h.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`
                              p-4 rounded-2xl border flex flex-col gap-1 transition-all
                              ${i === 0 ? "bg-cyan-500/10 border-cyan-500/30" : "bg-white/5 border-white/5"}
                            `}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                <span className={`font-black uppercase tracking-tight text-xl ${i === 0 ? "text-cyan-400" : "text-white"}`}>
                                  {h.name}
                                </span>
                                {h.prize && (
                                   <span className="text-xs font-bold text-yellow-500 mt-0.5">{h.prize}</span>
                                )}
                              </div>
                              {i === 0 && <Sparkles className="w-4 h-4 text-cyan-400" />}
                            </div>
                            <span className="text-[10px] font-mono text-gray-500">{h.time}</span>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <motion.footer 
        animate={{ y: isImmersive ? 100 : 0, opacity: isImmersive ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 p-4 border-t border-white/5 bg-black/50 backdrop-blur-md flex justify-between items-center text-[10px] font-mono text-gray-600 uppercase tracking-widest"
      >
        <div>版本: 2026.02.06_RELEASE</div>
        <div className="flex gap-6">
          <span className="text-cyan-900">安全: AES-256</span>
          <span className="text-purple-900">熵值: High</span>
        </div>
      </motion.footer>

      <AnimatePresence>
        {winnerName && (
           <WinnerModal
              winner={winnerName}
              prize={history[0]?.prize}
              onClose={handleModalClose}
              particleColors={currentTheme.particleColors}
              celebrationMode={celebrationMode}
              avatar={winnerAvatar}
           />
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.5); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .clip-arrow { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); transform: rotate(180deg); }
      `}} />
    </div>
  );
}
