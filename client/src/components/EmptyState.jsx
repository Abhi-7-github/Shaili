import React from 'react';
import { Shirt, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmptyState = ({
  title = 'Your wardrobe is waiting.',
  description = 'Upload your first piece and let ShAili start styling.',
  actionLabel,
  onAction,
  icon: Icon = Shirt,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-3xl border border-[#F5DABF] bg-[#FAF4ED] shadow-sm max-w-lg mx-auto my-8"
    >
      <div className="w-14 h-14 rounded-full bg-[#0F3D3A] text-[#FAF4ED] flex items-center justify-center mb-4 shadow-sm border border-[#F5DABF]/50">
        <Icon className="w-7 h-7 text-[#F5DABF]" />
      </div>
      <h3 className="font-serif text-2xl font-bold text-[#0A2E2C] mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-[#0A2E2C]/80 mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-[#0F3D3A] hover:bg-[#0A2E2C] text-[#FAF4ED] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-[#F5DABF]" />
          <span>{actionLabel}</span>
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
