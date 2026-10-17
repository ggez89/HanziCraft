import React, { useState } from 'react';
import { WorksheetSettings, StrokeStyle, getRowsPerPage } from '../types';
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
}

const PRESETS = [
  { name: '1–10', text: '一二三四五六七八九十' },
  { name: 'Greetings', text: '你好谢谢再见朋友大家欢迎' },
  { name: 'Nature', text: '日月水火山石田土风雨天' },
  { name: 'Study', text: '看读书写学习字文听' },
];

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
}) => {
  const [outputSettingsOpen, setOutputSettingsOpen] = useState(false);
  const [exceededLimit, setExceededLimit] = useState(false);

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

  // Helper for size description
  const getSizeLabel = (mm: number) => {
    if (mm === 14) return `14 mm · Compact`;
    if (mm === 16) return `16 mm · Small`;
    if (mm === 18) return `18 mm · Standard`;
    if (mm === 20) return `20 mm · Medium-Large`;
    if (mm === 22) return `22 mm · Large`;
    if (mm === 24) return `24 mm · Jumbo`;
    return `${mm} mm`;
  };

  // Calculate practice square breakdown
  const rawSize = settings.characterSizeMm || 18;
  const totalSlots = rawSize === 18 ? 10 : Math.max(5, Math.floor(186 / rawSize));
  const practiceSlots = totalSlots - 1;
  const faintTraceSlots = settings.faintTrace ? Math.min(4, Math.floor(practiceSlots / 2)) : 0;
  const blankSlots = practiceSlots - faintTraceSlots;
  const rowsPerPage = getRowsPerPage(rawSize);

  return (
    <div className="no-print space-y-6">
      {/* WORKSHEET TITLE */}
      <div>
        <label className="block text-xs font-bold text-stone-700 tracking-wider uppercase mb-2">
          Worksheet Title
        </label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => updateSetting('title', e.target.value)}
          placeholder="基础汉字书写练习"
          className="w-full px-3.5 py-2.5 text-stone-900 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white shadow-2xs font-medium"
        />
        <p className="text-xs text-stone-400 mt-1.5">
          Centered at the top of each printed page
        </p>
      </div>

      {/* CHARACTERS TO PRACTICE */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-stone-700 tracking-wider uppercase">
            Characters to Practice
          </label>
          <span className="text-xs text-stone-500 font-medium">
            {charCount} {charCount === 1 ? 'char' : 'chars'} · {pageCount} {pageCount === 1 ? 'page' : 'pages'}
          </span>
        </div>
        <textarea
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          maxLength={100}
          placeholder="一二三四五六七八九十"
          rows={3}
          className="w-full px-3.5 py-2.5 text-stone-900 text-base border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white shadow-2xs font-heiti font-normal resize-none leading-relaxed"
        />

        {/* Warning banner displayed ONLY when trying to exceed 100 characters */}
        {exceededLimit && (
          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg mt-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>Maximum limit of 100 characters reached. Extra characters were omitted.</span>
          </div>
        )}

        {/* Presets */}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <span className="text-xs text-stone-500 font-medium">Presets:</span>
          {PRESETS.map((p) => (
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

        {/* Duplicate toggle */}
        <div className="mt-3">
          <label className="inline-flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={deduplicate}
              onChange={(e) => setDeduplicate(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-stone-300 focus:ring-blue-500 cursor-pointer"
            />
            <span>Remove duplicate characters</span>
          </label>
        </div>
      </div>

      {/* CHARACTER SIZE CARD */}
      <div className="border border-stone-200 rounded-2xl p-4 bg-white shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-stone-700 tracking-wider uppercase">
            Character Size
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateSetting('characterSizeMm', Math.max(14, settings.characterSizeMm - 2))}
              disabled={settings.characterSizeMm <= 14}
              className="w-6 h-6 flex items-center justify-center rounded-md border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-stone-700"
              title="Decrease size"
              aria-label="Decrease size"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
              {getSizeLabel(settings.characterSizeMm)}
            </span>
            <button
              type="button"
              onClick={() => updateSetting('characterSizeMm', Math.min(24, settings.characterSizeMm + 2))}
              disabled={settings.characterSizeMm >= 24}
              className="w-6 h-6 flex items-center justify-center rounded-md border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-stone-700"
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
            min="14"
            max="24"
            step="2"
            value={settings.characterSizeMm}
            onChange={(e) => updateSetting('characterSizeMm', Number(e.target.value))}
            className="range-slider"
            aria-label="Character Size in mm"
          />
        </div>

        <div className="flex justify-between text-[11px] text-stone-400 mt-2 font-medium">
          <span>Compact (14 mm)</span>
          <span className="text-stone-600 font-semibold">Standard (18 mm)</span>
          <span>Jumbo (24 mm)</span>
        </div>

        <p className="text-xs text-stone-500 mt-3 leading-relaxed">
          Fits 1 reference + {practiceSlots} practice squares per row ({faintTraceSlots} faint trace + {blankSlots} blank) · <span className="font-semibold text-stone-700">{rowsPerPage} rows per page</span>.
          {pageCount > 1 ? ` Characters spill cleanly across ${pageCount} pages with blank practice grids completing each page.` : ''}
        </p>
      </div>

      {/* FONT & STROKE STYLE CARD (2 options only: Sans-Serif and Brush Calligraphy) */}
      <div className="border border-stone-200 rounded-2xl p-4 bg-white shadow-2xs">
        <div className="mb-3">
          <span className="text-xs font-bold text-stone-700 tracking-wider uppercase">
            Font & Stroke Style
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
              永 · 黑体
            </div>
            <div className="text-xs text-stone-600 font-medium">
              Sans-Serif (Modern)
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
              永 · 楷体
            </div>
            <div className="text-xs text-stone-600 font-medium">
              Brush / Calligraphy
            </div>
          </button>
        </div>

        <p className="text-xs text-stone-500 mt-3 leading-relaxed">
          Switches character font and stroke order between clean sans-serif and traditional brushwork for the entire page and PDF.
        </p>
      </div>

      {/* WORKSHEET LAYOUT OPTIONS */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-stone-700 tracking-wider uppercase">
          Worksheet Layout Options
        </label>

        {/* 1. Faint Trace Outlines */}
        <div className="flex items-center justify-between p-3.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
          <div className="flex items-start gap-3">
            <PenLine className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-stone-800">Faint Trace Outlines</div>
              <div className="text-xs text-stone-500">Faint character guides for guided muscle memory</div>
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
              <div className="text-sm font-semibold text-stone-800">Stroke Order Breakdown</div>
              <div className="text-xs text-stone-500">Visual progressive stroke steps above row</div>
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
              <div className="text-sm font-semibold text-stone-800">Pīnyīn Pronunciation</div>
              <div className="text-xs text-stone-500">Tone-marked pinyin for each character</div>
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
              <div className="text-sm font-semibold text-stone-800">Tianzige Practice Gridlines</div>
              <div className="text-xs text-stone-500">Cross and diagonal balance guidelines</div>
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
              <div className="text-sm font-semibold text-stone-800">Header Student Name Field</div>
              <div className="text-xs text-stone-500">Prints &quot;姓名：______&quot; at the top</div>
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
              Output Settings
            </span>
            <span className="text-stone-400 font-normal">A4 · Portrait</span>
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
                Include date field (&quot;日期：______&quot;)
              </label>
              <p className="text-[11px] text-stone-400">
                All pages are formatted for standard desktop A4 printers with crisp 10mm margins.
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
          <span>{isGeneratingPdf ? (pdfStatus || 'Generating PDF...') : 'Download PDF'}</span>
        </button>

        {/* Secondary: Native Print dialog */}
        <button
          type="button"
          onClick={printWorksheet}
          className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 font-semibold text-xs rounded-xl border border-stone-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-stone-600" />
          <span>Print Directly</span>
        </button>
      </div>
    </div>
  );
};
