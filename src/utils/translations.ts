import { AppLanguage, ComplaintCategory, ComplaintStatus } from '../types';

export const t = (lang: AppLanguage) => {
  const isUrdu = lang === 'ur';

  return {
    appName: isUrdu ? 'آواز' : 'Awaaz',
    tagline: isUrdu ? 'آپ کی آواز، آپ کا شہر' : 'Your voice, your city',
    headerLang: isUrdu ? 'English' : 'اردو',
    report: isUrdu ? 'رپورٹ' : 'Report',
    myComplaints: isUrdu ? 'میری شکایات' : 'My Complaints',
    profile: isUrdu ? 'پروفائل' : 'Profile',
    admin: isUrdu ? 'ایڈمن' : 'Admin',

    // Splash & Onboarding
    snap: isUrdu ? 'تصویر لیں' : 'Snap',
    snapDesc: isUrdu
      ? 'سڑک کے کھڈے، کچرے یا برقی خطرے کی تصویر کھینچیں۔'
      : 'Take a photo of any civic problem or municipal hazard.',
    speak: isUrdu ? 'بولیں' : 'Speak',
    speakDesc: isUrdu
      ? 'پشتو، اردو یا انگلش میں مائیک دبا کر مسئلہ بیان کریں۔'
      : 'Hold to speak what happened in Pashto, Urdu, or English.',
    track: isUrdu ? 'ٹریک کریں' : 'Track',
    trackDesc: isUrdu
      ? 'حکومتی محکموں کی جانب سے مسئلے کے حل کی لائیو پیش رفت دیکھیں۔'
      : 'Follow real-time municipal dispatch and verified resolution.',
    skip: isUrdu ? 'چھوڑیں' : 'Skip',
    getStarted: isUrdu ? 'شروع کریں' : 'Get Started',

    // Citizen Login
    welcome: isUrdu ? 'خوش آمدید' : 'Welcome',
    loginSubtitle: isUrdu
      ? 'پشاور کے بلدیاتی مسائل کے حل کے لیے آواز میں داخل ہوں'
      : 'Sign in to report and track municipal issues in Peshawar',
    continuePhone: isUrdu ? 'فون نمبر سے جاری رکھیں' : 'Continue with phone number',
    phoneLabel: isUrdu ? 'موبائل نمبر' : 'Phone number',
    phonePlaceholder: '+92 300 1234567',
    enterCode: isUrdu ? '۶ ہندسوں کا کوڈ درج کریں' : 'Enter 6-digit code',
    codePlaceholder: '123456',
    demoModeNote: isUrdu
      ? 'ڈیمو موڈ: کوئی بھی ۶ ہندسے درج کریں'
      : 'Demo mode: enter any 6-digit code',
    verifyAndLogin: isUrdu ? 'تصدیق کریں اور لاگ ان ہوں' : 'Verify & Sign In',
    continueGoogle: isUrdu ? 'گوگل سے جاری رکھیں' : 'Continue with Google',
    continueGuest: isUrdu ? 'بطور مہمان جاری رکھیں' : 'Continue as guest',
    privacyNote: isUrdu
      ? 'ہم آپ کا مقام اور تصاویر صرف شکایت کے ازالے کے لیے استعمال کرتے ہیں۔'
      : 'We only use your location and photos to process your complaint.',

    // Admin Login
    officerLogin: isUrdu ? 'افسر لاگ ان' : 'Officer Login',
    adminEmail: isUrdu ? 'ای میل ایڈریس' : 'Official Email',
    adminPassword: isUrdu ? 'پاس ورڈ' : 'Password',
    adminSignIn: isUrdu ? 'سائن ان کریں' : 'Sign in as Officer',
    demoCredentials: isUrdu ? 'ڈیمو لاگ ان کی تفصیلات' : 'Demo Credentials',
    switchToCitizen: isUrdu ? 'عام شہری اسکرین پر جائیں' : 'Switch to citizen view',

    // Wizard
    stepHeadline: isUrdu
      ? 'کیا مسئلہ ہے؟ ہمیں ۳ آسان اقدامات میں بتائیں۔'
      : "What's the problem? Tell us in 3 steps.",
    step1Title: isUrdu ? 'مرحلہ ۱ از ۳: تصویر' : 'Step 1 of 3: Snap',
    step2Title: isUrdu ? 'مرحلہ ۲ از ۳: آواز' : 'Step 2 of 3: Speak',
    step3Title: isUrdu ? 'مرحلہ ۳ از ۳: بھیجیں' : 'Step 3 of 3: Send',

    // Step 1: Snap
    snapMainAction: isUrdu ? 'تصویر لیں' : 'Take a Photo',
    chooseFromGallery: isUrdu ? 'یا گیلری سے منتخب کریں' : 'or choose from gallery',
    retakePhoto: isUrdu ? 'دوبارہ تصویر لیں' : 'Retake photo',
    noPhotoAdded: isUrdu ? 'کوئی تصویر نہیں لگائی گئی' : 'No photo added yet',
    next: isUrdu ? 'اگلا مرحلہ' : 'Next',
    back: isUrdu ? 'واپس' : 'Back',

    // Step 2: Speak
    speakInstructions: isUrdu
      ? 'مائیک دبائیں اور بتائیں کہ کیا ہوا (پشتو، اردو یا انگلش)'
      : 'Tap and tell us what happened (Pashto, Urdu or English)',
    recording: isUrdu ? 'ریکارڈنگ جاری ہے...' : 'Recording...',
    tapToStop: isUrdu ? 'ریکارڈنگ روکنے کے لیے ٹیپ کریں' : 'Tap to stop',
    skipTypeInstead: isUrdu ? 'آواز چھوڑیں، لکھ کر بتائیں' : 'Skip, type instead',
    reRecord: isUrdu ? 'دوبارہ ریکارڈ کریں' : 'Re-record',
    typePlaceholder: isUrdu
      ? 'مسئلے کی تفصیل یا قریبی نشانی لکھیں...'
      : 'Describe the issue or nearby landmark...',
    voiceNoteRecorded: isUrdu ? 'صوتی پیغام ریکارڈ ہو گیا' : 'Voice note recorded',

    // Step 3: Send
    summaryTitle: isUrdu ? 'رپورٹ کا جائزہ' : 'Summary of your report',
    locationFound: isUrdu ? 'مقام مل گیا ✓' : 'Location found ✓',
    locationManual: isUrdu ? 'مقام تبدیل کریں' : 'Change location',
    photoAttached: isUrdu ? 'تصویر شامل ہے' : 'Photo attached',
    voiceAttached: isUrdu ? 'صوتی پیغام شامل ہے' : 'Voice note attached',
    textAttached: isUrdu ? 'تحریری نوٹ شامل ہے' : 'Written note attached',
    submitButton: isUrdu ? 'شکایت بھیجیں' : 'Send Complaint',
    analyzing: isUrdu ? 'آپ کی رپورٹ کا جائزہ لیا جا رہا ہے...' : 'Analyzing your report...',
    needAtLeastOne: isUrdu
      ? 'براہ کرم تصویر لیں، آواز ریکارڈ کریں یا تحریر درج کریں۔'
      : 'Please take a photo, record a voice note, or write text to continue.',

    // Success Screen
    complaintSent: isUrdu ? 'شکایت بھیج دی گئی!' : 'Complaint sent!',
    assignedTo: isUrdu ? 'متعلقہ محکمہ:' : 'Responsible Agency:',
    trackMyComplaint: isUrdu ? 'میری شکایت دیکھیں' : 'Track my complaint',
    reportAnother: isUrdu ? 'دوسرا مسئلہ درج کریں' : 'Report another',
    alreadyReportedPart1: isUrdu ? 'یہ مسئلہ پہلے ہی ' : 'Already reported by ',
    alreadyReportedPart2: isUrdu
      ? ' افراد نے درج کرایا ہے، ہم نے آپ کی آواز بھی شامل کر دی ہے۔'
      : ' people, we added your voice.',

    // Emergency
    emergencyTitle: isUrdu ? 'ہنگامی خطرہ!' : 'Emergency Alert!',
    emergencySub: isUrdu
      ? 'فوری مدد کے لیے نیچے دیے گئے نمبر پر کال کریں'
      : 'Tap below to immediately call emergency dispatch',
    callRescue1122: isUrdu ? 'ریسکیو 1122 کو کال کریں' : 'Call Rescue 1122',
    callPolice15: isUrdu ? 'پولیس 15 کو کال کریں' : 'Call Police 15',
    callFire16: isUrdu ? 'فائر بریگیڈ 16 کو کال کریں' : 'Call Fire 16',
    dismissEmergency: isUrdu ? 'ٹھیک ہے، شکایت بھیج دی گئی' : 'Dismiss, complaint is saved',
    sosButton: isUrdu ? 'ہنگامی SOS' : 'Emergency SOS',
    reportWithEmergencyFlag: isUrdu ? 'ہنگامی شکایت تصویر کے ساتھ درج کریں' : 'Report an emergency with photo',

    // My complaints
    myComplaintsTitle: isUrdu ? 'میری شکایات' : 'My Complaints',
    emptyComplaints: isUrdu
      ? 'ابھی تک کوئی شکایت نہیں۔ شروع کرنے کے لیے رپورٹ پر ٹیپ کریں۔'
      : 'No complaints yet. Tap Report to start.',
    startReportBtn: isUrdu ? 'مسئلہ درج کریں' : 'Report a problem',
    close: isUrdu ? 'بند کریں' : 'Close',

    // Profile & Settings
    profileTitle: isUrdu ? 'پروفائل اور ترتیبات' : 'Profile & Settings',
    signOut: isUrdu ? 'سائن آؤٹ' : 'Sign out',
    notificationsToggle: isUrdu ? 'اطلاعات (Notifications)' : 'Notifications',
    emergencyNumbers: isUrdu ? 'ہنگامی ہیلپ لائنز' : 'Emergency Helplines',
    aboutAwaaz: isUrdu ? 'آواز کے بارے میں' : 'About Awaaz',
    aboutAwaazText: isUrdu
      ? 'حکومت خیبر پختونخوا کا مصنوعی ذہانت سے لیس بلدیاتی شکایات کا نظام، پشاور کے شہریوں کے لیے۔'
      : 'Citizen grievance redressal system powered by Google Gemini multimodal AI for Peshawar, Khyber Pakhtunkhwa.',
    complaintsSent: isUrdu ? 'درج شدہ شکایات' : 'Complaints Sent',
    complaintsResolved: isUrdu ? 'حل شدہ شکایات' : 'Resolved',
    citizensHelped: isUrdu ? 'متاثرہ شہری' : 'Citizens Helped',

    // Notifications Screen
    notificationsTitle: isUrdu ? 'اطلاعات' : 'Notifications',
    markAllRead: isUrdu ? 'سب پڑھا ہوا نشان زد کریں' : 'Mark all as read',
    noNotifications: isUrdu ? 'کوئی نئی اطلاع نہیں ہے' : 'No notifications yet',

    // 404
    pageNotFound: isUrdu ? 'صفحہ نہیں ملا' : 'Page not found',
    pageNotFoundDesc: isUrdu
      ? 'درخواست کردہ صفحہ موجود نہیں ہے یا منتقل ہو چکا ہے۔'
      : 'The page you are looking for does not exist or has moved.',
    goHome: isUrdu ? 'مرکزی صفحے پر جائیں' : 'Go home',

    // Statuses
    received: isUrdu ? 'موصول ہوئی' : 'Received',
    sentToOrg: isUrdu ? 'محکمے کو روانہ' : 'Sent to Organization',
    acknowledged: isUrdu ? 'محکمے نے قبول کر لی' : 'Acknowledged',
    inProgress: isUrdu ? 'کارروائی جاری ہے' : 'In Progress',
    assigned: isUrdu ? 'کارروائی جاری' : 'Assigned',
    resolved: isUrdu ? 'حل ہو گئی' : 'Resolved',

    // Organization Routing & Email
    sentToStep: isUrdu ? 'محکمے کو باقاعدہ ارسال' : 'Sent to Organization',
    emailPreview: isUrdu ? 'سرکاری ای میل کا پیش نظارہ' : 'Dispatched Email Preview',
    openInEmailApp: isUrdu ? 'ای میل ایپ میں کھولیں' : 'Open in email app',
    dispatchLogTitle: isUrdu ? 'ڈسپیچ لاگ' : 'Dispatch Log',
    byOrganization: isUrdu ? 'محکمہ وار جائزہ' : 'By Organization',
    avgResponseTime: isUrdu ? 'اوسط جوابی وقت' : 'Avg Response Time',
    reassignOrg: isUrdu ? 'ادارہ تبدیل کریں' : 'Reassign Organization',
    selectOrganization: isUrdu ? 'ادارہ منتخب کریں' : 'Select Organization',
    officerDashboard: isUrdu ? 'افسر ڈیش بورڈ' : 'Officer Dashboard',

    // Categories
    categories: {
      waste: isUrdu ? 'کچرا اور صفائی' : 'Waste & Garbage',
      road: isUrdu ? 'سڑک کی خرابی' : 'Broken Road',
      water: isUrdu ? 'پانی اور سیوریج' : 'Water & Sewer',
      electricity: isUrdu ? 'بجلی کا خطرہ' : 'Electricity',
      traffic: isUrdu ? 'ٹریفک جام' : 'Traffic',
      safety: isUrdu ? 'عوامی خطرہ' : 'Safety Hazard',
      other: isUrdu ? 'دیگر مسئلہ' : 'Other Issue',
    } as Record<ComplaintCategory, string>,

    // Admin
    adminPortal: isUrdu ? 'ایڈمن کنٹرول پورٹل' : 'Admin Portal',
    totalReports: isUrdu ? 'کل شکایات' : 'Total Reports',
    highPriority: isUrdu ? 'انتہائی اہم' : 'High Priority',
    resolvedCount: isUrdu ? 'حل شدہ' : 'Resolved',
    listView: isUrdu ? 'فہرست' : 'List',
    mapView: isUrdu ? 'نقشہ' : 'Map',
    filterBtn: isUrdu ? 'فلٹر' : 'Filter',
    affectedSuffix: isUrdu ? 'متاثرہ شہری' : 'citizens affected',
    generateLetter: isUrdu ? 'سرکاری خط تیار کریں' : 'Generate formal letter',
    auditResolution: isUrdu ? 'تصدیق اور حل کریں' : 'Resolve with photo',

    // Errors
    unclearAudio: isUrdu
      ? 'آواز واضح نہیں تھی، براہ کرم تحریر میں کچھ لکھیں'
      : "Couldn't understand the audio, please add text",
    retry: isUrdu ? 'دوبارہ کوشش کریں' : 'Retry',
  };
};
