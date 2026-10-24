import { ComplaintCategory } from '../types';

export interface Organization {
  id: string;
  name: string;
  nameUrdu: string;
  shortName: string;
  shortNameUrdu: string;
  categories: ComplaintCategory[];
  email: string;
  logoBg: string;
  logoText: string;
  badgeColor: string;
  jurisdiction: string;
  avgResponseHours: number;
}

export const ORGANIZATIONS: Organization[] = [
  {
    id: 'wssp',
    name: 'Water and Sanitation Services Peshawar',
    nameUrdu: 'واٹر اینڈ سینی ٹیشن سروسز پشاور',
    shortName: 'WSSP',
    shortNameUrdu: 'ڈبلیو ایس ایس پی',
    categories: ['waste', 'water'],
    email: 'wssp@example.com',
    logoBg: 'bg-teal-700',
    logoText: 'WSSP',
    badgeColor: 'text-teal-800 bg-teal-50 border-teal-200',
    jurisdiction: 'Solid waste management, clean water supply, drainage, sewer network',
    avgResponseHours: 1.8,
  },
  {
    id: 'tma',
    name: 'Tehsil Municipal Administration Peshawar',
    nameUrdu: 'تحصیل میونسپل ایڈمنسٹریشن پشاور',
    shortName: 'TMA Peshawar',
    shortNameUrdu: 'ٹی ایم اے پشاور',
    categories: ['road'],
    email: 'tma@example.com',
    logoBg: 'bg-amber-700',
    logoText: 'TMA',
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
    jurisdiction: 'Municipal street paving, potholes, footpaths, encroachment control',
    avgResponseHours: 3.5,
  },
  {
    id: 'pesco',
    name: 'Peshawar Electric Supply Company',
    nameUrdu: 'پشاور الیکٹرک سپلائی کمپنی',
    shortName: 'PESCO',
    shortNameUrdu: 'پیسکو',
    categories: ['electricity'],
    email: 'pesco@example.com',
    logoBg: 'bg-sky-700',
    logoText: 'PESCO',
    badgeColor: 'text-sky-800 bg-sky-50 border-sky-200',
    jurisdiction: 'Power distribution, low-hanging cables, transformers, electrical poles',
    avgResponseHours: 1.2,
  },
  {
    id: 'traffic',
    name: 'Peshawar Traffic Police',
    nameUrdu: 'ٹریفک پولیس پشاور',
    shortName: 'Traffic Police',
    shortNameUrdu: 'ٹریفک پولیس',
    categories: ['traffic'],
    email: 'traffic@example.com',
    logoBg: 'bg-indigo-700',
    logoText: 'TRAFFIC',
    badgeColor: 'text-indigo-800 bg-indigo-50 border-indigo-200',
    jurisdiction: 'Traffic congestion, non-functional signals, BRT lane blockages, wrong-way parking',
    avgResponseHours: 0.8,
  },
  {
    id: 'rescue1122',
    name: 'Rescue 1122 Khyber Pakhtunkhwa',
    nameUrdu: 'ریسکیو 1122 خیبر پختونخوا',
    shortName: 'Rescue 1122',
    shortNameUrdu: 'ریسکیو 1122',
    categories: ['safety'],
    email: 'rescue1122@example.com',
    logoBg: 'bg-red-600',
    logoText: '1122',
    badgeColor: 'text-red-800 bg-red-50 border-red-200',
    jurisdiction: 'Imminent collapse hazards, open manhole rescues, life emergencies',
    avgResponseHours: 0.4,
  },
  {
    id: 'police',
    name: 'Khyber Pakhtunkhwa Police (Peshawar)',
    nameUrdu: 'خیبر پختونخوا پولیس پشاور',
    shortName: 'Police',
    shortNameUrdu: 'پولیس',
    categories: ['safety'],
    email: 'police@example.com',
    logoBg: 'bg-slate-800',
    logoText: 'POLICE',
    badgeColor: 'text-slate-800 bg-slate-100 border-slate-300',
    jurisdiction: 'Public safety threats, unauthorized roadblocks, law & order hazards',
    avgResponseHours: 1.1,
  },
  {
    id: 'general',
    name: 'Peshawar District Administration',
    nameUrdu: 'ڈسٹرکٹ ایڈمنسٹریشن پشاور',
    shortName: 'General Admin',
    shortNameUrdu: 'ضلعی انتظامیہ',
    categories: ['other'],
    email: 'admin@example.com',
    logoBg: 'bg-emerald-800',
    logoText: 'ADMIN',
    badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    jurisdiction: 'Cross-departmental grievances, civic welfare, general municipal oversight',
    avgResponseHours: 4.0,
  },
];

/**
 * Route a complaint to the appropriate organization based on category and emergency status
 */
export function routeComplaintToOrganization(
  category: ComplaintCategory,
  isEmergency: boolean = false
): string {
  // If emergency is true, route immediately to Rescue 1122
  if (isEmergency) {
    return 'rescue1122';
  }

  switch (category) {
    case 'waste':
    case 'water':
      return 'wssp';
    case 'road':
      return 'tma';
    case 'electricity':
      return 'pesco';
    case 'traffic':
      return 'traffic';
    case 'safety':
      return 'police';
    default:
      return 'general';
  }
}

export function getOrganizationById(id?: string): Organization {
  if (!id) return ORGANIZATIONS[ORGANIZATIONS.length - 1]; // general
  const match = ORGANIZATIONS.find((o) => o.id.toLowerCase() === id.toLowerCase());
  return match || ORGANIZATIONS[ORGANIZATIONS.length - 1];
}

export function getAllOrganizations(): Organization[] {
  return ORGANIZATIONS;
}
