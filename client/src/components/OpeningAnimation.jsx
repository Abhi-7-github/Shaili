import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AnimatedCTA } from './AnimatedCTA';
import { Sparkles } from 'lucide-react';

export const OpeningAnimation = ({ onComplete }) => {
  // Timeline Stages:
  // 0ms   - Stage 0: Ivory Background
  // 100ms - Stage 1: Left Green Panel Slide (translateX -100% -> 0)
  // 200ms - Stage 2: Right Burgundy Panel Slide (translateX 100% -> 0)
  // 800ms - Stage 3: ShAili Logo Curtain Reveal (clip-path + scale)
  // 1300ms - Stage 4: Burgundy Underline Draw-on (scaleX 0 -> 1)
  // 1450ms - Stage 5: Headline Line 1 ("Where Indian Culture")
  // 1580ms - Stage 6: Headline Line 2 ("Meets")
  // 1710ms - Stage 7: Headline Line 3 Burgundy Italic ("AI in Fashion")
  // 2050ms - Stage 8: Peach Card Cinematic Reveal (clip-path round + scale)
  // 2300ms - Stage 9: Explore Your Style Button Hero Impact Entrance
  // 2850ms - Stage 10: Button Single Light Sweep Shine
  // 3000ms - Stage 11: Card Subtext Reveal ("Click to unlock your intelligent closet")
  // 3200ms - Stage 12: Sparkle Accent Reveal (scale + rotate)
  // 3500ms - Stage 13: All Animations Stop -> Static Luxury Editorial UI
  // 99     - Exit transition on click
  const [stage, setStage] = useState(0);
  const aiRef = useRef(null);
  const [aiCoords, setAiCoords] = useState({ x: '50%', y: '50%' });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setStage(13);
      return;
    }

    const t1 = setTimeout(() => setStage(1), 100);    // Green panel (100ms)
    const t2 = setTimeout(() => setStage(2), 200);    // Burgundy panel (200ms)
    const t3 = setTimeout(() => setStage(3), 800);    // Logo reveal (800ms)
    const t4 = setTimeout(() => setStage(4), 1300);   // Underline (1300ms)
    const t5 = setTimeout(() => setStage(5), 1450);   // Headline Line 1 (1450ms)
    const t6 = setTimeout(() => setStage(6), 1580);   // Headline Line 2 (1580ms)
    const t7 = setTimeout(() => setStage(7), 1710);   // AI in Fashion (1710ms)
    const t8 = setTimeout(() => setStage(8), 2050);   // Peach Card (2050ms)
    const t9 = setTimeout(() => setStage(9), 2300);   // Explore Button Impact (2300ms)
    const t10 = setTimeout(() => setStage(10), 2850); // Button Shine (2850ms)
    const t11 = setTimeout(() => setStage(11), 3000); // Card Subtext (3000ms)
    const t12 = setTimeout(() => setStage(12), 3200); // Sparkle (3200ms)
    const t13 = setTimeout(() => setStage(13), 3500); // Complete Static (3500ms)

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
      clearTimeout(t9);
      clearTimeout(t10);
      clearTimeout(t11);
      clearTimeout(t12);
      clearTimeout(t13);
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (aiRef.current) {
      const rect = aiRef.current.getBoundingClientRect();
      const xPct = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
      const yPct = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
      setAiCoords({ x: `${xPct.toFixed(1)}%`, y: `${yPct.toFixed(1)}%` });
    }
  }, [stage]);

  const handleExplore = () => {
    setStage(99);
    setTimeout(() => {
      onComplete && onComplete();
    }, 800);
  };

  // Custom Editorial Cinematic Easing: cubic-bezier(0.16, 1, 0.3, 1)
  const cinematicEase = [0.16, 1, 0.3, 1];

  return (
    <motion.div
      className="fixed inset-0 z-50 w-full h-screen overflow-hidden bg-[#FAF4ED] bg-grain select-none relative flex flex-col items-center justify-between"
      initial={{ opacity: 1 }}
      animate={
        stage === 99
          ? {
            clipPath: `circle(0% at ${aiCoords.x} ${aiCoords.y})`,
            scale: 1.02,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }
          : {
            clipPath: `circle(150% at ${aiCoords.x} ${aiCoords.y})`,
            scale: 1,
            transition: { duration: 0.3 },
          }
      }
    >
      {/* SCENE 2 — LEFT GREEN PANEL (#0F3D3A) - Dramatic slide entrance (translateX -100% -> 0%) */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        animate={stage >= 1 ? { x: '0%', opacity: 1 } : { x: '-100%', opacity: 0 }}
        transition={{ duration: 1.0, ease: cinematicEase }}
        className="absolute top-0 left-0 w-[32vw] max-w-[480px] min-w-[240px] h-[44vh] min-h-[260px] bg-[#0F3D3A] rounded-br-[4rem] shadow-xl z-0 pointer-events-none"
      />

      {/* SCENE 2 — RIGHT BURGUNDY PANEL (#6C151E) - Dramatic slide entrance (translateX 100% -> 0%) */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={stage >= 2 ? { x: '0%', opacity: 1 } : { x: '100%', opacity: 0 }}
        transition={{ duration: 1.0, ease: cinematicEase }}
        className="absolute top-0 right-0 w-[32vw] max-w-[480px] min-w-[240px] h-[44vh] min-h-[260px] bg-[#6C151E] rounded-bl-[4rem] shadow-xl z-0 p-8 flex items-end justify-start pointer-events-none"
      >
        <span className="text-[11px] font-mono tracking-widest uppercase text-[#F5DABF]/80 font-semibold">
          02 / CURATION
        </span>
      </motion.div>

      {/* CENTERED TYPOGRAPHY STACK */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-3xl pt-16 sm:pt-20 space-y-4">

        {/* SCENE 3 — ShAili LOGO (Curtain Masked Reveal: clip-path inset + opacity + scale 0.96 -> 1) */}
        <motion.div
          initial={{ clipPath: 'inset(100% 0% 0% 0%)', opacity: 0, scale: 0.96 }}
          animate={
            stage >= 3
              ? { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, scale: 1 }
              : { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0, scale: 0.96 }
          }
          transition={{ duration: 0.7, ease: cinematicEase }}
          className="flex items-center justify-center font-serif text-7xl sm:text-9xl md:text-[10rem] font-semibold text-[#0A2E2C] tracking-tighter leading-none select-none"
        >
          <span>Sh</span>

          {/* SCENE 4 — LOGO BURGUNDY ACCENT UNDERLINE (Signature draw-on: scaleX 0 -> 1) */}
          <span
            ref={aiRef}
            className="relative inline-flex items-center text-[#6C151E] font-semibold px-1"
          >
            <span>AI</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={stage >= 4 ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.45, ease: cinematicEase }}
              style={{ transformOrigin: 'center' }}
              className="absolute bottom-2 left-0 w-full h-[4px] bg-[#6C151E] rounded-full"
            />
          </span>

          <span>li</span>
        </motion.div>

        {/* SCENE 5 & 6 — HEADLINE CINEMATIC EDITORIAL REVEAL (Line by line stagger) */}
        <div className="space-y-1 overflow-hidden py-1">
          {/* Line 1: "Where Indian Culture" (1450ms) */}
          <motion.div
            initial={{ opacity: 0, y: 35, clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={
              stage >= 5
                ? { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }
                : { opacity: 0, y: 35, clipPath: 'inset(100% 0% 0% 0%)' }
            }
            transition={{ duration: 0.65, ease: cinematicEase }}
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-semibold text-[#0A2E2C] tracking-tight leading-tight"
          >
            Where Indian Culture
          </motion.div>

          {/* Line 2 & 3: "Meets AI in Fashion" (Line 2 at 1580ms, Burgundy Italic "AI in Fashion" at 1710ms) */}
          <div className="font-serif text-3xl sm:text-5xl md:text-6xl font-semibold text-[#0A2E2C] tracking-tight leading-tight flex items-center justify-center gap-2">
            <motion.span
              initial={{ opacity: 0, y: 35, clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={
                stage >= 6
                  ? { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }
                  : { opacity: 0, y: 35, clipPath: 'inset(100% 0% 0% 0%)' }
              }
              transition={{ duration: 0.65, ease: cinematicEase }}
            >
              Meets
            </motion.span>

            {/* SCENE 6 — BURGUNDY "AI IN FASHION" (Typographic print reveal: opacity + scale 0.97 -> 1 + clip-path) */}
            <motion.span
              initial={{ opacity: 0, scale: 0.97, clipPath: 'inset(0% 100% 0% 0%)' }}
              animate={
                stage >= 7
                  ? { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' }
                  : { opacity: 0, scale: 0.97, clipPath: 'inset(0% 100% 0% 0%)' }
              }
              transition={{ duration: 0.65, ease: cinematicEase }}
              className="font-normal italic text-[#6C151E] inline-block"
            >
              AI in Fashion
            </motion.span>

            {/* SCENE 11 — DECORATIVE SPARKLE (Entrance at 3200ms: opacity + scale 0.5 -> 1 + rotate -20deg -> 0deg) */}
            <motion.span
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              animate={
                stage >= 12
                  ? { opacity: 1, scale: [0.5, 1.15, 1], rotate: 0 }
                  : { opacity: 0, scale: 0.5, rotate: -20 }
              }
              transition={{ duration: 0.5, ease: cinematicEase }}
              className="inline-block"
            >
              <Sparkles className="w-5 h-5 text-[#6C151E] inline-block" />
            </motion.span>
          </div>
        </div>
      </div>

      {/* PEACH CARD & EXPLORE BUTTON CONTAINER */}
      <div className="relative z-20 w-[90%] sm:w-[620px] md:w-[700px] flex flex-col items-center">

        {/* SCENE 8 & 9 — EXPLORE YOUR STYLE BUTTON (Hero Impact Entrance at 2300ms: scale 0.75 -> 1.05 -> 1 + y 35 -> 0, followed by Scene 9 Light Shine at 2850ms) */}
        <AnimatePresence>
          {stage >= 9 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 35 }}
              animate={{ opacity: 1, scale: [0.75, 1.05, 1], y: 0 }}
              transition={{ duration: 0.65, ease: cinematicEase }}
              className="absolute -top-7 z-30 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto"
            >
              <AnimatedCTA
                onClick={handleExplore}
                text="EXPLORE YOUR STYLE →"
                subtitle={null}
                showShine={stage >= 10}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCENE 7 — PEACH / BEIGE BOTTOM INTERACTIVE CARD (#F5DABF) (Cinematic Panel Reveal at 2050ms: clip-path inset round + opacity + scale 0.96 -> 1) */}
        <motion.div
          initial={{ clipPath: 'inset(15% 0% 0% 0% round 3.5rem)', opacity: 0, scale: 0.96 }}
          animate={
            stage >= 8
              ? { clipPath: 'inset(0% 0% 0% 0% round 3.5rem)', opacity: 1, scale: 1 }
              : { clipPath: 'inset(15% 0% 0% 0% round 3.5rem)', opacity: 0, scale: 0.96 }
          }
          transition={{ duration: 0.9, ease: cinematicEase }}
          className="w-full h-[240px] sm:h-[280px] bg-[#F5DABF] rounded-t-[3.5rem] shadow-2xl p-6 pt-12 flex flex-col items-center justify-start text-center border-t border-x border-[#6C151E]/20 z-10"
        >
          {/* SCENE 10 — CARD SUBTEXT (Editorial Reveal at 3000ms) */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={stage >= 11 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.8, ease: cinematicEase }}
            className="mt-3 text-center text-xs font-mono tracking-wide text-[#6C151E] font-medium"
          >
            Click to unlock your intelligent closet
          </motion.p>
        </motion.div>
      </div>

      {/* FOOTER TAG */}
      <div className="absolute bottom-4 right-8 z-30 text-[10px] font-mono tracking-widest text-[#6C151E] font-semibold uppercase hidden sm:block">
        INDIAN CONTEMPORARY FASHION EDITORIAL
      </div>
    </motion.div>
  );
};

export default OpeningAnimation;
