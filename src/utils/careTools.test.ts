import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addCustomRoutineStep,
  buildPortfolioItemsFromSiteData,
  calculateVisitKitPlan,
  filterPortfolioItems,
  getAsdRoutinePreset,
  getBreathPhaseAtSecond,
  getColourGradePreset,
  PORTFOLIO_SHOWCASE_ITEMS,
  sanitizeAssistantResult,
  toggleRoutineStep,
  validateAssistantMessage,
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

test('ASD routine preset, toggling, and custom step addition behave immutably', () => {
  const initial = getAsdRoutinePreset('morning');
  assert.equal(initial.length, 4);
  assert.equal(initial[0].done, false);

  const toggled = toggleRoutineStep(initial, initial[0].id);
  assert.equal(toggled[0].done, true);
  assert.equal(initial[0].done, false);

  const withCustom = addCustomRoutineStep(toggled, '  Hug blue teddy bear  ');
  assert.equal(withCustom.length, 5);
  assert.equal(withCustom[4].title, 'Hug blue teddy bear');
  assert.equal(withCustom[4].timeHint, 'Step 5');

  const rejectedBlank = addCustomRoutineStep(withCustom, ' ');
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
  assert.equal(artOnly.length, 1);
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

