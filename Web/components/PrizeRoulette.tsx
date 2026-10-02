import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import type { Prize } from "../App";

interface PrizeRouletteProps {
    active: boolean;
    prizes: Prize[];
    onComplete: (prizeId: string) => void;
}

export const PrizeRoulette = ({ active, prizes, onComplete }: PrizeRouletteProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [finalPrizeId, setFinalPrizeId] = useState<string | null>(null);

    // Filter available prizes
    const availablePrizes = prizes.filter(p => p.remaining > 0);

    useEffect(() => {
        if (!active || availablePrizes.length === 0) return;

        let intervalId: NodeJS.Timeout;
        let counter = 0;
        const totalSpins = 20; // How many ticks before stopping
        const baseSpeed = 50;

        // Reset
        setFinalPrizeId(null);
        setCurrentIndex(0);

        const spin = () => {
             counter++;
             setCurrentIndex(prev => (prev + 1) % availablePrizes.length);

             if (counter > totalSpins) {
                 // Stop
                 const randomIdx = Math.floor(Math.random() * availablePrizes.length);
                 setCurrentIndex(randomIdx);
                 setFinalPrizeId(availablePrizes[randomIdx].id);
                 
                 setTimeout(() => {
                     onComplete(availablePrizes[randomIdx].id);
                 }, 5000); // Show result for 5s
             } else {
                 // Slow down
                 const factor = counter / totalSpins;
                 const delay = baseSpeed + (factor * factor * 200);
                 intervalId = setTimeout(spin, delay);
             }
        };

        spin();

        return () => clearTimeout(intervalId);
    }, [active, availablePrizes.length]); // Dependencies simplified to avoid re-triggering mid-spin

    if (!active) return null;

    if (availablePrizes.length === 0) return null;

    const currentPrize = availablePrizes[currentIndex];

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
             <div className="text-center relative z-10">
                 <h2 className="text-xl font-mono text-cyan-500 tracking-[0.5em] uppercase mb-8 animate-pulse">
                    正在抽取奖项
                 </h2>
                 <motion.div
                    key={currentPrize.id} // Re-render animation on change
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                 >
                    {currentPrize.name}
                 </motion.div>
                 
                 {finalPrizeId && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8 text-purple-400 font-bold text-lg"
                     >
                        即将开始抽取幸运得主...
                     </motion.div>
                 )}
             </div>
             
             {/* Background Effects */}
             <div className="absolute inset-0 z-0 pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
             </div>
        </div>
    );
};
