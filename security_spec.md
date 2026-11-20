# Security Rules Specification & Red Team Test Matrix

## Data Invariants
1. **Identity & Role Integrity**: Users can never self-assign `admin` privileges in `/users/{userId}` (`role` restricted to `'member' | 'guardian' | 'partner'`) or write to `/admins/{userId}` without matching the verified bootstrap administrator email (`kariukiephraim1st@gmail.com` with `email_verified == true`).
2. **PII Isolation**: User email and phone reside exclusively in `/users/{userId}/private/{docId}` (`isOwner(userId) || isAdmin()`). Blanket `list` queries on `/users`, `/familyCarePlans`, `/sponsorPledges`, and `/storyAnimations` are forbidden—all `list` rules enforce `resource.data.ownerUid == request.auth.uid` (or `request.auth.uid == userId`) directly.
3. **Immutable Ownership & Temporal Integrity**: `ownerUid` (or `uid`) and `createdAt` cannot be forged or modified after document creation; timestamps strictly require `request.time`.
4. **Strict Key & Type Guards**: Every write calls a standalone `isValid[Entity]()` blueprint helper enforcing exact allowed keys (`hasAll` + `hasOnly`), string `.size()` bounds, bounded list sizes (`<= 15`), and `isValidId()` regex validation (`^[a-zA-Z0-9_\-]+$`, max 128 chars).
5. **Terminal State Locking**: Once a `FamilyCarePlan` reaches `'archived'` or a `SponsorPartnerPledge` reaches `'approved'`, client updates are rejected unless performed by a verified administrator.

## "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Unauthenticated Read Scrape**: Anonymous client `getDocs(collection(db, 'familyCarePlans'))` -> Denied (`auth == null`).
2. **Identity Spoofing on Create**: Signed-in user `alice` tries to create `/familyCarePlans/plan-1` with `ownerUid: 'bob'` -> Denied (`data.ownerUid == request.auth.uid`).
3. **Shadow Key Injection (Create)**: Signed-in user includes extra field `isVerifiedPartner: true` on `/sponsorPledges/p-1` -> Denied (`hasOnly(...)` fails).
4. **Shadow Update / Ghost Field**: Owner sends `{ ...validPlan, adminOverride: true }` on `update` -> Denied (`affectedKeys().hasOnly(...)` + `isValidFamilyCarePlan`).
5. **ID Poisoning**: Owner tries creating `/familyCarePlans/../../etc/passwd` or 500-char ID -> Denied (`isValidId()` regex + size check).
6. **Privilege Escalation in User Profile**: User tries setting `role: 'admin'` on `/users/{uid}` -> Denied (`role in ['member', 'guardian', 'partner']`).
7. **Unverified Admin Email Spoof**: User token has `email: 'kariukiephraim1st@gmail.com'` with `email_verified: false` -> Denied (`email_verified == true`).
8. **Blanket Query Scraping**: Signed-in non-admin runs `getDocs(collection(db, 'sponsorPledges'))` without `where('ownerUid', '==', uid)` -> Denied (`resource.data.ownerUid == request.auth.uid` rule cannot be satisfied across arbitrary docs).
9. **Cross-User Private PII Read**: User `bob` reads `/users/alice/private/contact` -> Denied (`isOwner(userId)` fails).
10. **Fake Server Timestamp**: Owner sends `createdAt: new Date('2020-01-01')` instead of `serverTimestamp()` -> Denied (`incoming().createdAt == request.time`).
11. **Terminal State Bypass**: Owner tries changing status of an `'approved'` pledge back to `'submitted'` or editing notes -> Denied (existing status is terminal `'approved'`).
12. **Array / Resource Exhaustion**: Owner submits a `notes` string of 10,000 characters or `savedChallengeIds` with 50 items -> Denied (`notes.size() <= 1200` and `savedChallengeIds.size() <= 15`).
