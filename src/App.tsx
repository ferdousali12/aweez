import React, { useState, useEffect } from 'react';
import { Camera, FileText, User } from 'lucide-react';
import {
  Complaint,
  ComplaintStatus,
  AppLanguage,
  LocationData,
  UserSession,
  AppNotification,
} from './types';
import {
  getComplaints,
  getUserCreatedIds,
  saveComplaint,
  updateComplaintStatus,
  loadFifteenDemoComplaints,
  findNearbySameCategoryComplaints,
  mergeDuplicateComplaint,
  getCitizenSession,
  clearCitizenSession,
  getAdminSession,
  clearAdminSession,
  isOnboardingDone,
  getNotifications,
  markNotificationsRead,
  getUnreadNotificationCount,
} from './utils/storage';
import { routeComplaintToOrganization, getOrganizationById } from './data/organizations';
import { t } from './utils/translations';
import { CleanHeader } from './components/CleanHeader';
import { ReportWizard } from './components/ReportWizard';
import { SuccessView } from './components/SuccessView';
import { MyComplaintsView } from './components/MyComplaintsView';
import { ProfileTab } from './components/ProfileTab';
import { AdminPortal } from './components/AdminPortal';
import { AdminLoginScreen } from './components/AdminLoginScreen';
import { CitizenLoginScreen } from './components/CitizenLoginScreen';
import { SplashAndOnboarding } from './components/SplashAndOnboarding';
import { NotificationsModal } from './components/NotificationsModal';
import { EmergencyAlertModal } from './components/EmergencyAlertModal';
import { EmergencyHelpModal } from './components/EmergencyHelpModal';
import { DemoToolsModal } from './components/DemoToolsModal';
import { NotFoundPage } from './components/NotFoundPage';

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>('en');

  // Navigation: 'report' | 'my-complaints' | 'profile'
  const [activeTab, setActiveTab] = useState<'report' | 'my-complaints' | 'profile'>('report');

  // Route & Auth states
  const [currentPath, setCurrentPath] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() =>
    isOnboardingDone()
  );
  const [citizenSession, setCitizenSession] = useState<UserSession | null>(() =>
    getCitizenSession()
  );
  const [adminSession, setAdminSession] = useState<UserSession | null>(() =>
    getAdminSession()
  );

  // Complaints & Notifications state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [userComplaintIds, setUserComplaintIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  // Modals state
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showEmergencyHelpModal, setShowEmergencyHelpModal] = useState(false);
  const [showEmergencyAlertModal, setShowEmergencyAlertModal] = useState(false);
  const [emergencyComplaint, setEmergencyComplaint] = useState<Complaint | null>(null);
  const [showDemoTools, setShowDemoTools] = useState(false);

  // Submission & Success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<Complaint | null>(null);
  const [duplicateCount, setDuplicateCount] = useState<number | undefined>(undefined);

  // Preset hazard presets for testing
  const [presetPhoto, setPresetPhoto] = useState<string | null>(null);
  const [presetAudio, setPresetAudio] = useState<string | null>(null);

  // Initial load & URL routing sync
  useEffect(() => {
    refreshComplaints();
    refreshNotifications();

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const refreshComplaints = () => {
    setComplaints(getComplaints());
    setUserComplaintIds(getUserCreatedIds());
  };

  const refreshNotifications = () => {
    setNotifications(getNotifications());
    setUnreadNotificationsCount(getUnreadNotificationCount());
  };

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  const strings = t(language);
  const isUrdu = language === 'ur';

  // Citizen Wizard Submission
  const handleWizardSubmit = async (reportData: {
    photoBase64: string | null;
    photoMime: string;
    audioBase64: string | null;
    audioMime: string;
    audioDuration: number;
    text: string;
    location: LocationData;
  }) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setDuplicateCount(undefined);

    try {
      const response = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const aiAnalysis = await response.json();

      if (aiAnalysis.is_emergency) {
        aiAnalysis.severity = 5;
      }

      const complaintId = `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      // Duplicate detection within 150m in last 7 days
      const nearbyCandidates = findNearbySameCategoryComplaints(
        aiAnalysis.category,
        reportData.location.latitude,
        reportData.location.longitude,
        150,
        7
      );

      let isDuplicate = false;
      let finalComplaint: Complaint | null = null;

      if (nearbyCandidates.length > 0) {
        try {
          const dupRes = await fetch('/api/check-duplicate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              newReport: {
                category: aiAnalysis.category,
                summary: aiAnalysis.summary,
                transcript: aiAnalysis.transcript,
                userText: reportData.text,
                location: reportData.location,
              },
              candidateReports: nearbyCandidates,
            }),
          });

          if (dupRes.ok) {
            const dupData = await dupRes.json();
            if (dupData.is_duplicate && dupData.matched_complaint_id) {
              isDuplicate = true;
              finalComplaint = mergeDuplicateComplaint(dupData.matched_complaint_id, complaintId);
              if (finalComplaint) {
                setDuplicateCount(finalComplaint.affectedCitizens);
              }
            }
          }
        } catch {
          // Duplicate check is non-blocking
        }
      }

      // Organization routing (Rescue 1122 if emergency, else by category)
      const orgId = routeComplaintToOrganization(aiAnalysis.category, aiAnalysis.is_emergency);
      const org = getOrganizationById(orgId);

      // Auto-draft formal complaint letter addressed to the organization with Google Maps link
      let draftedLetter = '';
      try {
        const letterRes = await fetch('/api/generate-letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            complaint: {
              id: complaintId,
              location: reportData.location,
              aiAnalysis,
              affectedCitizens: 1,
              userText: reportData.text,
            },
            organizationName: org.name,
            organizationShortName: org.shortName,
            organizationEmail: org.email,
          }),
        });

        if (letterRes.ok) {
          const letterJson = await letterRes.json();
          draftedLetter = letterJson.letter_text || '';
        }
      } catch (e) {
        console.error('Auto letter generation failed:', e);
      }

      const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const mapsUrl = `https://www.google.com/maps?q=${reportData.location.latitude},${reportData.location.longitude}`;
      if (!draftedLetter) {
        draftedLetter = `GOVERNMENT OF KHYBER PAKHTUNKHWA
DISTRICT ADMINISTRATION PESHAWAR
OFFICE OF CITIZEN REDRESSAL & GRIEVANCES (AWAAZ)

Ref: KP/PWR/CIVIC/${new Date().getFullYear()}/${complaintId.slice(-6).toUpperCase()}
Date: ${todayStr}

To:
The Competent Authority,
${org.name} (${org.shortName}),
Email: ${org.email},
Peshawar, Khyber Pakhtunkhwa.

SUBJECT: OFFICIAL GRIEVANCE DISPATCH — ${aiAnalysis.category.toUpperCase()} ISSUE AT ${reportData.location.areaName.toUpperCase()}

Respected Sir/Madam,

This formal complaint is officially transmitted to your organization on behalf of Peshawar citizens via the Awaaz Municipal Platform.

1. Problem Description:
${aiAnalysis.summary}
Citizen Testimony: "${aiAnalysis.transcript || reportData.text || 'Photographic evidence attached.'}"

2. Exact Location & Google Maps Link:
- Area: ${reportData.location.areaName}
- Street Address: ${reportData.location.address}
- GPS Coordinates: ${reportData.location.latitude}, ${reportData.location.longitude}
- Google Maps Location: ${mapsUrl}

3. Risk & Urgency Assessment:
- Severity Level: ${aiAnalysis.severity} / 5 (${aiAnalysis.is_emergency ? 'CRITICAL EMERGENCY' : 'Standard Priority'})

Your organization is respectfully requested to inspect the site and initiate remedial works within 24 to 48 hours.

Yours faithfully,
Municipal Grievance Directorate,
District Administration Peshawar.`;
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const initialDispatchLog = [
        {
          timestamp: now.toISOString(),
          message: `Sent to ${org.shortName} at ${timeStr}`,
          emailTo: org.email,
          status: 'sent' as const,
        },
      ];

      if (!finalComplaint) {
        finalComplaint = {
          id: complaintId,
          createdAt: now.toISOString(),
          photoUrl: reportData.photoBase64 || undefined,
          audioUrl: reportData.audioBase64 || undefined,
          audioDuration: reportData.audioDuration || undefined,
          userText: reportData.text.trim() || undefined,
          location: reportData.location,
          aiAnalysis,
          organizationId: orgId,
          letter: draftedLetter,
          dispatchLog: initialDispatchLog,
          status: 'sent_to_org',
          affectedCitizens: 1,
          statusHistory: [
            {
              status: 'received',
              timestamp: now.toISOString(),
              note: 'Complaint registered by citizen',
            },
            {
              status: 'sent_to_org',
              timestamp: now.toISOString(),
              note: `Dispatched to ${org.name}`,
            },
          ],
        };
        saveComplaint(finalComplaint);
      } else {
        if (!finalComplaint.organizationId) finalComplaint.organizationId = orgId;
        if (!finalComplaint.letter) finalComplaint.letter = draftedLetter;
        if (!finalComplaint.dispatchLog) finalComplaint.dispatchLog = initialDispatchLog;
      }

      refreshComplaints();
      refreshNotifications();
      setLastSubmitted(finalComplaint);

      // Emergency Mode trigger if high-risk / emergency detected
      if (aiAnalysis.is_emergency) {
        setEmergencyComplaint(finalComplaint);
        setShowEmergencyAlertModal(true);
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      setSubmitError(
        isUrdu
          ? 'رپورٹ جمع کرنے میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔'
          : 'Failed to analyze report. Please check your connection and retry.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (id: string, newStatus: ComplaintStatus) => {
    updateComplaintStatus(id, newStatus);
    refreshComplaints();
    refreshNotifications();
  };

  // Preset hazard photo injection for testing
  const handleSelectPresetPhoto = (presetType: string) => {
    let color = '#EA580C';
    let icon = '🚧';
    let title = 'Broken Road Pothole';

    if (presetType === 'garbage') {
      color = '#0D9488';
      icon = '🗑️';
      title = 'Overflowing Waste Dump';
    } else if (presetType === 'electric') {
      color = '#DC2626';
      icon = '⚡';
      title = 'Live Wire Danger';
    } else if (presetType === 'water') {
      color = '#0284C7';
      icon = '💧';
      title = 'Burst Water Pipe';
    }

    const svg = `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
        <rect width="600" height="400" fill="${color}"/>
        <circle cx="300" cy="180" r="50" fill="rgba(255,255,255,0.2)"/>
        <text x="300" y="195" font-family="sans-serif" font-size="36" fill="white" text-anchor="middle">${icon}</text>
        <text x="300" y="270" font-family="sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle">${title}</text>
      </svg>
    `)}`;
    setPresetPhoto(svg);
    setActiveTab('report');
  };

  const handleSelectPresetAudio = () => {
    setPresetAudio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    setActiveTab('report');
  };

  const handleLoadDemoData = () => {
    loadFifteenDemoComplaints();
    refreshComplaints();
    refreshNotifications();
  };

  const handleMarkNotificationsRead = () => {
    markNotificationsRead();
    refreshNotifications();
  };

  const handleCitizenSignOut = () => {
    clearCitizenSession();
    setCitizenSession(null);
    setActiveTab('report');
  };

  const handleAdminSignOut = () => {
    clearAdminSession();
    setAdminSession(null);
    navigateTo('/admin/login');
  };

  /* ─────────────────────────────────────────────────────────────
     1. SPLASH + ONBOARDING (First launch only)
  ───────────────────────────────────────────────────────────── */
  if (!hasCompletedOnboarding) {
    return (
      <SplashAndOnboarding
        language={language}
        onFinish={() => setHasCompletedOnboarding(true)}
        onToggleLanguage={handleToggleLanguage}
      />
    );
  }

  /* ─────────────────────────────────────────────────────────────
     2. ADMIN ROUTING (/admin or /admin/login)
  ───────────────────────────────────────────────────────────── */
  const isAdminPath =
    currentPath === '/admin' ||
    currentPath === '/admin/login' ||
    currentPath.startsWith('/admin/');

  if (isAdminPath) {
    // If not signed in as admin, force Officer Login screen
    if (!adminSession) {
      return (
        <AdminLoginScreen
          language={language}
          onLoginSuccess={(session) => {
            setAdminSession(session);
            navigateTo('/admin');
          }}
          onSwitchToCitizen={() => navigateTo('/')}
        />
      );
    }

    // Authenticated admin view
    return (
      <div
        dir={isUrdu ? 'rtl' : 'ltr'}
        className={`min-h-screen bg-slate-50 text-slate-900 ${isUrdu ? 'font-urdu' : 'font-sans'}`}
      >
        <AdminPortal
          complaints={complaints}
          userSession={adminSession}
          onStatusChange={handleStatusChange}
          onSwitchToCitizen={() => navigateTo('/')}
          onSignOut={handleAdminSignOut}
          onRefreshData={refreshComplaints}
          language={language}
        />
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     3. 404 UNKNOWN ROUTE HANDLING
  ───────────────────────────────────────────────────────────── */
  if (currentPath !== '/' && currentPath !== '') {
    return (
      <NotFoundPage
        language={language}
        onGoHome={() => navigateTo('/')}
      />
    );
  }

  /* ─────────────────────────────────────────────────────────────
     4. CITIZEN LOGIN SCREEN (If not authenticated)
  ───────────────────────────────────────────────────────────── */
  if (!citizenSession) {
    return (
      <CitizenLoginScreen
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onLoginSuccess={(session) => {
          setCitizenSession(session);
          setActiveTab('report');
        }}
      />
    );
  }

  /* ─────────────────────────────────────────────────────────────
     5. MAIN CITIZEN APP (3-Tab Mobile Navigation)
  ───────────────────────────────────────────────────────────── */
  return (
    <div
      dir={isUrdu ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-slate-50 text-slate-900 ${isUrdu ? 'font-urdu' : 'font-sans'}`}
    >
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* Header: Clean Logo + Unread Notifications Bell + Language Switch */}
        <CleanHeader
          language={language}
          onToggleLanguage={handleToggleLanguage}
          onUnlockDemoTools={() => setShowDemoTools(true)}
          unreadCount={unreadNotificationsCount}
          onOpenNotifications={() => setShowNotificationsModal(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-[480px] mx-auto">
          {lastSubmitted ? (
            /* Success Screen with Agency Routing and Duplicate info */
            <SuccessView
              complaint={lastSubmitted}
              duplicateCount={duplicateCount}
              onTrack={() => {
                setLastSubmitted(null);
                setActiveTab('my-complaints');
              }}
              onReportAnother={() => {
                setLastSubmitted(null);
                setPresetPhoto(null);
                setPresetAudio(null);
                setActiveTab('report');
              }}
              language={language}
            />
          ) : activeTab === 'report' ? (
            /* Step 1: Snap, Step 2: Speak, Step 3: Send + Floating Red SOS button */
            <ReportWizard
              language={language}
              onSubmit={handleWizardSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
              onRetry={() => setSubmitError(null)}
              presetPhoto={presetPhoto}
              presetAudio={presetAudio}
              onOpenEmergencyHelp={() => setShowEmergencyHelpModal(true)}
            />
          ) : activeTab === 'my-complaints' ? (
            /* My Complaints Screen with full 4-step vertical tracking screen */
            <MyComplaintsView
              complaints={complaints}
              userComplaintIds={userComplaintIds}
              onNavigateToReport={() => setActiveTab('report')}
              language={language}
            />
          ) : (
            /* Profile & Settings Tab (3rd bottom bar item) */
            <ProfileTab
              session={citizenSession}
              language={language}
              onLanguageChange={(l) => setLanguage(l)}
              onSignOut={handleCitizenSignOut}
            />
          )}
        </main>

        {/* Fixed Bottom Navigation Bar: 3 Tabs (Report, My Complaints, Profile) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-md">
          <div className="max-w-[480px] mx-auto grid grid-cols-3 h-16">
            {/* 1. Report Tab */}
            <button
              type="button"
              onClick={() => {
                setLastSubmitted(null);
                setActiveTab('report');
              }}
              className={`flex flex-col items-center justify-center min-h-[56px] transition-colors cursor-pointer ${
                activeTab === 'report'
                  ? 'text-teal-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Camera className="w-6 h-6 stroke-[2.2]" />
              <span className="text-xs mt-0.5 font-bold">{strings.report}</span>
            </button>

            {/* 2. My Complaints Tab */}
            <button
              type="button"
              onClick={() => {
                setLastSubmitted(null);
                setActiveTab('my-complaints');
              }}
              className={`flex flex-col items-center justify-center min-h-[56px] transition-colors cursor-pointer ${
                activeTab === 'my-complaints'
                  ? 'text-teal-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-6 h-6 stroke-[2.2]" />
              <span className="text-xs mt-0.5 font-bold">{strings.myComplaints}</span>
            </button>

            {/* 3. Profile Tab */}
            <button
              type="button"
              onClick={() => {
                setLastSubmitted(null);
                setActiveTab('profile');
              }}
              className={`flex flex-col items-center justify-center min-h-[56px] transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'text-teal-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-6 h-6 stroke-[2.2]" />
              <span className="text-xs mt-0.5 font-bold">{strings.profile}</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Emergency Help Modal (Triggered by floating SOS button) */}
      <EmergencyHelpModal
        isOpen={showEmergencyHelpModal}
        onClose={() => setShowEmergencyHelpModal(false)}
        onReportEmergencyWithPhoto={() => {
          setShowEmergencyHelpModal(false);
          handleSelectPresetPhoto('electric');
          setActiveTab('report');
        }}
        language={language}
      />

      {/* Emergency Full-Screen Red Alert (Triggered when AI detects emergency severity) */}
      {showEmergencyAlertModal && emergencyComplaint && (
        <EmergencyAlertModal
          complaint={emergencyComplaint}
          onClose={() => setShowEmergencyAlertModal(false)}
          language={language}
        />
      )}

      {/* Notifications Modal (Triggered by Bell icon in CleanHeader) */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkNotificationsRead}
        language={language}
      />

      {/* Hidden Demo Tools Modal (Unlocked via 5 taps on Awaaz logo) */}
      <DemoToolsModal
        isOpen={showDemoTools}
        onClose={() => setShowDemoTools(false)}
        onSelectPresetPhoto={handleSelectPresetPhoto}
        onSelectPresetAudio={handleSelectPresetAudio}
        onLoadDemoData={handleLoadDemoData}
        onOpenAdmin={() => {
          setShowDemoTools(false);
          navigateTo('/admin');
        }}
        language={language}
      />
    </div>
  );
}
