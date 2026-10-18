import React from 'react';
import { StrokeData, StrokeStyle } from '../types';
import { medianToSvgPath } from '../utils/strokeService';

interface StrokeOrderDiagramProps {
  strokeData?: StrokeData | null;
  strokeStyle?: StrokeStyle;
  sizePx?: number;
  maxWidthPx?: number;
}

export const StrokeOrderDiagram: React.FC<StrokeOrderDiagramProps> = ({
  strokeData,
  strokeStyle = 'kaiti',
  sizePx = 24,
  maxWidthPx = 580,
}) => {
  if (!strokeData || !strokeData.strokes || strokeData.strokes.length === 0) {
    return null;
  }

  const strokes = strokeData.strokes;
  const medians = strokeData.medians || [];
  const isSansSerif = strokeStyle === 'heiti' && medians.length === strokes.length;

  // Dynamic fitting: ensure even complex characters (15-20+ strokes) fit on the row without overflow
  const count = strokes.length;
  const gapPx = count > 12 ? 2 : 3;
  const totalNeeded = count * sizePx + (count - 1) * gapPx;
  const actualSizePx = totalNeeded > maxWidthPx
    ? Math.max(16, Math.floor((maxWidthPx - (count - 1) * gapPx) / count))
    : sizePx;

  return (
    <div
      style={{ gap: `${gapPx}px` }}
      className="flex items-center ml-2.5 shrink-0 select-none"
    >
      {strokes.map((_, stepIdx) => {
        const activeIdx = stepIdx;

        return (
          <div
            key={stepIdx}
            style={{ width: `${actualSizePx}px`, height: `${actualSizePx}px` }}
            className="inline-flex items-center justify-center shrink-0 border border-stone-300/80 rounded-[3px] bg-white p-0.5 shadow-3xs"
            title={`Step ${stepIdx + 1} of ${strokes.length}`}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full" style={{ display: 'block' }}>
              {isSansSerif ? (
                // Sans-Serif (黑体): Centerline median paths with uniform stroke widths & rounded caps
                <g
                  transform="translate(12, 87) scale(0.074, -0.074)"
                  strokeWidth="68"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                >
                  {/* Previous completed strokes in dark black */}
                  {medians.slice(0, activeIdx).map((m, prevIdx) => (
                    <path key={prevIdx} d={medianToSvgPath(m)} stroke="#0f172a" />
                  ))}
                  {/* Newly added stroke in vibrant red */}
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
                  {/* Newly added stroke in vibrant red */}
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
