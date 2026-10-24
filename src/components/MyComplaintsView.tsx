import React, { useState } from 'react';
import { Complaint, AppLanguage, ComplaintStatus } from '../types';
import { t } from '../utils/translations';
import { ChevronRight } from 'lucide-react';
import { ComplaintTrackingScreen } from './ComplaintTrackingScreen';

interface MyComplaintsViewProps {
  complaints: Complaint[];
  userComplaintIds: string[];
  onNavigateToReport: () => void;
  language: AppLanguage;
}

export const MyComplaintsView: React.FC<MyComplaintsViewProps> = ({
  complaints,
  userComplaintIds,
  onNavigateToReport,
  language,
}) => {
  const strings = t(language);
  const isUrdu = language === 'ur';

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // If a complaint is selected, show the full dedicated Complaint Tracking Screen!
  if (selectedComplaint) {
    return (
      <ComplaintTrackingScreen
        complaint={selectedComplaint}
        onBack={() => setSelectedComplaint(null)}
        language={language}
      />
    );
  }

  // Display complaints list
  const displayList = complaints;

  const getStatusColor = (st: ComplaintStatus) => {
    switch (st) {
      case 'resolved':
        return { dot: 'bg-emerald-500', text: 'text-emerald-700', label: strings.resolved };
      case 'assigned':
        return { dot: 'bg-orange-500', text: 'text-orange-700', label: strings.assigned };
      default:
        return { dot: 'bg-slate-400', text: 'text-slate-600', label: strings.received };
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="max-w-[480px] mx-auto px-4 py-4 pb-28">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">
        {strings.myComplaintsTitle}
      </h1>

      {displayList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 my-6">
          <p className="text-base text-slate-600">
            {strings.emptyComplaints}
          </p>
          <button
            type="button"
            onClick={onNavigateToReport}
            className="w-full min-h-[56px] h-14 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-2xl font-bold text-base cursor-pointer"
          >
            {strings.startReportBtn}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((c) => {
            const stat = getStatusColor(c.status);
            const summary = isUrdu ? c.aiAnalysis.summary_urdu : c.aiAnalysis.summary;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedComplaint(c)}
                className="bg-white rounded-3xl p-4 border border-slate-200 hover:border-teal-600/40 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-3.5"
              >
                {/* Photo or placeholder */}
                {c.photoUrl ? (
                  <img
                    src={c.photoUrl}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 uppercase tracking-wider">
                    {c.aiAnalysis.category.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-base font-semibold text-slate-900 truncate">
                    {summary}
                  </p>

                  <div className="flex items-center gap-2 text-sm">
                    <span className={`w-2.5 h-2.5 rounded-full ${stat.dot}`} />
                    <span className={`font-semibold ${stat.text}`}>{stat.label}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">{formatDate(c.createdAt)}</span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 rtl:rotate-180" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
