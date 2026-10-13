import React from 'react';

interface HanziLogoProps {
  size?: number;
  className?: string;
}

export const HanziLogo: React.FC<HanziLogoProps> = ({ size = 34, className = '' }) => {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`rounded-[7px] bg-[#e60012] flex items-center justify-center shrink-0 shadow-2xs select-none ${className}`}
    >
      <span
        style={{ fontSize: `${Math.round(size * 0.65)}px`, lineHeight: 1 }}
        className="font-bold text-white font-heiti tracking-normal"
      >
        字
      </span>
    </div>
  );
};
