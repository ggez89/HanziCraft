import React, { useState, useEffect, useMemo } from 'react';
import { CharacterItem, WorksheetSettings } from './types';
import { extractChineseChars, getCharPinyin } from './utils/pinyinService';
import { fetchStrokeData } from './utils/strokeService';
import { Navbar } from './components/Navbar';
import { Controls } from './components/Controls';
import { WorksheetPage } from './components/WorksheetPage';
import { CharacterModal } from './components/CharacterModal';
import { Eye, Printer } from 'lucide-react';
import { printWorksheet, downloadPdfDocument } from './utils/pdfExport';

const DEFAULT_SETTINGS: WorksheetSettings = {
  title: '基础汉字书写练习',
  characterSizeMm: 17,
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

  // Dynamic items per page: at 17mm default exactly 10 fit, at jumbo sizes (21-24mm) it adjusts so pages don't vertically clip
  const itemsPerPage = useMemo(() => {
    if (settings.characterSizeMm >= 21) return 7;
    if (settings.characterSizeMm >= 19) return 8;
    return 10;
  }, [settings.characterSizeMm]);

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
      await downloadPdfDocument(settings.title || 'Chinese-Character-Worksheet', (status) => {
        setPdfStatus(status);
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Fallback to print if canvas fails
      printWorksheet();
    } finally {
      setIsGeneratingPdf(false);
      setPdfStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/60 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: English Controls matching screenshot */}
          <div className="lg:col-span-5 xl:col-span-4 no-print">
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
          </div>

          {/* Right panel: Live Sheet Preview */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center">
            {/* Preview Toolbar (No-Print) */}
            <div className="no-print w-full flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
                <Eye className="w-4 h-4 text-stone-500" />
                <span>Live Preview (A4 Dimensions)</span>
                <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full text-[10px]">
                  {characters.length} {characters.length === 1 ? 'char' : 'chars'} · {pages.length} {pages.length === 1 ? 'page' : 'pages'}
                </span>
              </div>

              <button
                type="button"
                onClick={printWorksheet}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>

            {/* Render A4 Pages */}
            <div className="w-full flex flex-col items-center">
              {pages.map((pageChars, idx) => (
                <WorksheetPage
                  key={idx}
                  characters={pageChars}
                  settings={settings}
                  pageIndex={idx}
                  totalPages={pages.length}
                  onCharacterClick={(char) => setSelectedCharacter(char)}
                />
              ))}
            </div>
          </div>
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
