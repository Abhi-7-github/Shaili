import React from 'react';
import { ArrowRight } from 'lucide-react';

export const AnimatedCTA = ({ onClick, text = "EXPLORE YOUR STYLE →", subtitle = "Click to unlock your intelligent closet" }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="inline-block relative z-30">
        <button
          onClick={onClick}
          className="relative px-7 py-3.5 rounded-[12px] font-mono text-xs sm:text-sm tracking-widest uppercase font-semibold text-[#F5DABF] bg-[#6C151E] border border-[#F5DABF]/30 shadow-md flex items-center gap-3.5 cursor-pointer"
        >
          <span className="relative z-10 font-bold tracking-widest text-[#F5DABF]">
            {text}
          </span>

          {/* Arrow Container */}
          <div className="relative z-10 w-7 h-7 rounded-[8px] bg-[#F5DABF]/20 flex items-center justify-center text-[#F5DABF]">
            <ArrowRight className="w-3.5 h-3.5 text-[#F5DABF]" />
          </div>
        </button>
      </div>

      {/* Supporting Subtext */}
      {subtitle && (
        <p className="mt-3 text-center text-xs font-sans tracking-wide text-[#81766D]">
          {subtitle}
        </p>
      )}
    </div>
  );
};
