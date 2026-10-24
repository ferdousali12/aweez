export type ComplaintCategory =
  | 'waste'
  | 'road'
  | 'water'
  | 'electricity'
  | 'traffic'
  | 'safety'
  | 'other';

export type ComplaintStatus =
  | 'received'
  | 'sent_to_org'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'assigned';

export interface LocationData {
  latitude: number;
  longitude: number;
  areaName: string;
  address: string;
  isAutoDetected?: boolean;
}

export interface AiAnalysisResult {
  category: ComplaintCategory;
  severity: number; // 1 to 5
  summary: string;
  summary_urdu: string;
  department: string;
  language_detected: string;
  transcript: string;
  is_emergency: boolean;
  audio_unclear?: boolean;
}

export interface VerificationResult {
  verified: boolean;
  status_label: 'Verified fixed' | 'Needs review';
  confidence_score?: number;
  explanation: string;
  explanation_urdu: string;
}

export interface DispatchLogItem {
  timestamp: string;
  message: string;
  emailTo: string;
  status?: 'sent' | 'delivered';
}

export interface Complaint {
  id: string;
  createdAt: string;
  photoUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  userText?: string;
  location: LocationData;
  aiAnalysis: AiAnalysisResult;
  status: ComplaintStatus;
  statusHistory: Array<{
    status: ComplaintStatus;
    timestamp: string;
    note?: string;
  }>;
  affectedCitizens?: number; // Defaults to 1; increments when duplicate reports merged
  duplicateReportIds?: string[];
  linkedToOriginalId?: string;
  afterPhotoUrl?: string;
  verificationResult?: VerificationResult;
  formalLetter?: string;
  organizationId?: string; // e.g. 'wssp', 'tma', 'pesco', 'traffic', 'rescue1122', 'police', 'general'
  letter?: string; // formal drafted letter addressed to organization
  dispatchLog?: DispatchLogItem[];
}

export interface PeshawarZone {
  id: string;
  name: string;
  nameUrdu: string;
  latitude: number;
  longitude: number;
  landmark: string;
  type: 'residential' | 'commercial' | 'medical' | 'educational' | 'heritage';
}

export type AppLanguage = 'en' | 'ur';

export type UserRole = 'citizen' | 'admin' | 'officer';

export interface UserSession {
  id: string;
  role: UserRole;
  name: string;
  phone?: string;
  email?: string;
  organizationId?: string; // set for officers e.g. 'wssp', 'tma', 'pesco'
  isGuest?: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  complaintId?: string;
  title: string;
  titleUrdu: string;
  message: string;
  messageUrdu: string;
  timestamp: string;
  read: boolean;
  type: 'status_update' | 'duplicate_merged' | 'emergency';
}
