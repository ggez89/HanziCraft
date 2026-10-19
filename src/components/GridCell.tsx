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
  // Laser-printer optimized crisp guidelines colors (high-contrast for sharp printing)
  const innerLineColor = '#334155'; // Slate-700: strong, crisp dashed cross guidelines
  const diagonalLineColor = '#64748b'; // Slate-500: clear, visible diagonal balance lines
  const outerBorderColor = '#000000'; // Pure black: solid, razor-sharp outer box border

  // Character rendering styles (optimized for laser printers with clear tracing contrast)
  const isTrace = mode === 'trace';
  const charFill = isTrace ? '#334155' : '#000000';
  const charOpacity = isTrace ? 0.72 : 1;

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
          x="0.75"
          y="0.75"
          width="98.5"
          height="98.5"
          fill="#ffffff"
          stroke={outerBorderColor}
          strokeWidth="1.5"
        />

        {/* Inner Mizige / Tianzige guidelines */}
        {showGridlines && (
          <g>
            {/* Diagonal guidelines */}
            <line x1="1" y1="1" x2="99" y2="99" stroke={diagonalLineColor} strokeWidth="0.95" />
            <line x1="99" y1="1" x2="1" y2="99" stroke={diagonalLineColor} strokeWidth="0.95" />

            {/* Cross guidelines */}
            <line x1="50" y1="1" x2="50" y2="99" stroke={innerLineColor} strokeWidth="1.15" strokeDasharray="4,2.5" />
            <line x1="1" y1="50" x2="99" y2="50" stroke={innerLineColor} strokeWidth="1.15" strokeDasharray="4,2.5" />
          </g>
        )}

        {/* Character overlay - perfectly centered horizontally and vertically at (50, 50) with 8% margins */}
        {mode !== 'empty' && char && (
          <>
            {strokeData && strokeStyle === 'kaiti' ? (
              // Authentic Calligraphy / Brush strokes - centered on (50, 50) with equal 8% margins
              <g
                transform="translate(7.5, 83.6) scale(0.083, -0.083)"
                fill={charFill}
                opacity={charOpacity}
              >
                {strokeData.strokes.map((pathD, idx) => (
                  <path key={idx} d={pathD} />
                ))}
              </g>
            ) : (
              // Clean Sans-Serif Typography - centered on (50, 50) with equal 8% margins
              <text
                x="50"
                y="46"
                dominantBaseline="central"
                textAnchor="middle"
                fontSize="80"
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
