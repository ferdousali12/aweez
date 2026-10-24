import React, { useRef } from 'react';
import { Bell } from 'lucide-react';
import { AppLanguage } from '../types';

interface CleanHeaderProps {
  language: AppLanguage;
  onToggleLanguage: () => void;
  onUnlockDemoTools: () => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
}

export const CleanHeader: React.FC<CleanHeaderProps> = ({
  language,
  onToggleLanguage,
  onUnlockDemoTools,
  unreadCount = 0,
  onOpenNotifications,
}) => {
  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);

  const handleLogoTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 600) {
      tapCountRef.current += 1;
    } else {
      tapCountRef.current = 1;
    }
    lastTapRef.current = now;

    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      onUnlockDemoTools();
    }
  };

  const isUrdu = language === 'ur';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-[480px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo/Name only (tap 5 times for hidden demo tools) */}
        <div
          onClick={handleLogoTap}
          className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform"
          title="Awaaz"
        >
          <div className="w-10 h-10 rounded-2xl bg-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-xs">
            {isUrdu ? 'آ' : 'A'}
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">
            {isUrdu ? 'آواز' : 'Awaaz'}
          </span>
        </div>

        {/* Right side controls: Notifications Bell + Language Switch */}
        <div className="flex items-center gap-1.5">
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-2xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white" />
              )}
            </button>
          )}

          {/* Language switch English | اردو */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="px-3 py-2 rounded-xl text-base font-semibold text-teal-800 hover:bg-teal-50 transition-colors cursor-pointer"
            aria-label="Switch Language"
          >
            {isUrdu ? 'English' : 'اردو'}
          </button>
        </div>
      </div>
    </header>
  );
};
