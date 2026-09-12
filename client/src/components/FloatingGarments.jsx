import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Sun, Shirt, RotateCw, CheckCircle2, Flame, Award } from 'lucide-react';

export const FloatingGarments = ({ mouseX = 0, mouseY = 0 }) => {
  const shouldReduceMotion = useReducedMotion();

  // Floating variant for natural movement
  const floatAnimation = (duration = 6, delay = 0, yDistance = 12) => {
    if (shouldReduceMotion) return {};
    return {
      animate: {
        y: [-yDistance / 2, yDistance / 2, -yDistance / 2],
        rotate: [-1.5, 1.5, -1.5],
        transition: {
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay
        }
      }
    };
  };

  const parallaxX = mouseX * 20;
  const parallaxY = mouseY * 20;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* Dynamic Parallax Container */}
      <motion.div
        className="w-full h-full relative"
        animate={{
          x: shouldReduceMotion ? 0 : parallaxX,
          y: shouldReduceMotion ? 0 : parallaxY
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        {/* Subtle Background Organic Fabric Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-radial from-[#C5A059]/10 via-[#EBE5DB]/30 to-transparent blur-3xl rounded-full opacity-60 pointer-events-none" />

        {/* --- Top Left Floating Micro-Card: "12 Outfits Created" --- */}
        <motion.div
          {...floatAnimation(7, 0, 14)}
          className="absolute top-[16%] left-[6%] sm:left-[10%] lg:left-[12%] pointer-events-auto"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            className="glass-card px-4 py-3 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.04)] border border-[#C5A059]/25 flex items-center gap-3 bg-white/75 backdrop-blur-md"
          >
            <div className="w-9 h-9 rounded-full bg-[#121212] text-[#FAF8F5] flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#121212] font-sans tracking-wide">12 outfits created</p>
              <p className="text-[10px] text-[#8C8A84] font-sans">Automated AI Pairing</p>
            </div>
          </motion.div>
        </motion.div>

        {/* --- Top Right Floating Micro-Card: "Weather: 24°C" --- */}
        <motion.div
          {...floatAnimation(8, 1, 16)}
          className="absolute top-[22%] right-[6%] sm:right-[10%] lg:right-[12%] pointer-events-auto"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            className="glass-card px-4 py-3 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.04)] border border-[#C5A059]/25 flex items-center gap-3 bg-white/75 backdrop-blur-md"
          >
            <div className="w-9 h-9 rounded-full bg-[#FAF8F5] text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center">
              <Sun className="w-4 h-4 text-[#C5A059]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#121212] font-sans tracking-wide">Weather: 24°C</p>
              <p className="text-[10px] text-[#5C5B57] font-sans">Ideal for Lightweight Linen</p>
            </div>
          </motion.div>
        </motion.div>

        {/* --- Bottom Left Floating Micro-Card: "3 Underused Pieces" --- */}
        <motion.div
          {...floatAnimation(7.5, 1.5, 12)}
          className="absolute bottom-[24%] left-[5%] sm:left-[8%] lg:left-[14%] pointer-events-auto"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            className="glass-card px-4 py-3 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.04)] border border-[#C5A059]/25 flex items-center gap-3 bg-white/75 backdrop-blur-md"
          >
            <div className="w-9 h-9 rounded-full bg-[#FAF8F5] text-[#121212] border border-[#121212]/10 flex items-center justify-center">
              <RotateCw className="w-4 h-4 text-[#121212]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#121212] font-sans tracking-wide">3 underused pieces</p>
              <p className="text-[10px] text-[#8C8A84] font-sans">Camel Trench & Silk Scarf</p>
            </div>
          </motion.div>
        </motion.div>

        {/* --- Bottom Right Floating Micro-Card: "Style Match: 94%" --- */}
        <motion.div
          {...floatAnimation(6.5, 0.5, 14)}
          className="absolute bottom-[20%] right-[5%] sm:right-[8%] lg:right-[14%] pointer-events-auto"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            className="glass-card px-4.5 py-3.5 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.04)] border border-[#C5A059]/30 flex items-center gap-3 bg-white/80 backdrop-blur-md"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#121212] to-[#3A3A3C] text-[#C5A059] flex items-center justify-center shadow-inner">
              <Award className="w-4.5 h-4.5 text-[#C5A059]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#121212] font-sans tracking-wide">Style match: 94%</span>
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              </div>
              <p className="text-[10px] text-[#5C5B57] font-sans">High Harmony Index</p>
            </div>
          </motion.div>
        </motion.div>

        {/* --- Abstract Minimalist Garment & Hanger Vectors --- */}
        {/* Floating Rotating Hanger Icon 1 */}
        <motion.div
          animate={shouldReduceMotion ? {} : { rotate: [0, 8, -8, 0], y: [-5, 5, -5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[35%] left-[18%] opacity-20 hidden lg:block"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2L3 13v2h18v-2l-6.8-6c.5-.5.8-1.2.8-2a3 3 0 0 0-3-3z"/>
            <path d="M6 15v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5"/>
          </svg>
        </motion.div>

        {/* Floating Garment Outline 2: Minimal Blazer Silhouette */}
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [6, -6, 6], rotate: [-2, 2, -2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] right-[16%] opacity-20 hidden lg:block"
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
            <path d="M12 11v10"/>
          </svg>
        </motion.div>

        {/* Floating Garment Outline 3: Silk Dress / Coat Lines */}
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [-8, 8, -8], rotate: [1.5, -1.5, 1.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[35%] left-[28%] opacity-15 hidden md:block"
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="0.9">
            <path d="M6 3l3 4v14h6V7l3-4H6z" />
            <line x1="9" y1="11" x2="15" y2="11" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};
