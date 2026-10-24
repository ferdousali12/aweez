import React, { useState } from 'react';
import { Check, ArrowRight, RotateCcw, Users, Building2, Mail, ExternalLink, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { Complaint, AppLanguage } from '../types';
import { t } from '../utils/translations';
import { getOrganizationById } from '../data/organizations';

interface SuccessViewProps {
  complaint: Complaint;
  duplicateCount?: number;
  onTrack: () => void;
  onReportAnother: () => void;
  language: AppLanguage;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  complaint,
  duplicateCount,
  onTrack,
  onReportAnother,
  language,
}) => {
  const strings = t(language);
  const isUrdu = language === 'ur';

  const [showEmailPreview, setShowEmailPreview] = useState(true);

  const org = getOrganizationById(complaint.organizationId);
  const categoryLabel = strings.categories[complaint.aiAnalysis.category] || complaint.aiAnalysis.category;
  const summaryText = isUrdu ? complaint.aiAnalysis.summary_urdu : complaint.aiAnalysis.summary;
  const affectedCount = duplicateCount || complaint.affectedCitizens || 1;

  // Dispatch log text
  const dispatchText =
    complaint.dispatchLog?.[0]?.message ||
    `Sent to ${org.shortName} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const letterSubject = `Urgent Complaint Dispatch: ${complaint.aiAnalysis.category.toUpperCase()} at ${complaint.location.areaName}`;
  const letterBody = complaint.letter || `To: ${org.name}\n\nProblem: ${complaint.aiAnalysis.summary}\nLocation: ${complaint.location.areaName} (${complaint.location.address})\nCoordinates: https://www.google.com/maps?q=${complaint.location.latitude},${complaint.location.longitude}\nSeverity: ${complaint.aiAnalysis.severity}/5\n\nDispatched via Awaaz Peshawar Municipal Grievance System.`;

  const mailtoLink = `mailto:${org.email}?subject=${encodeURIComponent(letterSubject)}&body=${encodeURIComponent(letterBody)}`;

  return (
    <div className="max-w-[480px] mx-auto px-4 py-6 pb-28 animate-in fade-in duration-200 space-y-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-5">
        {/* Big Green Check */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
          <Check className="w-10 h-10 stroke-[3]" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {strings.complaintSent}
          </h1>
          <p className="text-base text-slate-600 mt-1">
            {complaint.location.areaName}
          </p>
        </div>

        {/* Animated Organization Dispatch Step */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-left rtl:text-right flex items-center gap-3.5 shadow-2xs animate-in zoom-in-95">
          <div className={`w-12 h-12 rounded-xl ${org.logoBg} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs relative`}>
            <span>{org.logoText}</span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                {isUrdu ? 'کامیاب ترسیل' : 'Official Dispatch'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {dispatchText}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {org.name} ({org.email})
            </p>
          </div>
        </div>

        {/* Duplicate Notice if applicable */}
        {affectedCount > 1 && (
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 text-base font-semibold flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-orange-600 shrink-0" />
            <span>
              {strings.alreadyReportedPart1}
              <strong className="text-orange-900">{affectedCount}</strong>
              {strings.alreadyReportedPart2}
            </span>
          </div>
        )}

        {/* Details Card */}
        <div className="bg-slate-50 rounded-2xl p-4 text-left rtl:text-right space-y-3 border border-slate-100">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">{categoryLabel}</span>
            <span className="font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
              Severity {complaint.aiAnalysis.severity}/5
            </span>
          </div>

          <p className="text-base font-medium text-slate-900 leading-snug">
            {summaryText}
          </p>

          <div className="pt-2 border-t border-slate-200 text-sm text-slate-600 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="truncate">
              {strings.assignedTo} <strong>{org.name}</strong>
            </span>
          </div>
        </div>

        {/* Email Preview & Open in Email App Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left rtl:text-right space-y-3">
          <div
            onClick={() => setShowEmailPreview(!showEmailPreview)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-700" />
              <span className="text-sm font-bold text-slate-900">
                {strings.emailPreview}
              </span>
            </div>
            {showEmailPreview ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>

          {showEmailPreview && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="text-xs text-slate-500 space-y-1 font-mono">
                <div>
                  <strong className="text-slate-700 font-sans">To:</strong> {org.email}
                </div>
                <div className="truncate">
                  <strong className="text-slate-700 font-sans">Subject:</strong> {letterSubject}
                </div>
              </div>

              {/* Letter snippet */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 max-h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {letterBody}
              </div>

              {/* Open in Email App (mailto) */}
              <a
                href={mailtoLink}
                className="w-full min-h-[48px] h-12 bg-white hover:bg-slate-100 text-teal-900 border border-teal-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors"
              >
                <Mail className="w-4 h-4 text-teal-700" />
                <span>{strings.openInEmailApp}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons (at least 56px tall) */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onTrack}
            className="w-full min-h-[56px] h-14 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>{strings.trackMyComplaint}</span>
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>

          <button
            type="button"
            onClick={onReportAnother}
            className="w-full min-h-[56px] h-14 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{strings.reportAnother}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
