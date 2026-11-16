import type { EventItem, ImpactProject } from '../shared/types';

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

export interface VolunteerInput {
  fullName: string;
  email: string;
  phone?: string;
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
  const name = isAnonymous ? 'Anonymous' : cleanText(input.name, 120) || 'Friend of GLOW';
  const contact = isAnonymous ? '' : cleanText(input.contact, 160);

  if (requestText.length < 8) {
    errors.requestText = 'Please share a brief prayer request (at least 8 characters).';
  }
  if (!consentAccepted) {
    errors.consentAccepted = 'Please confirm you consent to our prayer team receiving your request privately.';
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

export function validateVolunteerEnquiry(input: VolunteerInput): ValidationResult<{
  fullName: string;
  email: string;
  phone: string;
  areaOfInterest: string;
  availability: string;
  message: string;
}> {
  const errors: Record<string, string> = {};
  const fullName = cleanText(input.fullName, 120);
  const email = cleanText(input.email, 160);
  const phone = cleanText(input.phone, 40);
  const areaOfInterest = cleanText(input.areaOfInterest, 120);
  const availability = cleanText(input.availability, 120);
  const message = cleanText(input.message, 2500);

  if (fullName.length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  if (!isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
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
        ? { fullName, email, phone, areaOfInterest, availability, message }
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

export function filterImpactProjects(
  projects: ImpactProject[],
  category: string
): ImpactProject[] {
  if (!category || category === 'All') return projects;
  return projects.filter((p) => p.category === category);
}

export function filterAndSortEvents(events: EventItem[], category: string): EventItem[] {
  const filtered =
    !category || category === 'All' ? events : events.filter((e) => e.category === category);
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
