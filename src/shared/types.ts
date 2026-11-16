export type ImpactCategory =
  | 'Community Outreach'
  | 'Acts of Compassion'
  | 'Support for Vulnerable Communities'
  | 'Community Engagement';

export type EventCategory =
  | 'Worship Gathering'
  | 'Prayer Meeting'
  | 'Special Service'
  | 'Community Outreach'
  | 'Conference';

export type SubmissionStatus = 'new' | 'reviewed' | 'prayed' | 'archived';

export interface SiteSettings {
  organisationName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  welcomeHeadline: string;
  welcomeBody: string;
  prayerInvitation: string;
  closingStatement: string;
  primaryLocationLabel: string;
  primaryAddress: string;
  gatheringScheduleSummary: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  approvedGivingNote: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  linkLabel?: string;
  linkPath?: string;
  isActive: boolean;
  publishedAt: string;
}

export interface ImpactProject {
  id: string;
  slug: string;
  title: string;
  category: ImpactCategory;
  dateLabel: string;
  locationLabel: string;
  summary: string;
  whatWasDone: string;
  whyItMattered: string;
  whoItServed: string;
  whatGlowHopedToAchieve: string;
  documentedStory: string;
  imageUrl: string;
  imageAlt: string;
  featured: boolean;
  createdAt: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  dateISO: string;
  timeLabel: string;
  venue: string;
  summary: string;
  description: string;
  registrationOpen: boolean;
  registrationNote: string;
  imageUrl: string;
  imageAlt: string;
  featured: boolean;
  createdAt: string;
}

export interface PrayerRequest {
  id: string;
  name: string;
  contact: string;
  requestText: string;
  isAnonymous: boolean;
  consentAccepted: boolean;
  status: 'new' | 'prayed' | 'archived';
  createdAt: string;
}

export interface VolunteerEnquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  areaOfInterest: string;
  availability: string;
  message: string;
  status: 'new' | 'reviewed' | 'archived';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'reviewed' | 'archived';
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  fullName: string;
  email: string;
  phone: string;
  attendeesCount: number;
  notes: string;
  createdAt: string;
}

export interface PublicSiteData {
  settings: SiteSettings;
  announcements: Announcement[];
  impactProjects: ImpactProject[];
  events: EventItem[];
}

export interface AdminUserSession {
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

export interface AdminDashboardData {
  prayerRequests: PrayerRequest[];
  volunteerEnquiries: VolunteerEnquiry[];
  contactMessages: ContactMessage[];
  eventRegistrations: EventRegistration[];
}
