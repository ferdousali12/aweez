import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { LocationData, PeshawarZone } from '../types';
import { PESHAWAR_ZONES } from '../data/mockData';

interface LocationPickerProps {
  location: LocationData;
  onChange: (location: LocationData) => void;
  disabled?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onChange,
  disabled = false,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectStatus, setDetectStatus] = useState<string | null>(null);
  const [isManualDropdownOpen, setIsManualDropdownOpen] = useState(false);

  // Auto-capture GPS on mount if not already populated
  useEffect(() => {
    if (!location.isAutoDetected && navigator.geolocation) {
      attemptGpsCapture();
    }
  }, []);

  const attemptGpsCapture = () => {
    if (!navigator.geolocation || disabled) return;
    setIsDetecting(true);
    setDetectStatus('Detecting GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        setIsDetecting(false);
        setDetectStatus('GPS Lock acquired');

        // Check if close to any known Peshawar zone, otherwise default to Peshawar District
        const nearestZone = findNearestZone(lat, lng);
        onChange({
          latitude: lat,
          longitude: lng,
          areaName: nearestZone ? nearestZone.name : 'Peshawar Urban Area',
          address: nearestZone
            ? `${nearestZone.landmark}, Peshawar`
            : `GPS (${lat}, ${lng}), Peshawar, KP`,
          isAutoDetected: true,
        });

        setTimeout(() => setDetectStatus(null), 3000);
      },
      (err) => {
        console.warn('Geolocation failed or permission denied:', err);
        setIsDetecting(false);
        setDetectStatus('Using Peshawar municipal center (GPS unavailable)');
        setTimeout(() => setDetectStatus(null), 3000);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const findNearestZone = (lat: number, lng: number): PeshawarZone | null => {
    let nearest: PeshawarZone | null = null;
    let minDistance = Infinity;

    for (const zone of PESHAWAR_ZONES) {
      const d = Math.hypot(zone.latitude - lat, zone.longitude - lng);
      if (d < minDistance) {
        minDistance = d;
        nearest = zone;
      }
    }
    // If within ~0.15 degrees (~15km)
    return minDistance < 0.15 ? nearest : null;
  };

  const handleSelectZone = (zone: PeshawarZone) => {
    onChange({
      latitude: zone.latitude,
      longitude: zone.longitude,
      areaName: zone.name,
      address: `${zone.landmark}, ${zone.name}, Peshawar`,
      isAutoDetected: false,
    });
    setIsManualDropdownOpen(false);
  };

  return (
    <div className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-4 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-teal-700" />
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Location · مقام
          </span>
        </div>

        <button
          type="button"
          onClick={attemptGpsCapture}
          disabled={disabled || isDetecting}
          className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200/60 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
          <span>{isDetecting ? 'Locating...' : 'Refresh GPS'}</span>
        </button>
      </div>

      {detectStatus && (
        <div className="text-[11px] text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md mb-2 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-teal-600" />
          <span>{detectStatus}</span>
        </div>
      )}

      {/* Selected Location Display & Fallback Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsManualDropdownOpen(!isManualDropdownOpen)}
          disabled={disabled}
          className="w-full text-left bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3 shadow-2xs flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-sm truncate">
                {location.areaName}
              </span>
              {location.isAutoDetected ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.5 rounded">
                  GPS Auto
                </span>
              ) : (
                <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
                  Manual Area
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {location.address || 'Peshawar, Khyber Pakhtunkhwa'}
            </p>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs text-teal-700 font-medium shrink-0">
            <span>Change</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isManualDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown zone selector */}
        {isManualDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto p-1.5 divide-y divide-slate-100">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Select Peshawar District Zone
            </div>
            {PESHAWAR_ZONES.map((zone) => {
              const isSelected = zone.name === location.areaName;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => handleSelectZone(zone)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected ? 'bg-teal-50 text-teal-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{zone.name}</span>
                      <span className="font-urdu text-[11px] text-slate-400">{zone.nameUrdu}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{zone.landmark}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-700" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual landmark text override */}
      <div className="mt-2">
        <input
          type="text"
          value={location.address}
          onChange={(e) => onChange({ ...location, address: e.target.value })}
          placeholder="Specific street / landmark details (e.g. Near Shell pump)"
          disabled={disabled}
          className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
        />
      </div>
    </div>
  );
};
