import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CharacterItem, WorksheetSettings } from './types';
import { extractChineseChars, getCharPinyin } from './utils/pinyinService';
import { fetchStrokeData } from './utils/strokeService';
import { Navbar } from './components/Navbar';
import { Controls } from './components/Controls';
import { WorksheetPage } from './components/WorksheetPage';
import { CharacterModal } from './components/CharacterModal';
import { Eye, Printer, ChevronLeft, ChevronRight, Sliders } from 'lucide-react';
import { printWorksheet, downloadPdfDocument } from './utils/pdfExport';

const DEFAULT_SETTINGS: WorksheetSettings = {
  title: '基础汉字书写练习',
  characterSizeMm: 18,
  strokeStyle: 'heiti',
  faintTrace: true,
  strokeOrderBreakdown: true,
  pinyin: true,
  tianzigeGridlines: true,
  headerStudentName: true,
  headerDate: false,
};

export function App() {
  const [inputText, setInputText] = useState<string>('一二三四五六七八九十');
  const [deduplicate, setDeduplicate] = useState<boolean>(true);
  const [settings, setSettings] = useState<WorksheetSettings>(DEFAULT_SETTINGS);
  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterItem | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [mobileTab, setMobileTab] = useState<'setup' | 'preview'>('setup');

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState<number>(1);

  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      const containerWidth = previewContainerRef.current.clientWidth;
      const a4WidthPx = 794; // 210mm in standard CSS 96 DPI
      if (containerWidth > 0 && containerWidth < a4WidthPx) {
        const targetScale = Math.min(1, (containerWidth - 8) / a4WidthPx);
        setPreviewScale(Math.max(0.3, targetScale));
      } else {
        setPreviewScale(1);
      }
    };

    updateScale();
    const handleResize = () => updateScale();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(updateScale, 60);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [mobileTab]);

  // Extract characters and fetch stroke vectors
  useEffect(() => {
    const rawChars = extractChineseChars(inputText, deduplicate);
    const finalChars = rawChars.length > 0 ? rawChars : ['一', '二', '三'];

    const items: CharacterItem[] = finalChars.map((ch, idx) => ({
      id: `${ch}-${idx}`,
      char: ch,
      pinyin: getCharPinyin(ch),
      strokeCount: 0,
      loading: true,
    }));

    setCharacters(items);

    let isCancelled = false;
    const loadData = async () => {
      const updated = await Promise.all(
        items.map(async (item) => {
          const data = await fetchStrokeData(item.char);
          return {
            ...item,
            strokeData: data,
            strokeCount: data?.strokes?.length || 0,
            loading: false,
          };
        })
      );

      if (!isCancelled) {
        setCharacters(updated);
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [inputText, deduplicate]);

  // Exactly 10 characters per page so the 1-10 preset fits on a single page
  const itemsPerPage = 10;

  const pages = useMemo(() => {
    const result: CharacterItem[][] = [];
    for (let i = 0; i < characters.length; i += itemsPerPage) {
      result.push(characters.slice(i, i + itemsPerPage));
    }
    return result.length > 0 ? result : [[]];
  }, [characters, itemsPerPage]);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState('');

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      await downloadPdfDocument(settings.title, (status) => {
        setPdfStatus(status);
      });
    } catch (err: unknown) {
      console.error('Failed to generate PDF:', err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Could not generate PDF: ${msg}`);
    } finally {
      setIsGeneratingPdf(false);
      setPdfStatus('');
    }
  };

  // Keep currentPageIndex in bounds when total pages change
  useEffect(() => {
    if (currentPageIndex >= pages.length) {
      setCurrentPageIndex(Math.max(0, pages.length - 1));
    }
  }, [pages.length, currentPageIndex]);

  return (
    <div className="min-h-screen bg-stone-100/60 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Mobile & Tablet Tab Switcher (Visible on screens < lg) */}
        <div className="lg:hidden no-print flex p-1 bg-stone-200/80 rounded-xl mb-4 select-none">
          <button
            type="button"
            onClick={() => setMobileTab('setup')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mobileTab === 'setup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Page Setup</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Page View</span>
            {pages.length > 1 && (
              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-mono font-bold">
                {pages.length}p
              </span>
            )}
          </button>
        </div>

        <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: English Controls (Visible on lg, or when mobileTab is 'setup') */}
          <div
            className={`lg:col-span-5 xl:col-span-4 no-print ${
              mobileTab === 'setup' ? 'block' : 'hidden lg:block'
            }`}
          >
            <Controls
              inputText={inputText}
              setInputText={setInputText}
              settings={settings}
              setSettings={setSettings}
              deduplicate={deduplicate}
              setDeduplicate={setDeduplicate}
              charCount={characters.length}
              pageCount={pages.length}
              onDownloadPdf={handleDownloadPdf}
              isGeneratingPdf={isGeneratingPdf}
              pdfStatus={pdfStatus}
            />

            {/* Quick jump to Page View on mobile */}
            <div className="lg:hidden mt-4 pt-2">
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View Worksheet Preview ({characters.length} chars)</span>
              </button>
            </div>
          </div>

          {/* Right panel: Live Sheet Preview (Visible on lg, or when mobileTab is 'preview') */}
          <div
            className={`lg:col-span-7 xl:col-span-8 flex flex-col items-center w-full ${
              mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Preview Toolbar (No-Print) */}
            <div className="no-print w-full flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
                <Eye className="w-4 h-4 text-stone-500" />
                <span>Live Preview</span>
                <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full text-[10px]">
                  {characters.length} {characters.length === 1 ? 'char' : 'chars'}
                </span>
              </div>

              {/* Page Navigation Controls for multi-page sheets */}
              {pages.length > 1 && (
                <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentPageIndex === 0}
                    className="p-1 rounded hover:bg-stone-100 disabled:opacity-25 disabled:hover:bg-transparent text-stone-700 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-stone-700 px-2 select-none">
                    Page {currentPageIndex + 1} of {pages.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
                    disabled={currentPageIndex === pages.length - 1}
                    className="p-1 rounded hover:bg-stone-100 disabled:opacity-25 disabled:hover:bg-transparent text-stone-700 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={printWorksheet}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>

            {/* Render A4 Pages - Auto-scaled to container width on mobile & tablet without scrolling */}
            <div
              ref={previewContainerRef}
              className="w-full flex flex-col items-center overflow-x-hidden"
            >
              {/* Scaled viewport container */}
              <div
                style={{
                  width: previewScale < 1 ? `${Math.round(794 * previewScale)}px` : '794px',
                  height: previewScale < 1 ? `${Math.round(1123 * previewScale)}px` : '1123px',
                }}
                className="relative flex justify-center print:!w-auto print:!h-auto print:!m-0"
              >
                <div
                  style={{
                    transform: previewScale < 1 ? `scale(${previewScale})` : 'none',
                    transformOrigin: 'top center',
                    width: '210mm',
                    height: '297mm',
                  }}
                  className="print:!transform-none print:!w-auto print:!min-h-0"
                >
                  {pages.map((pageChars, idx) => (
                    <div
                      key={idx}
                      className={idx === currentPageIndex ? 'block w-full' : 'hidden w-full'}
                    >
                      <WorksheetPage
                        characters={pageChars}
                        settings={settings}
                        pageIndex={idx}
                        totalPages={pages.length}
                        onCharacterClick={(char) => setSelectedCharacter(char)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Navigation Buttons for multi-page sheets */}
              {pages.length > 1 && (
                <div className="no-print flex items-center justify-center gap-3 mt-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentPageIndex === 0}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous Page
                  </button>
                  <span className="text-xs font-bold text-stone-600 px-2 select-none">
                    Page {currentPageIndex + 1} of {pages.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
                    disabled={currentPageIndex === pages.length - 1}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Next Page
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Pristine Print Mount: unscaled full A4 pages for Native Print & PDF Export */}
        <div id="print-mount" className="hidden print:block w-[210mm]">
          {pages.map((pageChars, idx) => (
            <div key={`print-page-${idx}`} className="print-page-wrapper">
              <WorksheetPage
                characters={pageChars}
                settings={settings}
                pageIndex={idx}
                totalPages={pages.length}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Interactive Character Modal */}
      {selectedCharacter && (
        <CharacterModal
          item={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          strokeStyle={settings.strokeStyle}
        />
      )}
    </div>
  );
}

export default App;
