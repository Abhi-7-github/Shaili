import React from 'react';
import { motion } from 'framer-motion';

export const MatchScore = ({
  score = 0,
  label = 'Overall Match',
  showBreakdown = false,
  breakdown = null,
  size = 'md',
}) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

  let badgeBg = 'bg-[#0F3D3A] text-[#FAF4ED]';
  let barBg = 'bg-[#0F3D3A]';

  if (normalizedScore >= 85) {
    badgeBg = 'bg-[#0F3D3A] text-[#FAF4ED]';
    barBg = 'bg-[#0F3D3A]';
  } else if (normalizedScore >= 70) {
    badgeBg = 'bg-[#6C151E] text-[#FAF4ED]';
    barBg = 'bg-[#6C151E]';
  } else {
    badgeBg = 'bg-[#0A2E2C] text-[#F5DABF]';
    barBg = 'bg-[#0A2E2C]';
  }

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[#0A2E2C]">
          {label}
        </span>
        <span
          className={`px-3 py-0.5 rounded-full text-xs font-bold font-mono tracking-tight shadow-xs ${badgeBg}`}
        >
          {normalizedScore}%
        </span>
      </div>

      {/* Main Score Bar */}
      <div className="w-full bg-[#F5DABF]/50 rounded-full h-2.5 overflow-hidden border border-[#F5DABF]">
        <motion.div
          className={`h-full rounded-full ${barBg}`}
          initial={{ width: 0 }}
          animate={{ width: `${normalizedScore}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Breakdown Metrics */}
      {showBreakdown && breakdown && (
        <div className="pt-3 grid grid-cols-2 gap-x-5 gap-y-3 text-xs">
          {breakdown.colorScore !== undefined && (
            <div>
              <div className="flex justify-between text-[#0A2E2C] mb-1 font-medium">
                <span>Color Match</span>
                <span className="font-mono font-bold">{Math.round(breakdown.colorScore)}%</span>
              </div>
              <div className="w-full bg-[#F5DABF]/40 h-2 rounded-full overflow-hidden border border-[#F5DABF]/60">
                <div
                  className="bg-[#0F3D3A] h-full rounded-full"
                  style={{ width: `${breakdown.colorScore}%` }}
                />
              </div>
            </div>
          )}

          {breakdown.styleScore !== undefined && (
            <div>
              <div className="flex justify-between text-[#0A2E2C] mb-1 font-medium">
                <span>Style Match</span>
                <span className="font-mono font-bold">{Math.round(breakdown.styleScore)}%</span>
              </div>
              <div className="w-full bg-[#F5DABF]/40 h-2 rounded-full overflow-hidden border border-[#F5DABF]/60">
                <div
                  className="bg-[#6C151E] h-full rounded-full"
                  style={{ width: `${breakdown.styleScore}%` }}
                />
              </div>
            </div>
          )}

          {breakdown.occasionScore !== undefined && (
            <div>
              <div className="flex justify-between text-[#0A2E2C] mb-1 font-medium">
                <span>Occasion</span>
                <span className="font-mono font-bold">{Math.round(breakdown.occasionScore)}%</span>
              </div>
              <div className="w-full bg-[#F5DABF]/40 h-2 rounded-full overflow-hidden border border-[#F5DABF]/60">
                <div
                  className="bg-[#0A2E2C] h-full rounded-full"
                  style={{ width: `${breakdown.occasionScore}%` }}
                />
              </div>
            </div>
          )}

          {breakdown.weatherScore !== undefined && (
            <div>
              <div className="flex justify-between text-[#0A2E2C] mb-1 font-medium">
                <span>Weather</span>
                <span className="font-mono font-bold">{Math.round(breakdown.weatherScore)}%</span>
              </div>
              <div className="w-full bg-[#F5DABF]/40 h-2 rounded-full overflow-hidden border border-[#F5DABF]/60">
                <div
                  className="bg-[#6C151E] h-full rounded-full"
                  style={{ width: `${breakdown.weatherScore}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchScore;
