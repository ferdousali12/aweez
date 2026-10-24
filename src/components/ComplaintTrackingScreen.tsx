import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  ShieldCheck,
  Play,
  Pause,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Complaint, AppLanguage } from '../types';
import { t } from '../utils/translations';
import { getOrganizationById } from '../data/organizations';

interface ComplaintTrackingScreenProps {
  complaint: Complaint;
  onBack: () => void;
  language: AppLanguage;
}

export const ComplaintTrackingScreen: React.FC<ComplaintTrackingScreenProps> = ({
  complaint,
  onBack,
  language,
}) => {
  const strings = t(language);
  const isUrdu = language === 'ur';

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showLetterPreview, setShowLetterPreview] = useState(false);

  const org = getOrganizationById(complaint.organizationId);
  const summary = isUrdu ? complaint.aiAnalysis.summary_urdu : complaint.aiAnalysis.summary;
  const categoryLabel =
    strings.categories[complaint.aiAnalysis.category] || complaint.aiAnalysis.category;

  const formatDateTime = (isoStr?: string) => {
    if (!isoStr) return undefined;
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // Determine stage flags
  const st = complaint.status;
  const isSent = st === 'sent_to_org' || st === 'acknowledged' || st === 'in_progress' || st === 'resolved' || st === 'assigned';
  const isAck = st === 'acknowledged' || st === 'in_progress' || st === 'resolved';
  const isInProg = st === 'in_progress' || st === 'resolved' || st === 'assigned';
  const isResolved = st === 'resolved';

  // 5 Status Steps: Received -> Sent to org -> Acknowledged -> In progress -> Resolved
  const timelineSteps = [
    {
      key: 'received',
      title: isUrdu ? 'آواز میں موصول ہوئی' : 'Received by Awaaz',
      desc: isUrdu ? 'شکایت کی تصدیق اور زمرہ بندی مکمل' : 'Initial AI verification and citizen triage',
      done: true,
      time: formatDateTime(complaint.createdAt),
    },
    {
      key: 'sent_to_org',
      title: isUrdu ? `${org.shortNameUrdu} کو روانہ` : `Sent to ${org.shortName}`,
      desc: complaint.dispatchLog?.[0]?.message || `Transmitted to ${org.email}`,
      done: isSent,
      time: formatDateTime(
        complaint.statusHistory?.find((h) => h.status === 'sent_to_org')?.timestamp ||
        complaint.dispatchLog?.[0]?.timestamp ||
        complaint.createdAt
      ),
    },
    {
      key: 'acknowledged',
      title: isUrdu ? `${org.shortNameUrdu} نے قبول کر لی` : `Acknowledged by ${org.shortName}`,
      desc: isUrdu ? 'متعلقہ محکمے نے شکایت کا نوٹس لے لیا' : `${org.shortName} control room confirmed complaint`,
      done: isAck,
      time: formatDateTime(
        complaint.statusHistory?.find((h) => h.status === 'acknowledged')?.timestamp
      ),
    },
    {
      key: 'in_progress',
      title: isUrdu ? 'فیلڈ ٹیم کی کارروائی جاری' : 'In Progress (Field Unit)',
      desc: isUrdu ? 'موقع پر تکنیکی ٹیم تعینات کر دی گئی' : 'Maintenance unit mobilized to site',
      done: isInProg,
      time: formatDateTime(
        complaint.statusHistory?.find((h) => h.status === 'in_progress' || h.status === 'assigned')?.timestamp
      ),
    },
    {
      key: 'resolved',
      title: strings.resolved,
      desc: isUrdu ? 'مسئلہ حل ہو گیا اور کام مکمل' : 'Civic problem verified rectified',
      done: isResolved,
      time: formatDateTime(
        complaint.statusHistory?.find((h) => h.status === 'resolved')?.timestamp
      ),
    },
  ];

  const letterSubject = `Complaint Reference #${complaint.id.slice(-6).toUpperCase()} — ${complaint.aiAnalysis.category.toUpperCase()}`;
  const letterBody = complaint.letter || `To: ${org.name}\n\nProblem: ${complaint.aiAnalysis.summary}\nLocation: ${complaint.location.areaName}\nCoordinates: https://www.google.com/maps?q=${complaint.location.latitude},${complaint.location.longitude}\n\nAwaaz Peshawar Municipal System.`;
  const mailtoLink = `mailto:${org.email}?subject=${encodeURIComponent(letterSubject)}&body=${encodeURIComponent(letterBody)}`;

  return (
    <div className="max-w-[480px] mx-auto px-4 py-4 pb-28 animate-in fade-in space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1.5 cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{strings.back}</span>
        </button>

        <span className="font-mono text-xs font-bold text-slate-500">
          #{complaint.id.slice(-6).toUpperCase()}
        </span>
      </div>

      {/* Large Initial Photo */}
      {complaint.photoUrl && (
        <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
          <img
            src={complaint.photoUrl}
            alt="Report Evidence"
            className="w-full h-64 object-cover object-center"
          />
        </div>
      )}

      {/* Assigned Organization Card with Logo Placeholder & Email */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3.5">
        <div className={`w-14 h-14 rounded-2xl ${org.logoBg} text-white flex items-center justify-center font-black text-sm tracking-wider shadow-xs shrink-0`}>
          <span>{org.logoText}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              {isUrdu ? 'تفویض شدہ ادارہ' : 'Assigned Agency'}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 truncate">
            {isUrdu ? org.nameUrdu : org.name}
          </h3>
          <p className="text-xs text-slate-500 truncate">
            {org.email} • {org.jurisdiction}
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
            {categoryLabel}
          </span>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            Severity {complaint.aiAnalysis.severity}/5
          </span>
        </div>

        <h1 className="text-lg font-bold text-slate-900 leading-snug">
          {summary}
        </h1>

        {/* Location */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
          <span className="truncate">{complaint.location.areaName} ({complaint.location.address})</span>
        </div>

        {/* Voice Note playback if recorded */}
        {complaint.audioUrl && (
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center gap-3 mt-2">
            <audio
              id="tracking-audio"
              src={complaint.audioUrl}
              onEnded={() => setIsPlayingAudio(false)}
            />
            <button
              type="button"
              onClick={() => {
                const audio = document.getElementById('tracking-audio') as HTMLAudioElement;
                if (!audio) return;
                if (isPlayingAudio) {
                  audio.pause();
                  setIsPlayingAudio(false);
                } else {
                  audio.play();
                  setIsPlayingAudio(true);
                }
              }}
              className="w-11 h-11 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
            >
              {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <div className="text-sm font-semibold text-slate-800">
              {strings.voiceNoteRecorded}
            </div>
          </div>
        )}
      </div>

      {/* Resolution Verification (Before/After) if present */}
      {complaint.afterPhotoUrl && (
        <div className="bg-white border-2 border-emerald-500 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>{isUrdu ? 'تصدیق شدہ حل' : 'Verified Fixed ✓'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                {isUrdu ? 'پہلے (Before)' : 'Before'}
              </span>
              <div className="h-32 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={complaint.photoUrl}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-700 block mb-1">
                {isUrdu ? 'بعد میں (Fixed)' : 'After'}
              </span>
              <div className="h-32 rounded-xl overflow-hidden border-2 border-emerald-500">
                <img
                  src={complaint.afterPhotoUrl}
                  alt="After"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vertical Status Timeline (Received -> Sent to org -> Acknowledged -> In progress -> Resolved) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {isUrdu ? 'پیش رفت کی تفصیلات' : 'Step-by-Step Timeline'}
          </h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 uppercase">
            {complaint.status}
          </span>
        </div>

        <div className="relative pl-6 rtl:pl-0 rtl:pr-6 space-y-6 pt-1">
          {/* Vertical connecting line */}
          <div className="absolute top-3 bottom-3 left-2.5 rtl:left-auto rtl:right-2.5 w-0.5 bg-slate-200 -translate-x-1/2 rtl:translate-x-1/2" />

          {timelineSteps.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-3">
              {/* Dot / Check Icon */}
              <div
                className={`absolute -left-6 rtl:-left-auto rtl:-right-6 w-5 h-5 rounded-full flex items-center justify-center -translate-x-1/2 rtl:translate-x-1/2 transition-colors ${
                  step.done
                    ? 'bg-teal-700 text-white ring-4 ring-teal-100'
                    : 'bg-slate-300 ring-4 ring-slate-100'
                }`}
              >
                {step.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>

              {/* Text info & Time */}
              <div className="min-w-0 flex-1 -mt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm font-bold truncate ${
                      step.done ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                  {step.time && (
                    <span className="text-xs font-mono text-slate-500 shrink-0">
                      {step.time}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatched Formal Letter & Email Preview */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-3">
        <div
          onClick={() => setShowLetterPreview(!showLetterPreview)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">
              {strings.emailPreview}
            </h3>
          </div>
          {showLetterPreview ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>

        {showLetterPreview && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-mono space-y-0.5">
              <div><strong className="font-sans text-slate-700">Addressed To:</strong> {org.name} ({org.email})</div>
              <div><strong className="font-sans text-slate-700">Subject:</strong> {letterSubject}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {letterBody}
            </div>

            <a
              href={mailtoLink}
              className="w-full min-h-[48px] h-12 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors"
            >
              <Mail className="w-4 h-4 text-teal-700" />
              <span>{strings.openInEmailApp}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
