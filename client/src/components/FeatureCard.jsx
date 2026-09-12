import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export const FeatureCard = ({ title, headline, description, icon: Icon, colorTheme = 'bordeaux', onClick, index = 0 }) => {
  const themeStyles = {
    bordeaux: {
      bg: 'bg-[#6C151E] text-[#F5DABF]',
      badgeBg: 'bg-[#F5DABF]/20 text-[#F5DABF] border-[#F5DABF]/30',
      border: 'border-[#F5DABF]/25',
      iconBg: 'bg-[#F5DABF] text-[#6C151E]',
      shadow: 'shadow-lg',
      subtext: 'text-[#F5DABF]/80'
    },
    green: {
      bg: 'bg-[#0F3D3A] text-[#F5DABF]',
      badgeBg: 'bg-[#F5DABF]/20 text-[#F5DABF] border-[#F5DABF]/30',
      border: 'border-[#F5DABF]/25',
      iconBg: 'bg-[#F5DABF] text-[#0F3D3A]',
      shadow: 'shadow-lg',
      subtext: 'text-[#F5DABF]/80'
    },
    cream: {
      bg: 'bg-[#F5DABF] text-[#171513]',
      badgeBg: 'bg-[#6C151E]/15 text-[#6C151E] border-[#6C151E]/30',
      border: 'border-[#6C151E]/20',
      iconBg: 'bg-[#6C151E] text-[#F5DABF]',
      shadow: 'shadow-lg',
      subtext: 'text-[#5C544D]'
    }
  }[colorTheme] || themeStyles.bordeaux;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        onClick={onClick}
        className={`relative h-full p-8 rounded-[20px] ${themeStyles.bg} ${themeStyles.border} ${themeStyles.shadow} border flex flex-col justify-between cursor-pointer overflow-hidden`}
      >
        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between mb-8">
            <div className={`w-12 h-12 rounded-2xl ${themeStyles.iconBg} flex items-center justify-center font-bold shadow-md`}>
              <Icon className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${themeStyles.badgeBg}`}>
                {title}
              </span>
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Headline & Description */}
          <div>
            <h3 className="font-editorial text-3xl font-bold mb-3 tracking-tight leading-snug">
              {headline}
            </h3>
            <p className={`text-sm font-sans leading-relaxed ${themeStyles.subtext}`}>
              {description}
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-8 pt-4 border-t border-current/10 flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider">
            Launch Feature →
          </span>
          <span className="text-[10px] font-mono opacity-60">Shaili</span>
        </div>
      </div>
    </motion.div>
  );
};
