import React, { useState } from 'react';
import { Phone, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { AppLanguage, UserSession } from '../types';
import { t } from '../utils/translations';
import { saveCitizenSession } from '../utils/storage';

interface CitizenLoginScreenProps {
  language: AppLanguage;
  onToggleLanguage: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const CitizenLoginScreen: React.FC<CitizenLoginScreenProps> = ({
  language,
  onToggleLanguage,
  onLoginSuccess,
}) => {
  const strings = t(language);
  const isUrdu = language === 'ur';

  // Mode: 'choices' | 'phone_input' | 'otp_verify'
  const [step, setStep] = useState<'choices' | 'phone_input' | 'otp_verify'>('choices');
  const [phoneNumber, setPhoneNumber] = useState('+92 300 ');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.replace(/\D/g, '').length < 10) {
      setError(isUrdu ? 'براہ کرم درست فون نمبر درج کریں' : 'Please enter a valid phone number');
      return;
    }
    setError(null);
    setStep('otp_verify');
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Accept any 6-digit code for demo
    if (otpCode.trim().length !== 6) {
      setError(isUrdu ? 'براہ کرم ۶ ہندسوں کا کوڈ درج کریں' : 'Please enter 6 digits');
      return;
    }
    const session: UserSession = {
      id: `citizen-${Date.now()}`,
      role: 'citizen',
      name: 'Citizen Peshawar',
      phone: phoneNumber,
      createdAt: new Date().toISOString(),
    };
    saveCitizenSession(session);
    onLoginSuccess(session);
  };

  const handleGoogleLogin = () => {
    const session: UserSession = {
      id: `citizen-g-${Date.now()}`,
      role: 'citizen',
      name: 'Google User',
      email: 'citizen@peshawar.kp.gov.pk',
      createdAt: new Date().toISOString(),
    };
    saveCitizenSession(session);
    onLoginSuccess(session);
  };

  const handleGuestLogin = () => {
    const session: UserSession = {
      id: `guest-${Date.now()}`,
      role: 'citizen',
      name: isUrdu ? 'مہمان شہری' : 'Guest Citizen',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    saveCitizenSession(session);
    onLoginSuccess(session);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between max-w-[480px] mx-auto p-6">
      {/* Top Bar with Language Toggle */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm font-semibold text-slate-500">
          Khyber Pakhtunkhwa
        </div>

        <button
          type="button"
          onClick={onToggleLanguage}
          className="px-3 py-1.5 rounded-xl text-base font-semibold text-teal-800 hover:bg-teal-50 transition-colors cursor-pointer"
        >
          {strings.headerLang}
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-center my-6">
        {/* Brand & Welcome */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-teal-700 text-white flex items-center justify-center font-bold text-3xl shadow-sm mx-auto mb-4">
            {isUrdu ? 'آ' : 'A'}
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {strings.welcome}
          </h1>
          <p className="text-base text-slate-500 mt-1 max-w-xs mx-auto">
            {strings.loginSubtitle}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold text-center">
            {error}
          </div>
        )}

        {/* STEP 1: Main Choices */}
        {step === 'choices' && (
          <div className="space-y-3.5">
            {/* Phone Login Button */}
            <button
              type="button"
              onClick={() => setStep('phone_input')}
              className="w-full min-h-[56px] h-14 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-3 shadow-sm cursor-pointer"
            >
              <Phone className="w-5 h-5" />
              <span>{strings.continuePhone}</span>
            </button>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full min-h-[56px] h-14 bg-white hover:bg-slate-50 active:scale-98 text-slate-800 border border-slate-300 rounded-2xl text-base font-bold flex items-center justify-center gap-3 shadow-2xs cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{strings.continueGoogle}</span>
            </button>

            {/* Instant Guest Mode Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleGuestLogin}
                className="text-base text-teal-800 font-semibold underline py-2 cursor-pointer"
              >
                {strings.continueGuest}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Phone Input */}
        {step === 'phone_input' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {strings.phoneLabel}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+92 300 1234567"
                autoFocus
                className="w-full text-lg font-mono bg-white border border-slate-300 rounded-2xl p-4 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[56px] h-14 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>{strings.next}</span>
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>

            <button
              type="button"
              onClick={() => setStep('choices')}
              className="w-full text-center text-base text-slate-600 font-semibold py-2 cursor-pointer"
            >
              {strings.back}
            </button>
          </form>
        )}

        {/* STEP 3: OTP Verify */}
        {step === 'otp_verify' && (
          <form onSubmit={handleOtpVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                {strings.enterCode}
              </label>
              <p className="text-xs text-orange-600 font-medium mb-3">
                {strings.demoModeNote}
              </p>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                className="w-full text-2xl font-mono tracking-widest text-center bg-white border border-slate-300 rounded-2xl p-4 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[56px] h-14 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>{strings.verifyAndLogin}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('phone_input')}
              className="w-full text-center text-base text-slate-600 font-semibold py-2 cursor-pointer"
            >
              {strings.back}
            </button>
          </form>
        )}
      </div>

      {/* Privacy Note */}
      <div className="pt-4 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          {strings.privacyNote}
        </p>
      </div>
    </div>
  );
};
