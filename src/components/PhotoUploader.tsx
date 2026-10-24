import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, RefreshCw, Sparkles } from 'lucide-react';

interface PhotoUploaderProps {
  onPhotoSelected: (base64: string, mimeType: string) => void;
  onClearPhoto: () => void;
  existingPhotoUrl?: string;
  disabled?: boolean;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onPhotoSelected,
  onClearPhoto,
  existingPhotoUrl,
  disabled = false,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(existingPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mimeType = file.type || 'image/jpeg';
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      onPhotoSelected(result, mimeType);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPhotoPreview(null);
    onClearPhoto();
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Sample Peshawar hazard photos for quick testing on desktop
  const handleSelectSample = (sampleType: string) => {
    let title = 'Peshawar Road Hazard';
    let icon = '🚧';
    let color = '#EA580C';

    if (sampleType === 'garbage') {
      title = 'WSSP Overflowing Dumpster';
      icon = '🗑️';
      color = '#0D9488';
    } else if (sampleType === 'electric') {
      title = 'PESCO Sparking Transformer';
      icon = '⚡';
      color = '#DC2626';
    } else if (sampleType === 'water') {
      title = 'Broken Water Pipe Leak';
      icon = '💧';
      color = '#0284C7';
    }

    const svgData = `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
        <rect width="600" height="400" fill="${color}"/>
        <rect x="20" y="20" width="560" height="360" rx="16" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <circle cx="300" cy="170" r="50" fill="rgba(255,255,255,0.2)"/>
        <text x="300" y="184" font-family="system-ui, sans-serif" font-size="34" font-weight="bold" fill="white" text-anchor="middle">${icon}</text>
        <text x="300" y="260" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle">${title}</text>
        <text x="300" y="295" font-family="system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)" text-anchor="middle">Awaaz Live Hazard Evidence • Peshawar, KP</text>
      </svg>
    `)}`;

    setPhotoPreview(svgData);
    onPhotoSelected(svgData, 'image/svg+xml');
  };

  return (
    <div className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-4 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Hazard Photo · تصویر
          </span>
          <p className="text-xs text-slate-500 mt-0.5">
            Take a photo with your mobile camera or upload from gallery
          </p>
        </div>

        {photoPreview && (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Attached
          </span>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {!photoPreview ? (
        <div>
          <div className="grid grid-cols-2 gap-3">
            {/* Camera capture trigger */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={disabled}
              className="h-24 flex flex-col items-center justify-center gap-1.5 bg-white hover:bg-teal-50/50 border-2 border-dashed border-teal-600/40 hover:border-teal-600 rounded-xl transition-all cursor-pointer text-teal-800 active:scale-98 disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">Camera Snap</span>
              <span className="text-[10px] text-slate-500">کیمرہ سے تصویر لیں</span>
            </button>

            {/* Gallery Upload trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="h-24 flex flex-col items-center justify-center gap-1.5 bg-white hover:bg-slate-100/70 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl transition-all cursor-pointer text-slate-700 active:scale-98 disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">Gallery Upload</span>
              <span className="text-[10px] text-slate-500">گیلری سے منتخب کریں</span>
            </button>
          </div>

          {/* Quick preset selector for fast demoing */}
          <div className="mt-3 pt-3 border-t border-slate-200/80">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-1.5">
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span>Or test with a preset Peshawar hazard photo:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectSample('road')}
                className="px-2.5 py-1 text-[11px] bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                🚧 Broken Road
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample('garbage')}
                className="px-2.5 py-1 text-[11px] bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                🗑️ Waste Dump
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample('electric')}
                className="px-2.5 py-1 text-[11px] bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                ⚡ Live Wire
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample('water')}
                className="px-2.5 py-1 text-[11px] bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                💧 Pipe Leak
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black/5">
          <img
            src={photoPreview}
            alt="Report evidence preview"
            className="w-full h-44 object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-3">
            <div className="text-white text-xs drop-shadow-sm font-medium">
              Photo attached
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-medium flex items-center gap-1 backdrop-blur-xs transition-colors cursor-pointer"
                title="Change Photo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-700 text-white text-xs transition-colors cursor-pointer"
                title="Delete Photo"
                aria-label="Remove photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
