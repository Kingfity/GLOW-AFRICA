export type ImpactCategory =
  | 'Community Outreach'
  | 'Acts of Compassion'
  | 'Support for Vulnerable Communities'
  | 'Community Engagement';

export const HELPING_HAND_EVENT_CATEGORIES = [
  'Children’s Home Visits',
  'Mental Health & Recovery',
  'Trauma & Stress Circles',
  'Community Outreach',
  'Safe Refuge & Fellowship',
] as const;

export type EventCategory = (typeof HELPING_HAND_EVENT_CATEGORIES)[number];

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
  emergencyHotlineNote: string;
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

export interface ChildrensHome {
  id: string;
  name: string;
  institutionType?: 'Children’s Home' | 'School for Differently Abled';
  regionGroup?: string;
  specialization?: string;
  countyRegion: string;
  townArea: string;
  physicalAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  websiteUrl?: string;
  visitingHours?: string;
  childrenAgeRange: string;
  currentNeeds: string[];
  acceptsCorporateTeams: boolean;
  acceptsIndividualGroups: boolean;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

export interface RehabFacility {
  id: string;
  name: string;
  focusType:
    | 'Substance & Addiction Recovery'
    | 'Trauma & Crisis Rehabilitation'
    | 'Youth & Adolescent Restoration'
    | 'Family & Holistic Care';
  careFormat: 'Residential & Outpatient' | 'Outpatient Counselling' | 'Detox & Medical Recovery';
  countyRegion: string;
  townArea: string;
  physicalAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  websiteUrl?: string;
  visitingHours?: string;
  lat: number;
  lng: number;
  acceptsCommunityReferrals: boolean;
  summary: string;
  imageUrl: string;
  imageAlt: string;
}

export interface AdministratorDeskProfile {
  id: string;
  deskCode: string;
  fullName: string;
  roleTitle: string;
  department: string;
  status: 'Active' | 'Awaiting Staff Particulars';
  wardLocation: string;
  officeHours: string;
  phone: string;
  whatsapp?: string;
  email: string;
  photoUrl?: string;
  focusSummary: string;
  routingHref: string;
  routingLabel: string;
  accentHex: string;
}

export interface AsdGuideTip {
  id: string;
  pillar:
    | 'Nervous System & Trauma'
    | 'Stress, Panic & Sleep'
    | 'Caregiver & Silent Burdens'
    | 'Grief, Faith & Belonging';
  title: string;
  audienceTag: string;
  summary: string;
  practicalSteps: string[];
}

export type MentalHealthGuideTip = AsdGuideTip;

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

export interface CounsellingRequest {
  id: string;
  name: string;
  contact: string;
  preferredMethod: 'Phone Call' | 'WhatsApp Chat' | 'Email' | 'In-Person / Video Session';
  supportArea:
    | 'Individual Counselling'
    | 'Anxiety, Stress & Burnout'
    | 'Grief & Loss Support'
    | 'Family & Relationship Guidance'
    | 'Youth Mental Health Support'
    | 'Lighten Your Burden (Listening Ear)';
  urgency: 'Routine (Within 48 hours)' | 'Priority (Within 24 hours)' | 'Urgent Today';
  isAnonymous: boolean;
  message: string;
  consentAccepted: boolean;
  status: 'new' | 'assigned' | 'completed' | 'archived';
  createdAt: string;
}

export interface SafeHomeRequest {
  id: string;
  callerAlias: string;
  safeContact: string;
  safeToCall: boolean;
  safeTimeWindow: string;
  situationType:
    | 'Gender-Based Violence'
    | 'Child Abuse / Protection'
    | 'Both / Family Safety'
    | 'Other Urgent Safety Need';
  peopleCount: number;
  immediateNeeds: string;
  consentAccepted: boolean;
  status: 'new' | 'urgent-care' | 'sheltered' | 'archived';
  createdAt: string;
}

export interface HomeVisitBooking {
  id: string;
  organizerType:
    | 'Individual Visitor'
    | 'Friend / Family Group'
    | 'Corporate CSR Team'
    | 'Faith / Fellowship Group'
    | 'School / Youth Team';
  selectedHomeId: string;
  selectedHomeName: string;
  coordinatorName: string;
  groupName: string;
  email: string;
  phone: string;
  groupSize: number;
  focusArea: string;
  preferredDate: string;
  preferredTimeWindow: string;
  locationArea: string;
  notes: string;
  status: 'new' | 'scheduled' | 'completed' | 'archived';
  createdAt: string;
}

export interface PartnerOrganization {
  id: string;
  organizationName: string;
  partnerType:
    | 'Corporate CSR Partner'
    | 'Registered Children’s Home'
    | 'NGO / Community Organization'
    | 'Rehabilitation Facility'
    | 'Donor / Sponsor Network';
  contactPerson: string;
  email: string;
  phone: string;
  regionArea: string;
  collaborationFocus: string;
  websiteOrProfile: string;
  status: 'new' | 'onboarded' | 'archived';
  createdAt: string;
}

export interface RehabReferralRequest {
  id: string;
  applicantName: string;
  relationship: 'Self' | 'Parent / Guardian' | 'Spouse / Family Member' | 'Community Referrer';
  contact: string;
  preferredCounty: string;
  chosenFacilityId: string;
  chosenFacilityName: string;
  supportType: RehabFacility['focusType'];
  notes: string;
  consentAccepted: boolean;
  status: 'new' | 'matched' | 'in-care' | 'archived';
  createdAt: string;
}

export interface AsdSupportRequest {
  id: string;
  parentName: string;
  childAgeGroup: string;
  contact: string;
  topicNeeded: string;
  questionOrStory: string;
  consentAccepted: boolean;
  status: 'new' | 'answered' | 'connected' | 'archived';
  createdAt: string;
}

export type MentalHealthSupportRequest = AsdSupportRequest;

export type HouseholdStructureType =
  | 'Single Mother Household'
  | 'Single Father / Sole Guardian'
  | 'Two-Parent Family'
  | 'Grandparent / Kinship Guardian'
  | 'Foster / Community Caregiver';

export interface SpecialNeedsFamilyRequest {
  id: string;
  guardianName: string;
  householdStructure: HouseholdStructureType;
  phoneOrWhatsapp: string;
  email: string;
  preferredContactMethod:
    | 'Phone Call With Mother/Guardian Lead'
    | 'WhatsApp Chat'
    | 'Home Visit in Ward'
    | 'Mothers Support Tea Circle'
    | 'Email';
  county: string;
  townWard: string;
  childAgeGroup: string;
  disabilityFocus: string;
  practicalNeeds: string[];
  storyMessage: string;
  consentAccepted: boolean;
  status: 'new' | 'connected' | 'supported' | 'archived';
  createdAt: string;
}

export interface VolunteerEnquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  volunteerKind?: 'individual' | 'team' | 'institution';
  groupName?: string;
  groupSize?: string;
  pointOfContact?: string;
  areaOfInterest: string;
  availability: string;
  message: string;
  status: 'new' | 'reviewed' | 'archived';
  createdAt: string;
}

export interface EmergencyAuthorityAlert {
  id: string;
  county: string;
  emergencyType: string;
  authorityTarget: string;
  locationLandmark: string;
  callerAlias: string;
  safeContact: string;
  peopleAffected: number;
  details: string;
  status: 'dispatched' | 'acknowledged' | 'resolved';
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

export type VillageTierId =
  | 'books'
  | 'pantry'
  | 'sensory'
  | 'counselling'
  | 'mentorship'
  | 'refuge';

export interface VillageContributionItem {
  id: string;
  contributorName: string;
  region: string;
  tierId: VillageTierId;
  tierLabel: string;
  units: number;
  amountKes: number;
  encouragementNote: string;
  createdAt: string;
}

export interface PublicSiteData {
  settings: SiteSettings;
  announcements: Announcement[];
  impactProjects: ImpactProject[];
  events: EventItem[];
  childrensHomes: ChildrensHome[];
  rehabFacilities: RehabFacility[];
  asdGuides: AsdGuideTip[];
  villageContributions: VillageContributionItem[];
  administrators: AdministratorDeskProfile[];
}

export interface AdminUserSession {
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

export interface AdminDashboardData {
  prayerRequests: PrayerRequest[];
  counsellingRequests: CounsellingRequest[];
  safeHomeRequests: SafeHomeRequest[];
  homeVisitBookings: HomeVisitBooking[];
  partnerOrganizations: PartnerOrganization[];
  rehabReferrals: RehabReferralRequest[];
  asdSupportRequests: AsdSupportRequest[];
  specialNeedsRequests?: SpecialNeedsFamilyRequest[];
  volunteerEnquiries: VolunteerEnquiry[];
  contactMessages: ContactMessage[];
  eventRegistrations: EventRegistration[];
  administrators?: AdministratorDeskProfile[];
}
