import React from 'react';
import { X, Sparkles, Database, ShieldAlert, RotateCcw } from 'lucide-react';
import { AppLanguage } from '../types';

interface DemoToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPresetPhoto: (presetType: string) => void;
  onSelectPresetAudio: () => void;
  onLoadDemoData: () => void;
  onOpenAdmin: () => void;
  language: AppLanguage;
}

export const DemoToolsModal: React.FC<DemoToolsModalProps> = ({
  isOpen,
  onClose,
  onSelectPresetPhoto,
  onSelectPresetAudio,
  onLoadDemoData,
  onOpenAdmin,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-base">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span>Developer & Demo Tools</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          This panel is hidden from ordinary citizens and unlocked by tapping the Awaaz logo 5 times.
        </p>

        {/* Load 15 Demo Complaints */}
        <div>
          <button
            type="button"
            onClick={() => {
              onLoadDemoData();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Database className="w-4 h-4 text-teal-700" />
            <span>Load 15 Peshawar Demo Records</span>
          </button>
        </div>

        {/* Preset Hazard Photos */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Inject Preset Hazard Photo:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                onSelectPresetPhoto('road');
                onClose();
              }}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium text-slate-800 text-left"
            >
              🚧 Broken Road
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectPresetPhoto('garbage');
                onClose();
              }}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium text-slate-800 text-left"
            >
              🗑️ Waste Dump
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectPresetPhoto('electric');
                onClose();
              }}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium text-slate-800 text-left"
            >
              ⚡ Live Wire (Emergency)
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectPresetPhoto('water');
                onClose();
              }}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium text-slate-800 text-left"
            >
              💧 Pipe Leak
            </button>
          </div>
        </div>

        {/* Attach Sample Audio */}
        <div>
          <button
            type="button"
            onClick={() => {
              onSelectPresetAudio();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
          >
            🎤 Inject Sample Pashto/Urdu Voice Note
          </button>
        </div>

        {/* Admin Link */}
        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              onOpenAdmin();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            <span>Open Admin Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
