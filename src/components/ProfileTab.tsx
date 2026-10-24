import React, { useState } from 'react';
import { User, Phone, Globe, Bell, PhoneCall, ShieldAlert, Flame, Info, LogOut, HeartHandshake, CheckCircle2, Send } from 'lucide-react';
import { AppLanguage, UserSession } from '../types';
import { t } from '../utils/translations';
import { getComplaints, getUserCreatedComplaintIds } from '../utils/storage';

interface ProfileTabProps {
  session: UserSession | null;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onSignOut: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  session,
  language,
  onLanguageChange,
  onSignOut,
}) => {
  const strings = t(language);
  const isUrdu = language === 'ur';

  // Notifications setting toggle state
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const val = localStorage.getItem('awaaz_notifications_enabled_v1');
    return val !== null ? val === 'true' : true;
  });

  const handleToggleNotifications = () => {
    const nextVal = !notificationsEnabled;
    setNotificationsEnabled(nextVal);
    try {
      localStorage.setItem('awaaz_notifications_enabled_v1', String(nextVal));
    } catch {}
  };

  // Compute live citizen stats
  const allComplaints = getComplaints();
  const userComplaintIds = getUserCreatedComplaintIds();
  const myComplaints = allComplaints.filter((c) => userComplaintIds.includes(c.id));

  const totalSent = myComplaints.length;
  const totalResolved = myComplaints.filter((c) => c.status === 'resolved').length;
  const totalCitizensHelped = myComplaints.reduce(
    (sum, c) => sum + (c.affectedCitizens || 1),
    0
  );

  const displayName = session?.name || (isUrdu ? 'شہری صارف' : 'Peshawar Citizen');
  const displayPhone = session?.phone || '+92 300 0000000';

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 py-5 space-y-6 animate-in fade-in pb-28">
      {/* User Info Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-900 truncate">
              {displayName}
            </h2>
            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{displayPhone}</span>
            </div>
            {session?.isGuest && (
              <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md">
                {isUrdu ? 'مہمان صارف' : 'Guest Account'}
              </span>
            )}
          </div>
        </div>

        {/* Citizen Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
          <div className="bg-slate-50 rounded-2xl p-3">
            <div className="flex justify-center mb-1">
              <Send className="w-4 h-4 text-teal-700" />
            </div>
            <div className="text-xl font-black text-slate-900">{totalSent}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5 truncate">
              {strings.complaintsSent}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3">
            <div className="flex justify-center mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-slate-900">{totalResolved}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5 truncate">
              {strings.complaintsResolved}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3">
            <div className="flex justify-center mb-1">
              <HeartHandshake className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-xl font-black text-slate-900">{totalCitizensHelped}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5 truncate">
              {strings.citizensHelped}
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-teal-700" />
          <span>{isUrdu ? 'زبان کی ترجیح' : 'App Language'}</span>
        </h3>

        {/* Language selector buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`min-h-[48px] h-12 rounded-xl text-base font-bold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('ur')}
            className={`min-h-[48px] h-12 rounded-xl text-base font-bold transition-all cursor-pointer ${
              language === 'ur'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            اردو
          </button>
        </div>

        {/* Notifications Switch */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-800">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900">
                {strings.notificationsToggle}
              </div>
              <div className="text-xs text-slate-500">
                {isUrdu
                  ? 'شکایات کے حل کی لائیو اطلاعات موصول کریں'
                  : 'Receive real-time progress updates'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleNotifications}
            aria-label="Toggle notifications"
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              notificationsEnabled ? 'bg-teal-700 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
          </button>
        </div>
      </div>

      {/* Emergency Numbers Section (3 tap to call buttons) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-red-600" />
          <span>{strings.emergencyNumbers}</span>
        </h3>

        <div className="space-y-2.5">
          {/* Rescue 1122 */}
          <a
            href="tel:1122"
            className="w-full min-h-[56px] h-14 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-2xl px-4 flex items-center justify-between font-bold text-base shadow-xs"
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
            className="w-full min-h-[56px] h-14 bg-slate-900 hover:bg-black active:scale-98 text-white rounded-2xl px-4 flex items-center justify-between font-bold text-base shadow-xs"
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
            className="w-full min-h-[56px] h-14 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-2xl px-4 flex items-center justify-between font-bold text-base shadow-xs"
          >
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5" />
              <span>{strings.callFire16}</span>
            </div>
            <span className="font-mono text-xl font-black">16</span>
          </a>
        </div>
      </div>

      {/* About Awaaz Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-2">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Info className="w-5 h-5 text-teal-700" />
          <span>{strings.aboutAwaaz}</span>
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {strings.aboutAwaazText}
        </p>
        <div className="pt-2 text-xs text-slate-400 font-mono">
          Awaaz v2.4 • Peshawar Civic Redressal
        </div>
      </div>

      {/* Sign Out Button (56px tall) */}
      <button
        type="button"
        onClick={onSignOut}
        className="w-full min-h-[56px] h-14 bg-slate-100 hover:bg-red-50 hover:text-red-700 active:scale-98 text-slate-700 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200"
      >
        <LogOut className="w-5 h-5" />
        <span>{strings.signOut}</span>
      </button>
    </div>
  );
};
