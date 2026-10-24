import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, X } from 'lucide-react';
import { Complaint, AppLanguage } from '../types';
import { t } from '../utils/translations';

interface EmergencyAlertModalProps {
  complaint: Complaint;
  onClose: () => void;
  language?: AppLanguage;
}

export const EmergencyAlertModal: React.FC<EmergencyAlertModalProps> = ({
  complaint,
  onClose,
  language = 'en',
}) => {
  const strings = t(language);
  const isUrdu = language === 'ur';

  const summary = isUrdu ? complaint.aiAnalysis.summary_urdu : complaint.aiAnalysis.summary;

  return (
    <div className="fixed inset-0 z-50 bg-red-950/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-red-900 border-2 border-red-500 rounded-3xl p-6 sm:p-8 text-white shadow-2xl text-center space-y-6">
        {/* Warning Icon */}
        <div className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-lg ring-4 ring-red-400/40">
          <AlertTriangle className="w-12 h-12 stroke-[2.5]" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {strings.emergencyTitle}
          </h1>
          <p className="text-base text-red-200 mt-1">
            {strings.emergencySub}
          </p>
        </div>

        {/* Short Summary */}
        <div className="bg-red-950/60 border border-red-500/40 rounded-2xl p-4 text-sm text-red-100 text-left rtl:text-right space-y-1">
          <p className="font-semibold text-white leading-snug">{summary}</p>
          <p className="text-xs text-red-300">{complaint.location.areaName} · Severity 5</p>
        </div>

        {/* Two Huge Tap-to-Call Buttons (min 60px tall) */}
        <div className="space-y-3">
          {/* Rescue 1122 */}
          <a
            href="tel:1122"
            className="w-full min-h-[64px] bg-red-600 hover:bg-red-500 active:scale-98 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xl transition-all font-bold cursor-pointer border border-red-400"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white text-red-600 flex items-center justify-center shrink-0">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-lg font-bold">{strings.callRescue1122}</span>
            </div>
            <span className="text-2xl font-black font-mono">1122</span>
          </a>

          {/* Police 15 */}
          <a
            href="tel:15"
            className="w-full min-h-[60px] bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-2xl px-5 py-3 flex items-center justify-between shadow-lg transition-all font-bold cursor-pointer border border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-base font-bold">{strings.callPolice15}</span>
            </div>
            <span className="text-xl font-black font-mono text-teal-400">15</span>
          </a>
        </div>

        {/* Dismiss Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-sm text-red-200 hover:text-white underline font-semibold cursor-pointer"
          >
            {strings.dismissEmergency}
          </button>
        </div>
      </div>
    </div>
  );
};
