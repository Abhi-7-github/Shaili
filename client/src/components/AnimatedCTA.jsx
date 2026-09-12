import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const AnimatedCTA = ({
  onClick,
  text = "EXPLORE YOUR STYLE →",
  subtitle = "Click to unlock your intelligent closet",
  showShine = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="inline-block relative z-30">
        <motion.button
          type="button"
          onClick={onClick}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="group relative px-7 py-3.5 rounded-xl font-mono text-xs sm:text-sm tracking-widest uppercase font-semibold text-[#F5DABF] bg-[#6C151E] hover:bg-[#541017] border border-[#F5DABF]/40 shadow-xl flex items-center gap-3.5 cursor-pointer transition-colors duration-200 overflow-hidden"
        >
          {/* Single Luxury Shine Sweep across button */}
          {showShine && (
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '220%', opacity: [0, 0.45, 0] }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 pointer-events-none rounded-xl"
            />
          )}

          <span className="relative z-10 font-semibold tracking-widest text-[#F5DABF]">
            {text}
          </span>

          {/* Arrow Container with 5px hover translation */}
          <div className="relative z-10 w-7 h-7 rounded-lg bg-[#F5DABF]/20 flex items-center justify-center text-[#F5DABF] transition-transform duration-200 ease-out group-hover:translate-x-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#F5DABF]" />
          </div>
        </motion.button>
      </div>

      {/* Supporting Subtext if passed */}
      {subtitle && (
        <p className="mt-3 text-center text-xs font-mono tracking-wide text-[#6C151E] font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default AnimatedCTA;
