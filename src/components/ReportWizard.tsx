import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, Play, Pause, Trash2, MapPin, Check, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { LocationData, AppLanguage } from '../types';
import { t } from '../utils/translations';
import { PESHAWAR_ZONES } from '../data/mockData';

interface ReportWizardProps {
  language: AppLanguage;
  onSubmit: (report: {
    photoBase64: string | null;
    photoMime: string;
    audioBase64: string | null;
    audioMime: string;
    audioDuration: number;
    text: string;
    location: LocationData;
  }) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  onRetry: () => void;
  presetPhoto?: string | null;
  presetAudio?: string | null;
  onOpenEmergencyHelp?: () => void;
}

export const ReportWizard: React.FC<ReportWizardProps> = ({
  language,
  onSubmit,
  isSubmitting,
  submitError,
  onRetry,
  presetPhoto = null,
  presetAudio = null,
  onOpenEmergencyHelp,
}) => {
  const strings = t(language);
  const isUrdu = language === 'ur';

  // Step: 1 = Snap, 2 = Speak, 3 = Send
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Photo
  const [photoBase64, setPhotoBase64] = useState<string | null>(presetPhoto);
  const [photoMime, setPhotoMime] = useState<string>('image/jpeg');
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Step 2: Voice Note & Text
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(presetAudio);
  const [audioBase64, setAudioBase64] = useState<string | null>(presetAudio);
  const [audioMime, setAudioMime] = useState<string>('audio/webm');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTextBox, setShowTextBox] = useState(false);
  const [userText, setUserText] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Step 3: Location
  const [location, setLocation] = useState<LocationData>({
    latitude: 33.9984,
    longitude: 71.4883,
    areaName: 'University Town',
    address: 'Abdara Road, University Town, Peshawar',
    isAutoDetected: false,
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-capture GPS on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          setLocation({
            latitude: lat,
            longitude: lng,
            areaName: 'Peshawar City',
            address: `GPS (${lat}, ${lng}), Peshawar`,
            isAutoDetected: true,
          });
        },
        () => {
          // Default to Peshawar
        },
        { timeout: 6000 }
      );
    }
  }, []);

  // Sync presets if passed from hidden demo tools
  useEffect(() => {
    if (presetPhoto) {
      setPhotoBase64(presetPhoto);
    }
  }, [presetPhoto]);

  useEffect(() => {
    if (presetAudio) {
      setAudioBase64(presetAudio);
      setAudioUrl(presetAudio);
      setRecordDuration(4);
    }
  }, [presetAudio]);

  // Clean up audio recorder
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Handle Photo selection
  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mime = file.type || 'image/jpeg';
    setPhotoMime(mime);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Audio Recording
  const startRecording = async () => {
    if (isRecording) return;
    setValidationError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mime = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mime = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mime = 'audio/mp4';
      }
      setAudioMime(mime);

      const mr = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      };

      mr.start(100);
      setIsRecording(true);
      setRecordDuration(0);

      const startTime = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        setRecordDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    } catch {
      setShowTextBox(true);
      setValidationError(strings.unclearAudio);
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleAudioPlay = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const clearAudio = () => {
    if (audioElementRef.current) audioElementRef.current.pause();
    setAudioUrl(null);
    setAudioBase64(null);
    setIsPlaying(false);
    setRecordDuration(0);
  };

  const handleNextFromStep1 = () => {
    setValidationError(null);
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    setValidationError(null);
    if (isRecording) stopRecording();
    setCurrentStep(3);
  };

  const handleFinalSubmit = () => {
    setValidationError(null);
    const hasAnyInput = Boolean(photoBase64 || audioBase64 || userText.trim().length > 0);
    if (!hasAnyInput) {
      setValidationError(strings.needAtLeastOne);
      return;
    }

    onSubmit({
      photoBase64,
      photoMime,
      audioBase64,
      audioMime,
      audioDuration: recordDuration,
      text: userText,
      location,
    });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // While Gemini works
  if (isSubmitting) {
    return (
      <div className="max-w-[480px] mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="w-20 h-20 rounded-full border-4 border-teal-200 border-t-teal-700 animate-spin mb-6" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {strings.analyzing}
        </h2>
        <p className="text-base text-slate-500 max-w-xs">
          {isUrdu
            ? 'تصویر، صوتی پیغام اور مقام کی خودکار جانچ ہو رہی ہے...'
            : 'Evaluating photo, voice note, and verifying location...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 py-4 pb-28">
      {/* Top Short One-Liner */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
          {strings.stepHeadline}
        </h1>

        {/* 3-Step Clean Progress Bar */}
        <div className="mt-4 flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 1 ? 'bg-teal-700' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 2 ? 'bg-teal-700' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 3 ? 'bg-teal-700' : 'bg-slate-200'}`} />
        </div>

        <div className="mt-1.5 text-xs font-semibold text-teal-800">
          {currentStep === 1 && strings.step1Title}
          {currentStep === 2 && strings.step2Title}
          {currentStep === 3 && strings.step3Title}
        </div>
      </div>

      {/* Submission or validation error alert */}
      {(submitError || validationError) && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-base flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <span>{submitError || validationError}</span>
          </div>
          {submitError && (
            <button
              type="button"
              onClick={onRetry}
              className="self-start px-4 py-2 bg-orange-600 text-white rounded-xl font-semibold text-sm flex items-center gap-1.5 mt-1 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{strings.retry}</span>
            </button>
          )}
        </div>
      )}

      {/* Hidden file triggers */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoFile}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoFile}
        className="hidden"
      />

      {/* STEP 1: SNAP */}
      {currentStep === 1 && (
        <div className="space-y-6 pt-2">
          {!photoBase64 ? (
            <div className="flex flex-col items-center">
              {/* Big Camera Button as main action */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full min-h-[170px] bg-slate-100 hover:bg-slate-200/80 active:scale-98 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer text-slate-800"
              >
                <div className="w-16 h-16 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-md">
                  <Camera className="w-8 h-8" />
                </div>
                <span className="text-lg font-bold">{strings.snapMainAction}</span>
              </button>

              {/* Small "or choose from gallery" link */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="mt-3 text-base text-teal-800 underline font-semibold cursor-pointer py-1"
              >
                {strings.chooseFromGallery}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-black/5 shadow-xs">
                <img
                  src={photoBase64}
                  alt="Hazard capture"
                  className="w-full h-64 object-cover object-center"
                />
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="text-base text-teal-800 font-semibold underline cursor-pointer"
                >
                  {strings.retakePhoto}
                </button>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleNextFromStep1}
              className="w-full min-h-[56px] h-14 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>{strings.next}</span>
              <ChevronRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SPEAK */}
      {currentStep === 2 && (
        <div className="space-y-6 pt-2">
          {!audioUrl ? (
            <div className="flex flex-col items-center text-center">
              <p className="text-base text-slate-700 mb-6 font-medium max-w-xs">
                {strings.speakInstructions}
              </p>

              {/* Big round microphone button */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
                  isRecording
                    ? 'bg-orange-600 text-white ring-8 ring-orange-200 animate-pulse'
                    : 'bg-teal-700 text-white hover:bg-teal-800'
                }`}
                aria-label={isRecording ? 'Stop recording' : 'Record voice note'}
              >
                {isRecording ? (
                  <Square className="w-10 h-10 fill-current" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </button>

              <div className="mt-4">
                {isRecording ? (
                  <div className="space-y-1">
                    <span className="text-lg font-bold text-orange-600">
                      {formatTimer(recordDuration)}
                    </span>
                    <p className="text-sm text-slate-500">{strings.tapToStop}</p>
                  </div>
                ) : null}
              </div>

              {/* Skip, type instead link */}
              <button
                type="button"
                onClick={() => setShowTextBox(!showTextBox)}
                className="mt-6 text-base text-teal-800 font-semibold underline cursor-pointer"
              >
                {strings.skipTypeInstead}
              </button>
            </div>
          ) : (
            /* Voice Note Recorded Review */
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
              <audio
                ref={audioElementRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={toggleAudioPlay}
                  className="w-14 h-14 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-sm cursor-pointer shrink-0"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>

                <div className="flex-1">
                  <span className="font-bold text-slate-900 text-base block">
                    {strings.voiceNoteRecorded}
                  </span>
                  <span className="text-sm text-slate-500 font-mono">
                    {formatTimer(recordDuration || 4)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={clearAudio}
                  className="p-2 text-slate-400 hover:text-red-600 cursor-pointer"
                  title="Delete voice note"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200 text-center">
                <button
                  type="button"
                  onClick={clearAudio}
                  className="text-sm text-slate-600 font-semibold underline cursor-pointer"
                >
                  {strings.reRecord}
                </button>
              </div>
            </div>
          )}

          {/* Optional Type text box */}
          {showTextBox && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <textarea
                rows={3}
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder={strings.typePlaceholder}
                className="w-full text-base bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>
          )}

          {/* Navigation Buttons: Next & Back */}
          <div className="pt-4 space-y-2">
            <button
              type="button"
              onClick={handleNextFromStep2}
              className="w-full min-h-[56px] h-14 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>{strings.next}</span>
              <ChevronRight className="w-5 h-5 rtl:rotate-180" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full text-center text-base text-slate-600 font-semibold py-2 cursor-pointer"
            >
              {strings.back}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SEND */}
      {currentStep === 3 && (
        <div className="space-y-4 pt-2">
          {/* Summary Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {strings.summaryTitle}
            </h2>

            {/* Photo line */}
            <div className="flex items-center gap-3">
              {photoBase64 ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <img src={photoBase64} alt="Thumb" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  <Camera className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-base font-semibold text-slate-800 block">
                  {photoBase64 ? strings.photoAttached : strings.noPhotoAdded}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-teal-800 font-semibold underline"
                >
                  {photoBase64 ? strings.retakePhoto : strings.snapMainAction}
                </button>
              </div>
            </div>

            {/* Voice / Text line */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-14 h-14 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
                <Mic className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-base font-semibold text-slate-800 block truncate">
                  {audioBase64
                    ? strings.voiceAttached
                    : userText
                    ? strings.textAttached
                    : strings.skipTypeInstead}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-teal-800 font-semibold underline"
                >
                  {audioBase64 ? strings.reRecord : strings.speakInstructions}
                </button>
              </div>
            </div>

            {/* Location line with manual fallback */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-700" />
                  <span className="text-base font-semibold text-slate-800">
                    {strings.locationFound}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="text-xs text-teal-800 font-semibold underline cursor-pointer"
                >
                  {strings.locationManual}
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-1 pl-7">
                {location.areaName} ({location.address})
              </p>

              {/* Location Selector if opened */}
              {showLocationPicker && (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 max-h-48 overflow-y-auto space-y-1">
                  {PESHAWAR_ZONES.map((zone) => (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => {
                        setLocation({
                          latitude: zone.latitude,
                          longitude: zone.longitude,
                          areaName: zone.name,
                          address: `${zone.landmark}, ${zone.name}, Peshawar`,
                          isAutoDetected: false,
                        });
                        setShowLocationPicker(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl text-sm font-semibold hover:bg-white text-slate-800 cursor-pointer"
                    >
                      {isUrdu ? zone.nameUrdu : zone.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Action (Large 56px primary button) */}
          <div className="pt-4 space-y-2">
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="w-full min-h-[56px] h-14 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-2xl text-lg font-bold flex items-center justify-center shadow-md transition-all cursor-pointer"
            >
              <span>{strings.submitButton}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full text-center text-base text-slate-600 font-semibold py-2 cursor-pointer"
            >
              {strings.back}
            </button>
          </div>
        </div>
      )}

      {/* Floating Red SOS Button (Bottom-Right corner, high contrast, impossible to miss) */}
      {onOpenEmergencyHelp && (
        <button
          type="button"
          onClick={onOpenEmergencyHelp}
          className="fixed bottom-24 right-4 sm:right-[max(1rem,calc(50%-220px))] z-30 flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white px-4 py-3.5 rounded-full shadow-2xl border-2 border-white cursor-pointer transition-all animate-pulse"
          aria-label="Emergency SOS"
          title="Emergency SOS"
        >
          <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
          <span className="text-base font-black tracking-wider uppercase">SOS</span>
        </button>
      )}
    </div>
  );
};
