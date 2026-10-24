import React, { useState, useEffect } from 'react';
import { Camera, Mic, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { AppLanguage } from '../types';
import { t } from '../utils/translations';
import { setOnboardingDone } from '../utils/storage';

interface SplashAndOnboardingProps {
  language: AppLanguage;
  onFinish: () => void;
  onToggleLanguage: () => void;
}

export const SplashAndOnboarding: React.FC<SplashAndOnboardingProps> = ({
  language,
  onFinish,
  onToggleLanguage,
}) => {
  const [phase, setPhase] = useState<'splash' | 'onboarding'>('splash');
  const [cardIndex, setCardIndex] = useState(0);

  const strings = t(language);
  const isUrdu = language === 'ur';

  // Splash timer for 1.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('onboarding');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    setOnboardingDone();
    onFinish();
  };

  const handleNext = () => {
    if (cardIndex < 2) {
      setCardIndex(cardIndex + 1);
    } else {
      handleComplete();
    }
  };

  if (phase === 'splash') {
    return (
      <div className="fixed inset-0 z-50 bg-teal-800 flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-300">
        <div className="w-24 h-24 rounded-3xl bg-white text-teal-800 flex items-center justify-center font-bold text-4xl shadow-xl mb-4">
          {isUrdu ? 'آ' : 'A'}
        </div>
        <h1 className="text-3xl font-black tracking-tight">{strings.appName}</h1>
        <p className="text-base text-teal-100 mt-1 font-medium">{strings.tagline}</p>
      </div>
    );
  }

  const cards = [
    {
      title: strings.snap,
      description: strings.snapDesc,
      icon: Camera,
      badgeColor: 'bg-teal-50 text-teal-800',
    },
    {
      title: strings.speak,
      description: strings.speakDesc,
      icon: Mic,
      badgeColor: 'bg-orange-50 text-orange-800',
    },
    {
      title: strings.track,
      description: strings.trackDesc,
      icon: CheckCircle2,
      badgeColor: 'bg-emerald-50 text-emerald-800',
    },
  ];

  const CurrentIcon = cards[cardIndex].icon;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between max-w-[480px] mx-auto p-6 animate-in fade-in">
      {/* Top Bar: Skip on left/right + Language switch */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleComplete}
          className="text-base font-semibold text-slate-500 hover:text-slate-800 py-2 cursor-pointer"
        >
          {strings.skip}
        </button>

        <button
          type="button"
          onClick={onToggleLanguage}
          className="px-3 py-1.5 rounded-xl text-base font-semibold text-teal-800 hover:bg-teal-50 transition-colors cursor-pointer"
        >
          {strings.headerLang}
        </button>
      </div>

      {/* Middle Card */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 my-8">
        <div className="w-32 h-32 rounded-3xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-8 shadow-xs">
          <CurrentIcon className="w-16 h-16 stroke-[2]" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          {cards[cardIndex].title}
        </h2>
        <p className="text-base text-slate-600 leading-relaxed max-w-xs">
          {cards[cardIndex].description}
        </p>

        {/* 3 Dots */}
        <div className="flex items-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === cardIndex ? 'w-8 bg-teal-700' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="pb-4">
        <button
          type="button"
          onClick={handleNext}
          className="w-full min-h-[56px] h-14 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>{cardIndex === 2 ? strings.getStarted : strings.next}</span>
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
