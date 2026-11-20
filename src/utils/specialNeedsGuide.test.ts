import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCarePlanShareSummary,
  filterParentingPlaybooks,
  validateStoryAnimationInput,
} from './specialNeedsGuide';

test('filterParentingPlaybooks filters by category and search keyword cleanly', () => {
  const touchItems = filterParentingPlaybooks('physical-touch', '');
  assert.ok(touchItems.length >= 2);
  assert.ok(touchItems.every((x) => x.category === 'physical-touch'));

  const ncpwdItems = filterParentingPlaybooks('all', 'NCPWD');
  assert.ok(ncpwdItems.some((x) => x.id === 'ch-kenya-support-systems'));

  const matatuItems = filterParentingPlaybooks('all', 'matatu');
  assert.ok(matatuItems.length >= 1);
});

test('buildCarePlanShareSummary outputs structured summary with saved challenges', () => {
  const summary = buildCarePlanShareSummary({
    guardianName: 'Grace Wanjiku',
    householdStructure: 'Single Mother Household',
    county: 'Kiambu',
    disabilityFocus: 'Physical Disability / Cerebral Palsy',
    monthlyRespiteHours: 12,
    savedChallengeIds: ['ch-safe-lifting-touch'],
  });
  assert.ok(summary.includes('Grace Wanjiku'));
  assert.ok(summary.includes('12 hrs/month'));
  assert.ok(summary.includes('Spastic Limbs'));
});

test('validateStoryAnimationInput enforces aspect ratio 16:9 or 9:16, image format, and prompt bounds', () => {
  const samplePng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  const okLandscape = validateStoryAnimationInput({
    dataUrl: samplePng,
    prompt: 'Gentle sunlight breeze moves across the courtyard while mothers smile warmly.',
    aspectRatio: '16:9',
  });
  assert.equal(okLandscape.valid, true);
  assert.equal(okLandscape.mimeType, 'image/png');

  const okPortrait = validateStoryAnimationInput({
    dataUrl: samplePng,
    prompt: 'Warm lantern light rises peacefully across the veranda.',
    aspectRatio: '9:16',
  });
  assert.equal(okPortrait.valid, true);

  const badRatio = validateStoryAnimationInput({
    dataUrl: samplePng,
    prompt: 'Gentle sunlight breeze.',
    aspectRatio: '4:3',
  });
  assert.equal(badRatio.valid, false);

  const badMime = validateStoryAnimationInput({
    dataUrl: 'https://example.com/photo.jpg',
    prompt: 'Gentle sunlight breeze.',
    aspectRatio: '16:9',
  });
  assert.equal(badMime.valid, false);
});
