import React from 'react';
import { Bell, X, CheckCheck, Clock, CheckCircle2, Users, AlertTriangle } from 'lucide-react';
import { AppLanguage, AppNotification } from '../types';
import { t } from '../utils/translations';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  language: AppLanguage;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  language,
}) => {
  if (!isOpen) return null;

  const strings = t(language);
  const isUrdu = language === 'ur';

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-700" />
            <h2 className="text-lg font-bold text-slate-900">
              {strings.notificationsTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-teal-800 hover:text-teal-950 cursor-pointer"
            >
              {strings.markAllRead}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* List of notifications */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-medium">
              {strings.noNotifications}
            </div>
          ) : (
            notifications.map((n) => {
              const title = isUrdu ? n.titleUrdu : n.title;
              const msg = isUrdu ? n.messageUrdu : n.message;

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    n.read
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-teal-50/50 border-teal-200 text-slate-900 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-bold text-sm leading-snug">{title}</span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 mt-1 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-1">{msg}</p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatTime(n.timestamp)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Close Button */}
        <div className="pt-3 border-t border-slate-200 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[56px] h-14 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-base text-slate-800 cursor-pointer"
          >
            {strings.close}
          </button>
        </div>
      </div>
    </div>
  );
};
