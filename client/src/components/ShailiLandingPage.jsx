import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OpeningAnimation } from './OpeningAnimation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { HeroSection } from './HeroSection';
import { DashboardHero } from './DashboardHero';
import { OutfitStudioModal } from './OutfitStudioModal';
import { AiAssistant } from './AiAssistant';
import { PageTransition } from './PageTransition';
import { Sparkles, Shirt, BarChart3, CheckCircle2, RotateCw } from 'lucide-react';
import { SAMPLE_OUTFITS, UNDERUSED_ITEMS, WARDROBE_STATS } from '../types';

export const ShailiLandingPage = () => {
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  const handleAnimationComplete = () => {
    setShowOpeningAnimation(false);
  };

  const handleReplayIntro = () => {
    setShowOpeningAnimation(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF4ED] bg-grain text-[#171513] font-sans selection:bg-[#6C151E]/20 selection:text-[#171513] relative overflow-x-hidden">
      {/* 1. Fullscreen Redesigned Opening Animation Experience */}
      <AnimatePresence mode="wait">
        {showOpeningAnimation && (
          <OpeningAnimation key="opening" onComplete={handleAnimationComplete} />
        )}
      </AnimatePresence>

      {/* 2. Main Dashboard & Editorial Page Content */}
      {!showOpeningAnimation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative min-h-screen flex flex-col"
        >
          {/* Top Editorial Navbar */}
          <Navbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onReplayIntro={handleReplayIntro}
            onOpenStudio={() => setIsStudioOpen(true)}
          />

          {/* Main View Area */}
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <PageTransition key="home-view">
                  {/* Hero Section */}
                  <HeroSection
                    onOpenStudio={() => setIsStudioOpen(true)}
                  />
                </PageTransition>
              )}

              {activeTab === 'wardrobe' && (
                <PageTransition key="wardrobe-view">
                  <div className="pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
                    <div className="mb-8">
                      <span className="text-xs font-mono font-bold text-[#6C151E] uppercase tracking-widest">
                        Digital Closet Catalog
                      </span>
                      <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-[#171513] mt-1">
                        My Smart Wardrobe
                      </h1>
                      <p className="text-sm font-sans text-[#5C544D] mt-2 max-w-xl">
                        48 high-precision digitized garments categorized by fabric breathability, silhouette index, and color matching scores.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {SAMPLE_OUTFITS.map((outfit) => (
                        <motion.div
                          key={outfit.id}
                          whileHover={{ y: -6 }}
                          className="glass-cream p-6 rounded-[2rem] border border-[#6C151E]/25 bg-white/80 shadow-md"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full bg-[#6C151E] text-[#F5DABF]">
                              {outfit.category}
                            </span>
                            <span className="text-xs font-mono font-bold text-[#0F3D3A]">
                              {outfit.matchScore}% Match
                            </span>
                          </div>
                          <h3 className="font-editorial text-2xl font-bold text-[#171513] mb-3">{outfit.title}</h3>
                          <ul className="space-y-2 mb-6 text-xs text-[#5C544D]">
                            {outfit.items.map((item, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#6C151E]" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                          <button
                            onClick={() => setIsStudioOpen(true)}
                            className="w-full py-3 rounded-full bg-[#6C151E] text-[#F5DABF] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#541017] transition-colors cursor-pointer"
                          >
                            Stylize with AI →
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </PageTransition>
              )}

              {activeTab === 'stylist' && (
                <PageTransition key="stylist-view">
                  <div className="pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto text-center">
                    <span className="text-xs font-mono font-bold text-[#6C151E] uppercase tracking-widest">
                      Personalized AI Intelligence
                    </span>
                    <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-[#171513] mt-1 mb-4">
                      AI Stylist Suite
                    </h1>
                    <p className="text-base font-sans text-[#5C544D] max-w-xl mx-auto mb-8">
                      Generates combinations based on your wardrobe, preferences, occasion, and real-time weather.
                    </p>
                    <button
                      onClick={() => setIsStudioOpen(true)}
                      className="px-8 py-4 rounded-full bg-[#6C151E] text-[#F5DABF] border border-[#F5DABF]/40 shadow-xl text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-3 hover:scale-105 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#F5DABF]" />
                      <span>Open Interactive Studio</span>
                    </button>
                  </div>
                </PageTransition>
              )}

              {activeTab === 'insights' && (
                <PageTransition key="insights-view">
                  <div className="pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
                    <span className="text-xs font-mono font-bold text-[#6C151E] uppercase tracking-widest">
                      Wardrobe Analytics & Patterns
                    </span>
                    <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-[#171513] mt-1 mb-8">
                      Style Insights
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="glass-cream p-8 rounded-[2.5rem] border border-[#6C151E]/25 bg-white/80">
                        <h3 className="font-headline text-2xl font-bold text-[#171513] mb-4">Underutilized Garment Tracker</h3>
                        <div className="space-y-4">
                          {UNDERUSED_ITEMS.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-[#FAF4ED] border border-[#6C151E]/15">
                              <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-sm text-[#171513]">{item.name}</h4>
                                <span className="text-[10px] font-mono text-[#6C151E] font-bold">{item.lastWorn}</span>
                              </div>
                              <p className="text-xs text-[#5C544D] mt-1">{item.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass-cream p-8 rounded-[2.5rem] border border-[#6C151E]/25 bg-[#0F3D3A] text-[#F5DABF] flex flex-col justify-between">
                        <div>
                          <h3 className="font-headline text-2xl font-bold text-[#F5DABF] mb-4">Wardrobe Harmony Index</h3>
                          <div className="p-6 rounded-2xl bg-[#6C151E] text-center my-4 border border-[#F5DABF]/30">
                            <span className="font-editorial text-6xl font-bold text-[#F5DABF]">94%</span>
                            <p className="text-xs font-mono text-[#F5DABF]/80 mt-2 uppercase tracking-wider">
                              Capsule Versatility Score
                            </p>
                          </div>
                          <p className="text-xs text-[#F5DABF]/80 leading-relaxed">
                            Your wardrobe features exceptional item synergy. 88% of top-layer items pair effortlessly with bottom-layer pieces.
                          </p>
                        </div>
                        <button
                          onClick={() => setIsStudioOpen(true)}
                          className="mt-6 w-full py-3 rounded-full bg-[#F5DABF] text-[#0F3D3A] text-xs font-mono font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
                        >
                          Generate Optimization Plan →
                        </button>
                      </div>
                    </div>
                  </div>
                </PageTransition>
              )}
            </AnimatePresence>
          </main>

          {/* Footer Component */}
          <Footer
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenStudio={() => setIsStudioOpen(true)}
          />
        </motion.div>
      )}

      {/* Outfit Studio Modal */}
      <OutfitStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />

      {/* Floating AI Chatbot Assistant Launcher */}
      <AiAssistant />
    </div>
  );
};
