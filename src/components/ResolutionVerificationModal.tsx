import React, { useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, Camera, RefreshCw, X, Sparkles, ArrowRight } from 'lucide-react';
import { Complaint, VerificationResult } from '../types';

interface ResolutionVerificationModalProps {
  complaint: Complaint;
  onClose: () => void;
  onVerified: (afterPhotoUrl: string, result: VerificationResult) => void;
}

export const ResolutionVerificationModal: React.FC<ResolutionVerificationModalProps> = ({
  complaint,
  onClose,
  onVerified,
}) => {
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAfterPhotoUrl(result);
      setAuditResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleFixedPhoto = () => {
    const sampleAfterSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
        <rect width="600" height="400" fill="#047857"/>
        <rect x="20" y="20" width="560" height="360" rx="16" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <circle cx="300" cy="180" r="54" fill="rgba(255,255,255,0.2)"/>
        <text x="300" y="194" font-family="system-ui, sans-serif" font-size="34" font-weight="bold" fill="white" text-anchor="middle">✓</text>
        <text x="300" y="270" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle">Work Completed & Site Cleared</text>
        <text x="300" y="300" font-family="system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)" text-anchor="middle">Awaaz Municipal Quality Audit • Peshawar, KP</text>
      </svg>
    `)}`;
    setAfterPhotoUrl(sampleAfterSvg);
    setAuditResult(null);
  };

  const runVerificationAudit = async () => {
    if (!afterPhotoUrl) return;
    setIsAuditing(true);
    setError(null);

    try {
      const res = await fetch('/api/verify-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beforePhotoBase64: complaint.photoUrl,
          afterPhotoBase64: afterPhotoUrl,
          issueSummary: complaint.aiAnalysis.summary,
          category: complaint.aiAnalysis.category,
        }),
      });

      if (!res.ok) throw new Error('Verification request failed');
      const data: VerificationResult = await res.json();
      setAuditResult(data);
    } catch (err: any) {
      setError(err.message || 'Audit failed. Please retry.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApplyResolution = () => {
    if (!afterPhotoUrl || !auditResult) return;
    onVerified(afterPhotoUrl, auditResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                AI Resolution Audit
              </span>
              <span className="text-xs text-slate-400 font-mono">#{complaint.id.slice(-6)}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mt-1">
              Verify Repair Before Marking Resolved
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload an "After" photo. Gemini AI will inspect and verify whether the hazard is cleared.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-side Before & After comparison */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Before Photo */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-700 block">1. Before (Reported Issue)</span>
            <div className="h-36 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 relative">
              {complaint.photoUrl ? (
                <img
                  src={complaint.photoUrl}
                  alt="Before condition"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 p-2 text-center">
                  No initial photo
                </div>
              )}
            </div>
          </div>

          {/* After Photo Upload */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-700 block">2. After (Repaired Site)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-36 rounded-xl border-2 border-dashed border-emerald-500/50 hover:border-emerald-600 bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors flex flex-col items-center justify-center cursor-pointer p-2 overflow-hidden relative group"
            >
              {afterPhotoUrl ? (
                <>
                  <img
                    src={afterPhotoUrl}
                    alt="After completion"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                    Change Photo
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-emerald-800 block">Upload After Photo</span>
                  <span className="text-[10px] text-slate-500">Camera snap or file</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preset sample button if on desktop without camera */}
        {!afterPhotoUrl && (
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={handleUseSampleFixedPhoto}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use sample verified repair photo for demo</span>
            </button>
          </div>
        )}

        {/* Audit Action Button */}
        {afterPhotoUrl && !auditResult && (
          <div className="mb-4">
            <button
              type="button"
              onClick={runVerificationAudit}
              disabled={isAuditing}
              className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {isAuditing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Gemini is comparing Before vs After photos...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Visual Verification</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Audit Result Display */}
        {auditResult && (
          <div
            className={`rounded-2xl p-4 mb-4 border ${
              auditResult.verified
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm flex items-center gap-1.5">
                {auditResult.verified ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                <span>{auditResult.status_label}</span>
              </span>
              <span className="text-xs font-mono font-bold bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                {auditResult.confidence_score || 90}% Confidence
              </span>
            </div>

            <p className="text-xs font-medium leading-relaxed mb-1">{auditResult.explanation}</p>
            <p className="font-urdu text-xs leading-relaxed opacity-90">{auditResult.explanation_urdu}</p>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {auditResult ? (
            <button
              type="button"
              onClick={handleApplyResolution}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              <span>Confirm & Mark Resolved</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                // Allow direct resolve without photo if user desires
                onVerified('', {
                  verified: true,
                  status_label: 'Verified fixed',
                  explanation: 'Marked resolved manually by admin officer.',
                  explanation_urdu: 'ایڈمن افسر کی جانب سے دستی طور پر حل شدہ نشان زد کیا گیا۔',
                });
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Skip Photo Audit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
