import React from 'react';

export const Logo = ({ variant = 'light', showTagline = false, size = 'medium', className = '' }) => {
  const isDark = variant === 'dark';

  // Color palette matching the exact artwork: Dark Forest Green / Deep Burgundy / Muted Gold
  const tealColor = isDark ? '#FAF4ED' : '#0F3D3A';
  const burgundyColor = isDark ? '#F5969E' : '#6C151E';
  const goldColor = isDark ? '#F5DABF' : '#A67C46';
  const lineGold = isDark ? 'rgba(245, 218, 191, 0.4)' : 'rgba(166, 124, 70, 0.45)';

  // Responsive size mapping
  const heightClass = size === 'small' ? 'h-9 sm:h-10' : size === 'large' ? 'h-24 sm:h-28' : 'h-14 sm:h-16';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* 100% Pure Vector SVG Logo (Matches reference artwork without raster PNG images) */}
      <svg
        viewBox="0 0 540 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-auto ${heightClass} overflow-visible`}
      >
        {/* Sh - Calligraphic Dark Green Script */}
        <g id="Sh-text">
          {/* Sweeping calligraphic S loop */}
          <path
            d="M 145 68 C 110 58 82 82 82 108 C 82 135 115 145 152 142 C 188 139 205 125 215 105 C 228 78 212 42 178 48 C 145 54 112 88 102 125 C 92 162 118 178 155 174 C 188 171 210 155 220 140"
            stroke={tealColor}
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* h stem & cursive loop */}
          <path
            d="M 198 42 L 175 145 M 172 105 C 185 85 215 82 222 110 C 228 135 218 145 235 145"
            stroke={tealColor}
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* AI - Calligraphic Burgundy Lettering */}
        <g id="AI-text">
          {/* A left stem */}
          <path
            d="M 230 145 C 242 125 262 82 278 48 C 285 45 292 48 295 55 L 315 145"
            stroke={burgundyColor}
            strokeWidth="4.8"
            strokeLinecap="round"
            fill="none"
          />
          {/* A Crossbar swooping smoothly */}
          <path
            d="M 252 102 C 275 98 300 98 322 102"
            stroke={burgundyColor}
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          {/* I Capital Stem */}
          <path
            d="M 330 52 L 330 142"
            stroke={burgundyColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* I serifs */}
          <path
            d="M 318 52 H 342 M 318 142 H 342"
            stroke={burgundyColor}
            strokeWidth="3.6"
            strokeLinecap="round"
          />
        </g>

        {/* Golden Sweeping Under-Flourish Curve leading to Lotus */}
        <path
          d="M 178 145 C 190 178 260 185 340 170 C 385 162 410 152 438 132"
          stroke={goldColor}
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />

        {/* li - Calligraphic Dark Green Script */}
        <g id="li-text">
          {/* l loop */}
          <path
            d="M 348 142 L 372 45 C 372 45 352 82 368 142"
            stroke={tealColor}
            strokeWidth="4.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* i stem */}
          <path
            d="M 378 102 L 392 142 C 400 142 412 135 425 125"
            stroke={tealColor}
            strokeWidth="4.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* i dot */}
          <circle cx="383" cy="85" r="3.2" fill={tealColor} />
        </g>

        {/* Indian Heritage Lotus Blossom Motif at end of Gold Flourish */}
        <g id="Lotus-Motif" transform="translate(415, 105)">
          {/* Central main petal */}
          <path
            d="M 20 0 C 20 -15 12 -28 20 -38 C 28 -28 20 -15 20 0 Z"
            fill={burgundyColor}
          />
          {/* Inner Left petal */}
          <path
            d="M 18 -2 C 10 -14 0 -22 6 -32 C 14 -24 17 -10 18 -2 Z"
            fill={burgundyColor}
          />
          {/* Inner Right petal */}
          <path
            d="M 22 -2 C 30 -14 40 -22 34 -32 C 26 -24 23 -10 22 -2 Z"
            fill={burgundyColor}
          />
          {/* Outer Left petal */}
          <path
            d="M 16 -1 C 5 -8 -8 -12 -3 -20 C 6 -14 13 -5 16 -1 Z"
            fill={burgundyColor}
            opacity="0.9"
          />
          {/* Outer Right petal */}
          <path
            d="M 24 -1 C 35 -8 48 -12 43 -20 C 34 -14 27 -5 24 -1 Z"
            fill={burgundyColor}
            opacity="0.9"
          />
          {/* Lotus base gold accent curve */}
          <path
            d="M -5 4 C 10 12 30 12 45 4"
            stroke={goldColor}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Sub-tagline: "Where Indian Culture Meets AI in Fashion." */}
        {showTagline && (
          <g id="tagline-group">
            <text
              x="270"
              y="185"
              textAnchor="middle"
              fill={goldColor}
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="13"
              fontStyle="italic"
              letterSpacing="2.2"
            >
              Where Indian Culture Meets AI in Fashion.
            </text>

            {/* Bottom Ornamental Line with Diamond Star */}
            <line x1="170" y1="202" x2="245" y2="202" stroke={lineGold} strokeWidth="1" />
            <line x1="295" y1="202" x2="370" y2="202" stroke={lineGold} strokeWidth="1" />

            <circle cx="258" cy="202" r="1.5" fill={goldColor} />
            <polygon points="270,198 273.5,202 270,206 266.5,202" fill={burgundyColor} />
            <circle cx="282" cy="202" r="1.5" fill={goldColor} />
          </g>
        )}
      </svg>
    </div>
  );
};

export default Logo;

