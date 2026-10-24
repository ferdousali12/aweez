import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Play,
  Pause,
  Building2,
  Trash2,
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Volume2,
  Languages,
  Users,
  FileText,
  Camera,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Complaint, ComplaintStatus, ComplaintCategory, VerificationResult } from '../types';
import { FormalLetterModal } from './FormalLetterModal';
import { ResolutionVerificationModal } from './ResolutionVerificationModal';
import { saveFormalLetter, updateResolutionVerification } from '../utils/storage';

interface ComplaintCardProps {
  complaint: Complaint;
  onStatusChange?: (id: string, newStatus: ComplaintStatus) => void;
  showAdminControls?: boolean;
  onComplaintUpdated?: () => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onStatusChange,
  showAdminControls = false,
  onComplaintUpdated,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [activePhotoView, setActivePhotoView] = useState<string | null>(null);

  // Modals state
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const {
    aiAnalysis,
    location,
    status,
    createdAt,
    photoUrl,
    audioUrl,
    userText,
    affectedCitizens = 1,
    verificationResult,
    afterPhotoUrl,
    formalLetter,
  } = complaint;

  const getSeverityBadge = (level: number) => {
    switch (level) {
      case 5:
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          label: 'Severity 5 · Critical Emergency',
          dot: 'bg-red-600',
        };
      case 4:
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
          label: 'Severity 4 · High Hazard',
          dot: 'bg-orange-600',
        };
      case 3:
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          label: 'Severity 3 · Moderate',
          dot: 'bg-amber-500',
        };
      case 2:
        return {
          bg: 'bg-sky-50',
          text: 'text-sky-700',
          border: 'border-sky-200',
          label: 'Severity 2 · Minor',
          dot: 'bg-sky-500',
        };
      default:
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          label: 'Severity 1 · Low',
          dot: 'bg-emerald-500',
        };
    }
  };

  const getCategoryConfig = (cat: ComplaintCategory) => {
    switch (cat) {
      case 'waste':
        return { label: 'Solid Waste', icon: '🗑️', color: 'text-teal-800 bg-teal-50 border-teal-200' };
      case 'road':
        return { label: 'Roads & Infra', icon: '🚧', color: 'text-orange-800 bg-orange-50 border-orange-200' };
      case 'water':
        return { label: 'Water & Sewerage', icon: '💧', color: 'text-sky-800 bg-sky-50 border-sky-200' };
      case 'electricity':
        return { label: 'Electrical / PESCO', icon: '⚡', color: 'text-red-800 bg-red-50 border-red-200' };
      case 'traffic':
        return { label: 'Traffic & Signals', icon: '🚦', color: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'safety':
        return { label: 'Public Safety', icon: '⚠️', color: 'text-purple-800 bg-purple-50 border-purple-200' };
      default:
        return { label: 'Municipal General', icon: '🏛️', color: 'text-slate-800 bg-slate-50 border-slate-200' };
    }
  };

  const getStatusBadge = (st: ComplaintStatus) => {
    switch (st) {
      case 'resolved':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          label: 'Resolved · حل شدہ',
          icon: CheckCircle2,
        };
      case 'assigned':
        return {
          bg: 'bg-teal-50',
          text: 'text-teal-800',
          border: 'border-teal-200',
          label: 'Assigned · کارروائی جاری',
          icon: Activity,
        };
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-300',
          label: 'Received · موصول ہوئی',
          icon: Clock,
        };
    }
  };

  const sev = getSeverityBadge(aiAnalysis.severity);
  const cat = getCategoryConfig(aiAnalysis.category);
  const stat = getStatusBadge(status);
  const StatusIcon = stat.icon;

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const handleVerifiedFixed = (afterUrl: string, result: VerificationResult) => {
    updateResolutionVerification(complaint.id, afterUrl, result);
    if (onComplaintUpdated) onComplaintUpdated();
    if (onStatusChange && result.verified) {
      onStatusChange(complaint.id, 'resolved');
    }
  };

  const handleSavedLetter = (text: string) => {
    saveFormalLetter(complaint.id, text);
    if (onComplaintUpdated) onComplaintUpdated();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden">
      {/* Emergency banner if flagged */}
      {aiAnalysis.is_emergency && (
        <div className="bg-red-600 text-white px-4 py-1.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 fill-white text-red-600" />
            <span>URGENT EMERGENCY · ہنگامی صورتحال</span>
          </div>
          <span className="text-[10px] bg-red-700 px-2 py-0.5 rounded-full uppercase">Priority 5</span>
        </div>
      )}

      {/* Audio Unclear Warning */}
      {aiAnalysis.audio_unclear && (
        <div className="bg-amber-50 text-amber-800 border-b border-amber-200/80 px-4 py-1.5 flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Could not understand audio, please add text · صوتی پیغام واضح نہیں تھا</span>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Top Badges & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Chip */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cat.color}`}>
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </span>

            {/* Severity Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${sev.bg} ${sev.text} ${sev.border}`}>
              <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
              <span>{sev.label}</span>
            </span>

            {/* Affected Citizens Badge (Prompt 3) */}
            {affectedCitizens > 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-orange-600" />
                <span>{affectedCitizens} citizens affected</span>
              </span>
            )}
          </div>

          {/* Status Indicator */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${stat.bg} ${stat.text} ${stat.border}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{stat.label}</span>
          </span>
        </div>

        {/* English Summary */}
        <h3 className="text-base font-semibold text-slate-900 leading-snug mb-2">
          {aiAnalysis.summary}
        </h3>

        {/* Urdu Summary */}
        <div className="bg-amber-50/40 border border-amber-100/70 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between text-[11px] text-amber-800 font-medium mb-1">
            <span>اردو خلاصہ (Urdu Summary)</span>
            <span className="text-[10px] text-amber-700/80">Awaaz AI</span>
          </div>
          <p className="font-urdu text-sm text-slate-800 leading-relaxed">
            {aiAnalysis.summary_urdu}
          </p>
        </div>

        {/* Visual Inspection Audit Badge if Verified Fixed */}
        {verificationResult && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 mb-3 flex items-start gap-2 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">AI Visual Audit: {verificationResult.status_label}</span>
              <p className="text-[11px] text-emerald-800 mt-0.5">{verificationResult.explanation}</p>
            </div>
          </div>
        )}

        {/* Quiet Metadata info line */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-500 pt-1 pb-2">
          <div className="flex items-center gap-1 text-slate-700 font-medium">
            <Building2 className="w-3.5 h-3.5 text-teal-700" />
            <span>{aiAnalysis.department}</span>
          </div>

          <span aria-hidden="true" className="text-slate-300">·</span>

          <div className="flex items-center gap-1 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            <span className="truncate max-w-[200px]">{location.areaName}</span>
          </div>

          <span aria-hidden="true" className="text-slate-300">·</span>

          <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
            <Clock className="w-3 h-3" />
            <span>{formatDate(createdAt)}</span>
          </div>

          {aiAnalysis.language_detected && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <div className="flex items-center gap-1 text-slate-500">
                <Languages className="w-3 h-3" />
                <span>{aiAnalysis.language_detected}</span>
              </div>
            </>
          )}
        </div>

        {/* Media Preview Row (Photo thumbnail & Audio player) */}
        {(photoUrl || audioUrl || afterPhotoUrl) && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3">
            {photoUrl && (
              <div
                onClick={() => setActivePhotoView(photoUrl)}
                className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-2xs cursor-pointer group shrink-0"
              >
                <img
                  src={photoUrl}
                  alt="Initial Hazard"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-medium transition-opacity">
                  Before
                </div>
              </div>
            )}

            {afterPhotoUrl && (
              <div
                onClick={() => setActivePhotoView(afterPhotoUrl)}
                className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-2xs cursor-pointer group shrink-0"
              >
                <img
                  src={afterPhotoUrl}
                  alt="Repaired Evidence"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-emerald-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                  After ✓
                </div>
              </div>
            )}

            {audioUrl && (
              <div className="flex-1 min-w-[200px] bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const audioEl = document.getElementById(`audio-${complaint.id}`) as HTMLAudioElement;
                    if (!audioEl) return;
                    if (isPlayingAudio) {
                      audioEl.pause();
                      setIsPlayingAudio(false);
                    } else {
                      audioEl.play();
                      setIsPlayingAudio(true);
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs"
                >
                  {isPlayingAudio ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <audio
                  id={`audio-${complaint.id}`}
                  src={audioUrl}
                  onEnded={() => setIsPlayingAudio(false)}
                  className="hidden"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mb-0.5 font-medium">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-teal-600" />
                      Citizen Voice Note
                    </span>
                    <span className="text-slate-400 font-mono">
                      {complaint.audioDuration ? `${complaint.audioDuration}s` : 'Voice'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-teal-600 ${isPlayingAudio ? 'animate-pulse w-full' : 'w-1/3'}`} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expandable Section Toggle & Admin Actions */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Full Details & Transcript'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Admin Fast Actions: Formal Letter & Resolve with Audit */}
          {showAdminControls && (
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Generate Formal Letter */}
              <button
                type="button"
                onClick={() => setShowLetterModal(true)}
                className="px-2.5 py-1 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Draft official municipal grievance letter"
              >
                <FileText className="w-3.5 h-3.5 text-teal-700" />
                <span>Formal Letter</span>
              </button>

              {/* Status updater */}
              {status !== 'assigned' && status !== 'resolved' && onStatusChange && (
                <button
                  type="button"
                  onClick={() => onStatusChange(complaint.id, 'assigned')}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Assign
                </button>
              )}

              {/* Resolve with After-Photo Audit */}
              {status !== 'resolved' && (
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(true)}
                  className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Resolve & Audit</span>
                </button>
              )}

              {status === 'resolved' && onStatusChange && (
                <button
                  type="button"
                  onClick={() => onStatusChange(complaint.id, 'received')}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Reopen
                </button>
              )}
            </div>
          )}
        </div>

        {/* Detailed Expanded Area */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 text-xs">
            {/* Transcript */}
            {aiAnalysis.transcript && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="font-semibold text-slate-700 block mb-1">
                  Audio & Context Transcript:
                </span>
                <p className="text-slate-600 italic leading-relaxed">
                  "{aiAnalysis.transcript}"
                </p>
              </div>
            )}

            {/* User typed text */}
            {userText && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="font-semibold text-slate-700 block mb-1">
                  Citizen Written Note:
                </span>
                <p className="text-slate-600 leading-relaxed">{userText}</p>
              </div>
            )}

            {/* Address & GPS */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
              <span className="font-semibold text-slate-700 block mb-1">
                Location & Coordinates:
              </span>
              <p className="text-slate-600">{location.address || location.areaName}</p>
              <p className="font-mono text-slate-400 text-[11px] mt-1">
                Latitude: {location.latitude.toFixed(5)} · Longitude: {location.longitude.toFixed(5)}
              </p>
            </div>

            {/* Formal letter status if drafted */}
            {formalLetter && (
              <div className="bg-teal-50/60 rounded-xl p-3 border border-teal-200/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-teal-900 block">Formal Municipal Letter Saved</span>
                  <span className="text-[11px] text-teal-700">Official letterhead prepared for dispatch</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLetterModal(true)}
                  className="px-3 py-1.5 bg-white text-teal-800 text-xs font-bold rounded-lg border border-teal-200 hover:bg-teal-50"
                >
                  View Letter
                </button>
              </div>
            )}

            {/* Status History Timeline */}
            {complaint.statusHistory && complaint.statusHistory.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="font-semibold text-slate-700 block mb-2">
                  Action History & Dispatch:
                </span>
                <div className="space-y-2">
                  {complaint.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <div className="w-2 h-2 rounded-full bg-teal-600 mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold capitalize text-slate-800">{h.status}:</span>{' '}
                        <span className="text-slate-600">{h.note || 'Status updated'}</span>
                        <span className="text-slate-400 block font-mono text-[10px]">
                          {formatDate(h.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Photo */}
      {activePhotoView && (
        <div
          onClick={() => setActivePhotoView(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-lg w-full bg-black rounded-2xl overflow-hidden shadow-2xl">
            <img src={activePhotoView} alt="Hazard Evidence" className="w-full h-auto max-h-[80vh] object-contain" />
            <div className="p-3 text-center text-white text-xs bg-slate-900/90 flex items-center justify-between">
              <span>{location.areaName}</span>
              <span className="text-slate-400">Click anywhere to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Formal Letter Modal */}
      {showLetterModal && (
        <FormalLetterModal
          complaint={complaint}
          onClose={() => setShowLetterModal(false)}
          onSaveLetter={handleSavedLetter}
        />
      )}

      {/* Resolution Verification Modal */}
      {showVerifyModal && (
        <ResolutionVerificationModal
          complaint={complaint}
          onClose={() => setShowVerifyModal(false)}
          onVerified={handleVerifiedFixed}
        />
      )}
    </div>
  );
};
