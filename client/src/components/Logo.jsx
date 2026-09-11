import React from 'react';

export const Logo = ({ size = 'medium', className = '' }) => {
  return (
    <div className={`shaili-logo-container size-${size} ${className}`}>
      <svg
        className="shaili-logo-icon"
        viewBox="0 0 40 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Dark Slate Diamond */}
        <polygon
          points="20 4, 36 24, 20 44, 4 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Inner Orange Diamond */}
        <polygon
          points="20 11, 30 24, 20 37, 10 24"
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Center Dot */}
        <circle cx="20" cy="24" r="2.5" fill="var(--secondary)" />
      </svg>
      <div className="shaili-logo-text-group">
        <div className="shaili-brand-name">
          <span className="dark-letter">S</span>
          <span className="dark-letter">H</span>
          <span className="orange-letter">A</span>
          <span className="orange-letter">I</span>
          <span className="dark-letter">L</span>
          <span className="dark-letter">I</span>
        </div>
        <div className="shaili-tagline">HAUTE TECH &amp; STYLE</div>
      </div>
    </div>
  );
};
