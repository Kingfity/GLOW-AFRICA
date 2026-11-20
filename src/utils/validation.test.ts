import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePrayerRequest,
  validateCounsellingRequest,
  validateSafeHomeRequest,
  validateHomeVisitBooking,
  validatePartnerOnboarding,
  validateRehabReferral,
  validateAsdSupportRequest,
  validateVolunteerEnquiry,
  validateContactMessage,
  validateEventRegistration,
  validateSpecialNeedsSupport,
  calculateDistanceKm,
  sortFacilitiesByProximity,
  filterImpactProjects,
  filterAndSortEvents,
  formatEventDate,
  isHoneypotTriggered,
  isUpcomingEvent,
  normalizeEventCategory,
} from './validation';
import type { EventItem, ImpactProject, RehabFacility } from '../shared/types';

test('validatePrayerRequest rejects empty requests and missing consent', () => {
  const res = validatePrayerRequest({
    name: 'Grace',
    contact: 'grace@example.com',
    requestText: 'Help',
    isAnonymous: false,
    consentAccepted: false,
  });
  assert.equal(res.valid, false);
  assert.ok(res.errors.requestText);
  assert.ok(res.errors.consentAccepted);
});

test('validatePrayerRequest anonymizes identity when isAnonymous is true', () => {
  const res = validatePrayerRequest({
    name: 'Daniel',
    contact: 'daniel@example.com',
    requestText: 'Praying for peace and healing for my family during this season.',
    isAnonymous: true,
    consentAccepted: true,
  });
  assert.equal(res.valid, true);
  assert.equal(res.data?.name, 'Anonymous');
  assert.equal(res.data?.contact, '');
});

test('validateCounsellingRequest enforces contact when non-anonymous and supports anonymous burden sharing', () => {
  const missingContact = validateCounsellingRequest({
    name: 'Faith',
    contact: '',
    preferredMethod: 'Phone Call',
    supportArea: 'Anxiety, Stress & Burnout',
    urgency: 'Routine (Within 48 hours)',
    isAnonymous: false,
    message: 'I have been feeling overwhelmed and need someone to speak with.',
    consentAccepted: true,
  });
  assert.equal(missingContact.valid, false);
  assert.ok(missingContact.errors.contact);

  const anonValid = validateCounsellingRequest({
    name: 'Faith',
    contact: 'faith@example.com',
    preferredMethod: 'WhatsApp Chat',
    supportArea: 'Lighten Your Burden (Listening Ear)',
    urgency: 'Priority (Within 24 hours)',
    isAnonymous: true,
    message: 'Sharing a heavy burden anonymously so someone can hold space and guide me.',
    consentAccepted: true,
  });
  assert.equal(anonValid.valid, true);
  assert.equal(anonValid.data?.name, 'Anonymous');
  assert.equal(anonValid.data?.contact, '');
});

test('validateSafeHomeRequest validates safe contact and clamps peopleCount', () => {
  const invalid = validateSafeHomeRequest({
    callerAlias: '',
    safeContact: '',
    safeToCall: false,
    situationType: 'Gender-Based Violence',
    peopleCount: 2,
    immediateNeeds: 'Help',
    consentAccepted: false,
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.safeContact);
  assert.ok(invalid.errors.immediateNeeds);
  assert.ok(invalid.errors.consentAccepted);

  const valid = validateSafeHomeRequest({
    callerAlias: 'Sister M.',
    safeContact: 'WhatsApp text only +254 700 111 222',
    safeToCall: false,
    safeTimeWindow: '09:00 - 11:00',
    situationType: 'Child Abuse / Protection',
    peopleCount: 40,
    immediateNeeds: 'Need safe temporary shelter for myself and two children tonight.',
    consentAccepted: true,
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.data?.peopleCount, 20);
  assert.equal(valid.data?.safeToCall, false);
});

test('validateHomeVisitBooking validates Children Home visit fields and clamps group size', () => {
  const invalid = validateHomeVisitBooking({
    organizerType: 'Corporate CSR Team',
    coordinatorName: 'A',
    email: 'invalid',
    groupSize: 10,
    focusArea: '',
    preferredDate: '',
    locationArea: '',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.coordinatorName);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.focusArea);
  assert.ok(invalid.errors.preferredDate);
  assert.ok(invalid.errors.locationArea);

  const valid = validateHomeVisitBooking({
    organizerType: 'Corporate CSR Team',
    selectedHomeId: 'ch-1',
    selectedHomeName: 'Amani Children’s Home (Sample Partner)',
    coordinatorName: 'David Kamau',
    groupName: 'Savannah Bank CSR Team',
    email: 'david@example.org',
    phone: '+254 700 222 333',
    groupSize: 25,
    focusArea: 'Corporate CSR Volunteering Day',
    preferredDate: '2026-12-05',
    preferredTimeWindow: 'Morning (09:30 – 12:30)',
    locationArea: 'Nairobi West',
    notes: 'Bringing school reading books, dry food hampers, and mentoring youth.',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.data?.groupSize, 25);
  assert.equal(valid.data?.selectedHomeId, 'ch-1');
});

test('validatePartnerOnboarding validates corporate and NGO onboarding fields', () => {
  const bad = validatePartnerOnboarding({
    organizationName: 'X',
    partnerType: 'Corporate CSR Partner',
    contactPerson: '',
    email: 'not-valid',
    regionArea: '',
    collaborationFocus: 'Hi',
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.organizationName);
  assert.ok(bad.errors.contactPerson);
  assert.ok(bad.errors.email);
  assert.ok(bad.errors.regionArea);
  assert.ok(bad.errors.collaborationFocus);

  const ok = validatePartnerOnboarding({
    organizationName: 'Horizon Foundation',
    partnerType: 'Corporate CSR Partner',
    contactPerson: 'Beatrice Wanjiku',
    email: 'csr@horizon.org',
    phone: '+254 711 999 000',
    regionArea: 'Nairobi & Kiambu',
    collaborationFocus: 'Sponsoring quarterly children home educational visits and nutrition packs.',
    websiteOrProfile: 'https://horizon.org',
  });
  assert.equal(ok.valid, true);
  assert.equal(ok.data?.partnerType, 'Corporate CSR Partner');
});

test('validateRehabReferral and proximity sorting work deterministically', () => {
  const bad = validateRehabReferral({
    applicantName: 'Peter',
    relationship: 'Parent / Guardian',
    contact: '12',
    preferredCounty: '',
    supportType: 'Substance & Addiction Recovery',
    notes: 'help',
    consentAccepted: false,
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.contact);
  assert.ok(bad.errors.preferredCounty);
  assert.ok(bad.errors.notes);
  assert.ok(bad.errors.consentAccepted);

  const ok = validateRehabReferral({
    applicantName: 'Peter M.',
    relationship: 'Parent / Guardian',
    contact: '+254 700 444 555',
    preferredCounty: 'Kiambu',
    chosenFacilityId: 'reh-2',
    chosenFacilityName: 'Maji Mazuri Restoration Campus',
    supportType: 'Youth & Adolescent Restoration',
    notes: 'Seeking outpatient youth counselling and structured peer mentorship near Kiambu.',
    consentAccepted: true,
  });
  assert.equal(ok.valid, true);
  assert.equal(ok.data?.chosenFacilityId, 'reh-2');

  const facilities = [
    {
      id: 'far',
      name: 'Coast Care',
      countyRegion: 'Mombasa',
      focusType: 'Family & Holistic Care',
      lat: -4.0435,
      lng: 39.6682,
    },
    {
      id: 'near',
      name: 'Nairobi Hope',
      countyRegion: 'Nairobi',
      focusType: 'Family & Holistic Care',
      lat: -1.2921,
      lng: 36.8219,
    },
  ] as RehabFacility[];

  const sorted = sortFacilitiesByProximity(facilities, { lat: -1.3, lng: 36.8 }, 'All', 'All');
  assert.equal(sorted[0].id, 'near');
  assert.ok((sorted[0].distanceKm ?? 999) < 10);
  assert.ok(calculateDistanceKm(-1.2921, 36.8219, -4.0435, 39.6682) > 400);
});

test('validateAsdSupportRequest enforces parent details and consent', () => {
  const bad = validateAsdSupportRequest({
    parentName: '',
    childAgeGroup: 'Early Years (2–5)',
    contact: 'abc',
    topicNeeded: 'Sensory Routines',
    questionOrStory: 'short',
    consentAccepted: false,
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.parentName);
  assert.ok(bad.errors.contact);
  assert.ok(bad.errors.questionOrStory);
  assert.ok(bad.errors.consentAccepted);

  const ok = validateAsdSupportRequest({
    parentName: 'Miriam K.',
    childAgeGroup: 'Adults & Working Parents',
    contact: 'miriam@example.org',
    topicNeeded: 'Stress, Panic & Sleep',
    questionOrStory: 'Looking for practical trauma grounding tools and a local peer listening circle.',
    consentAccepted: true,
  });
  assert.equal(ok.valid, true);
  assert.equal(ok.data?.childAgeGroup, 'Adults & Working Parents');
});

test('validateSpecialNeedsSupport supports both single-parent and two-parent families with guardian details', () => {
  const bad = validateSpecialNeedsSupport({
    guardianName: 'A',
    householdStructure: 'Single Mother Household',
    phoneOrWhatsapp: '12',
    email: 'not-an-email',
    preferredContactMethod: 'WhatsApp Chat',
    county: '',
    townWard: '',
    childAgeGroup: 'Early Childhood (Ages 0–5)',
    disabilityFocus: 'Cerebral Palsy / Physical Mobility',
    practicalNeeds: [],
    storyMessage: 'short',
    consentAccepted: false,
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.guardianName);
  assert.ok(bad.errors.phoneOrWhatsapp);
  assert.ok(bad.errors.email);
  assert.ok(bad.errors.county);
  assert.ok(bad.errors.storyMessage);
  assert.ok(bad.errors.consentAccepted);

  const singleMotherOk = validateSpecialNeedsSupport({
    guardianName: 'Grace Wanjiru',
    householdStructure: 'Single Mother Household',
    phoneOrWhatsapp: '+254 712 345 678',
    email: '',
    preferredContactMethod: 'Phone Call With Mother/Guardian Lead',
    county: 'Kiambu',
    townWard: 'Ruiru',
    childAgeGroup: 'Primary School (Ages 6–12)',
    disabilityFocus: 'Neurodevelopmental / Learning Support',
    practicalNeeds: ['Mother Respite & Rest', 'Inclusive School Placement'],
    storyMessage: 'Looking for inclusive school guidance in Kiambu and a local mothers circle.',
    consentAccepted: true,
  });
  assert.equal(singleMotherOk.valid, true);
  assert.equal(singleMotherOk.data?.householdStructure, 'Single Mother Household');
  assert.equal(singleMotherOk.data?.practicalNeeds.length, 2);

  const twoParentOk = validateSpecialNeedsSupport({
    guardianName: 'Martha & John Ochieng',
    householdStructure: 'Two-Parent Family',
    phoneOrWhatsapp: '+254 722 987 654',
    email: 'martha@example.org',
    preferredContactMethod: 'Mothers Support Tea Circle',
    county: 'Kisumu',
    townWard: 'Milimani',
    childAgeGroup: 'Early Childhood (Ages 0–5)',
    disabilityFocus: 'Visual / Hearing Impairment',
    practicalNeeds: [],
    storyMessage: 'We both work shifts and need afternoon companion help plus inclusive early years.',
    consentAccepted: true,
  });
  assert.equal(twoParentOk.valid, true);
  assert.equal(twoParentOk.data?.householdStructure, 'Two-Parent Family');
  assert.equal(twoParentOk.data?.practicalNeeds[0], 'Direct Mother / Guardian Listening & Prayer');
});

test('validateVolunteerEnquiry validates email and area of interest', () => {
  const invalid = validateVolunteerEnquiry({
    fullName: 'Amina',
    email: 'not-an-email',
    areaOfInterest: '',
    message: 'Too short',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.areaOfInterest);
  assert.ok(invalid.errors.message);

  const valid = validateVolunteerEnquiry({
    fullName: 'Amina Osei',
    email: 'amina@example.org',
    phone: '+254 700 000000',
    areaOfInterest: 'Community Outreach',
    availability: 'Saturdays',
    message: 'I would love to join the monthly food and hospitality team.',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.data?.areaOfInterest, 'Community Outreach');
});

test('validateContactMessage and validateEventRegistration enforce required fields', () => {
  const badContact = validateContactMessage({
    fullName: '',
    email: 'bad',
    subject: 'Hi',
    message: 'Short',
  });
  assert.equal(badContact.valid, false);

  const goodReg = validateEventRegistration({
    eventId: 'evt-1',
    fullName: 'Samuel Mensah',
    email: 'samuel@example.org',
    attendeesCount: 25,
  });
  assert.equal(goodReg.valid, true);
  assert.equal(goodReg.data?.attendeesCount, 20);
});

test('isHoneypotTriggered detects filled bot field', () => {
  assert.equal(isHoneypotTriggered(''), false);
  assert.equal(isHoneypotTriggered('https://spam.example'), true);
});

test('filterImpactProjects and filterAndSortEvents filter, search, and normalize deterministically', () => {
  const projects = [
    { id: '1', category: 'Community Outreach' },
    { id: '2', category: 'Acts of Compassion' },
  ] as ImpactProject[];
  assert.equal(filterImpactProjects(projects, 'All').length, 2);
  assert.equal(filterImpactProjects(projects, 'Acts of Compassion').length, 1);

  assert.equal(normalizeEventCategory('Worship Gathering'), 'Safe Refuge & Fellowship');
  assert.equal(normalizeEventCategory('Prayer Meeting'), 'Mental Health & Recovery');
  assert.equal(normalizeEventCategory("Children's Home Visits"), 'Children’s Home Visits');
  assert.equal(isUpcomingEvent('2026-12-01', '2026-11-20'), true);
  assert.equal(isUpcomingEvent('2026-10-01', '2026-11-20'), false);

  const events = [
    {
      id: 'b',
      title: 'Evening Burden Circle',
      summary: 'Calm mental wellness session',
      venue: 'Care Room',
      category: 'Mental Health & Recovery',
      dateISO: '2026-12-10',
    },
    {
      id: 'a',
      title: 'Amani Children Home Visit',
      summary: 'CSR mentoring visit',
      venue: 'Karen Courtyard',
      category: 'Children’s Home Visits',
      dateISO: '2026-11-20',
    },
    {
      id: 'c',
      title: 'Legacy Recovery Gathering',
      summary: 'Prayer and renewal',
      venue: 'Sanctuary',
      category: 'Prayer Meeting',
      dateISO: '2026-11-25',
    },
  ] as unknown as EventItem[];

  const mentalHealthOnly = filterAndSortEvents(events, 'Mental Health & Recovery');
  assert.deepEqual(
    mentalHealthOnly.map((e) => e.id),
    ['c', 'b']
  );

  const keywordMatch = filterAndSortEvents(events, 'All', 'Karen');
  assert.deepEqual(
    keywordMatch.map((e) => e.id),
    ['a']
  );
});

test('formatEventDate formats ISO date consistently in UTC', () => {
  const formatted = formatEventDate('2026-11-20');
  assert.match(formatted, /20 November 2026/);
});
