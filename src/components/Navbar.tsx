import React from 'react';
import { HanziLogo } from './HanziLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

export const Navbar: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="no-print sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Project Logo & Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <HanziLogo size={36} />
            <span className="font-extrabold text-slate-900 text-2xl tracking-tight leading-none ml-2.5 select-none">
              HanziCraft
            </span>
          </div>
          <span className="hidden md:inline-block text-xs font-medium text-stone-400 border-l border-stone-200 pl-3">
            {t.brandSubtitle}
          </span>
        </div>

        {/* Global English / Traditional / Simplified Language Switcher */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
