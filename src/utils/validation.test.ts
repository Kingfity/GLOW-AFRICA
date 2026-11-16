import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePrayerRequest,
  validateVolunteerEnquiry,
  validateContactMessage,
  validateEventRegistration,
  filterImpactProjects,
  filterAndSortEvents,
  formatEventDate,
  isHoneypotTriggered,
} from './validation';
import type { EventItem, ImpactProject } from '../shared/types';

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
  assert.equal(goodReg.data?.attendeesCount, 20); // clamped safely
});

test('isHoneypotTriggered detects filled bot field', () => {
  assert.equal(isHoneypotTriggered(''), false);
  assert.equal(isHoneypotTriggered('https://spam.example'), true);
});

test('filterImpactProjects and filterAndSortEvents filter and sort deterministically', () => {
  const projects = [
    { id: '1', category: 'Community Outreach' },
    { id: '2', category: 'Acts of Compassion' },
  ] as ImpactProject[];
  assert.equal(filterImpactProjects(projects, 'All').length, 2);
  assert.equal(filterImpactProjects(projects, 'Acts of Compassion').length, 1);

  const events = [
    { id: 'b', category: 'Prayer Meeting', dateISO: '2026-12-10' },
    { id: 'a', category: 'Prayer Meeting', dateISO: '2026-11-20' },
    { id: 'c', category: 'Worship Gathering', dateISO: '2026-11-25' },
  ] as EventItem[];
  const sorted = filterAndSortEvents(events, 'Prayer Meeting');
  assert.deepEqual(
    sorted.map((e) => e.id),
    ['a', 'b']
  );
});

test('formatEventDate formats ISO date consistently in UTC', () => {
  const formatted = formatEventDate('2026-11-20');
  assert.match(formatted, /20 November 2026/);
});
