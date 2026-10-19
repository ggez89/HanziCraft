import React from 'react';
import { CharacterItem, WorksheetSettings, getRowsPerPage } from '../types';
import { GridCell } from './GridCell';
import { StrokeOrderDiagram } from './StrokeOrderDiagram';
import { HanziLogo } from './HanziLogo';
import { Globe, MousePointer2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface WorksheetPageProps {
  characters: CharacterItem[];
  settings: WorksheetSettings;
  pageIndex: number;
  totalPages: number;
  onCharacterClick?: (char: CharacterItem) => void;
}


export const WorksheetPage: React.FC<WorksheetPageProps> = ({
  characters,
  settings,
  pageIndex = 0,
  totalPages = 1,
  onCharacterClick,
}) => {
  const { t, formatText } = useLanguage();
  // Available printable width on US Letter 8.5" (~190mm)
  const availableWidthMm = 190;
  const rawSize = settings.characterSizeMm || 18;
  
  // Total frames per row dynamically scales so it never overflows:
  // 18mm: 10 frames (1 model + 9 practice)
  // 24mm: 7 frames (1 model + 6 practice)
  // 28mm: 6 frames (1 model + 5 practice)
  // 32mm: 5 frames (1 model + 4 practice)
  const totalSlots =
    rawSize === 18 ? 10 :
    rawSize === 28 ? 6 :
    rawSize === 32 ? 5 :
    Math.max(5, Math.floor(availableWidthMm / rawSize));
  const practiceSlots = totalSlots - 1;
  const faintTraceSlots = settings.faintTrace ? Math.min(4, Math.floor(practiceSlots / 2)) : 0;

  // Proportional scaling for pinyin and stroke breakdown diagrams (crisp, clearly visible, strictly within page margins)
  const pinyinFontSizePx = rawSize >= 24 ? 13 : rawSize >= 20 ? 12 : 12;
  const strokeOrderSizePx = rawSize >= 28 ? 26 : rawSize >= 22 ? 25 : 24;
  const infoLineHeightPx = strokeOrderSizePx;
  const infoMarginBottomPx = 2;
  const infoGapPx = 6;

  // Rows capacity dynamically calculated per character size so paper size is strictly constant Letter (11in)
  const maxRowsPerPage = getRowsPerPage(rawSize);
  
  // Fill remaining capacity with empty practice grids so rows have normal spacing and no gaping empty gaps
  const emptyRowsCount = Math.max(0, maxRowsPerPage - characters.length);

  // Exact pixel size per square fitted across Letter width (~68px at standard 18mm)
  // Perfectly balanced ~680px grid width centered on the 816px (8.5") page with equal margins
  const cellPxMap: Record<number, number> = {
    14: 54,
    16: 62,
    18: 68,
    20: 76,
    22: 85,
    24: 97,
    28: 114,
    32: 136,
  };
  const cellPx = cellPxMap[rawSize] || Math.floor((availableWidthMm / totalSlots) * 3.52);

  // Title font dynamically matches selected style
  const titleFontClass = settings.strokeStyle === 'kaiti' ? 'font-kaiti' : 'font-heiti';

  return (
    <div className="print-container bg-white text-stone-900 shadow-xl border border-stone-200/90 rounded-sm mx-auto px-6 pt-4 pb-3 mb-0 print:mb-0 print:border-none print:shadow-none print:rounded-none w-[8.5in] h-[11in] max-h-[11in] print:w-[8.5in] print:h-[11in] print:min-h-[11in] print:max-h-[11in] box-border relative flex flex-col justify-between overflow-hidden select-none">
      <div className="flex-1 min-h-0 flex flex-col justify-between">
        {/* Page Header: Left-aligned Logo + Worksheet Title, with Name on right */}
        <div className="mb-1 shrink-0 w-full px-1">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            {/* Top Left: Logo + Worksheet Title (left-aligned together) */}
            <div className="flex items-center gap-2.5">
              <HanziLogo size={22} />
              <h1 className={`text-sm sm:text-base font-bold text-stone-900 tracking-wide ${titleFontClass}`}>
                {settings.title || t.worksheetTitlePlaceholder}
              </h1>
            </div>

            {/* Top Right: Student Name & Date fields */}
            <div className="text-xs sm:text-sm font-medium text-stone-900 text-right shrink-0 flex items-center gap-3">
              {settings.headerDate && (
                <span>
                  {t.dateField}<span className="inline-block border-b border-stone-800 w-16 sm:w-20"></span>
                </span>
              )}
              {settings.headerStudentName && (
                <span>
                  {t.studentNameField}<span className="inline-block border-b border-stone-800 w-24 sm:w-32"></span>
                </span>
              )}
            </div>
          </div>

          {/* Solid black horizontal line across header */}
          <div className="border-b-2 border-stone-900 w-full" />
        </div>

        {/* Character Rows evenly and beautifully distributed down to the footer, centered horizontally */}
        <div className="flex-1 min-h-0 flex flex-col justify-around py-0.5 items-center w-full">
          {/* 1. Rows with practice characters */}
          {characters.map((item) => {
            return (
              <div key={item.id} className="flex flex-col py-0 w-fit break-inside-avoid print:break-inside-avoid">
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
                        maxWidthPx={620}
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
              <div key={`empty-row-${emptyIdx}`} className="flex flex-col py-0 opacity-80 w-fit break-inside-avoid print:break-inside-avoid">
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

      {/* Page Footer matching Mathletics */}
      <footer className="border-t border-stone-200/90 pt-1.5 pb-0.5 mt-auto flex items-center justify-between text-gray-400 print:text-gray-600 shrink-0 w-full px-1">
        <a
          href="https://hanzi.patrickyou.ng"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-gray-400 hover:text-gray-700 print:text-gray-600 text-[14px] font-sans font-medium transition-colors"
        >
          <div className="relative inline-flex items-center justify-center w-5 h-5 shrink-0">
            <Globe size={16} className="text-gray-400 print:text-gray-600" />
            <MousePointer2
              size={9}
              className="absolute -bottom-0.5 -right-0.5 text-gray-400 print:text-gray-600 fill-current"
            />
          </div>
          <span>hanzi.patrickyou.ng</span>
        </a>

        {/* Page counter matching Mathletics: only shown when totalPages > 1 */}
        {totalPages > 1 && (
          <div className="text-gray-500 font-bold text-[11px] print:text-gray-700 font-mono tracking-wider select-none">
            {formatText(t.footerPageOf, { current: pageIndex + 1, total: totalPages })}
          </div>
        )}
      </footer>
    </div>
  );
};
