import React from 'react';
import { Camera, Mic, CheckCircle2, ArrowRight, X, Sparkles } from 'lucide-react';
import { AppLanguage } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  const isUrdu = language === 'ur';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-teal-100 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Splash */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-200">
            <span className="font-urdu text-2xl font-bold">آ</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Awaaz</h2>
            <span className="font-urdu text-xl font-bold text-teal-800">آواز</span>
          </div>

          <p className="text-xs font-semibold text-orange-600 mt-1 uppercase tracking-wider">
            {isUrdu ? 'آپ کی آواز، آپ کا شہر' : 'Your voice, your city'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {isUrdu
              ? 'پشاور کے بلدیاتی مسائل کے حل کے لیے مصنوعی ذہانت پر مبنی جدید نظام'
              : 'Empowering citizens of Peshawar to report municipal hazards in 3 effortless steps'}
          </p>
        </div>

        {/* 3 Steps: Snap, Speak, Track */}
        <div className="space-y-3.5 mb-6">
          {/* Step 1: Snap */}
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">1. Snap · تصویر لیں</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                {isUrdu
                  ? 'سڑک کے کھڈے، کچرے یا بجلی کے خطرے کی تصویر کھینچیں یا اپلوڈ کریں۔'
                  : 'Take or upload a photo of the road damage, overflowing trash, or electrical hazard.'}
              </p>
            </div>
          </div>

          {/* Step 2: Speak */}
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-orange-50/70 border border-orange-200/80">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">2. Speak · بولیں</span>
                <span className="text-[10px] bg-orange-200/70 text-orange-800 font-bold px-1.5 py-0.2 rounded">
                  Pashto · Urdu · English
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                {isUrdu
                  ? 'مائیک دبائیں اور پشتو، اردو یا انگلش میں مسئلہ بیان کریں۔ لکھنے کی ضرورت نہیں۔'
                  : 'Hold the mic to record a voice note in Pashto, Urdu, or English. No typing needed.'}
              </p>
            </div>
          </div>

          {/* Step 3: Track */}
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">3. Track · ٹریک کریں</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                {isUrdu
                  ? 'اے آئی فوری طور پر متعلقہ محکمے (WSSP, PDA, PESCO) کو بھیجتا ہے، جہاں آپ پیش رفت دیکھ سکتے ہیں۔'
                  : 'Gemini AI automatically routes to WSSP, PDA, or PESCO with live status tracking.'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
        >
          <span>{isUrdu ? 'شروع کریں' : 'Get Started'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
