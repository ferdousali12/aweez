import { Complaint, ComplaintStatus, VerificationResult, UserSession, AppNotification } from '../types';
import { FIFTEEN_DEMO_COMPLAINTS } from '../data/mockData';
import { routeComplaintToOrganization, getOrganizationById } from '../data/organizations';

const STORAGE_KEY = 'awaaz_peshawar_complaints_v3';
const USER_CREATED_KEY = 'awaaz_peshawar_user_complaint_ids_v3';
const CITIZEN_SESSION_KEY = 'awaaz_citizen_session_v1';
const ADMIN_SESSION_KEY = 'awaaz_admin_session_v1';
const ONBOARDING_KEY = 'awaaz_onboarding_completed_v1';
const NOTIFICATIONS_KEY = 'awaaz_notifications_v1';

// Initial default notification for realistic demonstration
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Complaint Assigned to PESCO',
    titleUrdu: 'شکایت پیسکو کو تفویض کر دی گئی',
    message: 'Your report regarding broken wire in Hayatabad was dispatched to line maintenance.',
    messageUrdu: 'حیات آباد میں برقی تار کی شکایت فیلڈ ٹیم کو تفویض کر دی گئی ہے۔',
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
    read: false,
    type: 'status_update',
  },
  {
    id: 'notif-2',
    title: 'Water Leak Resolved',
    titleUrdu: 'پانی کی لیکیج کا مسئلہ حل ہو گیا',
    message: 'WSSP team repaired the cracked supply pipe in Qissa Khwani Bazaar.',
    messageUrdu: 'ڈبلیو ایس ایس پی کی ٹیم نے قصہ خوانی بازار میں پائپ لائن درست کر دی ہے۔',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    read: true,
    type: 'status_update',
  },
];

/* ─── AUTH / SESSION ─── */
export function getCitizenSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CITIZEN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCitizenSession(session: UserSession): void {
  try {
    localStorage.setItem(CITIZEN_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save citizen session:', e);
  }
}

export function clearCitizenSession(): void {
  try {
    localStorage.removeItem(CITIZEN_SESSION_KEY);
  } catch {}
}

export function getAdminSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAdminSession(session: UserSession): void {
  try {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save admin session:', e);
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {}
}

/* ─── ONBOARDING ─── */
export function isOnboardingDone(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function setOnboardingDone(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {}
}

/* ─── NOTIFICATIONS ─── */
export function getNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
  const current = getNotifications();
  const newNotif: AppNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  const updated = [newNotif, ...current];
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save notification:', e);
  }
}

export function markNotificationsRead(): void {
  const current = getNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch {}
}

export function getUnreadNotificationCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

/* ─── COMPLAINTS ─── */
export function getComplaints(): Complaint[] {
  if (typeof window === 'undefined') return FIFTEEN_DEMO_COMPLAINTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(FIFTEEN_DEMO_COMPLAINTS));
      return FIFTEEN_DEMO_COMPLAINTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : FIFTEEN_DEMO_COMPLAINTS;
  } catch (e) {
    console.error('Failed to load complaints from localStorage:', e);
    return FIFTEEN_DEMO_COMPLAINTS;
  }
}

export function saveComplaint(complaint: Complaint): Complaint[] {
  const current = getComplaints();

  // Ensure organizationId is assigned
  const orgId = complaint.organizationId || routeComplaintToOrganization(complaint.aiAnalysis.category, complaint.aiAnalysis.is_emergency);
  const org = getOrganizationById(orgId);

  // Auto-generate initial dispatch log if not already present
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dispatchLogs = complaint.dispatchLog && complaint.dispatchLog.length > 0
    ? complaint.dispatchLog
    : [
        {
          timestamp: now.toISOString(),
          message: `Sent to ${org.shortName} at ${timeStr}`,
          emailTo: org.email,
          status: 'sent' as const,
        },
      ];

  const preparedComplaint: Complaint = {
    ...complaint,
    organizationId: orgId,
    status: complaint.status || 'sent_to_org',
    dispatchLog: dispatchLogs,
    statusHistory: complaint.statusHistory && complaint.statusHistory.length > 0
      ? complaint.statusHistory
      : [
          { status: 'received', timestamp: now.toISOString(), note: 'Received by Awaaz platform' },
          { status: 'sent_to_org', timestamp: now.toISOString(), note: `Dispatched to ${org.name}` },
        ],
  };

  const updated = [preparedComplaint, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const userIdsRaw = localStorage.getItem(USER_CREATED_KEY);
    const userIds: string[] = userIdsRaw ? JSON.parse(userIdsRaw) : [];
    if (!userIds.includes(preparedComplaint.id)) {
      userIds.unshift(preparedComplaint.id);
      localStorage.setItem(USER_CREATED_KEY, JSON.stringify(userIds));
    }

    // Add confirmation notification
    addNotification({
      complaintId: preparedComplaint.id,
      title: `Sent to ${org.shortName}`,
      titleUrdu: `شکایت ${org.shortNameUrdu} کو بھیج دی گئی`,
      message: `Your complaint in ${preparedComplaint.location.areaName} was received and dispatched to ${org.name}.`,
      messageUrdu: `${preparedComplaint.location.areaName} میں آپ کی شکایت ${org.shortNameUrdu} کو ارسال کر دی گئی ہے۔`,
      type: 'status_update',
    });
  } catch (e) {
    console.error('Failed to save complaint to localStorage:', e);
  }
  return updated;
}

export function getUserCreatedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const userIdsRaw = localStorage.getItem(USER_CREATED_KEY);
    return userIdsRaw ? JSON.parse(userIdsRaw) : [];
  } catch {
    return [];
  }
}

export const getUserCreatedComplaintIds = getUserCreatedIds;

export function updateComplaintStatus(
  id: string,
  newStatus: ComplaintStatus,
  note?: string
): Complaint[] {
  const current = getComplaints();
  let updatedComplaint: Complaint | null = null;

  const updated = current.map((c) => {
    if (c.id !== id) return c;
    updatedComplaint = {
      ...c,
      status: newStatus,
      statusHistory: [
        ...(c.statusHistory || []),
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: note || `Status updated to ${newStatus}`,
        },
      ],
    };
    return updatedComplaint;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Automatically generate notification when admin/officer updates status
    if (updatedComplaint) {
      const comp = updatedComplaint as Complaint;
      const org = getOrganizationById(comp.organizationId);

      let statusTitle = `${org.shortName} Status Update`;
      let statusTitleUrdu = `${org.shortNameUrdu} کی جانب سے اپ ڈیٹ`;
      let statusMsg = `Your complaint in ${comp.location.areaName} status changed to ${newStatus}.`;
      let statusMsgUrdu = `${comp.location.areaName} کے لیے آپ کی شکایت کی صورتحال تبدیل ہو گئی ہے۔`;

      if (newStatus === 'acknowledged') {
        statusTitle = `${org.shortName} Acknowledged`;
        statusTitleUrdu = `${org.shortNameUrdu} نے شکایت قبول کر لی`;
        statusMsg = `${org.shortName} has acknowledged your complaint and queued field inspection.`;
        statusMsgUrdu = `${org.shortNameUrdu} نے آپ کی شکایت کی تصدیق کر لی ہے۔`;
      } else if (newStatus === 'in_progress') {
        statusTitle = `${org.shortName} Working on Issue`;
        statusTitleUrdu = `${org.shortNameUrdu} کی فیلڈ ٹیم متحرک`;
        statusMsg = `${org.shortName} field team is actively working on the issue in ${comp.location.areaName}.`;
        statusMsgUrdu = `${org.shortNameUrdu} کی فیلڈ ٹیم ${comp.location.areaName} میں مسئلے پر کارروائی کر رہی ہے۔`;
      } else if (newStatus === 'resolved') {
        statusTitle = `${org.shortName} Marked Resolved ✓`;
        statusTitleUrdu = `${org.shortNameUrdu} کی جانب سے مسئلہ حل ہو گیا ✓`;
        statusMsg = `Your complaint in ${comp.location.areaName} has been verified and resolved by ${org.shortName}.`;
        statusMsgUrdu = `${comp.location.areaName} میں آپ کی شکایت ${org.shortNameUrdu} نے حل کر دی ہے۔`;
      } else if (newStatus === 'sent_to_org') {
        statusTitle = `Sent to ${org.shortName}`;
        statusTitleUrdu = `${org.shortNameUrdu} کو روانہ`;
        statusMsg = `Your report was officially transmitted to ${org.name}.`;
        statusMsgUrdu = `آپ کی شکایت ${org.shortNameUrdu} کو باقاعدہ ارسال کر دی گئی ہے۔`;
      }

      addNotification({
        complaintId: comp.id,
        title: statusTitle,
        titleUrdu: statusTitleUrdu,
        message: statusMsg,
        messageUrdu: statusMsgUrdu,
        type: 'status_update',
      });
    }
  } catch (e) {
    console.error('Failed to update complaint status:', e);
  }
  return updated;
}

export function reassignComplaintOrganization(
  id: string,
  newOrgId: string,
  note?: string
): Complaint[] {
  const current = getComplaints();
  let updatedComplaint: Complaint | null = null;
  const newOrg = getOrganizationById(newOrgId);
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const updated = current.map((c) => {
    if (c.id !== id) return c;
    const oldOrg = getOrganizationById(c.organizationId);
    const newDispatchItem = {
      timestamp: now.toISOString(),
      message: `Reassigned from ${oldOrg.shortName} to ${newOrg.shortName} at ${timeStr}`,
      emailTo: newOrg.email,
      status: 'sent' as const,
    };

    updatedComplaint = {
      ...c,
      organizationId: newOrgId,
      status: 'sent_to_org',
      dispatchLog: [...(c.dispatchLog || []), newDispatchItem],
      statusHistory: [
        ...(c.statusHistory || []),
        {
          status: 'sent_to_org',
          timestamp: now.toISOString(),
          note: note || `Reassigned from ${oldOrg.shortName} to ${newOrg.shortName} by Super Admin`,
        },
      ],
    };
    return updatedComplaint;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (updatedComplaint) {
      addNotification({
        complaintId: id,
        title: `Reassigned to ${newOrg.shortName}`,
        titleUrdu: `شکایت ${newOrg.shortNameUrdu} کو تفویض`,
        message: `Your complaint in ${(updatedComplaint as Complaint).location.areaName} was reassigned to ${newOrg.name} for official action.`,
        messageUrdu: `آپ کی شکایت اب ${newOrg.shortNameUrdu} کو تفویض کر دی گئی ہے۔`,
        type: 'status_update',
      });
    }
  } catch (e) {
    console.error('Failed to reassign complaint:', e);
  }
  return updated;
}

export function updateResolutionVerification(
  id: string,
  afterPhotoUrl: string,
  verificationResult: VerificationResult
): Complaint[] {
  const current = getComplaints();
  const updated = current.map((c) => {
    if (c.id !== id) return c;
    return {
      ...c,
      status: verificationResult.verified ? 'resolved' : c.status,
      afterPhotoUrl,
      verificationResult,
      statusHistory: [
        ...(c.statusHistory || []),
        {
          status: verificationResult.verified ? 'resolved' : c.status,
          timestamp: new Date().toISOString(),
          note: `AI Visual Audit: ${verificationResult.status_label} - ${verificationResult.explanation}`,
        },
      ],
    };
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save resolution verification:', e);
  }
  return updated;
}

export function saveFormalLetter(id: string, letterText: string): Complaint[] {
  const current = getComplaints();
  const updated = current.map((c) => {
    if (c.id !== id) return c;
    return { ...c, formalLetter: letterText };
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save formal letter:', e);
  }
  return updated;
}

// Distance helper
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const φ1 = lat1 * rad;
  const φ2 = lat2 * rad;
  const Δφ = (lat2 - lat1) * rad;
  const Δλ = (lon2 - lon1) * rad;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function findNearbySameCategoryComplaints(
  category: string,
  latitude: number,
  longitude: number,
  maxDistanceMeters = 150,
  maxDays = 7
): Complaint[] {
  const current = getComplaints();
  const sevenDaysAgo = Date.now() - maxDays * 24 * 3600 * 1000;

  return current.filter((c) => {
    if (c.aiAnalysis.category !== category) return false;
    const createdTime = new Date(c.createdAt).getTime();
    if (createdTime < sevenDaysAgo) return false;
    const dist = calculateDistanceMeters(
      latitude,
      longitude,
      c.location.latitude,
      c.location.longitude
    );
    return dist <= maxDistanceMeters;
  });
}

export function mergeDuplicateComplaint(
  originalId: string,
  newReportId: string
): Complaint | null {
  const current = getComplaints();
  let updatedOriginal: Complaint | null = null;

  const updated = current.map((c) => {
    if (c.id !== originalId) return c;
    const count = (c.affectedCitizens || 1) + 1;
    const dupIds = c.duplicateReportIds || [];
    updatedOriginal = {
      ...c,
      affectedCitizens: count,
      duplicateReportIds: [...dupIds, newReportId],
      statusHistory: [
        ...(c.statusHistory || []),
        {
          status: c.status,
          timestamp: new Date().toISOString(),
          note: `Duplicate report merged from citizen (Total citizens affected: ${count})`,
        },
      ],
    };
    return updatedOriginal;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const userIdsRaw = localStorage.getItem(USER_CREATED_KEY);
    const userIds: string[] = userIdsRaw ? JSON.parse(userIdsRaw) : [];
    if (!userIds.includes(newReportId)) {
      userIds.unshift(newReportId);
      localStorage.setItem(USER_CREATED_KEY, JSON.stringify(userIds));
    }

    addNotification({
      complaintId: originalId,
      title: 'Voice Added to Existing Report',
      titleUrdu: 'آپ کی آواز پہلے سے درج شکایت میں شامل کی گئی',
      message: `Your report was linked with a nearby issue. ${updatedOriginal ? (updatedOriginal as any).affectedCitizens : 2} citizens now connected.`,
      messageUrdu: `آپ کی رپورٹ کو قریبی مسئلے کے ساتھ منسلک کر دیا گیا ہے۔ اب کل متاثرہ شہریوں کی تعداد زیادہ ہے۔`,
      type: 'duplicate_merged',
    });
  } catch (e) {
    console.error('Failed to merge duplicate:', e);
  }

  return updatedOriginal;
}

export function loadFifteenDemoComplaints(): Complaint[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(FIFTEEN_DEMO_COMPLAINTS));
    localStorage.removeItem(USER_CREATED_KEY);
  } catch (e) {
    console.error('Failed to load demo data:', e);
  }
  return FIFTEEN_DEMO_COMPLAINTS;
}
