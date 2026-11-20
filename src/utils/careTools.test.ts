import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addCustomAnchorStep,
  buildPortfolioItemsFromSiteData,
  buildRegionalCareSummary,
  calculateSpecialNeedsSupportPlan,
  calculateVisitKitPlan,
  computeVillageProgress,
  filterPortfolioItems,
  getBreathPhaseAtSecond,
  getColourGradePreset,
  getTraumaAnchorPreset,
  PORTFOLIO_SHOWCASE_ITEMS,
  sanitizeAssistantResult,
  toggleAnchorStep,
  validateAssistantMessage,
  validateVillageContribution,
} from './careTools';
import type { EventItem, ImpactProject } from '../shared/types';

test('calculateVisitKitPlan calculates packs, chaperones, and 1:1 vs grouped mentorship ratio', () => {
  const plan = calculateVisitKitPlan(15, 45);
  assert.equal(plan.visitorCount, 15);
  assert.equal(plan.childrenCount, 45);
  assert.equal(plan.carePacksCount, 45);
  assert.equal(plan.chaperonesNeeded, 2);
  assert.equal(plan.childrenPerVisitorLabel, 'Approx. 3 children per visiting mentor');
  assert.ok(plan.checklistSummary.includes('15 visitors'));

  const oneToOne = calculateVisitKitPlan(50, 40);
  assert.equal(oneToOne.childrenPerVisitorLabel, '1:1 Buddy Ratio');
});

test('Trauma grounding anchor preset, toggling, and custom step addition behave immutably', () => {
  const initial = getTraumaAnchorPreset('morning-steady');
  assert.equal(initial.length, 4);
  assert.equal(initial[0].done, false);

  const toggled = toggleAnchorStep(initial, initial[0].id);
  assert.equal(toggled[0].done, true);
  assert.equal(initial[0].done, false);

  const withCustom = addCustomAnchorStep(toggled, '  Drink warm water slowly  ');
  assert.equal(withCustom.length, 5);
  assert.equal(withCustom[4].title, 'Drink warm water slowly');
  assert.equal(withCustom[4].timeHint, 'Step 5');

  const rejectedBlank = addCustomAnchorStep(withCustom, ' ');
  assert.equal(rejectedBlank.length, 5);
});

test('getBreathPhaseAtSecond cycles cleanly across 4-4-6 breathing cadence', () => {
  assert.equal(getBreathPhaseAtSecond(0).phase, 'Inhale Slowly');
  assert.equal(getBreathPhaseAtSecond(3).phaseRemainingSeconds, 1);
  assert.equal(getBreathPhaseAtSecond(4).phase, 'Hold Gently');
  assert.equal(getBreathPhaseAtSecond(8).phase, 'Exhale Fully');
  assert.equal(getBreathPhaseAtSecond(14).phase, 'Inhale Slowly');
});

test('validateAssistantMessage and sanitizeAssistantResult filter routes safely', () => {
  assert.equal(validateAssistantMessage('').valid, false);
  assert.equal(validateAssistantMessage('Where can our company book a visit?').valid, true);

  const sanitized = sanitizeAssistantResult({
    reply: 'You can browse verified children’s homes and submit a CSR team booking.',
    suggestedLinks: [
      { label: 'Children’s Homes', href: '/home-visits', reason: 'Pick a home and date' },
      { label: 'Bad Route', href: 'https://evil.example.com', reason: 'Should be stripped' },
    ],
  });
  assert.equal(sanitized.suggestedLinks.length, 1);
  assert.equal(sanitized.suggestedLinks[0].href, '/home-visits');
});

test('getColourGradePreset and filterPortfolioItems resolve presets and visual kinds accurately', () => {
  const calm = getColourGradePreset('sage-calm');
  assert.equal(calm.id, 'sage-calm');
  assert.ok(calm.cssFilter.includes('contrast'));

  const fallback = getColourGradePreset('unknown-preset');
  assert.equal(fallback.id, 'golden-hope');

  const allItems = filterPortfolioItems(PORTFOLIO_SHOWCASE_ITEMS, 'All');
  const photosOnly = filterPortfolioItems(PORTFOLIO_SHOWCASE_ITEMS, 'Documentary Photo');
  const artOnly = filterPortfolioItems(PORTFOLIO_SHOWCASE_ITEMS, 'Lifelike Illustration');

  assert.equal(allItems.length, PORTFOLIO_SHOWCASE_ITEMS.length);
  assert.ok(photosOnly.length >= 4);
  assert.equal(artOnly.length, 0);
  assert.ok(photosOnly.every((item) => item.kind === 'Documentary Photo'));

  const merged = buildPortfolioItemsFromSiteData(
    [
      {
        id: 'imp-upload',
        title: 'Fresh Upload Day',
        imageUrl: '/uploads/care-sample.jpg',
        imageAlt: 'Community upload photo',
        locationLabel: 'Nakuru',
        summary: 'Uploaded community field photo.',
      } as ImpactProject,
    ],
    [
      {
        id: 'evt-upload',
        title: 'Uploaded Event Photo',
        imageUrl: '/uploads/care-event.jpg',
        imageAlt: 'Uploaded event moment',
        venue: 'Kiambu Hub',
        summary: 'Uploaded event moment.',
      } as EventItem,
    ]
  );
  const uploadsOnly = filterPortfolioItems(merged, 'Community Upload');
  assert.equal(uploadsOnly.length, 2);
  assert.equal(merged.length, PORTFOLIO_SHOWCASE_ITEMS.length + 2);
});

test('Care Village contribution validation, progress, and regional summaries calculate accurately', () => {
  const invalid = validateVillageContribution({
    contributorName: 'A',
    tierId: 'books',
    encouragementNote: 'Hi',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.contributorName);
  assert.ok(invalid.errors.encouragementNote);

  const valid = validateVillageContribution({
    contributorName: 'Aurel Tech Team',
    region: 'Nairobi',
    tierId: 'sensory',
    units: 2,
    encouragementNote: 'Supporting calm trauma healing evenings for neighbours in distress.',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.data?.amountKes, 7000);
  assert.equal(valid.data?.tierLabel, 'Trauma & Stress Healing Kit');

  const summary = computeVillageProgress([
    { tierId: 'books', amountKes: 3000, units: 2 },
    { tierId: 'sensory', amountKes: 7000, units: 2 },
  ]);
  assert.equal(summary.totalKes, 10000);
  assert.equal(summary.pledgeCount, 2);
  assert.deepEqual(summary.unlockedTierIds, ['books', 'sensory']);

  const regions = buildRegionalCareSummary({
    childrensHomes: [{ countyRegion: 'Nairobi' }, { countyRegion: 'Kiambu' }],
    rehabFacilities: [{ countyRegion: 'Nairobi' }, { countyRegion: 'Kisumu' }],
    events: [{ venue: 'Nairobi Sanctuary' }],
    contributions: [{ region: 'Nairobi', amountKes: 7000 }],
  });
  const nairobi = regions.find((r) => r.county === 'Nairobi');
  assert.ok(nairobi);
  assert.equal(nairobi.homesCount, 1);
  assert.equal(nairobi.rehabCount, 1);
  assert.equal(nairobi.eventsCount, 1);
  assert.equal(nairobi.pledgesKes, 7000);
});

import {
  ALL_47_COUNTY_NAMES,
  ALL_KENYA_COUNTIES,
  filterCountiesByRegion,
  findKenyaCounty,
  getCountyFacilityDetails,
  searchKenyaCounties,
  validateEmergencyAuthorityAlert,
} from './kenyaCounties';
import { validateVolunteerEnquiry } from './validation';

test('ALL_KENYA_COUNTIES covers all 47 unique Kenyan counties with facility addresses, phones, emails, and websites', () => {
  assert.equal(ALL_KENYA_COUNTIES.length, 47);
  assert.equal(new Set(ALL_47_COUNTY_NAMES).size, 47);
  assert.equal(new Set(ALL_KENYA_COUNTIES.map((c) => c.code)).size, 47);

  for (const county of ALL_KENYA_COUNTIES) {
    assert.ok(county.facilityHubName.trim().length > 4, `${county.name} missing facilityHubName`);
    assert.ok(county.physicalAddress.trim().length > 6, `${county.name} missing physicalAddress`);
    assert.ok(county.facilityPhone.trim().length > 6, `${county.name} missing facilityPhone`);
    assert.ok(county.facilityEmail.includes('@'), `${county.name} missing valid facilityEmail`);
    assert.ok(county.websiteUrl.startsWith('https://'), `${county.name} websiteUrl must be https`);
  }

  const turkana = findKenyaCounty('Turkana');
  assert.equal(turkana.code, '023');
  assert.equal(turkana.capitalTown, 'Lodwar');

  const kisumuDesk = getCountyFacilityDetails('Kisumu');
  assert.equal(kisumuDesk.county, 'Kisumu');
  assert.ok(kisumuDesk.websiteUrl.startsWith('https://'));

  const coastCounties = filterCountiesByRegion('Coast');
  assert.equal(coastCounties.length, 6);

  const searchResult = searchKenyaCounties('Eldoret');
  assert.ok(searchResult.some((c) => c.name === 'Uasin Gishu'));
});

test('validateEmergencyAuthorityAlert enforces landmark and safe contact while resolving county details', () => {
  const invalid = validateEmergencyAuthorityAlert({
    county: 'Kisumu',
    locationLandmark: 'A',
    safeContact: '1',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.locationLandmark);
  assert.ok(invalid.errors.safeContact);

  const valid = validateEmergencyAuthorityAlert({
    county: 'Nakuru',
    emergencyType: 'Child Abuse / Child at Risk',
    authorityTarget: 'Children Officer (116)',
    locationLandmark: 'Milimani Gate 4',
    safeContact: '+254 711 000111',
    peopleAffected: 3,
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.data?.county, 'Nakuru');
  assert.equal(valid.data?.peopleAffected, 3);
});

test('validateVolunteerEnquiry supports individual, team, and institution volunteer forms', () => {
  const teamValid = validateVolunteerEnquiry({
    fullName: 'Wanjiku Njoroge',
    email: 'wanjiku@example.org',
    phone: '+254700123456',
    volunteerKind: 'team',
    groupName: 'Savannah Builders Guild',
    groupSize: '14 people',
    pointOfContact: 'Wanjiku Njoroge',
    areaOfInterest: 'Nov 28 Thanksgiving Feast & Relief Token Bundles',
    availability: 'Saturdays',
    message: 'Excited to pack relief bundles together.',
  });
  assert.equal(teamValid.valid, true);
  assert.equal(teamValid.data?.volunteerKind, 'team');
  assert.equal(teamValid.data?.groupName, 'Savannah Builders Guild');
});

test('calculateSpecialNeedsSupportPlan tailors single-parent respite vs standard two-parent planning deterministically', () => {
  const singleMother = calculateSpecialNeedsSupportPlan(
    'Single Mother Household',
    'Cerebral Palsy / Physical Mobility',
    2
  );
  assert.equal(singleMother.householdLabel, 'Single Mother Household');
  assert.equal(singleMother.isSoleGuardian, true);
  assert.equal(singleMother.monthlyRespiteHours, 16);
  assert.equal(singleMother.pantryAndCareBundles, 2);
  assert.equal(singleMother.estimatedMonthlySupportKes, 8500);
  assert.ok(singleMother.guidanceNote.includes('mother or guardian'));
  assert.ok(singleMother.suggestedNeeds.some((n) => n.includes('Physiotherapy')));

  const standardHome = calculateSpecialNeedsSupportPlan(
    'Two-Parent Family',
    'Neurodevelopmental / Learning Support',
    0
  );
  assert.equal(standardHome.isSoleGuardian, false);
  assert.equal(standardHome.monthlyRespiteHours, 6);
  assert.equal(standardHome.estimatedMonthlySupportKes, 4500);
  assert.ok(standardHome.suggestedNeeds.length >= 3);
});


