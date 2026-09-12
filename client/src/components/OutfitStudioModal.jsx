import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, RefreshCw, CheckCircle2, ShieldCheck, Sun, Layers, Heart } from 'lucide-react';
import { SAMPLE_OUTFITS } from '../types';

export const OutfitStudioModal = ({ isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const outfit = SAMPLE_OUTFITS[currentIndex];

  const handleNextOutfit = () => {
    setGenerating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % SAMPLE_OUTFITS.length);
      setGenerating(false);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1C1A18]/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative z-10 w-full max-w-3xl glass-cream rounded-[2.5rem] p-6 sm:p-8 bg-[#F7EFE7] border border-[#6C151E]/30 shadow-2xl overflow-hidden text-[#1C1A18]"
        >
          {/* Top Header Row */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#6C151E]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6C151E] text-[#F5DABF] flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-[#F5DABF]" />
              </div>
              <div>
                <h2 className="font-editorial text-2xl font-bold text-[#1C1A18]">Outfit Studio AI</h2>
                <p className="text-xs font-mono text-[#5C544D]">Live Wardrobe Intelligence Engine</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#6C151E]/10 text-[#1C1A18] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Column: Visual Card Preview */}
            <div className="md:col-span-5 flex flex-col items-center bg-[#F5DABF] p-6 rounded-3xl border border-[#6C151E]/20 shadow-xs relative">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F3D3A] text-[#F5DABF] text-[10px] font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{outfit.matchScore}% Match</span>
              </div>

              {/* Garment Card Graphic */}
              <div className="my-6 relative w-36 h-44 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#0F3D3A] rounded-2xl transform -rotate-6 border border-[#F5DABF]/20 opacity-80" />
                <div className="absolute inset-0 bg-[#D8C5B5] rounded-2xl transform rotate-3 border border-[#6C151E]/20 opacity-80" />
                <div className="relative z-10 w-full h-full bg-[#6C151E] text-[#F5DABF] rounded-2xl p-4 flex flex-col justify-between shadow-lg border border-[#F5DABF]/30">
                  <div className="flex justify-between items-start">
                    <Layers className="w-5 h-5 text-[#F5DABF]" />
                    <span className="text-[9px] font-mono text-[#F5DABF] uppercase">{outfit.category}</span>
                  </div>
                  <div>
                    <p className="text-xs font-editorial font-bold text-white leading-tight">{outfit.title}</p>
                    <p className="text-[10px] text-[#F5DABF]/70 mt-1 font-sans">{outfit.items.length} garments synced</p>
                  </div>
                </div>
              </div>

              {/* Color Harmony Palette */}
              <div className="w-full flex items-center justify-between pt-3 border-t border-[#6C151E]/15">
                <span className="text-[10px] font-mono font-semibold uppercase text-[#5C544D]">Color Harmony</span>
                <div className="flex items-center gap-1.5">
                  {outfit.palette.map((color, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Garment List & AI Rationale */}
            <div className="md:col-span-7 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#6C151E] font-bold uppercase mb-1">
                  <Sun className="w-3.5 h-3.5" />
                  <span>{outfit.weatherSync}</span>
                </div>
                <h3 className="font-editorial text-3xl font-bold text-[#1C1A18] mb-3">{outfit.title}</h3>

                <p className="text-xs font-sans text-[#5C544D] mb-4 leading-relaxed">
                  Formulated by Shaili AI based on your preference for sleek Indian contemporary editorial aesthetics and autumn weather.
                </p>

                {/* Garments Breakdown */}
                <div className="space-y-2 mb-6">
                  <span className="text-[11px] font-mono font-bold uppercase text-[#6C151E]">Selected Wardrobe Items:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {outfit.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-[#6C151E]/15 text-xs text-[#1C1A18] font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6C151E] shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#6C151E]/15 flex items-center justify-between gap-3">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3 rounded-full border transition-all cursor-pointer ${
                    isLiked ? 'bg-[#6C151E] text-[#F5DABF] border-[#6C151E]' : 'bg-white text-[#5C544D] border-[#6C151E]/20 hover:text-[#6C151E]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNextOutfit}
                  disabled={generating}
                  className="flex-1 py-3 px-6 rounded-full bg-[#6C151E] text-[#F5DABF] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#F5DABF]/40 shadow-md cursor-pointer hover:bg-[#541017]"
                >
                  <RefreshCw className={`w-4 h-4 text-[#F5DABF] ${generating ? 'animate-spin' : ''}`} />
                  <span>{generating ? 'Re-analyzing Closet...' : 'Generate Alternative Outfit'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
