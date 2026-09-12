/**
 * Color Detection & Normalization Service for ShAili
 * Handles RGB/HEX to HSL conversion, color family normalization, and color harmony calculations.
 */

// Normalized mapping dictionary for clothing colors
const COLOR_MAPPING = {
  // Whites / Creams
  white: { primaryColor: 'white', colorFamily: 'white', hex: '#FFFFFF', h: 0, s: 0, l: 100 },
  offwhite: { primaryColor: 'cream', colorFamily: 'white', hex: '#FAF9F6', h: 40, s: 20, l: 97 },
  cream: { primaryColor: 'cream', colorFamily: 'white', hex: '#FFFDD0', h: 57, s: 100, l: 91 },
  ivory: { primaryColor: 'cream', colorFamily: 'white', hex: '#FFFFF0', h: 60, s: 100, l: 97 },
  beige: { primaryColor: 'beige', colorFamily: 'brown', hex: '#F5F5DC', h: 60, s: 56, l: 91 },

  // Blacks / Greys
  black: { primaryColor: 'black', colorFamily: 'black', hex: '#111111', h: 0, s: 0, l: 7 },
  charcoal: { primaryColor: 'black', colorFamily: 'black', hex: '#36454F', h: 204, s: 19, l: 26 },
  grey: { primaryColor: 'grey', colorFamily: 'grey', hex: '#808080', h: 0, s: 0, l: 50 },
  gray: { primaryColor: 'grey', colorFamily: 'grey', hex: '#808080', h: 0, s: 0, l: 50 },
  silver: { primaryColor: 'grey', colorFamily: 'grey', hex: '#C0C0C0', h: 0, s: 0, l: 75 },

  // Blues / Navy
  navy: { primaryColor: 'navy', colorFamily: 'blue', hex: '#000080', h: 240, s: 100, l: 25 },
  'navy blue': { primaryColor: 'navy', colorFamily: 'blue', hex: '#000080', h: 240, s: 100, l: 25 },
  'dark blue': { primaryColor: 'navy', colorFamily: 'blue', hex: '#00008B', h: 240, s: 100, l: 27 },
  blue: { primaryColor: 'blue', colorFamily: 'blue', hex: '#0000FF', h: 240, s: 100, l: 50 },
  'light blue': { primaryColor: 'blue', colorFamily: 'blue', hex: '#ADD8E6', h: 195, s: 53, l: 79 },
  sky: { primaryColor: 'blue', colorFamily: 'blue', hex: '#87CEEB', h: 197, s: 71, l: 73 },
  cyan: { primaryColor: 'blue', colorFamily: 'blue', hex: '#00FFFF', h: 180, s: 100, l: 50 },
  teal: { primaryColor: 'green', colorFamily: 'green', hex: '#008080', h: 180, s: 100, l: 25 },

  // Reds / Burgundies
  red: { primaryColor: 'red', colorFamily: 'red', hex: '#FF0000', h: 0, s: 100, l: 50 },
  maroon: { primaryColor: 'burgundy', colorFamily: 'red', hex: '#800000', h: 0, s: 100, l: 25 },
  burgundy: { primaryColor: 'burgundy', colorFamily: 'red', hex: '#800020', h: 345, s: 100, l: 25 },
  wine: { primaryColor: 'burgundy', colorFamily: 'red', hex: '#722F37', h: 353, s: 42, l: 32 },

  // Greens
  green: { primaryColor: 'green', colorFamily: 'green', hex: '#008000', h: 120, s: 100, l: 25 },
  olive: { primaryColor: 'green', colorFamily: 'green', hex: '#808000', h: 60, s: 100, l: 25 },
  'forest green': { primaryColor: 'green', colorFamily: 'green', hex: '#228B22', h: 120, s: 61, l: 34 },
  mint: { primaryColor: 'green', colorFamily: 'green', hex: '#98FF98', h: 120, s: 100, l: 80 },

  // Browns / Tans
  brown: { primaryColor: 'brown', colorFamily: 'brown', hex: '#964B00', h: 30, s: 100, l: 29 },
  tan: { primaryColor: 'brown', colorFamily: 'brown', hex: '#D2B48C', h: 34, s: 44, l: 69 },
  khaki: { primaryColor: 'beige', colorFamily: 'brown', hex: '#C3B091', h: 37, s: 30, l: 67 },
  camel: { primaryColor: 'brown', colorFamily: 'brown', hex: '#C19A6B', h: 33, s: 44, l: 59 },

  // Pinks / Purples
  pink: { primaryColor: 'pink', colorFamily: 'pink', hex: '#FFC0CB', h: 350, s: 100, l: 88 },
  rose: { primaryColor: 'pink', colorFamily: 'pink', hex: '#FF007F', h: 330, s: 100, l: 50 },
  purple: { primaryColor: 'purple', colorFamily: 'purple', hex: '#800080', h: 300, s: 100, l: 25 },
  lavender: { primaryColor: 'purple', colorFamily: 'purple', hex: '#E6E6FA', h: 240, s: 67, l: 94 },

  // Yellows / Oranges
  yellow: { primaryColor: 'yellow', colorFamily: 'yellow', hex: '#FFFF00', h: 60, s: 100, l: 50 },
  mustard: { primaryColor: 'yellow', colorFamily: 'yellow', hex: '#FFDB58', h: 47, s: 100, l: 67 },
  gold: { primaryColor: 'yellow', colorFamily: 'yellow', hex: '#FFD700', h: 51, s: 100, l: 50 },
  orange: { primaryColor: 'orange', colorFamily: 'orange', hex: '#FFA500', h: 39, s: 100, l: 50 },
  peach: { primaryColor: 'orange', colorFamily: 'orange', hex: '#FFDAB9', h: 28, s: 100, l: 86 },
};

/**
 * Converts Hex string to HSL object
 * @param {string} hex - Hex color string
 * @returns {{ h: number, s: number, l: number }}
 */
const hexToHsl = (hex) => {
  if (!hex) return { h: 0, s: 0, l: 50 };
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((char) => char + char).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return { h: 0, s: 0, l: 50 };

  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

/**
 * Normalizes any input color string to standardized ShAili color metadata
 * @param {string} colorName - Input color string (e.g., "dark blue", "navy", "#1F3A5F")
 * @returns {{ primaryColor: string, secondaryColor: string, colorFamily: string, hex: string, hue: number, saturation: number, lightness: number }}
 */
const normalizeColor = (colorName = 'blue', secondaryInput = '') => {
  const cleanStr = String(colorName || '').trim().toLowerCase();
  const matched = COLOR_MAPPING[cleanStr];

  if (matched) {
    return {
      primaryColor: matched.primaryColor,
      secondaryColor: secondaryInput || '',
      colorFamily: matched.colorFamily,
      hex: matched.hex,
      hue: matched.h,
      saturation: matched.s,
      lightness: matched.l,
    };
  }

  // If input is hex string
  if (cleanStr.startsWith('#')) {
    const hsl = hexToHsl(cleanStr);
    let family = 'grey';
    if (hsl.l > 90) family = 'white';
    else if (hsl.l < 15) family = 'black';
    else if (hsl.s < 15) family = 'grey';
    else if (hsl.h < 30 || hsl.h >= 340) family = 'red';
    else if (hsl.h < 45) family = 'orange';
    else if (hsl.h < 70) family = 'yellow';
    else if (hsl.h < 165) family = 'green';
    else if (hsl.h < 260) family = 'blue';
    else if (hsl.h < 315) family = 'purple';
    else family = 'pink';

    return {
      primaryColor: family,
      secondaryColor: secondaryInput || '',
      colorFamily: family,
      hex: cleanStr.toUpperCase(),
      hue: hsl.h,
      saturation: hsl.s,
      lightness: hsl.l,
    };
  }

  // Substring search fallback
  for (const [key, meta] of Object.entries(COLOR_MAPPING)) {
    if (cleanStr.includes(key)) {
      return {
        primaryColor: meta.primaryColor,
        secondaryColor: secondaryInput || '',
        colorFamily: meta.colorFamily,
        hex: meta.hex,
        hue: meta.h,
        saturation: meta.s,
        lightness: meta.l,
      };
    }
  }

  // Default fallback
  const defaultHsl = hexToHsl('#808080');
  return {
    primaryColor: 'grey',
    secondaryColor: secondaryInput || '',
    colorFamily: 'grey',
    hex: '#808080',
    hue: defaultHsl.h,
    saturation: defaultHsl.s,
    lightness: defaultHsl.l,
  };
};

module.exports = {
  COLOR_MAPPING,
  hexToHsl,
  normalizeColor,
};
