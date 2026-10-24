import React from 'react';
import { PhoneCall, ShieldAlert, Flame, Camera, X, AlertTriangle } from 'lucide-react';
import { AppLanguage } from '../types';
import { t } from '../utils/translations';

interface EmergencyHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportEmergencyWithPhoto: () => void;
  language: AppLanguage;
}

export const EmergencyHelpModal: React.FC<EmergencyHelpModalProps> = ({
  isOpen,
  onClose,
  onReportEmergencyWithPhoto,
  language,
}) => {
  if (!isOpen) return null;

  const strings = t(language);
  const isUrdu = language === 'ur';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            <span>{strings.emergencyNumbers}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-slate-600">
          {isUrdu
            ? 'کسی بھی جان لیوا صورتحال یا فوری خطرے کے لیے براہ راست کال کریں:'
            : 'For immediate life-threatening incidents, tap below to contact emergency dispatchers:'}
        </p>

        {/* 3 Large Tap to Call Buttons (Rescue 1122, Police 15, Fire 16) */}
        <div className="space-y-2.5">
          {/* Rescue 1122 */}
          <a
            href="tel:1122"
            className="w-full min-h-[56px] h-14 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-2xl px-5 flex items-center justify-between font-bold text-base shadow-sm"
          >
            <div className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5 animate-pulse" />
              <span>{strings.callRescue1122}</span>
            </div>
            <span className="font-mono text-xl font-black">1122</span>
          </a>

          {/* Police 15 */}
          <a
            href="tel:15"
            className="w-full min-h-[56px] h-14 bg-slate-900 hover:bg-black active:scale-98 text-white rounded-2xl px-5 flex items-center justify-between font-bold text-base shadow-sm"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
              <span>{strings.callPolice15}</span>
            </div>
            <span className="font-mono text-xl font-black text-teal-400">15</span>
          </a>

          {/* Fire 16 */}
          <a
            href="tel:16"
            className="w-full min-h-[56px] h-14 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-2xl px-5 flex items-center justify-between font-bold text-base shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5" />
              <span>{strings.callFire16}</span>
            </div>
            <span className="font-mono text-xl font-black">16</span>
          </a>
        </div>

        {/* Report an emergency with photo button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onReportEmergencyWithPhoto();
            }}
            className="w-full min-h-[56px] h-14 bg-red-50 hover:bg-red-100 text-red-800 border-2 border-red-300 rounded-2xl font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Camera className="w-5 h-5 text-red-600" />
            <span>{strings.reportWithEmergencyFlag}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
