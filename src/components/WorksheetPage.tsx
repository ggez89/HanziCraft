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

// Globe + pointer cursor icon matching mathletics (screenshot 1)
const WebsiteGlobeCursorIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Globe outer circle */}
    <circle cx="10" cy="10" r="7.5" />
    {/* Equator horizontal line */}
    <line x1="2.5" y1="10" x2="17.5" y2="10" />
    {/* Vertical curved meridian ellipse */}
    <ellipse cx="10" cy="10" rx="3.6" ry="7.5" />
    {/* Mouse pointer arrow at bottom right */}
    <path
      d="M14 13.5l5.5 2-2.5 1 1.6 3-1.4 0.7-1.6-3-1.8 1.8z"
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
  const rawSize = settings.characterSizeMm || 17;
  
  // Total frames per row dynamically scales so it never overflows
  const totalSlots = rawSize === 17 ? 11 : Math.max(5, Math.floor(availableWidthMm / rawSize));
  const practiceSlots = totalSlots - 1;
  const faintTraceSlots = settings.faintTrace ? Math.min(4, Math.floor(practiceSlots / 2)) : 0;

  // Exact pixel size per square fitted across the available width
  const cellPx = Math.floor((availableWidthMm / totalSlots) * 3.78);

  // Maximum rows capacity per page without vertical clipping
  const maxRowsPerPage = rawSize >= 21 ? 7 : (rawSize >= 19 ? 8 : 10);
  
  // Fill remaining capacity with empty practice grids so rows have normal spacing and no gaping empty gaps
  const emptyRowsCount = Math.max(0, maxRowsPerPage - characters.length);

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
                {/* Top info line: Pinyin on left in black, progressive strokes right next to it */}
                {(settings.pinyin || settings.strokeOrderBreakdown) && (
                  <div className="flex items-center gap-2 h-4 mb-1 px-0.5">
                    {/* Tone-marked Pīnyīn in BLACK */}
                    {settings.pinyin && (
                      <span className="text-xs font-semibold text-stone-900 font-mono tracking-tight shrink-0">
                        {item.pinyin || ''}
                      </span>
                    )}

                    {/* Progressive Stroke Order Breakdown follows Sans-Serif vs Brush toggle */}
                    {settings.strokeOrderBreakdown && item.strokeData && (
                      <StrokeOrderDiagram
                        strokeData={item.strokeData}
                        strokeStyle={settings.strokeStyle}
                        sizePx={Math.max(15, Math.min(22, Math.round(cellPx * 0.28)))}
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
                {/* Top spacer matching pinyin row height */}
                {(settings.pinyin || settings.strokeOrderBreakdown) && (
                  <div className="h-4 mb-1" />
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
