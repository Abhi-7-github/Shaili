import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shirt, BarChart3, ArrowRight, RefreshCw } from 'lucide-react';
import UnderusedGarments from '../components/UnderusedGarments';
import fashionPortraitImg from '../assets/shaili_fashion_portrait.png';

export const Home = ({ onNavigate, onOpenStylistWithGarment }) => {
  return (
    <div className="space-y-12 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none">
      {/* Editorial Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F3D3A] via-[#0A2E2C] to-[#0A2E2C] text-[#FAF4ED] p-6 sm:p-10 md:p-12 shadow-2xl border border-[#F5DABF]/30">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4ED]/10 backdrop-blur-md border border-[#F5DABF]/30 text-xs font-mono tracking-widest uppercase text-[#F5DABF] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#F5DABF]" />
              AI-POWERED WARDROBE INTELLIGENCE
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
              Where Indian Culture Meets AI in Fashion
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-[#FAF4ED]/90 max-w-xl font-medium leading-relaxed">
              Elevate your personal aesthetic. Digitally catalog your clothes, analyze color harmony, rediscover forgotten garments, and generate occasion-perfect outfits in seconds.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('stylist')}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-[#F5DABF] hover:bg-white text-[#0A2E2C] font-serif font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Open AI Stylist</span>
                <ArrowRight className="w-4 h-4 text-[#6C151E]" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('wardrobe')}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-[#0F3D3A]/60 hover:bg-[#0F3D3A] border border-[#F5DABF]/40 text-[#FAF4ED] font-bold text-xs uppercase tracking-wider rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Explore My Wardrobe</span>
              </button>
            </div>
          </div>

          {/* Right Column: High-Fashion Portrait Image Display */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[460px] lg:max-w-[500px] rounded-3xl overflow-hidden border-2 border-[#F5DABF]/50 shadow-2xl bg-[#0F3D3A] flex items-center justify-center p-1">
              <img
                src={fashionPortraitImg}
                alt="ShAili Luxury Indian Fashion Portrait"
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </div>

        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 w-96 h-96 opacity-20 pointer-events-none rounded-full bg-gradient-to-t from-[#F5DABF] to-transparent blur-3xl" />
      </section>

      {/* Feature Highlights (4 Pillars) */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-mono tracking-widest text-[#6C151E] font-bold">
            Core Platform Capabilities
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0A2E2C]">
            Designed for Modern Fashion-Tech Elegance
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          <FeatureBox
            icon={Shirt}
            title="AI Wardrobe"
            description="Automatic garment detection, color extraction, pattern matching, and smart categorization."
            onClick={() => onNavigate && onNavigate('wardrobe')}
          />
          <FeatureBox
            icon={Sparkles}
            title="Smart Matching"
            description="Deep neural styling matching color temperature, occasion appropriateness, and weather."
            onClick={() => onNavigate && onNavigate('stylist')}
          />
          <FeatureBox
            icon={RefreshCw}
            title="Underused Garments"
            description="Intelligent prompts to pair forgotten items in your closet with fresh staples."
            onClick={() => onNavigate && onNavigate('wardrobe')}
          />
          <FeatureBox
            icon={BarChart3}
            title="Style Insights"
            description="Wardrobe utilization %, color frequency distributions, and gap detection analytics."
            onClick={() => onNavigate && onNavigate('insights')}
          />
        </div>
      </section>

      {/* Embedded Underused Section Preview */}
      <UnderusedGarments onStyleWithItem={onOpenStylistWithGarment} />
    </div>
  );
};

const FeatureBox = ({ icon: Icon, title, description, onClick }) => (
  <motion.div
    whileHover={{ y: -4 }}
    onClick={onClick}
    className="bg-white border border-[#F5DABF] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 h-full"
  >
    <div className="w-12 h-12 rounded-2xl bg-[#0F3D3A] text-[#FAF4ED] flex items-center justify-center shadow-sm">
      <Icon className="w-6 h-6 text-[#F5DABF]" />
    </div>
    <div>
      <h3 className="font-serif text-xl font-semibold text-[#0A2E2C] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#0A2E2C]/80 leading-relaxed font-medium">{description}</p>
    </div>
    <span className="text-xs font-semibold text-[#6C151E] flex items-center gap-1 uppercase tracking-wider mt-auto">
      Explore feature <ArrowRight className="w-3.5 h-3.5 text-[#0F3D3A]" />
    </span>
  </motion.div>
);

export default Home;
