import React, { useState } from 'react';
import { Search, Filter, PlusCircle, Inbox, CheckCircle2, Activity, Clock } from 'lucide-react';
import { Complaint, ComplaintStatus, AppLanguage } from '../types';
import { ComplaintCard } from './ComplaintCard';

interface MyComplaintsTabProps {
  complaints: Complaint[];
  userComplaintIds: string[];
  onNavigateToReport: () => void;
  onStatusChange?: (id: string, newStatus: ComplaintStatus) => void;
  language?: AppLanguage;
  onRefreshData?: () => void;
}

export const MyComplaintsTab: React.FC<MyComplaintsTabProps> = ({
  complaints,
  userComplaintIds,
  onNavigateToReport,
  onStatusChange,
  language = 'en',
  onRefreshData,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scope, setScope] = useState<'all' | 'my'>('all');

  const isUrdu = language === 'ur';

  // Determine complaints to display
  const targetList = scope === 'my' && userComplaintIds.length > 0
    ? complaints.filter((c) => userComplaintIds.includes(c.id))
    : complaints;

  const filtered = targetList.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchSummary = c.aiAnalysis.summary.toLowerCase().includes(q);
      const matchUrdu = c.aiAnalysis.summary_urdu.includes(q);
      const matchArea = c.location.areaName.toLowerCase().includes(q);
      const matchDept = c.aiAnalysis.department.toLowerCase().includes(q);
      return matchSummary || matchUrdu || matchArea || matchDept;
    }
    return true;
  });

  const countByStatus = {
    received: targetList.filter((c) => c.status === 'received').length,
    assigned: targetList.filter((c) => c.status === 'assigned').length,
    resolved: targetList.filter((c) => c.status === 'resolved').length,
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isUrdu ? 'شکایات کا ریکارڈ' : 'Civic Complaints · شکایات'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isUrdu
              ? 'پشاور میونسپل سروسز کی جانب سے پیش رفت اور ازالہ کی تفصیلات'
              : 'Track status updates, municipal dispatch, and resolution of reported issues'}
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-transform active:scale-98 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isUrdu ? 'نئی شکایت درج کریں' : 'New Report'}</span>
        </button>
      </div>

      {/* Scope toggle (All Peshawar Reports vs My Submissions) */}
      <div className="flex items-center justify-between gap-2 mb-4 bg-slate-100 p-1 rounded-xl text-xs">
        <button
          type="button"
          onClick={() => setScope('all')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
            scope === 'all'
              ? 'bg-white text-teal-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isUrdu ? 'تمام شہری شکایات' : 'All Peshawar Reports'} ({complaints.length})
        </button>
        <button
          type="button"
          onClick={() => setScope('my')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
            scope === 'my'
              ? 'bg-white text-teal-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isUrdu ? 'میری براہ راست رپورٹس' : 'My Submissions'} ({userComplaintIds.length})
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isUrdu
                ? 'علاقہ (حیات آباد، صدر)، محکمہ یا مسئلے کے لحاظ سے تلاش کریں...'
                : 'Search by area (e.g. Hayatabad, Saddar, Board Bazaar), department, or issue...'
            }
            className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
          />
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-teal-700 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            All ({targetList.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('received')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'received'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Received ({countByStatus.received})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('assigned')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'assigned'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Assigned ({countByStatus.assigned})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'resolved'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved ({countByStatus.resolved})</span>
          </button>
        </div>
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            {isUrdu ? 'کوئی شکایت نہیں ملی' : 'No complaints found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search query or status filter to see other reports.'
              : 'You have not submitted any complaints yet. Take a photo or record a voice note to start.'}
          </p>
          <button
            type="button"
            onClick={onNavigateToReport}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isUrdu ? 'شکایت درج کریں' : 'File a Complaint'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onStatusChange={onStatusChange}
              showAdminControls={false}
              onComplaintUpdated={onRefreshData}
            />
          ))}
        </div>
      )}
    </div>
  );
};
