import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Sparkles } from 'lucide-react';
import ColorSwatch from './ColorSwatch';

export const WardrobeCard = ({
  item,
  onSelect,
  onEdit,
  onDelete,
  onStyleWithItem,
}) => {
  if (!item) return null;

  const timesWorn = item.timesWorn || 0;
  const utilizationColor =
    timesWorn === 0
      ? 'bg-[#6C151E] text-[#FAF4ED] border-[#6C151E]'
      : timesWorn < 3
      ? 'bg-[#0F3D3A] text-[#FAF4ED] border-[#0F3D3A]'
      : 'bg-[#0A2E2C] text-[#F5DABF] border-[#0A2E2C]';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-3xl bg-white border border-[#F5DABF] shadow-sm hover:shadow-xl overflow-hidden flex flex-col justify-between"
    >
      {/* Image Container */}
      <div
        onClick={() => onSelect && onSelect(item)}
        className="relative aspect-3/4 bg-[#FAF4ED] overflow-hidden cursor-pointer border-b border-[#F5DABF]/50"
      >
        <img
          src={item.imageUrl || item.image}
          alt={item.title || item.garmentType}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#0A2E2C]/90 text-[#FAF4ED] backdrop-blur-md">
            {item.category || item.type || 'Garment'}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${utilizationColor}`}
          >
            {timesWorn} {timesWorn === 1 ? 'wear' : 'wears'}
          </span>
        </div>

        {/* Hover Quick Actions overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A2E2C]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onStyleWithItem) onStyleWithItem(item);
            }}
            className="px-3.5 py-1.5 bg-[#F5DABF] text-[#0A2E2C] text-xs font-bold rounded-xl shadow-md hover:bg-white transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6C151E]" />
            Style This
          </button>
          <div className="flex gap-1.5">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="p-2 bg-[#FAF4ED] hover:bg-white text-[#0A2E2C] rounded-xl text-xs transition-colors shadow-xs"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                className="p-2 bg-[#6C151E] hover:bg-[#541017] text-[#FAF4ED] rounded-xl text-xs transition-colors shadow-xs"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Meta */}
      <div
        onClick={() => onSelect && onSelect(item)}
        className="p-4 cursor-pointer space-y-2"
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-serif text-base font-bold text-[#0A2E2C] truncate">
            {item.title || `${item.primaryColor || ''} ${item.garmentType || 'Item'}`.trim()}
          </h4>
          <span className="text-[10px] text-[#6C151E] uppercase tracking-widest font-mono font-bold flex-shrink-0">
            {item.style || 'Casual'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[#0A2E2C]/80">
          <ColorSwatch colorName={item.primaryColor} size="sm" />
          <span className="text-[11px] truncate max-w-[100px] font-semibold text-[#0A2E2C]/70">
            {item.material || item.pattern || ''}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default WardrobeCard;
