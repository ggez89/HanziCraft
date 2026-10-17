import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

const LANGUAGES: { code: Language; shortLabel: string; fullLabel: string }[] = [
  { code: 'en', shortLabel: 'EN', fullLabel: 'English' },
  { code: 'zh-Hans', shortLabel: '简', fullLabel: '简体中文' },
  { code: 'zh-Hant', shortLabel: '繁', fullLabel: '繁體中文' },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  compact = false,
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 bg-stone-100 hover:bg-stone-200/70 border border-stone-200/90 rounded-xl transition-all shadow-2xs ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <div className="pl-1.5 pr-0.5 text-stone-400 flex items-center justify-center">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center gap-0.5">
        {LANGUAGES.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer select-none ${
                isActive
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
              title={lang.fullLabel}
            >
              <span className={compact ? 'inline' : 'hidden sm:inline'}>{lang.fullLabel}</span>
              <span className={compact ? 'hidden' : 'inline sm:hidden'}>{lang.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
