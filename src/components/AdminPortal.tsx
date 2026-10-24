import React, { useState } from 'react';
import {
  ArrowLeft,
  Filter,
  Layers,
  AlertOctagon,
  CheckCircle2,
  List,
  Map as MapIcon,
  X,
  FileText,
  Users,
  ChevronRight,
  Camera,
  Building2,
  Clock,
  Send,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  Complaint,
  ComplaintStatus,
  ComplaintCategory,
  AppLanguage,
  UserSession,
} from '../types';
import { t } from '../utils/translations';
import { PeshawarMap } from './PeshawarMap';
import { FormalLetterModal } from './FormalLetterModal';
import { ResolutionVerificationModal } from './ResolutionVerificationModal';
import {
  ORGANIZATIONS,
  getOrganizationById,
  getAllOrganizations,
  Organization,
} from '../data/organizations';
import { reassignComplaintOrganization } from '../utils/storage';

interface AdminPortalProps {
  complaints: Complaint[];
  userSession?: UserSession | null;
  onStatusChange: (id: string, newStatus: ComplaintStatus) => void;
  onSwitchToCitizen: () => void;
  onSignOut?: () => void;
  onRefreshData: () => void;
  language: AppLanguage;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  complaints,
  userSession,
  onStatusChange,
  onSwitchToCitizen,
  onSignOut,
  onRefreshData,
  language,
}) => {
  const strings = t(language);
  const isUrdu = language === 'ur';

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orgFilter, setOrgFilter] = useState<string>('all');

  // Detail Modal & Extra Modals
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const isOfficer = userSession?.role === 'officer' && !!userSession?.organizationId;
  const officerOrg = isOfficer ? getOrganizationById(userSession.organizationId) : null;

  // 1. Filter complaints by organization if logged in as an officer
  const orgScopedComplaints = isOfficer
    ? complaints.filter((c) => (c.organizationId || '').toLowerCase() === userSession.organizationId?.toLowerCase())
    : complaints;

  // 2. Stats calculation
  const totalCount = orgScopedComplaints.length;
  const highPriorityCount = orgScopedComplaints.filter(
    (c) => c.aiAnalysis.severity >= 4 || c.aiAnalysis.is_emergency
  ).length;
  const resolvedCount = orgScopedComplaints.filter((c) => c.status === 'resolved').length;

  // 3. Organization metrics for "By Organization" card (Requirement 8)
  const orgMetrics = ORGANIZATIONS.map((org) => {
    const orgComplaints = complaints.filter(
      (c) => (c.organizationId || '').toLowerCase() === org.id.toLowerCase()
    );
    const orgReceived = orgComplaints.length;
    const orgResolved = orgComplaints.filter((c) => c.status === 'resolved').length;
    return {
      ...org,
      received: orgReceived,
      resolved: orgResolved,
      avgResponseStr: `${org.avgResponseHours} hrs`,
    };
  });

  // 4. Sorted by severity descending
  const sorted = [...orgScopedComplaints].sort((a, b) => {
    if (b.aiAnalysis.severity !== a.aiAnalysis.severity) {
      return b.aiAnalysis.severity - a.aiAnalysis.severity;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filtered = sorted.filter((c) => {
    if (!isOfficer && orgFilter !== 'all' && c.organizationId !== orgFilter) return false;
    if (categoryFilter !== 'all' && c.aiAnalysis.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const getSeverityBarColor = (sev: number) => {
    switch (sev) {
      case 5:
        return 'bg-red-600';
      case 4:
        return 'bg-orange-500';
      case 3:
        return 'bg-amber-500';
      case 2:
        return 'bg-sky-500';
      default:
        return 'bg-emerald-500';
    }
  };

  const getStatusBadge = (st: ComplaintStatus) => {
    switch (st) {
      case 'resolved':
        return { label: strings.resolved, bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'in_progress':
      case 'assigned':
        return { label: strings.inProgress, bg: 'bg-orange-50 text-orange-800 border-orange-200' };
      case 'acknowledged':
        return { label: strings.acknowledged, bg: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'sent_to_org':
        return { label: strings.sentToOrg, bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      default:
        return { label: strings.received, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const handleReassignOrg = (complaintId: string, newOrgId: string) => {
    reassignComplaintOrganization(complaintId, newOrgId);
    onRefreshData();
    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint({
        ...selectedComplaint,
        organizationId: newOrgId,
        status: 'sent_to_org',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-28">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <button
          type="button"
          onClick={onSwitchToCitizen}
          className="text-sm font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{strings.switchToCitizen}</span>
        </button>

        <div className="flex items-center gap-2">
          {isOfficer && officerOrg ? (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-xs font-black ${officerOrg.badgeColor} border`}>
                {officerOrg.shortName}
              </span>
              <span className="font-bold text-sm text-slate-800 truncate max-w-[140px] sm:max-w-none">
                {isUrdu ? officerOrg.shortNameUrdu : officerOrg.shortName} Officer
              </span>
            </div>
          ) : (
            <span className="font-bold text-base text-slate-900">
              Super Admin Portal
            </span>
          )}

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              {strings.signOut}
            </button>
          )}
        </div>
      </div>

      {/* 3 Small Stat Cards (Total, High priority, Resolved) */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block truncate">
            {strings.totalReports}
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">{totalCount}</div>
        </div>

        <div className="bg-white border border-red-200 rounded-2xl p-3 shadow-2xs">
          <span className="text-xs font-semibold text-red-600 block truncate">
            {strings.highPriority}
          </span>
          <div className="text-2xl font-bold text-red-600 mt-0.5">{highPriorityCount}</div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-3 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-700 block truncate">
            {strings.resolvedCount}
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-0.5">{resolvedCount}</div>
        </div>
      </div>

      {/* Requirement 8: "By Organization" Overview Card (Complaints Received, Resolved, Avg Response Time) */}
      {!isOfficer && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs mb-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-700" />
              <h2 className="text-base font-bold text-slate-900">
                {strings.byOrganization}
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {ORGANIZATIONS.length} Municipal Agencies
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {orgMetrics.map((om) => {
              const isSelected = orgFilter === om.id;
              return (
                <div
                  key={om.id}
                  onClick={() => setOrgFilter(isSelected ? 'all' : om.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/60 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl ${om.logoBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                    >
                      {om.logoText.slice(0, 4)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {isUrdu ? om.shortNameUrdu : om.shortName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{strings.avgResponseTime}: {om.avgResponseStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <div className="text-sm font-black text-slate-900">
                      {om.resolved} / {om.received}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700">
                      {om.received > 0 ? Math.round((om.resolved / om.received) * 100) : 0}% fixed
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {orgFilter !== 'all' && (
            <div className="pt-1 flex items-center justify-between text-xs text-teal-800">
              <span>Filtered by: <strong>{getOrganizationById(orgFilter).shortName}</strong></span>
              <button
                type="button"
                onClick={() => setOrgFilter('all')}
                className="font-bold underline cursor-pointer"
              >
                Show All Organizations
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toggle between List and Map + Filter button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>{strings.listView}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>{strings.mapView}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
            categoryFilter !== 'all' || statusFilter !== 'all' || orgFilter !== 'all'
              ? 'bg-teal-50 border-teal-300 text-teal-900'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{strings.filterBtn}</span>
        </button>
      </div>

      {/* Filter Options */}
      {showFilterDrawer && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="received">{strings.received}</option>
                <option value="sent_to_org">{strings.sentToOrg}</option>
                <option value="acknowledged">{strings.acknowledged}</option>
                <option value="in_progress">{strings.inProgress}</option>
                <option value="resolved">{strings.resolved}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              >
                <option value="all">All Categories</option>
                <option value="waste">{strings.categories.waste}</option>
                <option value="road">{strings.categories.road}</option>
                <option value="water">{strings.categories.water}</option>
                <option value="electricity">{strings.categories.electricity}</option>
                <option value="traffic">{strings.categories.traffic}</option>
                <option value="safety">{strings.categories.safety}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="mb-6">
          <PeshawarMap
            complaints={filtered}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
          />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl">
              No complaints match the selected criteria.
            </div>
          )}

          {filtered.map((c) => {
            const affected = c.affectedCitizens || 1;
            const summary = isUrdu ? c.aiAnalysis.summary_urdu : c.aiAnalysis.summary;
            const org = getOrganizationById(c.organizationId);
            const statusBadge = getStatusBadge(c.status);

            return (
              <div
                key={c.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
              >
                <div className="flex items-start gap-3">
                  {/* Severity vertical color bar */}
                  <div
                    className={`w-1.5 self-stretch rounded-full ${getSeverityBarColor(
                      c.aiAnalysis.severity
                    )} shrink-0`}
                  />

                  {/* Main Content Click to open details */}
                  <div
                    onClick={() => setSelectedComplaint(c)}
                    className="flex-1 min-w-0 cursor-pointer space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${org.badgeColor}`}>
                        {org.shortName}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        #{c.id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <p className="text-base font-semibold text-slate-900 truncate">
                      {summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 capitalize">
                        {strings.categories[c.aiAnalysis.category] || c.aiAnalysis.category}
                      </span>
                      <span>·</span>
                      <span>{c.location.areaName}</span>
                      {affected > 1 && (
                        <>
                          <span>·</span>
                          <span className="font-bold text-orange-700 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {affected} {strings.affectedSuffix}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="shrink-0">
                    <select
                      value={c.status === 'assigned' ? 'in_progress' : c.status}
                      onChange={(e) => onStatusChange(c.id, e.target.value as ComplaintStatus)}
                      className="text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 p-2 text-slate-800 cursor-pointer focus:outline-teal-700"
                    >
                      <option value="received">{strings.received}</option>
                      <option value="sent_to_org">{strings.sentToOrg}</option>
                      <option value="acknowledged">{strings.acknowledged}</option>
                      <option value="in_progress">{strings.inProgress}</option>
                      <option value="resolved">{strings.resolved}</option>
                    </select>
                  </div>
                </div>

                {/* Super Admin Reassignment Quick Action (Requirement 5) */}
                {!isOfficer && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Reassign Agency:</span>
                    <select
                      value={c.organizationId || 'general'}
                      onChange={(e) => handleReassignOrg(c.id, e.target.value)}
                      className="text-xs font-bold rounded-lg border border-slate-200 bg-white px-2 py-1 text-teal-900 cursor-pointer"
                    >
                      {ORGANIZATIONS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.shortName} ({o.name})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-400 font-mono">
                #{selectedComplaint.id.slice(-6).toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedComplaint.photoUrl && (
              <div className="h-56 rounded-2xl overflow-hidden border border-slate-200">
                <img
                  src={selectedComplaint.photoUrl}
                  alt="Evidence"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Assigned Organization & Reassign dropdown for super-admin */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold text-slate-800">
                    {strings.assignedTo}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getOrganizationById(selectedComplaint.organizationId).badgeColor}`}>
                  {getOrganizationById(selectedComplaint.organizationId).shortName}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {getOrganizationById(selectedComplaint.organizationId).name} ({getOrganizationById(selectedComplaint.organizationId).email})
              </p>

              {/* Super Admin Reassignment dropdown */}
              {!isOfficer && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{strings.reassignOrg}:</span>
                  <select
                    value={selectedComplaint.organizationId || 'general'}
                    onChange={(e) => handleReassignOrg(selectedComplaint.id, e.target.value)}
                    className="text-xs font-bold rounded-xl border border-slate-300 bg-white p-2 text-teal-950 cursor-pointer"
                  >
                    {ORGANIZATIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.shortName} — {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {selectedComplaint.aiAnalysis.summary}
              </h3>
              <p className="font-urdu text-sm text-slate-700 mt-1 leading-relaxed">
                {selectedComplaint.aiAnalysis.summary_urdu}
              </p>
            </div>

            {/* Dispatch Log history */}
            {selectedComplaint.dispatchLog && selectedComplaint.dispatchLog.length > 0 && (
              <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-3 space-y-1 text-xs">
                <span className="font-bold text-teal-900 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-teal-700" />
                  <span>{strings.dispatchLogTitle}:</span>
                </span>
                {selectedComplaint.dispatchLog.map((log, i) => (
                  <div key={i} className="text-slate-700 font-mono text-[11px]">
                    • {log.message} ({log.emailTo})
                  </div>
                ))}
              </div>
            )}

            {/* Actions: Generate formal letter & Resolve with audit */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowLetterModal(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-teal-700" />
                <span>{strings.generateLetter}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVerifyModal(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>{strings.auditResolution}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formal Letter Generation Modal */}
      {showLetterModal && selectedComplaint && (
        <FormalLetterModal
          onClose={() => setShowLetterModal(false)}
          complaint={selectedComplaint}
          onSaveLetter={() => {
            onRefreshData();
            setShowLetterModal(false);
          }}
        />
      )}

      {/* Before / After Resolution Verification Modal */}
      {showVerifyModal && selectedComplaint && (
        <ResolutionVerificationModal
          onClose={() => setShowVerifyModal(false)}
          complaint={selectedComplaint}
          onVerified={() => {
            onRefreshData();
            setShowVerifyModal(false);
            setSelectedComplaint(null);
          }}
        />
      )}
    </div>
  );
};
