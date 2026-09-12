import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoadingState = ({ message = 'Styling your wardrobe...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[300px] bg-[#FAF4ED] rounded-3xl border border-[#F5DABF]/60">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-full bg-[#0F3D3A] text-[#FAF4ED] flex items-center justify-center mb-4 shadow-md border border-[#F5DABF]"
      >
        <Sparkles className="w-8 h-8 animate-pulse text-[#F5DABF]" />
      </motion.div>
      <h3 className="font-serif text-2xl font-bold text-[#0A2E2C] tracking-tight">
        {message}
      </h3>
      <p className="text-xs text-[#6C151E] mt-2 font-mono uppercase tracking-widest flex items-center gap-1.5 font-bold">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ShAili AI engine active
      </p>
    </div>
  );
};

export default LoadingState;
