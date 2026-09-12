import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookmarkPlus, CheckCircle, Sliders } from 'lucide-react';
import MatchScore from './MatchScore';
import ColorSwatch from './ColorSwatch';

export const StylistResults = ({
  outfits = [],
  onSaveOutfit,
  onMarkWorn,
  onOpenStudioWithOutfit,
  onReset,
}) => {
  if (!outfits || outfits.length === 0) return null;

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#F5DABF] pb-6 text-center md:text-left">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#6C151E] font-bold">
            Tailored Recommendations
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#0A2E2C] mt-1">
            Generated Outfits ({outfits.length})
          </h2>
          <p className="text-xs text-[#0A2E2C]/70 font-medium mt-1">
            Intelligently curated for color harmony, weather suitability, and occasion context.
          </p>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-5 py-2.5 rounded-xl border border-[#F5DABF] bg-white text-xs font-bold text-[#0A2E2C] hover:bg-[#FAF4ED] transition-colors shadow-xs"
          >
            Adjust Preferences
          </button>
        )}
      </div>

      {/* Outfits List */}
      <div className="space-y-8">
        {outfits.map((outfit, index) => {
          const garments = outfit.items || outfit.garmentIds || outfit.garments || [];
          const topItem = garments.find((g) => g.category === 'Tops') || garments[0];
          const bottomItem = garments.find((g) => g.category === 'Bottoms') || garments[1];
          const finalScore = outfit.finalScore || outfit.score || 88;
          const colorScore = outfit.colorScore || 90;

          return (
            <motion.div
              key={outfit.id || outfit._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className="bg-white rounded-3xl border border-[#F5DABF] shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Left Column: Garment Image Cards Grid */}
              <div className="lg:col-span-6 bg-[#FAF4ED] p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#F5DABF]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0F3D3A]">
                    OUTFIT 0{index + 1}
                  </span>
                  <span className="text-xs text-[#6C151E] font-bold font-mono">
                    {garments.length} Items
                  </span>
                </div>

                {/* Garments Images Row / Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-auto">
                  {garments.map((item, gIdx) => (
                    <div
                      key={item._id || gIdx}
                      className="group relative rounded-2xl overflow-hidden bg-white border border-[#F5DABF] aspect-3/4 shadow-xs"
                    >
                      <img
                        src={item.imageUrl || item.image}
                        alt={item.title || item.garmentType}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-[#0A2E2C]/80 backdrop-blur-xs p-1.5 text-center">
                        <span className="text-[10px] font-bold text-[#FAF4ED] block truncate">
                          {item.title || item.garmentType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* COLOR MATCHING VISUALIZATION */}
                {topItem && bottomItem && (
                  <div className="mt-6 pt-4 border-t border-[#F5DABF] bg-white p-3.5 rounded-2xl border border-[#F5DABF]">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0A2E2C] mb-2">
                      <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                        <ColorSwatch colorName={topItem.primaryColor} size="sm" showLabel={false} />
                        <span className="truncate">{topItem.garmentType || 'Top'}</span>
                        <span className="text-[#6C151E] font-bold">+</span>
                        <ColorSwatch colorName={bottomItem.primaryColor} size="sm" showLabel={false} />
                        <span className="truncate">{bottomItem.garmentType || 'Bottom'}</span>
                      </div>
                      <span className="text-[#0F3D3A] font-mono font-bold">{Math.round(colorScore)}%</span>
                    </div>

                    <div className="w-full bg-[#F5DABF]/50 h-2.5 rounded-full overflow-hidden border border-[#F5DABF]">
                      <div
                        className="bg-[#0F3D3A] h-full rounded-full transition-all duration-500"
                        style={{ width: `${colorScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#6C151E] mt-1.5 font-bold italic">
                      {colorScore >= 90 ? '✦ Excellent Color Harmony' : '✦ Strong Color Complementarity'}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Score Breakdown & AI Explanation */}
              <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <MatchScore
                    score={finalScore}
                    label="Overall Compatibility"
                    showBreakdown={true}
                    breakdown={{
                      colorScore: outfit.colorScore || colorScore,
                      styleScore: outfit.styleScore || 85,
                      occasionScore: outfit.occasionScore || 90,
                      weatherScore: outfit.weatherScore || 88,
                    }}
                  />

                  {/* AI Explanation Box */}
                  <div className="mt-6 p-4 rounded-2xl bg-[#FAF4ED] border border-[#F5DABF] space-y-2">
                    <span className="text-xs font-bold text-[#6C151E] uppercase tracking-wider block">
                      Why this works
                    </span>
                    <p className="text-xs text-[#0A2E2C] leading-relaxed italic font-medium">
                      "{outfit.explanation || outfit.reason || 'The clean lines and complementary tones balance warmth and elegance for your chosen occasion.'}"
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onSaveOutfit && onSaveOutfit(outfit)}
                      className="py-3 px-4 bg-[#0F3D3A] hover:bg-[#0A2E2C] text-[#FAF4ED] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <BookmarkPlus className="w-4 h-4 text-[#F5DABF]" />
                      Save Outfit
                    </button>

                    <button
                      type="button"
                      onClick={() => onMarkWorn && onMarkWorn(outfit)}
                      className="py-3 px-4 bg-[#FAF4ED] border border-[#F5DABF] hover:bg-[#F5DABF]/50 text-[#0A2E2C] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 text-[#0F3D3A]" />
                      Mark Worn
                    </button>
                  </div>

                  {onOpenStudioWithOutfit && (
                    <button
                      type="button"
                      onClick={() => onOpenStudioWithOutfit(outfit)}
                      className="w-full py-2.5 px-4 bg-white border border-[#F5DABF] text-[#0A2E2C] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#FAF4ED] transition-colors flex items-center justify-center gap-2"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#6C151E]" />
                      Customize in Outfit Studio
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StylistResults;
