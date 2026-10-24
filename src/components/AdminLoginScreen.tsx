import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, Key, Lock, Mail, Building2, Check } from 'lucide-react';
import { AppLanguage, UserSession } from '../types';
import { t } from '../utils/translations';
import { saveAdminSession } from '../utils/storage';
import { getOrganizationById } from '../data/organizations';

interface AdminLoginScreenProps {
  language: AppLanguage;
  onLoginSuccess: (session: UserSession) => void;
  onSwitchToCitizen: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  language,
  onLoginSuccess,
  onSwitchToCitizen,
}) => {
  const strings = t(language);
  const isUrdu = language === 'ur';

  const [email, setEmail] = useState('admin@awaaz.pk');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Super Admin
    if (cleanEmail === 'admin@awaaz.pk' && (cleanPass === 'admin123' || cleanPass === 'demo123')) {
      const session: UserSession = {
        id: 'admin-super-1',
        role: 'admin',
        name: 'Chief Municipal Officer',
        email: 'admin@awaaz.pk',
        createdAt: new Date().toISOString(),
      };
      saveAdminSession(session);
      onLoginSuccess(session);
      return;
    }

    // 2. Organization Officers (wssp@awaaz.pk, tma@awaaz.pk, pesco@awaaz.pk, etc.)
    const orgMap: Record<string, { id: string; name: string }> = {
      'wssp@awaaz.pk': { id: 'wssp', name: 'WSSP Grievance Officer' },
      'tma@awaaz.pk': { id: 'tma', name: 'TMA Peshawar Enforcement Officer' },
      'pesco@awaaz.pk': { id: 'pesco', name: 'PESCO Dispatch Supervisor' },
      'traffic@awaaz.pk': { id: 'traffic', name: 'Traffic Control Warden' },
      'rescue1122@awaaz.pk': { id: 'rescue1122', name: 'Rescue 1122 Dispatcher' },
      'police@awaaz.pk': { id: 'police', name: 'Peshawar Police Liaison' },
    };

    if (orgMap[cleanEmail] && (cleanPass === 'demo123' || cleanPass === 'admin123')) {
      const match = orgMap[cleanEmail];
      const org = getOrganizationById(match.id);
      const session: UserSession = {
        id: `officer-${match.id}-${Date.now()}`,
        role: 'officer',
        organizationId: match.id,
        name: match.name,
        email: cleanEmail,
        createdAt: new Date().toISOString(),
      };
      saveAdminSession(session);
      onLoginSuccess(session);
      return;
    }

    setError(
      isUrdu
        ? 'غلط لاگ ان تفصیلات۔ براہ کرم نیچے دیے گئے ڈیمو اکاؤنٹس استعمال کریں۔'
        : 'Invalid credentials. Please click one of the demo credentials below.'
    );
  };

  const handleSelectDemo = (eMail: string, pass: string) => {
    setEmail(eMail);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center max-w-[480px] mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <button
            type="button"
            onClick={onSwitchToCitizen}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{strings.switchToCitizen}</span>
          </button>

          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Gov Official Portal
          </span>
        </div>

        {/* Title */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <ShieldAlert className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {strings.officerLogin}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Peshawar Municipal Administration Portal
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {strings.adminEmail}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 text-sm focus:outline-teal-700 focus:border-teal-700 font-mono"
                placeholder="officer@awaaz.pk"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {strings.adminPassword}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 text-sm focus:outline-teal-700 focus:border-teal-700 font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[56px] h-14 bg-teal-800 hover:bg-teal-900 active:scale-98 text-white rounded-2xl font-bold text-base shadow-sm transition-all cursor-pointer mt-2"
          >
            {strings.adminSignIn}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Key className="w-3.5 h-3.5 text-teal-700" />
            <span>{strings.demoCredentials} (Tap to Auto-fill)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Super Admin */}
            <button
              type="button"
              onClick={() => handleSelectDemo('admin@awaaz.pk', 'admin123')}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                email === 'admin@awaaz.pk'
                  ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="font-bold">Super Admin</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">admin@awaaz.pk</div>
            </button>

            {/* WSSP */}
            <button
              type="button"
              onClick={() => handleSelectDemo('wssp@awaaz.pk', 'demo123')}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                email === 'wssp@awaaz.pk'
                  ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="font-bold">WSSP Officer</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">wssp@awaaz.pk</div>
            </button>

            {/* TMA */}
            <button
              type="button"
              onClick={() => handleSelectDemo('tma@awaaz.pk', 'demo123')}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                email === 'tma@awaaz.pk'
                  ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="font-bold">TMA Peshawar</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">tma@awaaz.pk</div>
            </button>

            {/* PESCO */}
            <button
              type="button"
              onClick={() => handleSelectDemo('pesco@awaaz.pk', 'demo123')}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                email === 'pesco@awaaz.pk'
                  ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="font-bold">PESCO Officer</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">pesco@awaaz.pk</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
