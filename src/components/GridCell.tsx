import React from 'react';
import { StrokeStyle, StrokeData } from '../types';

interface GridCellProps {
  char?: string;
  strokeData?: StrokeData | null;
  strokeStyle: StrokeStyle;
  showGridlines: boolean;
  mode: 'model' | 'trace' | 'empty';
  sizePx?: number;
  className?: string;
  onClick?: () => void;
}

export const GridCell: React.FC<GridCellProps> = ({
  char,
  strokeData,
  strokeStyle,
  showGridlines,
  mode,
  sizePx = 58,
  className = '',
  onClick,
}) => {
  // Inner guidelines colors
  const innerLineColor = '#94a3b8';
  const diagonalLineColor = '#cbd5e1';
  const outerBorderColor = '#475569';

  // Character rendering styles
  const isTrace = mode === 'trace';
  const charFill = isTrace ? '#94a3b8' : '#0f172a';
  const charOpacity = isTrace ? 0.32 : 1;

  return (
    <div
      onClick={onClick}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none bg-white ${
        onClick ? 'cursor-pointer hover:bg-slate-50/60' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ display: 'block' }}
      >
        {/* Solid Pure White Background & Crisp Outer Border */}
        <rect
          x="0.6"
          y="0.6"
          width="98.8"
          height="98.8"
          fill="#ffffff"
          stroke={outerBorderColor}
          strokeWidth="1.2"
        />

        {/* Inner Mizige / Tianzige guidelines */}
        {showGridlines && (
          <g>
            {/* Diagonal guidelines */}
            <line x1="1" y1="1" x2="99" y2="99" stroke={diagonalLineColor} strokeWidth="0.7" />
            <line x1="99" y1="1" x2="1" y2="99" stroke={diagonalLineColor} strokeWidth="0.7" />

            {/* Cross guidelines */}
            <line x1="50" y1="1" x2="50" y2="99" stroke={innerLineColor} strokeWidth="0.7" strokeDasharray="3,2" />
            <line x1="1" y1="50" x2="99" y2="50" stroke={innerLineColor} strokeWidth="0.7" strokeDasharray="3,2" />
          </g>
        )}

        {/* Character overlay */}
        {mode !== 'empty' && char && (
          <>
            {strokeData && strokeStyle === 'kaiti' ? (
              // Authentic Calligraphy / Brush strokes
              <g
                transform="translate(12, 87) scale(0.074, -0.074)"
                fill={charFill}
                opacity={charOpacity}
              >
                {strokeData.strokes.map((pathD, idx) => (
                  <path key={idx} d={pathD} />
                ))}
              </g>
            ) : (
              // Clean Sans-Serif Typography (solid, crisp, no scribbles)
              <text
                x="50"
                y="54"
                dominantBaseline="central"
                textAnchor="middle"
                fontSize="68"
                fill={charFill}
                opacity={charOpacity}
                className="font-heiti font-normal"
              >
                {char}
              </text>
            )}
          </>
        )}
      </svg>
    </div>
  );
};
