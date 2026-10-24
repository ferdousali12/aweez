import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Users,
  RefreshCw,
  AlertCircle,
  PhoneCall,
} from 'lucide-react';
import { PhotoUploader } from './PhotoUploader';
import { VoiceRecorder } from './VoiceRecorder';
import { LocationPicker } from './LocationPicker';
import { ComplaintCard } from './ComplaintCard';
import { EmergencyAlertModal } from './EmergencyAlertModal';
import { Complaint, LocationData, AiAnalysisResult, AppLanguage } from '../types';
import {
  saveComplaint,
  findNearbySameCategoryComplaints,
  mergeDuplicateComplaint,
} from '../utils/storage';

interface ReportTabProps {
  onReportSubmitted: (newComplaint: Complaint) => void;
  onNavigateToMyComplaints: () => void;
  language?: AppLanguage;
}

export const ReportTab: React.FC<ReportTabProps> = ({
  onReportSubmitted,
  onNavigateToMyComplaints,
  language = 'en',
}) => {
  // Form state
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMime, setPhotoMime] = useState<string>('image/jpeg');
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMime, setAudioMime] = useState<string>('audio/webm');
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [userText, setUserText] = useState<string>('');
  const [location, setLocation] = useState<LocationData>({
    latitude: 33.9984,
    longitude: 71.4883,
    areaName: 'University Road & Town',
    address: 'Abdara Road, University Town, Peshawar',
    isAutoDetected: false,
  });

  // Submission & Loader state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<string>('');
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Emergency Modal state
  const [emergencyComplaint, setEmergencyComplaint] = useState<Complaint | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const isUrdu = language === 'ur';

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setDuplicateNotice(null);

    // Validate input
    if (!photoBase64 && !audioBase64 && (!userText || userText.trim().length === 0)) {
      setErrorMessage(
        isUrdu
          ? 'براہ کرم تصویر کھینچیں، صوتی پیغام ریکارڈ کریں یا تحریری تفصیل درج کریں۔'
          : 'Please capture a photo, record a voice note, or enter text to report the issue.'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitPhase('Uploading photo & audio to Awaaz AI engine...');

    try {
      setSubmitPhase('Gemini is analyzing photo, transcribing Pashto/Urdu & verifying location...');

      const response = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoBase64,
          photoMime,
          audioBase64,
          audioMime,
          text: userText,
          location,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      setSubmitPhase('Checking 150m radius for duplicate community complaints...');
      const aiAnalysis: AiAnalysisResult = await response.json();

      // If emergency is flagged, ensure severity is 5
      if (aiAnalysis.is_emergency) {
        aiAnalysis.severity = 5;
      }

      const complaintId = `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Step: Duplicate Detection (Prompt 3)
      // Search for candidates with same category within 150m from last 7 days
      const nearbyCandidates = findNearbySameCategoryComplaints(
        aiAnalysis.category,
        location.latitude,
        location.longitude,
        150, // 150 meters
        7    // 7 days
      );

      let isDuplicate = false;
      let matchedComplaint: Complaint | null = null;

      if (nearbyCandidates.length > 0) {
        setSubmitPhase('Gemini verifying similarity with nearby reports...');
        try {
          const dupRes = await fetch('/api/check-duplicate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              newReport: {
                category: aiAnalysis.category,
                summary: aiAnalysis.summary,
                transcript: aiAnalysis.transcript,
                userText,
                location,
              },
              candidateReports: nearbyCandidates,
            }),
          });

          if (dupRes.ok) {
            const dupData = await dupRes.json();
            if (dupData.is_duplicate && dupData.matched_complaint_id) {
              isDuplicate = true;
              matchedComplaint = mergeDuplicateComplaint(dupData.matched_complaint_id, complaintId);
              if (matchedComplaint) {
                const count = matchedComplaint.affectedCitizens || 2;
                setDuplicateNotice(
                  `Already reported by ${count} people, we added your voice.`
                );
              }
            }
          }
        } catch (dupErr) {
          console.warn('Duplicate check non-blocking failure:', dupErr);
        }
      }

      // If not duplicate, save as brand new complaint
      const newComplaint: Complaint = matchedComplaint || {
        id: complaintId,
        createdAt: new Date().toISOString(),
        photoUrl: photoBase64 || undefined,
        audioUrl: audioBase64 || undefined,
        audioDuration: audioDuration || undefined,
        userText: userText.trim() || undefined,
        location,
        aiAnalysis,
        status: 'received',
        affectedCitizens: 1,
        statusHistory: [
          {
            status: 'received',
            timestamp: new Date().toISOString(),
            note: 'Complaint registered by citizen and triaged with Gemini multimodal AI.',
          },
        ],
      };

      if (!isDuplicate) {
        saveComplaint(newComplaint);
      }

      onReportSubmitted(newComplaint);
      setSubmittedComplaint(newComplaint);

      // Emergency Mode Takeover (Prompt 4)
      if (aiAnalysis.is_emergency) {
        setEmergencyComplaint(newComplaint);
        setShowEmergencyModal(true);
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(
        err.message || 'Analysis timed out or failed. Please check connection and click Retry.'
      );
    } finally {
      setIsSubmitting(false);
      setSubmitPhase('');
    }
  };

  const handleResetForNew = () => {
    setPhotoBase64(null);
    setAudioBase64(null);
    setAudioDuration(0);
    setUserText('');
    setSubmittedComplaint(null);
    setDuplicateNotice(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-xl mx-auto pb-10">
      {/* Top Banner / Hero Kicker */}
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>{isUrdu ? 'مصنوعی ذہانت سے بلدیاتی شکایات کا فوری اندراج' : 'AI-Powered Civic Redressal · پشاور بلدیاتی آواز'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isUrdu ? 'بلدیاتی مسئلہ درج کریں' : 'Report a Municipal Problem'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {isUrdu
            ? 'تصویر لیں یا پشتو، اردو یا انگلش میں آواز ریکارڈ کریں۔ آواز اے آئی خود بخود متعلقہ محکمے کو روانہ کرے گا۔'
            : 'Snap a photo or speak in Pashto, Urdu, or English. Awaaz AI auto-triages and dispatches to Peshawar municipal authorities.'}
        </p>
      </div>

      {/* Success View if just submitted */}
      {submittedComplaint ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Duplicate Link Notification (Prompt 3) */}
          {duplicateNotice ? (
            <div className="bg-orange-50 border-2 border-orange-300 rounded-3xl p-5 flex items-start gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-orange-950">
                  {duplicateNotice}
                </h3>
                <p className="text-xs text-orange-800 mt-0.5">
                  An existing complaint for this exact issue was already filed nearby. We boosted its community priority so field teams resolve it faster.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-900">
                  {isUrdu ? 'شکایت کامیابی سے درج ہو گئی!' : 'Complaint Successfully Lodged!'}
                </h2>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Routed to <strong>{submittedComplaint.aiAnalysis.department}</strong> at Severity {submittedComplaint.aiAnalysis.severity}/5.
                </p>
              </div>
            </div>
          )}

          {/* Clean result card */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
              AI Triage & Classification Summary
            </div>
            <ComplaintCard complaint={submittedComplaint} />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToMyComplaints}
              className="w-full py-3.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              <span>{isUrdu ? 'شکایات میں دیکھیں' : 'Track in "My Complaints"'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleResetForNew}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-98 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isUrdu ? 'نیا مسئلہ درج کریں' : 'Submit Another Report'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Form View */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Banner with Retry Button (Prompt 1) */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Submission</span>
              </button>
            </div>
          )}

          {/* Step 1: Photo capture */}
          <PhotoUploader
            onPhotoSelected={(base64, mime) => {
              setPhotoBase64(base64);
              setPhotoMime(mime);
            }}
            onClearPhoto={() => setPhotoBase64(null)}
            existingPhotoUrl={photoBase64 || undefined}
            disabled={isSubmitting}
          />

          {/* Step 2: Voice Note with hold-to-record */}
          <VoiceRecorder
            onAudioReady={(base64, mime, dur) => {
              setAudioBase64(base64);
              setAudioMime(mime);
              setAudioDuration(dur);
            }}
            onClearAudio={() => {
              setAudioBase64(null);
              setAudioDuration(0);
            }}
            existingAudioUrl={audioBase64 || undefined}
            disabled={isSubmitting}
          />

          {/* Step 3: Optional Text Description */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="user-text"
                className="text-xs font-semibold uppercase tracking-wider text-teal-800"
              >
                {isUrdu ? 'اختیاری تحریری تفصیل' : 'Optional Written Note'}
              </label>
              <span className="text-[11px] text-slate-400">
                {isUrdu ? 'اردو یا انگلش' : 'Useful if audio is noisy'}
              </span>
            </div>
            <textarea
              id="user-text"
              rows={2}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder={
                isUrdu
                  ? 'مثال کے طور پر: حیات آباد فیز 3 تاتارا پارک کے قریب بجلی کی تار ٹوٹ گئی ہے...'
                  : 'E.g. Near Khyber Teaching Hospital Gate 2 or near University Road BRT station...'
              }
              disabled={isSubmitting}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all resize-none"
            />
          </div>

          {/* Step 4: GPS Location with Peshawar Fallback */}
          <LocationPicker
            location={location}
            onChange={setLocation}
            disabled={isSubmitting}
          />

          {/* Step 5: Submit Button with "Gemini is analyzing..." animation (Prompt 1) */}
          <div className="pt-2">
            {isSubmitting ? (
              <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white rounded-2xl p-5 shadow-lg border border-teal-700 text-center space-y-3 animate-in fade-in">
                <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-teal-400/20 border-t-teal-300 animate-spin" />
                  <div className="w-8 h-8 rounded-full bg-teal-600/60 flex items-center justify-center text-teal-200 animate-pulse">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center justify-center gap-1.5">
                    <span>Gemini is analyzing your report...</span>
                  </h3>
                  <p className="text-xs text-teal-200 mt-1 max-w-sm mx-auto font-medium">
                    {submitPhase || 'Evaluating photo hazard, transcribing audio note & checking duplicate alerts...'}
                  </p>
                </div>

                {/* Animated progress dots */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <span className="w-2 h-2 rounded-full bg-teal-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-teal-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-teal-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer min-h-[52px]"
              >
                <Send className="w-4 h-4" />
                <span>{isUrdu ? 'پشاور بلدیاتی انتظامیہ کو شکایت بھیجیں' : 'Submit Complaint to Peshawar Administration'}</span>
              </button>
            )}
          </div>
        </form>
      )}

      {/* Full-Screen Emergency Modal Takeover (Prompt 4) */}
      {showEmergencyModal && emergencyComplaint && (
        <EmergencyAlertModal
          complaint={emergencyComplaint}
          onClose={() => setShowEmergencyModal(false)}
        />
      )}
    </div>
  );
};
