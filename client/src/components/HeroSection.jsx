import React from 'react';
import { motion } from 'framer-motion';
import fashionPortraitImg from '../assets/shaili_fashion_portrait.jpg';
import heroBgImg from '../assets/shaili_hero_bg.png';

export const HeroSection = () => {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] py-8 lg:py-12 px-4 sm:px-8 lg:px-10 max-w-[1400px] mx-auto flex items-center justify-center select-none overflow-hidden">
      {/* Editorial Canvas Background with Subtle Fabric Texture */}
      <div className="absolute inset-0 -z-10 rounded-[2.5rem] overflow-hidden my-2 border border-[#6C151E]/15 shadow-xl bg-[#FAF4ED] bg-grain">
        <img
          src={heroBgImg}
          alt="Shaili Editorial Texture"
          className="w-full h-full object-cover opacity-20 mix-blend-multiply filter brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAF4ED]/95 via-[#FAF4ED]/70 to-[#FAF4ED]/95" />
      </div>

      {/* Main Two-Column Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center justify-center w-full my-auto py-4">
        
        {/* Mobile-First Ordering: Logo & Tagline Stack First on Mobile, Side-by-Side on Desktop */}
        
        {/* Mobile Logo & Tagline (Shown on small screens only) */}
        <div className="lg:hidden flex flex-col items-center text-center">
          {/* Logo */}
          <div className="font-editorial text-6xl sm:text-7xl font-bold text-[#171513] tracking-tighter leading-none mb-3">
            <span>Sh</span>
            <span className="relative inline-flex items-center text-[#6C151E] font-extrabold px-1">
              <span className="relative z-10">AI</span>
              <span className="absolute bottom-1 left-0 w-full h-[3px] bg-[#6C151E] rounded-full" />
            </span>
            <span>li</span>
          </div>

          {/* Headline */}
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#171513] tracking-tight leading-tight my-2">
            <div>Where Indian Culture Meets</div>
            <div>
              <span className="text-[#6C151E]">AI</span> <span className="italic font-normal">in Fashion</span>
            </div>
          </h1>

          {/* Description */}
          <p className="font-sans text-xs sm:text-sm text-[#5C544D] max-w-[480px] mt-2 mb-4 leading-relaxed">
            An intelligent wardrobe that understands what you own, learns your style, and creates outfits around you.
          </p>
        </div>

        {/* LEFT SIDE: Static High-Fashion Editorial Image Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 relative flex items-center justify-center my-auto order-2 lg:order-1"
        >
          <div className="relative rounded-[2.5rem] overflow-hidden border border-[#6C151E]/25 shadow-2xl bg-[#0F3D3A] aspect-[4/3] w-full max-w-[540px] max-h-[500px] mx-auto">
            <img
              src={fashionPortraitImg}
              alt="Shaili Luxury Indian Fashion Editorial"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </motion.div>

        {/* RIGHT SIDE: Centered Hero Typography & Editorial Specs (Desktop Only Stack) */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex lg:col-span-6 flex-col items-center text-center justify-center my-auto order-1 lg:order-2"
        >
          {/* 1. BRAND LOGO: ShAIli */}
          <div className="font-editorial text-7xl sm:text-8xl md:text-9xl font-bold text-[#171513] tracking-tighter leading-none mb-6 drop-shadow-sm">
            <span>Sh</span>
            <span className="relative inline-flex items-center text-[#6C151E] font-extrabold px-1 cursor-default">
              <span className="relative z-10">AI</span>
              <span className="absolute bottom-2 left-0 w-full h-[4px] bg-[#6C151E] rounded-full shadow-sm" />
            </span>
            <span>li</span>
          </div>

          {/* 2. MAIN TAGLINE */}
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#171513] tracking-tight leading-tight max-w-2xl my-4 sm:my-6">
            <div>Where Indian Culture Meets</div>
            <div>
              <span className="text-[#6C151E]">AI</span> <span className="italic font-normal">in Fashion</span>
            </div>
          </h1>

          {/* 3. DECORATIVE DIVIDER */}
          <div className="flex items-center justify-center gap-3 my-4 text-[#6C151E]/50 text-xs">
            <span className="w-12 h-[1px] bg-[#6C151E]/30" />
            <span className="text-sm text-[#6C151E]">✦</span>
            <span className="w-12 h-[1px] bg-[#6C151E]/30" />
          </div>

          {/* 4. DESCRIPTION */}
          <p className="font-sans text-sm sm:text-base text-[#5C544D] max-w-[520px] leading-relaxed mx-auto">
            An intelligent wardrobe that understands what you own, learns your style, and creates outfits around you.
          </p>
        </motion.div>

      </div>

      {/* EDITORIAL INWARD SIDE & BOTTOM DETAILS */}
      <div className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3 text-[10px] font-mono text-[#6C151E] font-bold">
        <span>01</span>
        <span className="w-[1px] h-4 bg-[#6C151E]/30 mx-auto" />
        <span>02</span>
        <span className="w-[1px] h-4 bg-[#6C151E]/30 mx-auto" />
        <span>03</span>
        <span className="w-[1px] h-4 bg-[#6C151E]/30 mx-auto" />
        <span>04</span>
      </div>

      <div className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 text-[9px] font-mono tracking-widest uppercase text-[#81766D] text-right">
        <span>STYLE</span>
        <span>HERITAGE</span>
        <span>INTELLIGENCE</span>
      </div>

      <div className="absolute bottom-3 left-4 sm:left-8 text-[10px] font-mono tracking-widest text-[#81766D] uppercase hidden sm:block">
        INDIAN CONTEMPORARY • FASHION EDITORIAL
      </div>
    </div>
  );
};





