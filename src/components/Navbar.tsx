import React from 'react';
import { HanziLogo } from './HanziLogo';

export const Navbar: React.FC = () => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Project Logo matching Screenshot 3 */}
        <div className="flex items-center">
          <HanziLogo size={36} />
          <span className="font-extrabold text-slate-900 text-2xl tracking-tight leading-none ml-2.5 select-none">
            HanziCraft
          </span>
        </div>
      </div>
    </header>
  );
};
