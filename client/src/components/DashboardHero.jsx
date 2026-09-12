import React from 'react';
import { motion } from 'framer-motion';
import { Shirt, BarChart3, Clock, ArrowRight, Zap, RefreshCw, CheckCircle } from 'lucide-react';
import { FeatureCard } from './FeatureCard';
import { WARDROBE_STATS, UNDERUSED_ITEMS } from '../types';

export const DashboardHero = ({ onOpenStudio, onNavigateTab }) => {
  return (
    <div className="relative pt-20 pb-20 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen flex flex-col justify-between">
      {/* Background Decorative Aura Lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#6C151E]/15 via-[#F5DABF]/30 to-[#0F3D3A]/15 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* --- Personal Greeting & Main Editorial Heading Section --- */}
      <section className="mt-4 mb-16 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5DABF] border border-[#6C151E]/20 shadow-xs mb-6"
        >
          <Clock className="w-3.5 h-3.5 text-[#6C151E]" />
          <span className="text-xs font-mono font-bold text-[#6C151E] uppercase tracking-wider">
            Paris • 21:07 | Editorial Autumn Collection
          </span>
        </motion.div>

        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg sm:text-2xl font-sans text-[#5C544D] mb-2"
        >
          Good evening, <span className="font-semibold text-[#171513]">Abhiram.</span>
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-editorial text-5xl sm:text-7xl md:text-8xl font-bold text-[#171513] tracking-tight leading-[1.05]"
        >
          Your Style, <br />
          <span className="text-[#6C151E] italic font-normal">Curated for You.</span>
        </motion.h1>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-base sm:text-xl font-sans font-light text-[#5C544D] max-w-2xl mx-auto leading-relaxed"
        >
          Shaili understands what you own, what you wear, and how you like to dress — then turns your wardrobe into intelligent outfit possibilities.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          <button
            onClick={onOpenStudio}
            className="group px-8 py-4 rounded-[12px] bg-[#6C151E] text-[#F5DABF] font-mono text-xs sm:text-sm tracking-widest uppercase font-semibold border border-[#F5DABF]/40 shadow-xl inline-flex items-center gap-3 hover:bg-[#541017] transition-all cursor-pointer"
          >
            <span>Create Today's Look →</span>
          </button>
        </motion.div>
      </section>

      {/* --- Section 10: Three Editorial Feature Cards --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
        {/* Card 1: AI Stylist (Bordeaux) */}
        <FeatureCard
          index={0}
          title="Personal Stylist"
          headline="Your personal stylist, powered by intelligence."
          description="Generate personalized combinations from your actual wardrobe based on preferences, occasion, and weather."
          icon={Shirt}
          colorTheme="bordeaux"
          onClick={onOpenStudio}
        />

        {/* Card 2: Smart Wardrobe (Deep Green) */}
        <FeatureCard
          index={1}
          title="Smart Wardrobe"
          headline="Everything you own. One intelligent wardrobe."
          description="Track garments, colors, categories, seasons, and usage."
          icon={Shirt}
          colorTheme="green"
          onClick={() => onNavigateTab && onNavigateTab('wardrobe')}
        />

        {/* Card 3: Style Insights (Cream) */}
        <FeatureCard
          index={2}
          title="Style Insights"
          headline="Discover your own style patterns."
          description="See what you wear most, what you rarely use, and what combinations you haven't tried."
          icon={BarChart3}
          colorTheme="cream"
          onClick={() => onNavigateTab && onNavigateTab('insights')}
        />
      </section>

      {/* --- Live Wardrobe Diagnostic Panel --- */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-12 glass-cream p-8 rounded-[2.5rem] border border-[#6C151E]/20 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#6C151E]/15">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#6C151E] uppercase tracking-wider font-bold mb-1">
              <Zap className="w-4 h-4 text-[#6C151E]" />
              <span>Wardrobe Diagnostic</span>
            </div>
            <h3 className="font-editorial text-3xl font-bold text-[#171513]">Today's Style Diagnostic</h3>
          </div>

          <button
            onClick={onOpenStudio}
            className="self-start md:self-auto px-6 py-3 rounded-full bg-[#6C151E] text-[#F5DABF] text-xs font-mono font-bold uppercase tracking-wider border border-[#F5DABF]/40 hover:bg-[#541017] transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>Generate Outfit →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="p-5 rounded-2xl bg-[#FAF4ED] border border-[#6C151E]/15">
            <span className="text-[10px] font-mono text-[#5C544D] uppercase font-semibold">Total Garments</span>
            <p className="font-editorial text-3xl font-bold text-[#171513] mt-1">{WARDROBE_STATS.totalItems} Pieces</p>
            <p className="text-[11px] text-[#0F3D3A] font-semibold mt-1 flex items-center gap-1 font-sans">
              <CheckCircle className="w-3 h-3 text-[#0F3D3A]" /> 100% Digitized
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF4ED] border border-[#6C151E]/15">
            <span className="text-[10px] font-mono text-[#5C544D] uppercase font-semibold">Style Match Index</span>
            <p className="font-editorial text-3xl font-bold text-[#171513] mt-1">{WARDROBE_STATS.styleMatchIndex}</p>
            <p className="text-[11px] text-[#6C151E] font-semibold mt-1 font-sans">High Cohesion Rating</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF4ED] border border-[#6C151E]/15">
            <span className="text-[10px] font-mono text-[#5C544D] uppercase font-semibold">Outfits Generated</span>
            <p className="font-editorial text-3xl font-bold text-[#171513] mt-1">{WARDROBE_STATS.outfitsCreated} Outfits</p>
            <p className="text-[11px] text-[#5C544D] mt-1 font-sans">Ready for calendar</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF4ED] border border-[#6C151E]/15">
            <span className="text-[10px] font-mono text-[#5C544D] uppercase font-semibold">Underutilized Pieces</span>
            <p className="font-editorial text-3xl font-bold text-[#171513] mt-1">{WARDROBE_STATS.underusedCount} Garments</p>
            <p className="text-[11px] text-[#6C151E] font-semibold mt-1 font-sans">Rotation recommended</p>
          </div>
        </div>

        {/* Underused items banner */}
        <div className="mt-6 p-4 rounded-2xl bg-[#0F3D3A] text-[#F5DABF] border border-[#F5DABF]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F5DABF] text-[#0F3D3A] flex items-center justify-center shrink-0 font-bold">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold uppercase text-[#F5DABF]">Underused Rotation Spotlight</p>
              <p className="text-xs text-[#F5DABF]/80 font-sans mt-0.5">
                Your <span className="font-semibold text-white">{UNDERUSED_ITEMS[0].name}</span> hasn't been worn in {UNDERUSED_ITEMS[0].lastWorn}. {UNDERUSED_ITEMS[0].suggestion}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenStudio}
            className="text-xs font-mono font-bold text-[#F5DABF] uppercase hover:underline whitespace-nowrap cursor-pointer"
          >
            Stylize Piece →
          </button>
        </div>
      </motion.section>
    </div>
  );
};
