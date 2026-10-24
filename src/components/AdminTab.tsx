import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  ListFilter,
  BarChart3,
  AlertOctagon,
  Activity,
  Layers,
  RotateCcw,
  Map as MapIcon,
  ListOrdered,
  Sparkles,
  Database,
} from 'lucide-react';
import { Complaint, ComplaintStatus, ComplaintCategory } from '../types';
import { ComplaintCard } from './ComplaintCard';
import { PeshawarMap } from './PeshawarMap';
import { WeeklyInsightsCard } from './WeeklyInsightsCard';
import { loadFifteenDemoComplaints } from '../utils/storage';

interface AdminTabProps {
  complaints: Complaint[];
  onStatusChange: (id: string, newStatus: ComplaintStatus) => void;
  onRefreshData: () => void;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  complaints,
  onStatusChange,
  onRefreshData,
}) => {
  const [activeSubView, setActiveSubView] = useState<'queue' | 'map'>('queue');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [demoLoadedNotice, setDemoLoadedNotice] = useState<string | null>(null);

  // Stats calculation
  const totalCount = complaints.length;
  const highPriorityCount = complaints.filter(
    (c) => c.aiAnalysis.severity >= 4 || c.aiAnalysis.is_emergency
  ).length;
  const assignedCount = complaints.filter((c) => c.status === 'assigned').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  // Priority Queue: Sorted by severity descending (5 down to 1), then affected citizens, then date
  const sortedComplaints = [...complaints].sort((a, b) => {
    if (b.aiAnalysis.severity !== a.aiAnalysis.severity) {
      return b.aiAnalysis.severity - a.aiAnalysis.severity;
    }
    const bAffected = b.affectedCitizens || 1;
    const aAffected = a.affectedCitizens || 1;
    if (bAffected !== aAffected) {
      return bAffected - aAffected;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredComplaints = sortedComplaints.filter((c) => {
    if (categoryFilter !== 'all' && c.aiAnalysis.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  // Prompt 2: "Load demo data" button
  const handleLoadDemoData = () => {
    loadFifteenDemoComplaints();
    onRefreshData();
    setDemoLoadedNotice('Loaded 15 realistic Peshawar complaints across Hayatabad, Saddar, University Road & Board Bazaar!');
    setTimeout(() => setDemoLoadedNotice(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
            <span>Municipal Dispatch Portal · پشاور ایڈمن کنٹرول</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Peshawar Municipal Triage & Priority Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-sorted civic hazard queues for WSSP, PDA, PESCO, and Traffic Police Peshawar
          </p>
        </div>

        {/* Load Demo Data Button (Prompt 2) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleLoadDemoData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-300 transition-all active:scale-98 cursor-pointer shadow-2xs"
            title="Insert 15 realistic complaints across Hayatabad, Saddar, University Road & Board Bazaar"
          >
            <Database className="w-3.5 h-3.5 text-teal-700" />
            <span>Load Demo Data (15 Records)</span>
          </button>
        </div>
      </div>

      {demoLoadedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-2xl mb-4 flex items-center justify-between animate-in fade-in">
          <span>✓ {demoLoadedNotice}</span>
          <button type="button" onClick={() => setDemoLoadedNotice(null)} className="text-emerald-950 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* AI Weekly Insights Digest & Trend Card (Prompt 5b) */}
      <WeeklyInsightsCard complaints={complaints} />

      {/* Stat Cards (Total, High Priority, Assigned, Resolved) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Total Complaints */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Reports</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across 8 Peshawar zones</p>
        </div>

        {/* High Priority / Emergencies */}
        <div className="bg-white rounded-2xl border border-red-200 p-4 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between text-red-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High Priority</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600">{highPriorityCount}</div>
          <p className="text-[11px] text-red-600/80 mt-1">Severity 4–5 & Emergencies</p>
        </div>

        {/* In Progress / Assigned */}
        <div className="bg-white rounded-2xl border border-teal-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-teal-800 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Activity className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-800">{assignedCount}</div>
          <p className="text-[11px] text-teal-700/80 mt-1">Dispatched to field teams</p>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">{resolvedCount}</div>
          <p className="text-[11px] text-emerald-700/80 mt-1">
            {totalCount > 0 ? `${Math.round((resolvedCount / totalCount) * 100)}% clearance rate` : '0%'}
          </p>
        </div>
      </div>

      {/* Map View & Priority Queue Toggle */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubView('queue')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === 'queue'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Priority Queue ({filteredComplaints.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('map')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === 'map'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Peshawar GIS Map</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="received">Received</option>
            <option value="assigned">Assigned</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden"
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

      {/* Main View Area */}
      {activeSubView === 'map' ? (
        <PeshawarMap complaints={complaints} />
      ) : (
        <div className="space-y-4">
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
            <span>
              <strong>Priority Queue Rule:</strong> Highest severity (Severity 5 emergency) hazards and high citizen impact issues are pinned to the top.
            </span>
            <span className="font-mono text-[11px] text-amber-800">Risk Ranked</span>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center text-slate-500 text-xs">
              No complaints match the selected category and status filters.
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onStatusChange={onStatusChange}
                showAdminControls={true}
                onComplaintUpdated={onRefreshData}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
