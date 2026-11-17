import {
  HELPING_HAND_EVENT_CATEGORIES,
  type AsdSupportRequest,
  type CounsellingRequest,
  type EventCategory,
  type EventItem,
  type HomeVisitBooking,
  type ImpactProject,
  type PartnerOrganization,
  type RehabFacility,
  type RehabReferralRequest,
  type SafeHomeRequest,
} from '../shared/types';

export interface ValidationResult<T> {
  valid: boolean;
  errors: Record<string, string>;
  data?: T;
}

export interface PrayerRequestInput {
  name?: string;
  contact?: string;
  requestText: string;
  isAnonymous: boolean;
  consentAccepted: boolean;
  website_url?: string;
}

export interface CounsellingInput {
  name?: string;
  contact?: string;
  preferredMethod: CounsellingRequest['preferredMethod'];
  supportArea: CounsellingRequest['supportArea'];
  urgency: CounsellingRequest['urgency'];
  isAnonymous: boolean;
  message: string;
  consentAccepted: boolean;
  website_url?: string;
}

export interface SafeHomeInput {
  callerAlias?: string;
  safeContact: string;
  safeToCall: boolean;
  safeTimeWindow?: string;
  situationType: SafeHomeRequest['situationType'];
  peopleCount: number;
  immediateNeeds: string;
  consentAccepted: boolean;
  website_url?: string;
}

export interface HomeVisitInput {
  organizerType: HomeVisitBooking['organizerType'];
  selectedHomeId?: string;
  selectedHomeName?: string;
  coordinatorName: string;
  groupName?: string;
  email: string;
  phone?: string;
  groupSize: number;
  focusArea: string;
  preferredDate: string;
  preferredTimeWindow?: string;
  locationArea: string;
  notes?: string;
  website_url?: string;
}

export interface PartnerOnboardingInput {
  organizationName: string;
  partnerType: PartnerOrganization['partnerType'];
  contactPerson: string;
  email: string;
  phone?: string;
  regionArea: string;
  collaborationFocus: string;
  websiteOrProfile?: string;
  website_url?: string;
}

export interface RehabReferralInput {
  applicantName: string;
  relationship: RehabReferralRequest['relationship'];
  contact: string;
  preferredCounty: string;
  chosenFacilityId?: string;
  chosenFacilityName?: string;
  supportType: RehabFacility['focusType'];
  notes: string;
  consentAccepted: boolean;
  website_url?: string;
}

export interface AsdSupportInput {
  parentName: string;
  childAgeGroup: AsdSupportRequest['childAgeGroup'];
  contact: string;
  topicNeeded: string;
  questionOrStory: string;
  consentAccepted: boolean;
  website_url?: string;
}

export interface VolunteerInput {
  fullName: string;
  email: string;
  phone?: string;
  volunteerKind?: 'individual' | 'team' | 'institution';
  groupName?: string;
  groupSize?: string;
  pointOfContact?: string;
  areaOfInterest: string;
  availability?: string;
  message: string;
  website_url?: string;
}

export interface ContactInput {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  website_url?: string;
}

export interface EventRegistrationInput {
  eventId: string;
  fullName: string;
  email: string;
  phone?: string;
  attendeesCount: number;
  notes?: string;
  website_url?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function cleanText(value: unknown, maxLength = 2000): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function isHoneypotTriggered(honeypot: unknown): boolean {
  return typeof honeypot === 'string' && honeypot.trim().length > 0;
}

export function validatePrayerRequest(input: PrayerRequestInput): ValidationResult<{
  name: string;
  contact: string;
  requestText: string;
  isAnonymous: boolean;
  consentAccepted: boolean;
}> {
  const errors: Record<string, string> = {};
  const requestText = cleanText(input.requestText, 3000);
  const isAnonymous = Boolean(input.isAnonymous);
  const consentAccepted = Boolean(input.consentAccepted);
  const name = isAnonymous ? 'Anonymous' : cleanText(input.name, 120) || 'Community Member';
  const contact = isAnonymous ? '' : cleanText(input.contact, 160);

  if (requestText.length < 8) {
    errors.requestText = 'Please share a brief prayer request (at least 8 characters).';
  }
  if (!consentAccepted) {
    errors.consentAccepted = 'Please confirm you consent to our care team receiving your request privately.';
  }
  if (contact && contact.includes('@') && !isValidEmail(contact)) {
    errors.contact = 'Please enter a valid email address or leave contact blank.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data:
      Object.keys(errors).length === 0
        ? { name, contact, requestText, isAnonymous, consentAccepted }
        : undefined,
  };
}

export function validateCounsellingRequest(input: CounsellingInput): ValidationResult<{
  name: string;
  contact: string;
  preferredMethod: CounsellingRequest['preferredMethod'];
  supportArea: CounsellingRequest['supportArea'];
  urgency: CounsellingRequest['urgency'];
  isAnonymous: boolean;
  message: string;
  consentAccepted: boolean;
}> {
  const errors: Record<string, string> = {};
  const isAnonymous = Boolean(input.isAnonymous);
  const name = isAnonymous ? 'Anonymous' : cleanText(input.name, 120) || 'Confidential Guest';
  const contact = cleanText(input.contact, 160);
  const message = cleanText(input.message, 3500);
  const consentAccepted = Boolean(input.consentAccepted);

  if (!isAnonymous && !contact) {
    errors.contact =
      'Please provide a phone number, WhatsApp, or email so a counsellor can reach you, or choose anonymous reflection.';
  }
  if (contact && contact.includes('@') && !isValidEmail(contact)) {
    errors.contact = 'Please enter a valid email address.';
  }
  if (message.length < 10) {
    errors.message = 'Please share a few words about what you are carrying (at least 10 characters).';
  }
  if (!consentAccepted) {
    errors.consentAccepted =
      'Please confirm you consent to our counselling and care team reviewing this confidentially.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data:
      Object.keys(errors).length === 0
        ? {
            name,
            contact: isAnonymous ? '' : contact,
            preferredMethod: input.preferredMethod || 'Phone Call',
            supportArea: input.supportArea || 'Individual Counselling',
            urgency: input.urgency || 'Routine (Within 48 hours)',
            isAnonymous,
            message,
            consentAccepted,
          }
        : undefined,
  };
}

export function validateSafeHomeRequest(input: SafeHomeInput): ValidationResult<{
  callerAlias: string;
  safeContact: string;
  safeToCall: boolean;
  safeTimeWindow: string;
  situationType: SafeHomeRequest['situationType'];
  peopleCount: number;
  immediateNeeds: string;
  consentAccepted: boolean;
}> {
  const errors: Record<string, string> = {};
  const callerAlias = cleanText(input.callerAlias, 100) || 'Protected Individual';
  const safeContact = cleanText(input.safeContact, 180);
  const safeToCall = Boolean(input.safeToCall);
  const safeTimeWindow = cleanText(input.safeTimeWindow, 120) || 'Anytime when safe';
  const immediateNeeds = cleanText(input.immediateNeeds, 3000);
  const consentAccepted = Boolean(input.consentAccepted);
  const peopleCount = Number.isFinite(Number(input.peopleCount))
    ? Math.max(1, Math.min(20, Math.round(Number(input.peopleCount))))
    : 1;

  if (safeContact.length < 5) {
    errors.safeContact =
      'Please enter a safe phone number, trusted friend contact, or safe email we can reach.';
  }
  if (immediateNeeds.length < 8) {
    errors.immediateNeeds =
      'Please share brief details about the shelter or protection needed (at least 8 characters).';
  }
  if (!consentAccepted) {
    errors.consentAccepted =
      'Please confirm consent so our safe-home protection coordinator may respond safely.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data:
      Object.keys(errors).length === 0
        ? {
            callerAlias,
            safeContact,
            safeToCall,
            safeTimeWindow,
            situationType: input.situationType || 'Gender-Based Violence',
            peopleCount,
            immediateNeeds,
            consentAccepted,
          }
        : undefined,
  };
}

export function validateHomeVisitBooking(input: HomeVisitInput): ValidationResult<{
  organizerType: HomeVisitBooking['organizerType'];
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
}> {
  const errors: Record<string, string> = {};
  const selectedHomeId = cleanText(input.selectedHomeId, 80) || 'any-partner-home';
  const selectedHomeName =
    cleanText(input.selectedHomeName, 160) || 'Matched Partner Children’s Home';
  const coordinatorName = cleanText(input.coordinatorName, 120);
  const groupName = cleanText(input.groupName, 160);
  const email = cleanText(input.email, 160);
  const phone = cleanText(input.phone, 40);
  const focusArea = cleanText(input.focusArea, 140);
  const preferredDate = cleanText(input.preferredDate, 20);
  const preferredTimeWindow = cleanText(input.preferredTimeWindow, 80) || 'Morning (09:30 – 12:30)';
  const locationArea = cleanText(input.locationArea, 180);
  const notes = cleanText(input.notes, 2000);
  const groupSize = Number.isFinite(Number(input.groupSize))
    ? Math.max(1, Math.min(200, Math.round(Number(input.groupSize))))
    : 1;

  if (coordinatorName.length < 2) {
    errors.coordinatorName = 'Please enter the coordinator or primary visitor name.';
  }
  if (!isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }
  if (!focusArea) {
    errors.focusArea = 'Please choose a children’s home visit activity focus.';
  }
  if (!preferredDate) {
    errors.preferredDate = 'Please select a preferred date for the children’s home visit.';
  }
  if (locationArea.length < 2) {
    errors.locationArea = 'Please indicate your preferred town or region.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data:
      Object.keys(errors).length === 0
        ? {
            organizerType: input.organizerType || 'Individual Visitor',
            selectedHomeId,
            selectedHomeName,
            coordinatorName,
            groupName,
            email,
            phone,
            groupSize,
            focusArea,
            preferredDate,
            preferredTimeWindow,
            locationArea,
            notes,
          }
        : undefined,
  };
}

export function validatePartnerOnboarding(input: PartnerOnboardingInput): ValidationResult<{
  organizationName: string;
  partnerType: PartnerOrganization['partnerType'];
  contactPerson: string;
  email: string;
  phone: string;
  regionArea: string;
  collaborationFocus: string;
  websiteOrProfile: string;
}> {
  const errors: Record<string, string> = {};
  const organizationName = cleanText(input.organizationName, 160);
  const contactPerson = cleanText(input.contactPerson, 120);
  const email = cleanText(input.email, 160);
  const phone = cleanText(input.phone, 40);
  const regionArea = cleanText(input.regionArea, 140);
  const collaborationFocus = cleanText(input.collaborationFocus, 2000);
  const websiteOrProfile = cleanText(input.websiteOrProfile, 240);

  if (organizationName.length < 2) {
    errors.organizationName = 'Please enter your organisation, company, or children’s home name.';
  }
  if (contactPerson.length < 2) {
    errors.contactPerson = 'Please enter the primary liaison contact name.';
  }
  if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid organisation email address.';
  }
  if (regionArea.length < 2) {
    errors.regionArea = 'Please enter your county, city, or operating region.';
  }
  if (collaborationFocus.length < 10) {
    errors.collaborationFocus =
      'Please describe how your organisation would like to collaborate or host teams (at least 10 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data:
      Object.keys(errors).length === 0
        ? {
            organizationName,
            partnerType: input.partnerType || 'Corporate CSR Partner',
            contactPerson,
            email,
            phone,
            regionArea,
            collaborationFocus,
            websiteOrProfile,
          }
        : undefined,
  };
}

export function validateRehabReferral(input: RehabReferralInput): ValidationResult<{
  applicantName: string;
  relationship: RehabReferralRequest['relationship'];
  contact: string;
  preferredCounty: string;
  chosenFacilityId: string;
  chosenFacilityName: string;
  supportType: RehabFacility['focusType'];
  notes: string;
  consentAccepted: boolean;
}> {
  const errors: Record<string, string> = {};
  const applicantName = cleanText(input.applicantName, 120) || 'Confidential Family Member';
  const contact = cleanText(input.contact, 160);
  const preferredCounty = cleanText(input.preferredCounty, 120);
  const chosenFacilityId = cleanText(input.chosenFacilityId, 80) || 'nearest-match';
  const chosenFacilityName =
    cleanText(input.chosenFacilityName, 180) || 'Nearest Verified Partner Facility';
  const notes = cleanText(input.notes, 3000);
  const consentAccepted = Boolean(input.consentAccepted);

  if (contact.length < 5) {
    errors.contact = 'Please provide a phone number or email so our rehabilitation liaison can respond.';
  }
  if (contact && contact.includes('@') && !isValidEmail(contact)) {
    errors.contact = 'Please enter a valid email address or phone number.';
  }
  if (preferredCounty.length < 2) {
    errors.preferredCounty = 'Please enter your preferred county, town, or neighbourhood.';
  }
  if (notes.length < 10) {
    errors.notes = 'Please briefly describe the recovery or rehabilitation support needed (at least 10 characters).';
  }
  if (!consentAccepted) {
    errors.consentAccepted =
      'Please confirm consent so our care coordinator may connect you confidentially with your chosen facility.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data:
      Object.keys(errors).length === 0
        ? {
            applicantName,
            relationship: input.relationship || 'Parent / Guardian',
            contact,
            preferredCounty,
            chosenFacilityId,
            chosenFacilityName,
            supportType: input.supportType || 'Substance & Addiction Recovery',
            notes,
            consentAccepted,
          }
        : undefined,
  };
}

export function validateAsdSupportRequest(input: AsdSupportInput): ValidationResult<{
  parentName: string;
  childAgeGroup: AsdSupportRequest['childAgeGroup'];
  contact: string;
  topicNeeded: string;
  questionOrStory: string;
  consentAccepted: boolean;
}> {
  const errors: Record<string, string> = {};
  const parentName = cleanText(input.parentName, 120);
  const contact = cleanText(input.contact, 160);
  const topicNeeded = cleanText(input.topicNeeded, 140) || 'Daily Sensory & Home Support';
  const questionOrStory = cleanText(input.questionOrStory, 3000);
  const consentAccepted = Boolean(input.consentAccepted);

  if (parentName.length < 2) {
    errors.parentName = 'Please enter your name or preferred name.';
  }
  if (contact.length < 5) {
    errors.contact = 'Please provide a phone number, WhatsApp, or email for parent mentoring follow-up.';
  }
  if (contact && contact.includes('@') && !isValidEmail(contact)) {
    errors.contact = 'Please enter a valid email address.';
  }
  if (questionOrStory.length < 10) {
    errors.questionOrStory = 'Please share a little about your child or question (at least 10 characters).';
  }
  if (!consentAccepted) {
    errors.consentAccepted =
      'Please confirm consent so our ASD family support coordinator can respond warmly.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data:
      Object.keys(errors).length === 0
        ? {
            parentName,
            childAgeGroup: input.childAgeGroup || 'Primary Age (6–11)',
            contact,
            topicNeeded,
            questionOrStory,
            consentAccepted,
          }
        : undefined,
  };
}

export function validateVolunteerEnquiry(input: VolunteerInput): ValidationResult<{
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
}> {
  const errors: Record<string, string> = {};
  const fullName = cleanText(input.fullName, 120);
  const email = cleanText(input.email, 160);
  const phone = cleanText(input.phone, 40);
  const volunteerKind =
    input.volunteerKind === 'team' || input.volunteerKind === 'institution'
      ? input.volunteerKind
      : 'individual';
  const groupName = cleanText(input.groupName, 140);
  const groupSize = cleanText(input.groupSize, 60);
  const pointOfContact = cleanText(input.pointOfContact, 120);
  const areaOfInterest = cleanText(input.areaOfInterest, 180);
  const availability = cleanText(input.availability, 120);
  const message = cleanText(input.message, 2500);

  if (fullName.length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  if (!isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }
  if ((volunteerKind === 'team' || volunteerKind === 'institution') && groupName.length < 2) {
    errors.groupName = 'Please enter your team or institution name.';
  }
  if (!areaOfInterest) {
    errors.areaOfInterest = 'Please select an area where you would like to participate.';
  }
  if (message.length < 10) {
    errors.message = 'Please share a few lines about your interest (at least 10 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data:
      Object.keys(errors).length === 0
        ? {
            fullName,
            email,
            phone,
            volunteerKind,
            ...(groupName ? { groupName } : {}),
            ...(groupSize ? { groupSize } : {}),
            ...(pointOfContact ? { pointOfContact } : {}),
            areaOfInterest,
            availability,
            message,
          }
        : undefined,
  };
}

export function validateContactMessage(input: ContactInput): ValidationResult<{
  fullName: string;
  email: string;
  subject: string;
  message: string;
}> {
  const errors: Record<string, string> = {};
  const fullName = cleanText(input.fullName, 120);
  const email = cleanText(input.email, 160);
  const subject = cleanText(input.subject, 160);
  const message = cleanText(input.message, 3000);

  if (fullName.length < 2) {
    errors.fullName = 'Please enter your name.';
  }
  if (!isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }
  if (subject.length < 3) {
    errors.subject = 'Please enter a subject for your message.';
  }
  if (message.length < 10) {
    errors.message = 'Please enter your message (at least 10 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data:
      Object.keys(errors).length === 0
        ? { fullName, email, subject, message }
        : undefined,
  };
}

export function validateEventRegistration(input: EventRegistrationInput): ValidationResult<{
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  attendeesCount: number;
  notes: string;
}> {
  const errors: Record<string, string> = {};
  const eventId = cleanText(input.eventId, 80);
  const fullName = cleanText(input.fullName, 120);
  const email = cleanText(input.email, 160);
  const phone = cleanText(input.phone, 40);
  const attendeesCount = Number.isFinite(Number(input.attendeesCount))
    ? Math.max(1, Math.min(20, Math.round(Number(input.attendeesCount))))
    : 1;
  const notes = cleanText(input.notes, 500);

  if (!eventId) {
    errors.eventId = 'Event selection is required.';
  }
  if (fullName.length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  if (!isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data:
      Object.keys(errors).length === 0
        ? { eventId, fullName, email, phone, attendeesCount, notes }
        : undefined,
  };
}

export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function sortFacilitiesByProximity(
  facilities: RehabFacility[],
  referenceCoords: { lat: number; lng: number } | null,
  countyFilter = 'All',
  focusFilter = 'All'
): Array<RehabFacility & { distanceKm?: number }> {
  const filtered = facilities.filter((f) => {
    const countyOk = !countyFilter || countyFilter === 'All' || f.countyRegion === countyFilter;
    const focusOk = !focusFilter || focusFilter === 'All' || f.focusType === focusFilter;
    return countyOk && focusOk;
  });

  if (!referenceCoords) {
    return filtered;
  }

  return filtered
    .map((f) => ({
      ...f,
      distanceKm: calculateDistanceKm(referenceCoords.lat, referenceCoords.lng, f.lat, f.lng),
    }))
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
}

export function filterImpactProjects(
  projects: ImpactProject[],
  category: string
): ImpactProject[] {
  if (!category || category === 'All') return projects;
  return projects.filter((p) => p.category === category);
}

export function normalizeEventCategory(raw: string): EventCategory {
  const value = (raw || '').trim();
  if ((HELPING_HAND_EVENT_CATEGORIES as readonly string[]).includes(value)) {
    return value as EventCategory;
  }
  const lower = value.toLowerCase();
  if (lower.includes('child') || lower.includes('home visit')) {
    return 'Children’s Home Visits';
  }
  if (lower.includes('asd') || lower.includes('autism') || lower.includes('sensory')) {
    return 'ASD Family Gatherings';
  }
  if (
    lower.includes('mental') ||
    lower.includes('rehab') ||
    lower.includes('recovery') ||
    lower.includes('counsell') ||
    lower === 'prayer meeting'
  ) {
    return 'Mental Health & Recovery';
  }
  if (
    lower.includes('refuge') ||
    lower.includes('fellowship') ||
    lower.includes('worship') ||
    lower.includes('special service') ||
    lower.includes('conference')
  ) {
    return 'Safe Refuge & Fellowship';
  }
  return 'Community Outreach';
}

export function isUpcomingEvent(
  dateISO: string,
  referenceISO = new Date().toISOString().slice(0, 10)
): boolean {
  return typeof dateISO === 'string' && dateISO >= referenceISO;
}

export function filterAndSortEvents(
  events: EventItem[],
  category: string,
  searchQuery = ''
): EventItem[] {
  const normalizedTarget =
    category && category !== 'All' ? normalizeEventCategory(category) : null;
  const query = searchQuery.trim().toLowerCase();

  const filtered = events.filter((e) => {
    const categoryMatches =
      !normalizedTarget || normalizeEventCategory(e.category) === normalizedTarget;
    if (!categoryMatches) return false;
    if (!query) return true;
    const haystack = `${e.title} ${e.summary} ${e.venue} ${e.category}`.toLowerCase();
    return haystack.includes(query);
  });

  return [...filtered].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

export function formatEventDate(dateISO: string): string {
  const parsed = new Date(`${dateISO}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return dateISO;
  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
