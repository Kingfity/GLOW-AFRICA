import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const blueprint = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'firebase-blueprint.json'), 'utf8')
);
const rules = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');

test('Every collection defined in firebase-blueprint.json has a matching security rule block', () => {
  const paths = Object.keys(blueprint.firestore || {});
  assert.ok(paths.length >= 6);
  for (const fullPath of paths) {
    const collectionName = fullPath.split('/').filter(Boolean)[0];
    assert.ok(
      rules.includes(`match /${collectionName}`),
      `Missing rule match block for collection ${collectionName}`
    );
  }
});

test('Firestore rules enforce Eight Pillars invariants (catch-all deny, email_verified, valid IDs, no null request.resource in delete/read)', () => {
  assert.match(rules, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;/);
  assert.ok(rules.includes('request.auth.token.email_verified == true'));
  assert.ok(rules.includes('function isValidId(id)'));
  assert.ok(rules.includes('hasOnly('));
  assert.ok(rules.includes('affectedKeys().hasOnly('));
  assert.ok(rules.includes('request.time'));
  // Ensure delete blocks never invoke incoming()
  const deleteLines = rules
    .split('\n')
    .filter((l) => l.includes('allow delete:'));
  for (const line of deleteLines) {
    assert.equal(line.includes('incoming()'), false, `Delete rule must not reference incoming(): ${line}`);
  }
  assert.ok(rules.includes("data.photoURL.matches('^https://.*')"));
  assert.ok(rules.includes("data.videoUrl.matches('^(/uploads/|https://).*')"));
});
