import React from 'react';
import { Compass, Home } from 'lucide-react';
import { AppLanguage } from '../types';
import { t } from '../utils/translations';

interface NotFoundPageProps {
  language: AppLanguage;
  onGoHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ language, onGoHome }) => {
  const strings = t(language);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-[480px] bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-50 flex items-center justify-center text-teal-700">
          <Compass className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-800">{strings.pageNotFound}</h2>
          <p className="text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
            {strings.pageNotFoundDesc}
          </p>
        </div>

        <button
          type="button"
          onClick={onGoHome}
          className="w-full min-h-[56px] h-14 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Home className="w-5 h-5" />
          <span>{strings.goHome}</span>
        </button>
      </div>
    </div>
  );
};
