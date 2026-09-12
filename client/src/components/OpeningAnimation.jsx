import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AnimatedCTA } from './AnimatedCTA';

export const OpeningAnimation = ({ onComplete }) => {
  // Sequence Timeline:
  // 1: 0.0s - Background & panels entrance
  // 2: 0.8s - 'Sh' logo entrance
  // 3: 1.0s - 'AI' Bordeaux highlight & underline
  // 4: 1.2s - 'li' logo completes
  // 5: 1.5s - Tagline "Where Indian Culture Meets AI in Fashion" fades & slides up smoothly
  // 6: 1.8s - CTA button "EXPLORE YOUR STYLE →" enters
  // 7: 5.0s+ - Circular clip-path transition originating from AI letters
  const [stage, setStage] = useState(1);
  const aiRef = useRef(null);
  const [aiCoords, setAiCoords] = useState({ x: '50%', y: '50%' });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      const t1 = setTimeout(() => setStage(5), 200);
      const t2 = setTimeout(() => setStage(6), 600);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }

    const t2 = setTimeout(() => setStage(2), 800);   // Sh (0.8s)
    const t3 = setTimeout(() => setStage(3), 1000);  // AI (1.0s)
    const t4 = setTimeout(() => setStage(4), 1200);  // li (1.2s)
    const t5 = setTimeout(() => setStage(5), 1500);  // Tagline (1.5s)
    const t6 = setTimeout(() => setStage(6), 1800);  // CTA (1.8s)

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [shouldReduceMotion]);

  // Track position of AI letters for clip-path transition origin
  useEffect(() => {
    if (aiRef.current) {
      const rect = aiRef.current.getBoundingClientRect();
      const xPct = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
      const yPct = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
      setAiCoords({ x: `${xPct.toFixed(1)}%`, y: `${yPct.toFixed(1)}%` });
    }
  }, [stage]);

  const handleExplore = () => {
    setStage(7); // Trigger circular clip-path reveal from AI letters
    setTimeout(() => {
      onComplete && onComplete();
    }, 1100);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 w-full h-screen overflow-hidden bg-[#FAF4ED] bg-grain flex flex-col items-center justify-center select-none"
      initial={{ opacity: 1 }}
      animate={stage === 7 ? {
        clipPath: `circle(0% at ${aiCoords.x} ${aiCoords.y})`,
        scale: 1.08,
        transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] }
      } : {
        clipPath: `circle(150% at ${aiCoords.x} ${aiCoords.y})`,
        scale: 1,
        transition: { duration: 0.8 }
      }}
    >
      {/* --- THREE BACKGROUND PANELS FRAMING CONTENT FROM BEHIND (-z-10) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Panel 1 — Deep Green (#0F3D3A): Upper-Left (-3deg) */}
        <motion.div
          initial={{ x: "-120%", y: "-60%", rotate: -10, opacity: 0 }}
          animate={stage >= 1 ? {
            x: "-28%",
            y: "-22%",
            rotate: -3,
            opacity: 0.85
          } : { x: "-120%", y: "-60%", rotate: -10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 85, damping: 18 }}
          className="absolute top-0 left-0 w-[420px] sm:w-[580px] h-[280px] sm:h-[360px] rounded-[3rem] bg-[#0F3D3A] text-[#F5DABF] p-8 shadow-2xl border border-[#F5DABF]/20 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#F5DABF]/70 font-semibold">
              01 / CULTURE
            </span>
          </div>
        </motion.div>

        {/* Panel 2 — Bordeaux (#6C151E): Upper-Right (3deg) */}
        <motion.div
          initial={{ x: "120%", y: "-60%", rotate: 10, opacity: 0 }}
          animate={stage >= 1 ? {
            x: "28%",
            y: "-22%",
            rotate: 3,
            opacity: 0.85
          } : { x: "120%", y: "-60%", rotate: 10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 85, damping: 18, delay: 0.1 }}
          className="absolute top-0 right-0 w-[420px] sm:w-[580px] h-[280px] sm:h-[360px] rounded-[3rem] bg-[#6C151E] text-[#F5DABF] p-8 shadow-2xl border border-[#F5DABF]/20 flex flex-col justify-between"
        >
          <div className="flex justify-between items-end h-full">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#F5DABF]/70 font-semibold">
              02 / CURATION
            </span>
          </div>
        </motion.div>

        {/* Panel 3 — Cream (#F5DABF): Bottom-Center */}
        <motion.div
          initial={{ y: "120%", rotate: 0, opacity: 0 }}
          animate={stage >= 1 ? {
            y: "48%",
            rotate: 0,
            opacity: 0.85
          } : { y: "120%", rotate: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.2 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[450px] sm:w-[650px] h-[220px] sm:h-[280px] rounded-[3rem] bg-[#F5DABF] border border-[#6C151E]/20 shadow-2xl p-6 flex flex-col justify-end"
        >
          <div className="flex justify-center">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#6C151E] font-bold">
              03 / PERSONAL STYLE
            </span>
          </div>
        </motion.div>
      </div>

      {/* CENTERED CONTENT CONTAINER */}
      <div className="relative z-30 flex flex-col items-center text-center px-4 max-w-4xl py-6 my-auto">
        
        {/* --- 1. BRAND LOGO: ShAIli --- */}
        <div className="flex items-center justify-center font-editorial text-7xl sm:text-9xl md:text-[10rem] font-bold text-[#171513] tracking-tighter leading-none mb-6">
          {/* 'Sh' */}
          <motion.span
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={stage >= 2 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 20, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block"
          >
            Sh
          </motion.span>

          {/* 'AI' Highlight in Bordeaux #6C151E */}
          <motion.span
            ref={aiRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={stage >= 3 ? {
              opacity: 1,
              scale: 1.05,
              color: '#6C151E'
            } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-flex items-center text-[#6C151E] font-extrabold px-1"
          >
            <span className="relative z-10">AI</span>

            {/* Subtle Bordeaux Underline */}
            <motion.span
              initial={{ width: "0%" }}
              animate={stage >= 3 ? { width: "100%" } : { width: "0%" }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeInOut" }}
              className="absolute bottom-2 left-0 h-[3px] bg-[#6C151E] rounded-full"
            />
          </motion.span>

          {/* 'li' */}
          <motion.span
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={stage >= 4 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 20, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block"
          >
            li
          </motion.span>
        </div>

        {/* --- 2. EDITORIAL TAGLINE: Where Indian Culture Meets AI in Fashion --- */}
        <AnimatePresence>
          {stage >= 5 && (
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-editorial text-3xl sm:text-5xl md:text-6xl font-bold text-[#171513] tracking-tight leading-tight max-w-3xl my-6"
            >
              Where Indian Culture Meets <span className="text-[#6C151E] italic font-normal">AI in Fashion</span>
            </motion.h2>
          )}
        </AnimatePresence>

        {/* --- 3. BORDEAUX CTA & SUBTEXT --- */}
        <AnimatePresence>
          {stage >= 6 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4"
            >
              <AnimatedCTA
                onClick={handleExplore}
                text="EXPLORE YOUR STYLE →"
                subtitle="Click to unlock your intelligent closet"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-6 right-8 text-right text-[10px] font-mono tracking-widest text-[#81766D] uppercase hidden sm:block">
        INDIAN CONTEMPORARY FASHION EDITORIAL
      </div>
    </motion.div>
  );
};


