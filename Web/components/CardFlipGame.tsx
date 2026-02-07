import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Shuffle, RotateCcw, Trophy, Gamepad2, Settings, Play, Eye } from 'lucide-react';
import { adjustBrightness } from './utils/color';

const BACKGROUND_IMAGES = [
    "https://images.unsplash.com/photo-1762278804729-13d330fad71a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBiYWNrZ3JvdW5kJTIwZGFyayUyMG5lb258ZW58MXx8fHwxNzcwMzY0MzM0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1730725419324-556f79e6d188?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwZ3JpZCUyMGxhbmRzY2FwZSUyMDgwcyUyMHJldHJvJTIwZnV0dXJpc3RpY3xlbnwxfHx8fDE3NzAzNjQzMzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1761078739233-629de9252840?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwY2lyY3VpdCUyMGJvYXJkJTIwbmVvbiUyMGxpbmVzJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NzAzNjQzMzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1645486618391-5283cfaa01e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwc21va2UlMjBuZW9uJTIwZGFyayUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzcwMzY0MzM0fDA&ixlib=rb-4.1.0&q=80&w=1080"
];

interface CardConfig {
    id: string;
    value: string;
    count: number;
    color?: string;
}

interface Card {
    id: string;
    value: string;
    isFlipped: boolean;
    isMatched: boolean;
    color?: string;
}

interface CardFlipGameProps {
    onClose: () => void;
}

export const CardFlipGame = ({ onClose }: CardFlipGameProps) => {
    const [gameState, setGameState] = useState<'SETUP' | 'IDLE' | 'SHUFFLING' | 'PLAYING' | 'REVEALED'>('SETUP');
    const [configs, setConfigs] = useState<CardConfig[]>([
        { id: '1', value: '谢谢参与', count: 10, color: '#64748b' }, // Gray/Slate - Low
        { id: '2', value: '幸运奖', count: 10, color: '#0ea5e9' },   // Sky Blue - Low-Mid
        { id: '3', value: '三等奖', count: 5, color: '#6366f1' },    // Indigo - Mid
        { id: '4', value: '二等奖', count: 3, color: '#a855f7' },    // Purple - High
        { id: '5', value: '一等奖', count: 1, color: '#be123c' },    // Rose Red - Highest
    ]);
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [currentBgImage, setCurrentBgImage] = useState<string>(BACKGROUND_IMAGES[0]);

    // Celebration Canvas logic inline for simplicity
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (gameState !== 'REVEALED') return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: any[] = [];
        const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#fbbf24'];

        for(let i=0; i<100; i++) {
            particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 5 + 2
            });
        }

        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravity
                p.life -= 0.01;
                p.vx *= 0.95;
                p.vy *= 0.95;

                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                if(p.life <= 0) particles.splice(i, 1);
            });

            if(particles.length > 0) {
                animationId = requestAnimationFrame(animate);
            }
        };

        animate();

        return () => cancelAnimationFrame(animationId);
    }, [gameState]);


    const addConfig = () => {
        setConfigs([...configs, { id: Date.now().toString(), value: '', count: 10, color: '#6366f1' }]);
    };

    const removeConfig = (id: string) => {
        setConfigs(configs.filter(c => c.id !== id));
    };

    const updateConfig = (id: string, field: keyof CardConfig, value: string | number) => {
        setConfigs(configs.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const startGame = () => {
        // Generate deck
        const newCards: Card[] = [];
        configs.forEach(config => {
            for (let i = 0; i < config.count; i++) {
                newCards.push({
                    id: `${config.id}-${i}`,
                    value: config.value,
                    isFlipped: false,
                    isMatched: false,
                    color: config.color
                });
            }
        });

        // Simple Fisher-Yates shuffle for data
        for (let i = newCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
        }

        setCards(newCards);
        setGameState('IDLE');
        setSelectedCardId(null);
    };

    const handleShuffle = () => {
        if (gameState === 'SHUFFLING' || gameState === 'SETUP') return;
        setGameState('SHUFFLING');
        setSelectedCardId(null);
        
        setTimeout(() => {
             setCards(prev => {
                const newCards = [...prev];
                // Identify fixed indices (flipped cards)
                const fixedIndices = new Set();
                const itemsToShuffle: Card[] = [];
                
                newCards.forEach((card, index) => {
                    if (card.isFlipped) {
                        fixedIndices.add(index);
                    } else {
                        itemsToShuffle.push(card);
                    }
                });
                
                // Shuffle items (Fisher-Yates)
                for (let i = itemsToShuffle.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [itemsToShuffle[i], itemsToShuffle[j]] = [itemsToShuffle[j], itemsToShuffle[i]];
                }
                
                // Reconstruct array preserving fixed positions
                let shufflePointer = 0;
                return newCards.map((originalCard, index) => {
                    if (fixedIndices.has(index)) return originalCard;
                    return itemsToShuffle[shufflePointer++];
                });
             });
            setGameState('PLAYING');
        }, 1500);
    };

    const handleRestart = () => {
        setCards(cards.map(c => ({...c, isFlipped: false})));
        setGameState('IDLE');
        setSelectedCardId(null);
    };

    const handleVerify = () => {
        if (gameState === 'SETUP' || gameState === 'SHUFFLING') return;
        
        // 1. Flip all cards to reveal them
        setCards(prev => prev.map(c => ({ ...c, isFlipped: true })));
        
        // 2. Wait for 2.5 seconds for verification
        setTimeout(() => {
            // 3. Flip them all back down
            setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
            
            // 4. Trigger shuffle after they've flipped back
            setTimeout(() => {
                handleShuffle();
            }, 600);
        }, 2500);
    };

    const handleCardClick = (cardId: string) => {
        if (gameState === 'SHUFFLING') return;
        
        const targetCard = cards.find(c => c.id === cardId);
        if (!targetCard || targetCard.isFlipped) return;

        // Change background randomly
        const nextBgIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
        setCurrentBgImage(BACKGROUND_IMAGES[nextBgIndex]);

        setSelectedCardId(cardId);
        setCards(cards.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));
        setGameState('PLAYING');
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl">
            {/* Header - Fixed to top, high contrast */}
            <div className="absolute top-0 left-0 right-0 h-20 md:h-24 px-4 md:px-10 flex items-center justify-between z-[120] bg-[#08080a] border-b border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
                <div className="flex items-center gap-6 md:gap-12">
                    {/* Title Section */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                            <Gamepad2 className="text-white w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase italic hidden sm:block">幸运翻牌</h2>
                        <h2 className="text-lg font-black text-white tracking-widest uppercase italic sm:hidden">翻牌</h2>
                    </div>

                    {/* Control Buttons Group - Directly next to title */}
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                        <motion.button 
                            whileHover={gameState !== 'SETUP' ? { scale: 1.05 } : {}}
                            whileTap={gameState !== 'SETUP' ? { scale: 0.95 } : {}}
                            onClick={handleShuffle}
                            disabled={gameState === 'SETUP' || gameState === 'SHUFFLING'}
                            className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all ${
                                (gameState === 'SETUP' || gameState === 'SHUFFLING') 
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-40' 
                                : 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:bg-cyan-400'
                            }`}
                        >
                            <Shuffle className={`w-3.5 h-3.5 ${gameState === 'SHUFFLING' ? 'animate-spin' : ''}`} /> 
                            <span className="hidden xs:inline">随机洗牌</span>
                        </motion.button>
                        
                        <button 
                            onClick={handleVerify}
                            disabled={gameState === 'SETUP' || gameState === 'SHUFFLING'}
                            className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all ${
                                (gameState === 'SETUP' || gameState === 'SHUFFLING')
                                ? 'bg-transparent text-gray-700 cursor-not-allowed opacity-20'
                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            }`}
                        >
                            <Eye className="w-3.5 h-3.5" /> 
                            <span className="hidden xs:inline">我要验牌</span>
                        </button>

                        <button 
                            onClick={() => setGameState('SETUP')}
                            className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all ${
                                gameState === 'SETUP' 
                                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            <Settings className="w-3.5 h-3.5" /> 
                            <span className="hidden xs:inline">重新配置</span>
                        </button>

                        <button 
                            onClick={handleRestart}
                            disabled={gameState === 'SETUP'}
                            className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all ${
                                gameState === 'SETUP' 
                                ? 'opacity-20 cursor-not-allowed' 
                                : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> 
                            <span className="hidden xs:inline">重新开始</span>
                        </button>
                    </div>
                </div>

                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Confetti Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30" />

            {/* Main Content */}
            <motion.div 
                className="relative z-40 w-full max-w-[95vw] h-[90vh] p-6 pt-32 md:pt-24 flex flex-col items-center rounded-3xl overflow-y-auto custom-scrollbar transition-all"
            >
                {/* Dynamic Background Image Layer */}
                <motion.div 
                    className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700"
                    style={{ 
                        backgroundImage: `url(${currentBgImage})`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: selectedCardId ? 0.4 : 0 }} 
                />
                
                {/* Gradient Overlay for better text readability */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
                
                <div className="relative z-10 w-full flex flex-col items-center">
                
                {gameState === 'SETUP' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                            <h3 className="text-lg font-mono text-purple-400 uppercase tracking-widest">卡池配置系统</h3>
                            <button 
                                onClick={addConfig}
                                className="flex items-center gap-2 text-xs bg-purple-500/20 hover:bg-purple-500 hover:text-white text-purple-300 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Plus className="w-3 h-3" /> 添加奖项
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                            {configs.map((config) => (
                                <div key={config.id} className="flex gap-4 items-center group">
                                    <div className="flex-1 flex gap-2">
                                        <input 
                                            type="text" 
                                            value={config.value}
                                            onChange={(e) => updateConfig(config.id, 'value', e.target.value)}
                                            placeholder="奖品/内容 (例如: 特等奖)"
                                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 outline-none text-white transition-all"
                                        />
                                        <div className="relative group w-12 rounded-lg border border-white/10 overflow-hidden cursor-pointer" title="卡片背景色">
                                            <input 
                                                type="color" 
                                                value={config.color || '#8b5cf6'}
                                                onChange={(e) => updateConfig(config.id, 'color', e.target.value)}
                                                className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 m-0 cursor-pointer opacity-0"
                                            />
                                            <div 
                                                className="w-full h-full"
                                                style={{ background: config.color || '#8b5cf6' }}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-3">
                                        <span className="text-[10px] text-gray-500 uppercase font-bold">数量</span>
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={config.count}
                                            onChange={(e) => updateConfig(config.id, 'count', parseInt(e.target.value) || 0)}
                                            className="w-12 bg-transparent text-center text-sm focus:outline-none text-white font-mono"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removeConfig(config.id)}
                                        className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <button 
                                onClick={startGame}
                                className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-16 py-4 rounded-xl font-black text-xl tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(168,85,247,0.4)]"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    <Play className="w-6 h-6 fill-current" />
                                    初始化命运卡池
                                </span>
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {(gameState !== 'SETUP') && (
                    <div className="flex flex-col items-center gap-8 w-full pb-12">
                         
                        {/* Cards Grid */}
                        <div className="flex flex-wrap justify-center gap-4 max-w-[95vw] px-4">
                            <AnimatePresence>
                                {cards.map((card, index) => {
                                    const randomX = (index % 5 - 2) * 50; 
                                    const randomY = (Math.floor(index / 5) - 2) * 50;
                                    const randomRotate = (index % 3 - 1) * 20;
                                    
                                    return (
                                        <motion.div
                                            key={card.id}
                                            layout
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ 
                                                scale: gameState === 'SHUFFLING' && !card.isFlipped ? [1, 1.1, 0.9, 1] : 1, 
                                                opacity: 1,
                                                rotateY: card.isFlipped ? 180 : 0,
                                                x: gameState === 'SHUFFLING' && !card.isFlipped ? [0, randomX, -randomX, 0] : 0,
                                                y: gameState === 'SHUFFLING' && !card.isFlipped ? [0, randomY, -randomY, 0] : 0,
                                                rotate: gameState === 'SHUFFLING' && !card.isFlipped ? [0, randomRotate, -randomRotate, 0] : 0,
                                                zIndex: card.isFlipped ? 10 : (gameState === 'SHUFFLING' ? 20 : 1)
                                            }}
                                            transition={{ 
                                                type: "spring", 
                                                stiffness: 260, 
                                                damping: 20,
                                                layout: { duration: 0.5 },
                                                x: { duration: 1.2, ease: "easeInOut" },
                                                y: { duration: 1.2, ease: "easeInOut" },
                                                rotate: { duration: 1.2, ease: "easeInOut" }
                                            }}
                                            onClick={() => handleCardClick(card.id)}
                                            className={`
                                                relative w-28 h-40 md:w-32 md:h-48 preserve-3d perspective-1000
                                                ${(gameState !== 'SHUFFLING' && !card.isFlipped) ? 'cursor-pointer hover:-translate-y-2' : ''}
                                            `}
                                            style={{ transformStyle: 'preserve-3d' }}
                                        >
                                            {/* Back of Card */}
                                            <div className="absolute inset-0 w-full h-full backface-hidden">
                                                 <div className={`
                                                    w-full h-full rounded-xl border-2 border-purple-500/30 bg-[#0c0c10]
                                                    flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all duration-300
                                                    ${!card.isFlipped && gameState !== 'SHUFFLING' ? 'hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]' : ''}
                                                 `}>
                                                     <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center opacity-20">
                                                        <Gamepad2 className="w-8 h-8 text-purple-500" />
                                                     </div>
                                                     <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(168,85,247,0.1)_50%,transparent_55%)] bg-[length:200%_200%] opacity-20" />
                                                 </div>
                                            </div>

                                            {/* Front of Card */}
                                            <div 
                                                className="absolute inset-0 w-full h-full backface-hidden rounded-xl flex items-center justify-center p-4 text-center border-2 border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-colors duration-500"
                                                style={{ 
                                                    transform: 'rotateY(180deg)',
                                                    background: card.color ? `linear-gradient(135deg, ${card.color}, ${adjustBrightness(card.color, -30)})` : 'linear-gradient(135deg, #7c3aed, #2563eb)'
                                                }}
                                            >
                                                <span className="text-white font-black text-base md:text-lg leading-tight break-words drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                                    {card.value}
                                                </span>
                                                <div className="absolute top-2 right-2">
                                                    <Trophy className="w-4 h-4 text-yellow-300/80" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                        
                        {gameState === 'SHUFFLING' && (
                            <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
                                <div className="bg-black/40 backdrop-blur-md px-10 py-5 rounded-full border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                                    <div className="text-cyan-400 font-mono tracking-[0.3em] animate-pulse text-2xl font-black uppercase">
                                        Shuffling Matrix...
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {(gameState === 'PLAYING' || gameState === 'IDLE') && !selectedCardId && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-white/40 font-mono tracking-widest text-[10px] md:text-xs uppercase"
                            >
                                [ 准备就绪，请翻开您的命运卡片 ]
                            </motion.div>
                        )}
                        
                        {selectedCardId && (
                            <div className="text-white/60 font-mono tracking-widest text-sm flex flex-col items-center gap-2">
                                <motion.div 
                                    key={selectedCardId}
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col items-center"
                                >
                                    <div className="text-purple-400 text-[10px] uppercase tracking-[0.3em] mb-1 font-bold">Latest Result</div>
                                    <div className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] italic uppercase">
                                        {cards.find(c => c.id === selectedCardId)?.value}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </div>
                )}

                </div>
            </motion.div>
        </div>
    );
};
