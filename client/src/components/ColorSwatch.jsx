import React from 'react';

const COLOR_HEX_MAP = {
  white: '#FAF4ED',
  black: '#0A2E2C',
  blue: '#1E3A8A',
  navy: '#0F172A',
  green: '#0F3D3A',
  darkgreen: '#0A2E2C',
  brown: '#4A2810',
  beige: '#F5DABF',
  grey: '#5C544D',
  gray: '#5C544D',
  red: '#6C151E',
  burgundy: '#6C151E',
  yellow: '#D97706',
  pink: '#9D174D',
  purple: '#581C87',
  orange: '#C2410C',
  ivory: '#FAF4ED',
};

export const ColorSwatch = ({ colorName = '', hexCode = '', size = 'md', showLabel = true }) => {
  const normalizedColor = (colorName || '').toLowerCase().trim();
  const hex = hexCode || COLOR_HEX_MAP[normalizedColor] || '#0F3D3A';

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-6 h-6',
  };

  const borderClass =
    normalizedColor === 'white' || normalizedColor === 'ivory' || hex === '#FAF4ED'
      ? 'border border-[#6C151E]/30'
      : 'border border-[#F5DABF]/40';

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`rounded-full shadow-xs ${sizeClasses[size] || sizeClasses.md} ${borderClass} flex-shrink-0`}
        style={{ backgroundColor: hex }}
        title={colorName || hex}
      />
      {showLabel && colorName && (
        <span className="text-xs font-semibold capitalize text-[#0A2E2C]">
          {colorName}
        </span>
      )}
    </div>
  );
};

export default ColorSwatch;
