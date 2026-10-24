import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Play, Pause, Volume2, Sparkles } from 'lucide-react';

interface VoiceRecorderProps {
  onAudioReady: (audioBase64: string, mimeType: string, durationSec: number) => void;
  onClearAudio: () => void;
  existingAudioUrl?: string;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioReady,
  onClearAudio,
  existingAudioUrl,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isHoldingRef = useRef<boolean>(false);

  // Sync with prop
  useEffect(() => {
    if (existingAudioUrl && existingAudioUrl !== audioUrl) {
      setAudioUrl(existingAudioUrl);
    }
  }, [existingAudioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    if (disabled || isRecording) return;
    setMicError(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone not supported in this browser context.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine supported mime type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setTotalDuration(recordDuration);

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          onAudioReady(base64Data, mimeType, recordDuration);
        };
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordDuration(0);

      const startTime = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        setRecordDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    } catch (err: any) {
      console.warn('Microphone error or permission denied:', err);
      setMicError('Mic access unavailable. You can use the sample Pashto/Urdu voice note below.');
      setIsRecording(false);
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

  // Touch and Mouse handlers for hold-to-record
  const handleHoldStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isHoldingRef.current = true;
    startRecording();
  };

  const handleHoldEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      stopRecording();
    }
  };

  const handleDeleteAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordDuration(0);
    setPlaybackTime(0);
    onClearAudio();
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  // Provide synthetic Pashto/Urdu sample audio for quick testing without microphone
  const loadSampleVoiceNote = () => {
    // Generate a short synthetic tone WAV base64
    const sampleDuration = 4;
    setRecordDuration(sampleDuration);
    setTotalDuration(sampleDuration);

    // Create a 1-second clean synthetic silent/tone audio blob
    const sampleText = 'Sample recorded voice note (Pashto/Urdu: Saddar area open manhole hazard)';
    const mimeType = 'audio/webm';
    
    // Minimal valid webm/wav dummy container
    const sampleAudioUrl = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
    setAudioUrl(sampleAudioUrl);
    onAudioReady(
      'data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA',
      mimeType,
      sampleDuration
    );
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-4 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Voice Note · صوتی پیغام
          </span>
          <p className="text-xs text-slate-500 mt-0.5">
            Hold to speak in Pashto, Urdu, or English
          </p>
        </div>

        {audioUrl && !isRecording && (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Recorded
          </span>
        )}
      </div>

      {!audioUrl ? (
        <div className="flex flex-col items-center justify-center py-4">
          {/* Primary Hold-to-Record Mic Button */}
          <div className="relative flex items-center justify-center my-2">
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-orange-500 animate-record-pulse" />
            )}

            <button
              type="button"
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
              disabled={disabled}
              className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer select-none touch-manipulation ${
                isRecording
                  ? 'bg-orange-600 text-white shadow-orange-300 ring-4 ring-orange-200'
                  : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-200'
              } disabled:opacity-50`}
              aria-label={isRecording ? 'Release to finish voice recording' : 'Hold to record voice note'}
            >
              {isRecording ? (
                <Square className="w-7 h-7 fill-current animate-pulse" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <div className="text-center mt-2">
            {isRecording ? (
              <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold text-sm">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-600 animate-ping" />
                <span>Recording... {formatSeconds(recordDuration)}</span>
                <span className="text-xs text-slate-500">(Release when done)</span>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Press & Hold to Record
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  یا ریکارڈنگ کے لیے مائیک دبائے رکھیں
                </p>
              </div>
            )}
          </div>

          {/* Quick fallback button if microphone permission issues */}
          {micError && (
            <div className="mt-3 text-center">
              <p className="text-xs text-amber-700 mb-2">{micError}</p>
              <button
                type="button"
                onClick={loadSampleVoiceNote}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-100 hover:bg-teal-200 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                Attach Sample Pashto/Urdu Audio Note
              </button>
            </div>
          )}

          {!micError && !isRecording && (
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={loadSampleVoiceNote}
                className="text-[11px] text-slate-500 hover:text-teal-700 underline transition-colors"
              >
                Sample Peshawar voice note demo
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Simple audio playback player with delete and replace controls */
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onTimeUpdate={(e) => setPlaybackTime(Math.floor(e.currentTarget.currentTime))}
            onEnded={() => {
              setIsPlaying(false);
              setPlaybackTime(0);
            }}
          />

          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlayback}
              className="w-11 h-11 rounded-full bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-sm transition-all active:scale-95 cursor-pointer"
              aria-label={isPlaying ? 'Pause audio' : 'Play audio note'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Audio Wave / Progress bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-mono">{formatSeconds(playbackTime)}</span>
                <span className="flex items-center gap-1 font-mono">
                  <Volume2 className="w-3 h-3 text-slate-400" />
                  {formatSeconds(totalDuration || recordDuration || 3)}
                </span>
              </div>

              {/* Visual simulated waveform bars */}
              <div className="h-6 flex items-center gap-1 bg-slate-50 px-2 rounded-md border border-slate-100 overflow-hidden">
                {[12, 18, 24, 16, 28, 14, 20, 26, 12, 22, 18, 25, 14, 20, 16, 10, 22, 15].map((h, i) => {
                  const active = (playbackTime / Math.max(1, totalDuration || 1)) * 18 > i;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-150 ${
                        active ? 'bg-teal-600' : 'bg-slate-300'
                      }`}
                      style={{ height: `${h}px` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Delete / Replace control */}
            <button
              type="button"
              onClick={handleDeleteAudio}
              className="w-10 h-10 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              title="Delete and re-record"
              aria-label="Delete voice note"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Voice note captured (Ready to analyze)</span>
            <button
              type="button"
              onClick={handleDeleteAudio}
              className="text-red-600 hover:underline font-medium"
            >
              Re-record voice note
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
