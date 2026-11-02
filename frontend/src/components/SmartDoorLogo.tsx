import React from 'react';

interface SmartDoorLogoProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
}

export const SmartDoorLogo: React.FC<SmartDoorLogoProps> = ({
  size = 24,
  className = '',
  showGlow = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`smartdoor-logo-icon ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Soft Warm Spill */}
        <linearGradient id="logoSpill" x1="11" y1="10" x2="26" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff8db" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#f7cb63" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#e8a838" stopOpacity="0.1" />
        </linearGradient>

        {/* Door Leaf gradient */}
        <linearGradient id="logoDoor" x1="9" y1="9" x2="17" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7e9c70" />
          <stop offset="100%" stopColor="#557347" />
        </linearGradient>
      </defs>

      {/* Warm Ambient Spill through door opening */}
      <polygon points="11,8 25,5 27,27 11,25" fill="url(#logoSpill)" />

      {/* Interior Door Cavity Shadow */}
      <rect x="10" y="7" width="12" height="19" rx="1" fill="#182315" fillOpacity="0.7" />

      {/* Open Door Leaf in 3D perspective */}
      <polygon
        points="10,7 17,9 17,24 10,26"
        fill="url(#logoDoor)"
        stroke="#334b29"
        strokeWidth="0.8"
      />

      {/* Brass Door Knob */}
      <circle cx="16" cy="17" r="0.9" fill="#ffeaa7" />

      {/* Architectural Door Outer Frame */}
      <rect
        x="8.5"
        y="6"
        width="15"
        height="21"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* Threshold / Sill */}
      <line
        x1="7"
        y1="27"
        x2="25"
        y2="27"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Overhead Smart Light Fixture */}
      <circle cx="16" cy="3.5" r="1.2" fill="#f5c862" />
      {showGlow && (
        <circle cx="16" cy="3.5" r="3" stroke="#f5c862" strokeWidth="0.6" strokeDasharray="1 1" />
      )}

      {/* IoT Wi-Fi Signal Arc */}
      <path
        d="M 21 9 A 3.5 3.5 0 0 1 24.5 12.5"
        stroke="#f5c862"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default SmartDoorLogo;
