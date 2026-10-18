import React, { useState } from 'react';
import { WorksheetSettings, StrokeStyle, getRowsPerPage } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  PenLine,
  FileText,
  MessageCircle,
  LayoutGrid,
  User,
  Download,
  Printer,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  Minus,
  Plus,
  BookOpen,
} from 'lucide-react';
import { printWorksheet } from '../utils/pdfExport';

interface ControlsProps {
  inputText: string;
  setInputText: (val: string) => void;
  settings: WorksheetSettings;
  setSettings: React.Dispatch<React.SetStateAction<WorksheetSettings>>;
  deduplicate: boolean;
  setDeduplicate: (val: boolean) => void;
  charCount: number;
  pageCount: number;
  onDownloadPdf: () => void;
  isGeneratingPdf?: boolean;
  pdfStatus?: string;
  onOpenCharacterLibrary?: () => void;
}

const SpeechBubbleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Oval speech bubble with a distinct, prominent comic pointer tail */}
    <path d="M12 3c5.5 0 10 3.6 10 8s-4.5 8-10 8c-1.3 0-2.5-.2-3.6-.6L3 21l1.7-4.4C3.6 15.2 2 13.2 2 11c0-4.4 4.5-8 10-8z" />
  </svg>
);

export const Controls: React.FC<ControlsProps> = ({
  inputText,
  setInputText,
  settings,
  setSettings,
  deduplicate,
  setDeduplicate,
  charCount,
  pageCount,
  onDownloadPdf,
  isGeneratingPdf = false,
  pdfStatus = '',
  onOpenCharacterLibrary,
}) => {
  const { t, formatText } = useLanguage();
  const [outputSettingsOpen, setOutputSettingsOpen] = useState(false);
  const [exceededLimit, setExceededLimit] = useState(false);

  const presets = [
    { name: '1–10', text: '一二三四五六七八九十' },
    { name: t.presetGreetings, text: '你好谢谢再见朋友大家欢迎' },
    { name: t.presetNature, text: '日月水火山石田土风雨天' },
    { name: t.presetStudy, text: '看读书写学习字文听' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > 100) {
      setInputText(val.slice(0, 100));
      setExceededLimit(true);
    } else {
      setInputText(val);
      if (val.length < 100) {
        setExceededLimit(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      inputText.length >= 100 &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.key) &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      setExceededLimit(true);
    }
  };

  const updateSetting = <K extends keyof WorksheetSettings>(
    key: K,
    val: WorksheetSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  // Available character sizes in mm
  const AVAILABLE_SIZES = [14, 16, 18, 20, 22, 24, 28, 32] as const;

  // Helper for size description
  const getSizeLabel = (mm: number) => {
    if (mm === 14) return t.sizeCompact;
    if (mm === 16) return t.sizeSmall;
    if (mm === 18) return t.sizeStandard;
    if (mm === 20) return t.sizeMediumLarge;
    if (mm === 22) return t.sizeLarge;
    if (mm === 24) return t.sizeJumbo;
    if (mm === 28) return t.sizeExtraJumbo;
    if (mm === 32) return t.sizeGiant;
    return `${mm} mm`;
  };

  // Calculate practice square breakdown
  const rawSize = settings.characterSizeMm || 18;
  const totalSlots =
    rawSize === 18 ? 10 :
    rawSize === 28 ? 6 :
    rawSize === 32 ? 5 :
    Math.max(5, Math.floor(190 / rawSize));
  const practiceSlots = totalSlots - 1;
  const faintTraceSlots = settings.faintTrace ? Math.min(4, Math.floor(practiceSlots / 2)) : 0;
  const blankSlots = practiceSlots - faintTraceSlots;
  const rowsPerPage = getRowsPerPage(rawSize);

  // Current index in discrete size steps
  const currentSizeIndex = (() => {
    let closestIdx = 0;
    let minDiff = Infinity;
    AVAILABLE_SIZES.forEach((s, idx) => {
      const diff = Math.abs(s - (settings.characterSizeMm || 18));
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    return closestIdx;
  })();

  return (
    <div className="no-print space-y-6">
      {/* WORKSHEET TITLE */}
      <div>
        <label className="block text-xs font-bold text-stone-700 tracking-wider uppercase mb-2">
          {t.worksheetTitleLabel}
        </label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => updateSetting('title', e.target.value)}
          placeholder={t.worksheetTitlePlaceholder}
          className="w-full px-3.5 py-2.5 text-stone-900 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white shadow-2xs font-medium"
        />
        <p className="text-xs text-stone-400 mt-1.5">
          {t.worksheetTitleHint}
        </p>
      </div>

      {/* CHARACTERS TO PRACTICE */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-stone-700 tracking-wider uppercase">
            {t.charactersLabel}
          </label>
          <span className="text-xs text-stone-500 font-medium">
            {charCount} {charCount === 1 ? t.charUnitSingular : t.charsUnit} · {pageCount} {pageCount === 1 ? t.pageUnitSingular : t.pagesUnit}
          </span>
        </div>
        <textarea
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          maxLength={100}
          placeholder={t.charactersPlaceholder}
          rows={3}
          className="w-full px-3.5 py-2.5 text-stone-900 text-base border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white shadow-2xs font-heiti font-normal resize-none leading-relaxed"
        />

        {/* Warning banner displayed ONLY when trying to exceed 100 characters */}
        {exceededLimit && (
          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg mt-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>{t.charLimitWarning}</span>
          </div>
        )}

        {/* 100 Topics Character Library Trigger & Quick Presets */}
        <div className="mt-3 space-y-2.5">
          {onOpenCharacterLibrary && (
            <button
              type="button"
              onClick={onOpenCharacterLibrary}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="text-left truncate">
                  <div className="text-xs font-bold tracking-wide">
                    {t.browseTopicsBtn}
                  </div>
                  <div className="text-[10px] text-white/80 font-normal">
                    {t.browseTopicsSub}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold bg-white/20 group-hover:bg-white/30 text-white px-2 py-0.5 rounded-full transition-colors flex items-center gap-0.5 shrink-0 ml-2">
                {t.exploreBtn} <ChevronRight className="w-3 h-3" />
              </span>
            </button>
          )}

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider mr-1">
              {t.quickPresetsLabel}
            </span>
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setInputText(p.text);
                  setExceededLimit(false);
                }}
                className="text-xs px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium border border-stone-200/80 transition-colors cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Duplicate toggle */}
        <div className="mt-3">
          <label className="inline-flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={deduplicate}
              onChange={(e) => setDeduplicate(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-stone-300 focus:ring-blue-500 cursor-pointer"
            />
            <span>{t.deduplicateLabel}</span>
          </label>
        </div>
      </div>

      {/* CHARACTER SIZE CARD */}
      <div className="border border-stone-200 rounded-2xl p-4 bg-white shadow-2xs">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <span className="text-xs font-bold text-stone-700 tracking-wider uppercase block truncate">
              {t.charSizeLabel}
            </span>
            <span className="text-xs font-semibold text-red-600 block truncate mt-0.5">
              {getSizeLabel(settings.characterSizeMm)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (currentSizeIndex > 0) {
                  updateSetting('characterSizeMm', AVAILABLE_SIZES[currentSizeIndex - 1]);
                }
              }}
              disabled={currentSizeIndex <= 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-stone-700 shadow-2xs transition-colors"
              title="Decrease size"
              aria-label="Decrease size"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-bold text-stone-800 bg-stone-100 px-2 py-1 rounded-lg border border-stone-200/80 min-w-[50px] text-center select-none">
              {settings.characterSizeMm} mm
            </span>
            <button
              type="button"
              onClick={() => {
                if (currentSizeIndex < AVAILABLE_SIZES.length - 1) {
                  updateSetting('characterSizeMm', AVAILABLE_SIZES[currentSizeIndex + 1]);
                }
              }}
              disabled={currentSizeIndex >= AVAILABLE_SIZES.length - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-stone-700 shadow-2xs transition-colors"
              title="Increase size"
              aria-label="Increase size"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Range Slider with generous touch target and smooth dragging */}
        <div className="py-1">
          <input
            type="range"
            min={0}
            max={AVAILABLE_SIZES.length - 1}
            step={1}
            value={currentSizeIndex}
            onChange={(e) => updateSetting('characterSizeMm', AVAILABLE_SIZES[Number(e.target.value)])}
            className="range-slider"
            aria-label="Character Size"
          />
        </div>

        <p className="text-xs text-stone-500 mt-3 leading-relaxed">
          {formatText(t.sizeHelpText, {
            practice: practiceSlots,
            trace: faintTraceSlots,
            blank: blankSlots,
            rows: rowsPerPage,
          })}
          {pageCount > 1 ? formatText(t.sizeSpillText, { pages: pageCount }) : ''}
        </p>
      </div>

      {/* FONT & STROKE STYLE CARD (2 options only: Sans-Serif and Brush Calligraphy) */}
      <div className="border border-stone-200 rounded-2xl p-4 bg-white shadow-2xs">
        <div className="mb-3">
          <span className="text-xs font-bold text-stone-700 tracking-wider uppercase">
            {t.fontStyleLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Left: Sans-Serif (HeiTi) */}
          <button
            type="button"
            onClick={() => updateSetting('strokeStyle', 'heiti')}
            className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
              settings.strokeStyle === 'heiti'
                ? 'border-2 border-red-600 bg-white shadow-xs'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div className={`text-xl font-bold font-heiti mb-1 ${
              settings.strokeStyle === 'heiti' ? 'text-red-600' : 'text-stone-800'
            }`}>
              {t.sansSerifTitle}
            </div>
            <div className="text-xs text-stone-600 font-medium">
              {t.sansSerifDesc}
            </div>
          </button>

          {/* Right: Brush / Calligraphy (KaiTi) */}
          <button
            type="button"
            onClick={() => updateSetting('strokeStyle', 'kaiti')}
            className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
              settings.strokeStyle === 'kaiti'
                ? 'border-2 border-red-600 bg-white shadow-xs'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div className={`text-xl font-bold font-kaiti mb-1 ${
              settings.strokeStyle === 'kaiti' ? 'text-red-600' : 'text-stone-800'
            }`}>
              {t.brushTitle}
            </div>
            <div className="text-xs text-stone-600 font-medium">
              {t.brushDesc}
            </div>
          </button>
        </div>

        <p className="text-xs text-stone-500 mt-3 leading-relaxed">
          {t.fontStyleHint}
        </p>
      </div>

      {/* WORKSHEET LAYOUT OPTIONS */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-stone-700 tracking-wider uppercase">
          {t.layoutOptionsLabel}
        </label>

        {/* 1. Faint Trace Outlines */}
        <div className="flex items-center justify-between p-3.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
          <div className="flex items-start gap-3">
            <PenLine className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-stone-800">{t.faintTraceTitle}</div>
              <div className="text-xs text-stone-500">{t.faintTraceDesc}</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.faintTrace}
            onChange={(e) => updateSetting('faintTrace', e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-stone-300 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* 2. Stroke Order Breakdown */}
        <div className="flex items-center justify-between p-3.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-stone-800">{t.strokeBreakdownTitle}</div>
              <div className="text-xs text-stone-500">{t.strokeBreakdownDesc}</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.strokeOrderBreakdown}
            onChange={(e) => updateSetting('strokeOrderBreakdown', e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-stone-300 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* 3. Pīnyīn Pronunciation */}
        <div className="flex items-center justify-between p-3.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
          <div className="flex items-start gap-3">
            <SpeechBubbleIcon className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-stone-800">{t.pinyinTitle}</div>
              <div className="text-xs text-stone-500">{t.pinyinDesc}</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.pinyin}
            onChange={(e) => updateSetting('pinyin', e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-stone-300 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* 4. Tianzige Practice Gridlines */}
        <div className="flex items-center justify-between p-3.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
          <div className="flex items-start gap-3">
            <LayoutGrid className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-stone-800">{t.tianzigeTitle}</div>
              <div className="text-xs text-stone-500">{t.tianzigeDesc}</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.tianzigeGridlines}
            onChange={(e) => updateSetting('tianzigeGridlines', e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-stone-300 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* 5. Header Student Name Field */}
        <div className="flex items-center justify-between p-3.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-stone-800">{t.studentNameTitle}</div>
              <div className="text-xs text-stone-500">{t.studentNameDesc}</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.headerStudentName}
            onChange={(e) => updateSetting('headerStudentName', e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-stone-300 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Output Settings Collapsible */}
        <div className="border border-stone-200 rounded-xl bg-white overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => setOutputSettingsOpen(!outputSettingsOpen)}
            className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              {outputSettingsOpen ? (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-500" />
              )}
              {t.outputSettingsTitle}
            </span>
            <span className="text-stone-400 font-normal">{t.letterPortrait}</span>
          </button>
          {outputSettingsOpen && (
            <div className="p-3.5 pt-0 border-t border-stone-100 text-xs text-stone-600 space-y-2 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.headerDate}
                  onChange={(e) => updateSetting('headerDate', e.target.checked)}
                  className="rounded text-blue-600"
                />
                {t.dateFieldTitle}
              </label>
              <p className="text-[11px] text-stone-400">
                {t.outputSettingsHint}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="space-y-3 pt-2">
        {/* Primary: Real Vector PDF direct download */}
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={isGeneratingPdf}
          className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 text-white font-bold text-sm rounded-xl shadow-md shadow-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-wait"
        >
          {isGeneratingPdf ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>{isGeneratingPdf ? (pdfStatus || t.savePdfBtn) : t.savePdfBtn}</span>
        </button>

        {/* Secondary: Native Print dialog */}
        <button
          type="button"
          onClick={printWorksheet}
          className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 font-semibold text-xs rounded-xl border border-stone-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-stone-600" />
          <span>{t.printDirectBtn}</span>
        </button>
      </div>
    </div>
  );
};
