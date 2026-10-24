import React, { useState } from 'react';
import { MapPin, AlertCircle, Building2, Eye, Filter, Compass, Flame } from 'lucide-react';
import { Complaint, ComplaintCategory } from '../types';
import { PESHAWAR_ZONES } from '../data/mockData';

interface PeshawarMapProps {
  complaints: Complaint[];
  onSelectComplaint?: (complaint: Complaint) => void;
}

export const PeshawarMap: React.FC<PeshawarMapProps> = ({
  complaints,
  onSelectComplaint,
}) => {
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'pins' | 'heatmap' | 'zones'>('pins');

  // Peshawar geographic bounding box
  const BOUNDS = {
    minLat: 33.95,
    maxLat: 34.04,
    minLng: 71.41,
    maxLng: 71.62,
  };

  const projectToCoordinates = (lat: number, lng: number) => {
    const clampedLat = Math.max(BOUNDS.minLat, Math.min(BOUNDS.maxLat, lat));
    const clampedLng = Math.max(BOUNDS.minLng, Math.min(BOUNDS.maxLng, lng));

    const x = ((clampedLng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
    const y = ((BOUNDS.maxLat - clampedLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;

    return { x: Math.max(6, Math.min(94, x)), y: Math.max(8, Math.min(92, y)) };
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filterCategory !== 'all' && c.aiAnalysis.category !== filterCategory) return false;
    if (filterSeverity !== 'all' && c.aiAnalysis.severity.toString() !== filterSeverity) return false;
    return true;
  });

  const getPinColor = (severity: number) => {
    switch (severity) {
      case 5:
        return { bg: 'bg-red-600', ring: 'ring-red-300', text: 'text-white', pulse: true, hex: '#DC2626' };
      case 4:
        return { bg: 'bg-orange-600', ring: 'ring-orange-300', text: 'text-white', pulse: false, hex: '#EA580C' };
      case 3:
        return { bg: 'bg-amber-500', ring: 'ring-amber-200', text: 'text-white', pulse: false, hex: '#D97706' };
      case 2:
        return { bg: 'bg-sky-500', ring: 'ring-sky-200', text: 'text-white', pulse: false, hex: '#0284C7' };
      default:
        return { bg: 'bg-emerald-500', ring: 'ring-emerald-200', text: 'text-white', pulse: false, hex: '#10B981' };
    }
  };

  const selectedComplaint = complaints.find((c) => c.id === selectedPinId);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-base">
              Peshawar District Civic Map & Coordinates
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Spatial distribution across Hayatabad, University Road, Saddar, Ring Road & Board Bazaar
          </p>
        </div>

        {/* View mode toggle (Pins vs Heatmap vs Zones) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('pins')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'pins'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pins Map
          </button>
          <button
            type="button"
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'heatmap'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-600" />
            <span>Heatmap</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('zones')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'zones'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Zones
          </button>
        </div>
      </div>

      {/* Map Legend & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 px-3 mb-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
        {/* Severity Legend */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Severity:</span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> 5 (Emergency)
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" /> 4 (High)
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 3 (Moderate)
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> 2 (Minor)
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 1 (Low)
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Severities</option>
            <option value="5">Severity 5</option>
            <option value="4">Severity 4</option>
            <option value="3">Severity 3</option>
            <option value="2">Severity 2</option>
            <option value="1">Severity 1</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="waste">🗑️ Solid Waste</option>
            <option value="road">🚧 Roads</option>
            <option value="water">💧 Water</option>
            <option value="electricity">⚡ Electricity</option>
            <option value="traffic">🚦 Traffic</option>
            <option value="safety">⚠️ Safety</option>
          </select>
        </div>
      </div>

      {viewMode === 'pins' || viewMode === 'heatmap' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Spatial Canvas Map (2 cols on large) */}
          <div className="lg:col-span-2 relative min-h-[380px] sm:min-h-[460px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner select-none">
            {/* Peshawar Road Grid & Geography SVG Background */}
            <svg
              className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1000 700"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Grand Trunk (GT) Road / University Road Corridor */}
              <path
                d="M 50 380 Q 250 360 480 340 T 950 280"
                fill="none"
                stroke="#0D9488"
                strokeWidth="7"
                strokeOpacity="0.45"
              />
              {/* Ring Road Peshawar Perimeter */}
              <path
                d="M 120 420 Q 300 580 550 560 T 900 380"
                fill="none"
                stroke="#EA580C"
                strokeWidth="5"
                strokeDasharray="8 4"
                strokeOpacity="0.4"
              />
              {/* Warsak Road Branch */}
              <path d="M 400 350 L 320 80" fill="none" stroke="#94A3B8" strokeWidth="3" strokeOpacity="0.3" />
              {/* Kohat Road Branch */}
              <path d="M 520 340 L 580 680" fill="none" stroke="#94A3B8" strokeWidth="3" strokeOpacity="0.3" />
            </svg>

            {/* Coordinate Badge */}
            <div className="absolute top-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-slate-300 font-mono">
              <span className="text-teal-400 font-bold">Peshawar GIS</span> · {viewMode === 'heatmap' ? 'Hotspot Intensity Layer' : '34.01°N, 71.52°E'}
            </div>

            {/* Landmark Label Anchors */}
            <div className="absolute top-[52%] left-[10%] text-[10px] font-semibold text-teal-300/80 tracking-wide pointer-events-none">
              HAYATABAD
            </div>
            <div className="absolute top-[48%] left-[34%] text-[10px] font-semibold text-teal-300/80 tracking-wide pointer-events-none">
              UNIVERSITY ROAD / TOWN
            </div>
            <div className="absolute top-[54%] left-[28%] text-[10px] font-semibold text-teal-200/80 tracking-wide pointer-events-none">
              BOARD BAZAAR
            </div>
            <div className="absolute top-[44%] left-[58%] text-[10px] font-semibold text-teal-300/80 tracking-wide pointer-events-none">
              SADDAR CANTT
            </div>
            <div className="absolute top-[37%] left-[76%] text-[10px] font-semibold text-teal-300/80 tracking-wide pointer-events-none">
              OLD CITY / QISSA KHWANI
            </div>
            <div className="absolute top-[78%] left-[46%] text-[10px] font-semibold text-orange-300/70 tracking-wide pointer-events-none">
              RING ROAD & PISHTAKHARA
            </div>

            {/* HEATMAP LAYER (Prompt 5b) */}
            {viewMode === 'heatmap' && (
              <div className="absolute inset-0 pointer-events-none">
                {filteredComplaints.map((c) => {
                  const pos = projectToCoordinates(c.location.latitude, c.location.longitude);
                  const isHigh = c.aiAnalysis.severity >= 4;
                  return (
                    <div
                      key={`heat-${c.id}`}
                      style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl opacity-60 ${
                        isHigh ? 'w-36 h-36 bg-red-600' : 'w-28 h-28 bg-amber-500'
                      }`}
                    />
                  );
                })}
              </div>
            )}

            {/* Complaint Pins */}
            {filteredComplaints.map((c) => {
              const pos = projectToCoordinates(c.location.latitude, c.location.longitude);
              const color = getPinColor(c.aiAnalysis.severity);
              const isSelected = selectedPinId === c.id;

              return (
                <div
                  key={c.id}
                  style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                  onClick={() => {
                    setSelectedPinId(c.id);
                    if (onSelectComplaint) onSelectComplaint(c);
                  }}
                >
                  {/* Ping effect for severity 5 */}
                  {c.aiAnalysis.severity === 5 && (
                    <span className="absolute -inset-2 rounded-full bg-red-500 animate-ping opacity-75" />
                  )}

                  {/* Marker Pin */}
                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-transform ${
                      color.bg
                    } ${color.text} ${
                      isSelected ? 'scale-125 ring-4 ring-white shadow-2xl z-30' : 'hover:scale-115'
                    }`}
                  >
                    <span>{c.aiAnalysis.severity}</span>
                  </div>

                  {/* Pin Hover/Selected Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                    <div className="bg-slate-950 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap max-w-[220px]">
                      <div className="font-bold truncate text-teal-300">{c.location.areaName}</div>
                      <div className="text-[10px] text-slate-300 truncate">{c.aiAnalysis.summary}</div>
                      {c.affectedCitizens && c.affectedCitizens > 1 && (
                        <div className="text-[9px] text-orange-400 font-bold">
                          {c.affectedCitizens} citizens affected
                        </div>
                      )}
                    </div>
                    <div className="w-2 h-2 bg-slate-950 rotate-45 -mt-1" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side-by-side Coordinate & Detail Box */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
                  Pin Inspection
                </span>
                <span className="text-xs font-semibold text-slate-500 font-mono">
                  {filteredComplaints.length} pinpointed
                </span>
              </div>

              {selectedComplaint ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {selectedComplaint.location.areaName}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        getPinColor(selectedComplaint.aiAnalysis.severity).bg
                      } text-white`}
                    >
                      Severity {selectedComplaint.aiAnalysis.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {selectedComplaint.aiAnalysis.summary}
                  </p>

                  {selectedComplaint.affectedCitizens && selectedComplaint.affectedCitizens > 1 && (
                    <div className="bg-orange-100/70 border border-orange-200 text-orange-900 text-xs font-bold px-2.5 py-1 rounded-lg">
                      ⚡ {selectedComplaint.affectedCitizens} Citizens Reported This Issue
                    </div>
                  )}

                  <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5">
                    <p className="font-urdu text-xs text-slate-800 leading-relaxed">
                      {selectedComplaint.aiAnalysis.summary_urdu}
                    </p>
                  </div>

                  <div className="text-[11px] space-y-1 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-800">Department:</span>{' '}
                      {selectedComplaint.aiAnalysis.department}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">Status:</span>{' '}
                      <span className="capitalize">{selectedComplaint.status}</span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      Lat: {selectedComplaint.location.latitude.toFixed(4)}, Lng:{' '}
                      {selectedComplaint.location.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40 text-teal-600" />
                  <p className="text-xs font-medium">Click any pin on the map to inspect complaint details & coordinates</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Projection: WGS84 Datum</span>
              <span className="text-teal-700 font-medium">Peshawar GIS Triage</span>
            </div>
          </div>
        </div>
      ) : (
        /* Zone Overview List */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {PESHAWAR_ZONES.map((zone) => {
            const zoneComplaints = complaints.filter(
              (c) => c.location.areaName.toLowerCase().includes(zone.name.toLowerCase().split(' ')[0])
            );
            const highSevCount = zoneComplaints.filter((c) => c.aiAnalysis.severity >= 4).length;

            return (
              <div
                key={zone.id}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 hover:bg-teal-50/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="font-bold text-slate-900 text-xs">{zone.name}</h4>
                  <span className="font-urdu text-[11px] text-slate-500">{zone.nameUrdu}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2 truncate">{zone.landmark}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
                  <span className="text-slate-600 font-medium">
                    {zoneComplaints.length} {zoneComplaints.length === 1 ? 'Report' : 'Reports'}
                  </span>
                  {highSevCount > 0 ? (
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                      {highSevCount} High Risk
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-medium">Normal</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
