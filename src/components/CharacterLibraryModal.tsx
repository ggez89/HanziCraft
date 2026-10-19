import React, { useState, useMemo, useEffect } from 'react';
import {
  CHARACTER_CATEGORIES,
  ALL_CHARACTER_SETS,
  CharacterSet,
  CategoryGroup,
  ScriptType,
} from '../data/characterLibrary';
import {
  X,
  Search,
  BookOpen,
  ChevronRight,
  Clock,
  Sun,
  Rabbit,
  Users,
  Activity,
  Utensils,
  Home,
  Compass,
  Sparkles,
  Award,
  Check,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CharacterLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSet: (set: CharacterSet, script: ScriptType) => void;
  currentScript?: ScriptType;
  onScriptChange?: (script: ScriptType) => void;
}

// Icon mapping helper
const getCategoryIcon = (iconName: string, className = 'w-4 h-4') => {
  switch (iconName) {
    case 'Clock':
      return <Clock className={className} />;
    case 'Sun':
      return <Sun className={className} />;
    case 'Rabbit':
      return <Rabbit className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Utensils':
      return <Utensils className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Award':
      return <Award className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};

export const CharacterLibraryModal: React.FC<CharacterLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectSet,
  currentScript = 'simplified',
  onScriptChange,
}) => {
  const { t, formatText } = useLanguage();
  const [selectedScript, setSelectedScript] = useState<ScriptType>(currentScript);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>(CHARACTER_CATEGORIES[0].id);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<Record<string, boolean>>({
    [CHARACTER_CATEGORIES[0].id]: true,
  });

  // Sync script changes if parent passes new prop
  useEffect(() => {
    setSelectedScript(currentScript);
  }, [currentScript]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle script switch
  const handleScriptToggle = (script: ScriptType) => {
    setSelectedScript(script);
    onScriptChange?.(script);
  };

  // Toggle mobile accordion category
  const toggleMobileCategory = (id: string) => {
    setExpandedMobileCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Search filtering logic
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    return ALL_CHARACTER_SETS.filter((set) => {
      const matchEn =
        set.subcategoryEn.toLowerCase().includes(q) || set.categoryEn.toLowerCase().includes(q);
      const matchSimp =
        set.subcategorySimp.includes(q) ||
        set.categorySimp.includes(q) ||
        set.charactersSimp.some((c) => c.includes(q));
      const matchTrad =
        set.subcategoryTrad.includes(q) ||
        set.categoryTrad.includes(q) ||
        set.charactersTrad.some((c) => c.includes(q));
      return matchEn || matchSimp || matchTrad;
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  const isTrad = selectedScript === 'traditional';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl h-[92vh] max-h-[850px] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <header className="px-5 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                  {t.libraryTitle}
                </h2>
                <span className="text-[11px] font-semibold text-stone-500 bg-stone-200/70 px-2 py-0.5 rounded-full">
                  {t.librarySetsCount}
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                {t.librarySubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Simplified vs Traditional Script Toggle */}
            <div className="flex items-center p-1 bg-stone-200/70 rounded-xl border border-stone-300/60 shadow-2xs">
              <button
                type="button"
                onClick={() => handleScriptToggle('simplified')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  !isTrad
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t.scriptSimplified}
              </button>
              <button
                type="button"
                onClick={() => handleScriptToggle('traditional')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isTrad
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t.scriptTraditional}
              </button>
            </div>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              title={t.closeBtn}
              aria-label={t.closeBtn}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* SEARCH BAR (Notice: NO autoFocus to protect mobile screens from automatic keyboard popup) */}
        <div className="px-5 py-3 border-b border-stone-200 bg-white shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-9 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* MAIN BODY: Two-column Explorer or Search Results */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {searchResults !== null ? (
            /* SEARCH RESULTS VIEW */
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {formatText(t.searchResultsHeader, { count: searchResults.length })}
                </span>
                <span className="text-xs text-stone-400">
                  {t.searchHint}
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="py-16 text-center text-stone-400">
                  <p className="text-sm font-medium">
                    {formatText(t.noSetsFound, { query: searchQuery })}
                  </p>
                  <p className="text-xs mt-1">
                    {t.noSetsFoundHint}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.map((set) => (
                    <CharacterSetCard
                      key={set.id}
                      set={set}
                      isTrad={isTrad}
                      applyLabel={t.applySet}
                      onSelect={() => onSelectSet(set, selectedScript)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* BROWSE TREE VIEW */
            <>
              {/* DESKTOP LEFT SIDEBAR: Category List (Hidden on small mobile) */}
              <aside className="hidden md:flex flex-col w-72 shrink-0 border-r border-stone-200 bg-stone-50/50 overflow-y-auto p-3 space-y-1">
                <span className="text-[11px] font-bold text-stone-400 px-3 py-1.5 uppercase tracking-wider">
                  {formatText(t.categoriesLabel, { count: CHARACTER_CATEGORIES.length })}
                </span>
                {CHARACTER_CATEGORIES.map((cat) => {
                  const isActive = cat.id === activeCategoryId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategoryId(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white font-semibold shadow-xs'
                          : 'text-stone-700 hover:bg-stone-200/60 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-600'
                          }`}
                        >
                          {getCategoryIcon(cat.iconName, 'w-4 h-4')}
                        </div>
                        <div className="truncate">
                          <div className="text-xs leading-tight truncate">
                            {isTrad ? cat.nameTrad : cat.nameSimp}
                          </div>
                          <div
                            className={`text-[10px] leading-tight truncate ${
                              isActive ? 'text-white/80' : 'text-stone-400'
                            }`}
                          >
                            {cat.nameEn}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          isActive ? 'bg-white/25 text-white' : 'bg-stone-200/60 text-stone-500'
                        }`}
                      >
                        {cat.sets.length}
                      </span>
                    </button>
                  );
                })}
              </aside>

              {/* DESKTOP RIGHT CONTENT: Active Category Sets */}
              <main className="hidden md:block flex-1 overflow-y-auto p-6">
                {(() => {
                  const activeCat =
                    CHARACTER_CATEGORIES.find((c) => c.id === activeCategoryId) ||
                    CHARACTER_CATEGORIES[0];
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                            {getCategoryIcon(activeCat.iconName, 'w-5 h-5')}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-stone-900">
                              {isTrad ? activeCat.nameTrad : activeCat.nameSimp}
                            </h3>
                            <p className="text-xs text-stone-400">
                              {activeCat.nameEn} · {formatText(t.subtopicsCount, { count: activeCat.sets.length })}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-stone-400">{t.clickSetToLoad}</span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                        {activeCat.sets.map((set) => (
                          <CharacterSetCard
                            key={set.id}
                            set={set}
                            isTrad={isTrad}
                            applyLabel={t.applySet}
                            onSelect={() => onSelectSet(set, selectedScript)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </main>

              {/* MOBILE ACCORDION VIEW: Full Tree of Categories on small screens */}
              <div className="block md:hidden flex-1 overflow-y-auto p-3 space-y-2">
                {CHARACTER_CATEGORIES.map((cat) => {
                  const isExpanded = !!expandedMobileCategories[cat.id];
                  return (
                    <div
                      key={cat.id}
                      className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => toggleMobileCategory(cat.id)}
                        className="w-full flex items-center justify-between p-3.5 bg-stone-50/70 hover:bg-stone-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-stone-200/80 text-stone-600 flex items-center justify-center">
                            {getCategoryIcon(cat.iconName, 'w-4 h-4')}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-stone-900 block">
                              {isTrad ? cat.nameTrad : cat.nameSimp}
                            </span>
                            <span className="text-[10px] text-stone-400">{cat.nameEn}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-stone-500 bg-stone-200/60 px-1.5 py-0.5 rounded-full">
                            {formatText(t.setsCount, { count: cat.sets.length })}
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 text-stone-400 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-3 border-t border-stone-200 space-y-2.5 bg-white">
                          {cat.sets.map((set) => (
                            <CharacterSetCard
                              key={set.id}
                              set={set}
                              isTrad={isTrad}
                              applyLabel={t.applySet}
                              onSelect={() => onSelectSet(set, selectedScript)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <footer className="px-5 py-3 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-2">
            <span>
              {t.modeLabel}{' '}
              <strong className="text-stone-800">
                {isTrad ? t.modeTrad : t.modeSimp}
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-stone-100 text-stone-700 font-semibold rounded-lg border border-stone-200 shadow-2xs transition-colors cursor-pointer"
          >
            {t.modalDoneBtn}
          </button>
        </footer>
      </div>
    </div>
  );
};

// Reusable 10-character Set Card component
interface CharacterSetCardProps {
  set: CharacterSet;
  isTrad: boolean;
  applyLabel: string;
  onSelect: () => void;
}

const CharacterSetCard: React.FC<CharacterSetCardProps> = ({
  set,
  isTrad,
  applyLabel,
  onSelect,
}) => {
  const characters = isTrad ? set.charactersTrad : set.charactersSimp;
  const subcategoryTitle = isTrad ? set.subcategoryTrad : set.subcategorySimp;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group w-full p-3 bg-white hover:bg-red-50/40 rounded-xl border border-stone-200 hover:border-red-300 text-left transition-all duration-150 shadow-2xs hover:shadow-sm cursor-pointer flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold text-stone-900 group-hover:text-red-700 transition-colors">
            {subcategoryTitle}
          </span>
          <span className="text-[11px] text-stone-400 font-medium">
            {set.subcategoryEn}
          </span>
        </div>
        <span className="text-[10px] font-bold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          {applyLabel} <Check className="w-3 h-3" />
        </span>
      </div>

      {/* 10 character boxes displayed clearly */}
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
        {characters.map((char, idx) => (
          <div
            key={idx}
            className="aspect-square flex items-center justify-center bg-stone-50 group-hover:bg-white rounded-md border border-stone-200/90 text-stone-800 font-heiti font-normal text-sm sm:text-base select-none shadow-2xs transition-colors"
          >
            {char}
          </div>
        ))}
      </div>
    </button>
  );
};
