import React from 'react';
import { CharacterItem, WorksheetSettings } from '../types';
import { GridCell } from './GridCell';
import { StrokeOrderDiagram } from './StrokeOrderDiagram';
import { HanziLogo } from './HanziLogo';

interface WorksheetPageProps {
  characters: CharacterItem[];
  settings: WorksheetSettings;
  pageIndex: number;
  totalPages: number;
  onCharacterClick?: (char: CharacterItem) => void;
}

// Custom modern SVG icon for "Website with mouse cursor" matching the screenshot exactly
const WebsiteGlobeCursorIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Globe circle and axes */}
    <circle cx="11" cy="11" r="8" />
    <path d="M3 11h16" />
    <path d="M11 3a13 13 0 0 1 0 16 13 13 0 0 1 0-16z" />
    {/* Modern Arrow Cursor */}
    <path
      d="M15 15l5.5 2-2 1.5 3 3-1.5 1.5-3-3-1.5 2L15 15z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

export const WorksheetPage: React.FC<WorksheetPageProps> = ({
  characters,
  settings,
  onCharacterClick,
}) => {
  // Available printable width (~186mm)
  const availableWidthMm = 186;
  const rawSize = settings.characterSizeMm || 18;
  
  // Total frames per row dynamically scales so it never overflows (at 18mm: 10 frames = 1 model + 9 practice)
  const totalSlots = rawSize === 18 ? 10 : Math.max(5, Math.floor(availableWidthMm / rawSize));
  const practiceSlots = totalSlots - 1;
  const faintTraceSlots = settings.faintTrace ? Math.min(4, Math.floor(practiceSlots / 2)) : 0;

  // Exact pixel size per square fitted across the available width
  const cellPx = Math.floor((availableWidthMm / totalSlots) * 3.78);

  // Maximum rows capacity per page without vertical clipping (10 rows fit comfortably at 18mm standard)
  const maxRowsPerPage = rawSize >= 22 ? 7 : (rawSize >= 20 ? 8 : 10);
  
  // Fill remaining capacity with empty practice grids so rows have normal spacing and no gaping empty gaps
  const emptyRowsCount = Math.max(0, maxRowsPerPage - characters.length);

  // Dynamic scaling proportional to the character size slider (14mm to 24mm, base 18mm)
  const sizeRatio = rawSize / 18;
  const pinyinFontSizePx = Math.max(11, Math.round(14 * sizeRatio));
  const strokeOrderSizePx = Math.max(16, Math.round(22 * sizeRatio));
  const infoLineHeightPx = Math.max(strokeOrderSizePx, pinyinFontSizePx + 4);
  const infoMarginBottomPx = Math.max(2, Math.round(3 * sizeRatio));
  const infoGapPx = Math.max(6, Math.round(10 * sizeRatio));

  // Title font dynamically matches selected style
  const titleFontClass = settings.strokeStyle === 'kaiti' ? 'font-kaiti' : 'font-heiti';

  return (
    <div className="print-container bg-white text-stone-900 shadow-xl border border-stone-200/90 rounded-sm mx-auto p-6 sm:p-7 mb-8 print:mb-0 print:border-none print:shadow-none print:rounded-none w-[210mm] min-h-[297mm] box-border relative flex flex-col justify-between select-none">
      <div className="flex-1 flex flex-col">
        {/* Page Header: Left-aligned Logo + Worksheet Title, with Name on right */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2 px-0.5">
            {/* Top Left: Logo + Worksheet Title (left-aligned together) */}
            <div className="flex items-center gap-2.5">
              <HanziLogo size={28} />
              <h1 className={`text-base sm:text-lg font-bold text-stone-900 tracking-wide ${titleFontClass}`}>
                {settings.title || '基础汉字书写练习'}
              </h1>
            </div>

            {/* Top Right: Student Name field */}
            <div className="text-xs sm:text-sm font-medium text-stone-900 text-right shrink-0">
              {settings.headerStudentName && (
                <span>
                  姓名：<span className="inline-block border-b border-stone-800 w-28 sm:w-36"></span>
                </span>
              )}
            </div>
          </div>

          {/* Solid black horizontal line across header */}
          <div className="border-b-2 border-stone-900 w-full" />
        </div>

        {/* Character Rows with normal whitespace */}
        <div className="flex-1 flex flex-col justify-between py-1">
          {/* 1. Rows with practice characters */}
          {characters.map((item) => {
            return (
              <div key={item.id} className="flex flex-col py-0.5">
                {/* Top info line: Pinyin on left in black, progressive strokes right next to it, scaled proportionally */}
                {(settings.pinyin || settings.strokeOrderBreakdown) && (
                  <div
                    style={{
                      height: `${infoLineHeightPx}px`,
                      marginBottom: `${infoMarginBottomPx}px`,
                      gap: `${infoGapPx}px`,
                    }}
                    className="flex items-center px-0.5"
                  >
                    {/* Tone-marked Pīnyīn in BLACK, scaled proportionally */}
                    {settings.pinyin && (
                      <span
                        style={{ fontSize: `${pinyinFontSizePx}px` }}
                        className="font-semibold text-stone-900 font-mono tracking-tight shrink-0 select-none leading-none"
                      >
                        {item.pinyin || ''}
                      </span>
                    )}

                    {/* Progressive Stroke Order Breakdown, scaled proportionally with character size */}
                    {settings.strokeOrderBreakdown && item.strokeData && (
                      <StrokeOrderDiagram
                        strokeData={item.strokeData}
                        strokeStyle={settings.strokeStyle}
                        sizePx={strokeOrderSizePx}
                      />
                    )}
                  </div>
                )}

                {/* Continuous Grid Row: 1 reference + faint trace + blank squares */}
                <div className="inline-flex items-center">
                  {/* Reference Square (Solid) */}
                  <GridCell
                    char={item.char}
                    strokeData={item.strokeData}
                    strokeStyle={settings.strokeStyle}
                    showGridlines={settings.tianzigeGridlines}
                    mode="model"
                    sizePx={cellPx}
                    onClick={() => onCharacterClick?.(item)}
                  />

                  {/* Practice Squares */}
                  {Array.from({ length: practiceSlots }).map((_, slotIdx) => {
                    const isFaint = slotIdx < faintTraceSlots;
                    return (
                      <GridCell
                        key={slotIdx}
                        char={item.char}
                        strokeData={item.strokeData}
                        strokeStyle={settings.strokeStyle}
                        showGridlines={settings.tianzigeGridlines}
                        mode={isFaint ? 'trace' : 'empty'}
                        sizePx={cellPx}
                        onClick={() => onCharacterClick?.(item)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* 2. Empty square grid rows for remaining capacity on the page for practice */}
          {Array.from({ length: emptyRowsCount }).map((_, emptyIdx) => {
            return (
              <div key={`empty-row-${emptyIdx}`} className="flex flex-col py-0.5 opacity-80">
                {/* Top spacer matching proportional pinyin row height */}
                {(settings.pinyin || settings.strokeOrderBreakdown) && (
                  <div
                    style={{
                      height: `${infoLineHeightPx}px`,
                      marginBottom: `${infoMarginBottomPx}px`,
                    }}
                  />
                )}

                {/* Empty square grid strip for freehand practice */}
                <div className="inline-flex items-center">
                  {Array.from({ length: totalSlots }).map((_, slotIdx) => (
                    <GridCell
                      key={`empty-cell-${slotIdx}`}
                      strokeStyle={settings.strokeStyle}
                      showGridlines={settings.tianzigeGridlines}
                      mode="empty"
                      sizePx={cellPx}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Page Footer matching mathletics (Screenshot 1) */}
      <div className="border-t border-stone-200/90 pt-2.5 mt-2 flex items-center">
        <a
          href="https://hanzi.patrickyou.ng"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <WebsiteGlobeCursorIcon className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-500 text-xs tracking-tight">
            hanzi.patrickyou.ng
          </span>
        </a>
      </div>
    </div>
  );
};
