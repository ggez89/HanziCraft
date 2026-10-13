import React from 'react';
import { StrokeData, StrokeStyle } from '../types';
import { medianToSvgPath } from '../utils/strokeService';

interface StrokeOrderDiagramProps {
  strokeData?: StrokeData | null;
  strokeStyle?: StrokeStyle;
  sizePx?: number;
}

export const StrokeOrderDiagram: React.FC<StrokeOrderDiagramProps> = ({
  strokeData,
  strokeStyle = 'kaiti',
  sizePx = 18,
}) => {
  if (!strokeData || !strokeData.strokes || strokeData.strokes.length === 0) {
    return null;
  }

  const strokes = strokeData.strokes;
  const medians = strokeData.medians || [];
  const isSansSerif = strokeStyle === 'heiti' && medians.length === strokes.length;

  return (
    <div className="flex items-center gap-1.5 ml-2">
      {strokes.map((_, stepIdx) => {
        const activeIdx = stepIdx;

        return (
          <div
            key={stepIdx}
            style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
            className="inline-flex items-center justify-center shrink-0"
            title={`Step ${stepIdx + 1} of ${strokes.length}`}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full" style={{ display: 'block' }}>
              {isSansSerif ? (
                // Sans-Serif (黑体): Centerline median paths with uniform stroke widths & rounded caps
                <g
                  transform="translate(12, 87) scale(0.074, -0.074)"
                  strokeWidth="62"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                >
                  {/* Previous completed strokes in dark black */}
                  {medians.slice(0, activeIdx).map((m, prevIdx) => (
                    <path key={prevIdx} d={medianToSvgPath(m)} stroke="#0f172a" />
                  ))}
                  {/* Newly added stroke in RED */}
                  {medians[activeIdx] && (
                    <path d={medianToSvgPath(medians[activeIdx])} stroke="#dc2626" />
                  )}
                </g>
              ) : (
                // Brush / Calligraphy (楷体): Traditional brush strokes with tapers and flairs
                <g transform="translate(12, 87) scale(0.074, -0.074)">
                  {/* Previous completed strokes in dark black */}
                  {strokes.slice(0, activeIdx).map((s, prevIdx) => (
                    <path key={prevIdx} d={s} fill="#0f172a" />
                  ))}
                  {/* Newly added stroke in RED */}
                  <path d={strokes[activeIdx]} fill="#dc2626" />
                </g>
              )}
            </svg>
          </div>
        );
      })}
    </div>
  );
};
