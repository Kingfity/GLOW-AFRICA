import type { EventItem, ImpactProject } from '../shared/types';

export interface VisitKitPlan {
  visitorCount: number;
  childrenCount: number;
  carePacksCount: number;
  stationerySetsCount: number;
  chaperonesNeeded: number;
  childrenPerVisitorLabel: string;
  checklistSummary: string;
}

export function calculateVisitKitPlan(visitorCountRaw: number, childrenCountRaw: number): VisitKitPlan {
  const visitorCount = Math.max(1, Math.min(200, Math.round(visitorCountRaw || 1)));
  const childrenCount = Math.max(10, Math.min(300, Math.round(childrenCountRaw || 40)));

  const carePacksCount = childrenCount;
  const stationerySetsCount = Math.ceil(childrenCount * 1.1);
  const chaperonesNeeded = Math.max(1, Math.ceil(visitorCount / 10));
  const ratio = Math.max(1, Math.round(childrenCount / visitorCount));
  const childrenPerVisitorLabel =
    visitorCount >= childrenCount
      ? '1:1 Buddy Ratio'
      : `Approx. ${ratio} children per visiting mentor`;

  const checklistSummary = [
    `Planned Team: ${visitorCount} visitors (${chaperonesNeeded} safeguarding lead${chaperonesNeeded > 1 ? 's' : ''})`,
    `Care Packs: ${carePacksCount} individual nutrition & hygiene packs`,
    `Learning Kits: ${stationerySetsCount} exercise books, crayons & storybook sets`,
    `Mentorship Ratio: ${childrenPerVisitorLabel} for ${childrenCount} resident children`,
  ].join(' | ');

  return {
    visitorCount,
    childrenCount,
    carePacksCount,
    stationerySetsCount,
    chaperonesNeeded,
    childrenPerVisitorLabel,
    checklistSummary,
  };
}

export type AnchorMode = 'morning-steady' | 'panic-reset' | 'evening-unload';

export interface TraumaAnchorStep {
  id: string;
  timeHint: string;
  title: string;
  gentleCue: string;
  done: boolean;
}

const TRAUMA_ANCHOR_PRESETS: Record<AnchorMode, Omit<TraumaAnchorStep, 'done'>[]> = {
  'morning-steady': [
    {
      id: 'm1',
      timeHint: 'Step 1',
      title: 'Two Feet on the Floor & Slow Morning Exhale',
      gentleCue: 'Before checking bad news or messages, feel both feet grounded and exhale slowly.',
    },
    {
      id: 'm2',
      timeHint: 'Step 2',
      title: 'Warm Tea, Water & One Nourishing Bite',
      gentleCue: 'Heavy weeks drain energy early—nourish your body gently before tackling tasks.',
    },
    {
      id: 'm3',
      timeHint: 'Step 3',
      title: 'Choose Only Today’s Essential Step',
      gentleCue: 'Write down one small reachable priority for today rather than carrying all of next month.',
    },
    {
      id: 'm4',
      timeHint: 'Step 4',
      title: 'Quiet Prayer or One Trusted Check-In Text',
      gentleCue: 'Remind yourself you do not have to walk through Ruiru, Nairobi, or today alone.',
    },
  ],
  'panic-reset': [
    {
      id: 'p1',
      timeHint: 'Step 1',
      title: '5-4-3-2-1 Present-Room Reality Anchor',
      gentleCue: 'Name 5 things you see, 4 textures you touch, and 3 natural sounds around you right now.',
    },
    {
      id: 'p2',
      timeHint: 'Step 2',
      title: 'Drop Your Shoulders & Unclench Your Jaw',
      gentleCue: 'Place one warm hand on your chest or forearm so your nervous system registers safety.',
    },
    {
      id: 'p3',
      timeHint: 'Step 3',
      title: 'Cool Water on Wrists or Step Into Daylight',
      gentleCue: 'Cool water and fresh air gently settle a racing pulse within 90 seconds.',
    },
    {
      id: 'p4',
      timeHint: 'Step 4',
      title: 'Reach Out to a Counsellor or Friend',
      gentleCue: 'Speak openly: “My chest feels heavy right now—can you stay on the line for five minutes?”',
    },
  ],
  'evening-unload': [
    {
      id: 'e1',
      timeHint: 'Step 1',
      title: 'Set Down Unfinished Worries on Paper',
      gentleCue: 'Write the three heaviest thoughts onto a notepad so your mind stops rehearsing them at 2 AM.',
    },
    {
      id: 'e2',
      timeHint: 'Step 2',
      title: 'Soften Lighting & Step Back From Distress News',
      gentleCue: 'Protect the last 40 minutes before bed from painful feeds and urgent demands.',
    },
    {
      id: 'e3',
      timeHint: 'Step 3',
      title: 'Gentle Neck Stretch & Slow 4-4-6 Breathing',
      gentleCue: 'Lengthen your exhale to signal your vagus nerve that tonight is safe for rest.',
    },
    {
      id: 'e4',
      timeHint: 'Step 4',
      title: 'Spoken Release of Peace & Gratitude',
      gentleCue: 'Leave tomorrow’s provision in God’s hands and rest honestly.',
    },
  ],
};

export function getTraumaAnchorPreset(mode: AnchorMode): TraumaAnchorStep[] {
  return TRAUMA_ANCHOR_PRESETS[mode].map((item) => ({ ...item, done: false }));
}

export function toggleAnchorStep(steps: TraumaAnchorStep[], id: string): TraumaAnchorStep[] {
  return steps.map((step) => (step.id === id ? { ...step, done: !step.done } : step));
}

export function addCustomAnchorStep(
  steps: TraumaAnchorStep[],
  rawTitle: string
): TraumaAnchorStep[] {
  const cleanTitle = rawTitle.trim().slice(0, 70);
  if (cleanTitle.length < 2) return steps;
  return [
    ...steps,
    {
      id: `custom-${steps.length + 1}-${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}`,
      timeHint: `Step ${steps.length + 1}`,
      title: cleanTitle,
      gentleCue: 'Added by you—move slowly and treat yourself with patience.',
      done: false,
    },
  ];
}

export interface BreathCycleState {
  phase: 'Inhale Slowly' | 'Hold Gently' | 'Exhale Fully';
  phaseRemainingSeconds: number;
  scale: number;
}

// 4s Inhale -> 4s Hold -> 6s Exhale (14-second restorative rhythm)
export function getBreathPhaseAtSecond(elapsedSeconds: number): BreathCycleState {
  const sec = ((Math.floor(elapsedSeconds) % 14) + 14) % 14;
  if (sec < 4) {
    return {
      phase: 'Inhale Slowly',
      phaseRemainingSeconds: 4 - sec,
      scale: 1 + (sec + 1) * 0.08,
    };
  }
  if (sec < 8) {
    return {
      phase: 'Hold Gently',
      phaseRemainingSeconds: 8 - sec,
      scale: 1.32,
    };
  }
  return {
    phase: 'Exhale Fully',
    phaseRemainingSeconds: 14 - sec,
    scale: 1.32 - (sec - 7) * 0.05,
  };
}

export const ALLOWED_ASSISTANT_ROUTES = new Set([
  '/home-visits',
  '/special-needs-families',
  '/special-needs',
  '/rehabilitation',
  '/recovery',
  '/mental-health',
  '/counselling',
  '/find-my-home',
  '/gbv',
  '/prayer-worship',
  '/events',
  '/accountability',
  '/leadership',
  '/get-involved',
  '/contact',
  '/impact',
  '/about',
]);

export interface SpecialNeedsSupportPlan {
  householdLabel: string;
  isSoleGuardian: boolean;
  monthlyRespiteHours: number;
  pantryAndCareBundles: number;
  estimatedMonthlySupportKes: number;
  suggestedNeeds: string[];
  guidanceNote: string;
}

export function calculateSpecialNeedsSupportPlan(
  householdStructure: string,
  disabilityFocus: string,
  dependantsCountRaw: number
): SpecialNeedsSupportPlan {
  const dependants = Math.max(1, Math.min(8, Math.round(dependantsCountRaw || 1)));
  const isSoleGuardian =
    householdStructure === 'Single Mother Household' ||
    householdStructure === 'Single Father / Sole Guardian' ||
    householdStructure === 'Grandparent / Kinship Guardian';

  const monthlyRespiteHours = isSoleGuardian ? 12 + (dependants - 1) * 4 : 6 + (dependants - 1) * 3;
  const pantryAndCareBundles = isSoleGuardian ? 2 + (dependants > 2 ? 1 : 0) : 1 + (dependants > 2 ? 1 : 0);
  const baseCareKes = isSoleGuardian ? 6500 : 4500;
  const estimatedMonthlySupportKes = baseCareKes + (dependants - 1) * 2000;

  const focusLower = (disabilityFocus || '').toLowerCase();
  const focusSpecificNeed = focusLower.includes('mobility') || focusLower.includes('cerebral')
    ? 'Physiotherapy & Mobility Aid Co-Pay'
    : focusLower.includes('deaf') || focusLower.includes('hearing')
      ? 'Kenyan Sign Language & Hearing Assessment Aid'
      : focusLower.includes('blind') || focusLower.includes('visual')
        ? 'Braille & Low-Vision Learning Materials'
        : focusLower.includes('autism') || focusLower.includes('developmental') || focusLower.includes('speech')
          ? 'Sensory Calm & Speech Therapy Support'
          : 'Occupational & Daily Living Care Supplies';

  const suggestedNeeds = [
    focusSpecificNeed,
    isSoleGuardian ? 'Respite Caregiver Hours & Emergency Backup' : 'Co-Parent & Sibling Encouragement Circle',
    'Maize Flour, Hygiene & Diaper Cushion Pack',
    'NCPWD Disability Card & SHA/EARS Assessment Guide',
  ];

  const guidanceNote = isSoleGuardian
    ? `When one mother or guardian carries every clinic trip, feeding, and sleepless night alone, we prioritise regular respite hours, unga and hygiene relief packs, and a direct sister-to-sister check-in lead for ${disabilityFocus}.`
    : `For two-parent and extended households, we walk beside both caregivers and siblings—preventing silent exhaustion, coordinating therapy referrals, and connecting you with vetted inclusive schools for ${disabilityFocus}.`;

  return {
    householdLabel: householdStructure,
    isSoleGuardian,
    monthlyRespiteHours,
    pantryAndCareBundles,
    estimatedMonthlySupportKes,
    suggestedNeeds,
    guidanceNote,
  };
}

export interface AssistantSuggestedLink {
  label: string;
  href: string;
  reason: string;
}

export interface AssistantResponsePayload {
  reply: string;
  suggestedLinks: AssistantSuggestedLink[];
  urgentSafetyNote?: string;
}

export function validateAssistantMessage(rawMessage: unknown): {
  valid: boolean;
  message: string;
  error?: string;
} {
  const message = typeof rawMessage === 'string' ? rawMessage.trim().replace(/\s+/g, ' ') : '';
  if (message.length < 2) {
    return { valid: false, message: '', error: 'Please share a short question or what you need help finding.' };
  }
  if (message.length > 600) {
    return { valid: false, message: message.slice(0, 600), error: 'Please keep your message under 600 characters.' };
  }
  return { valid: true, message };
}

export function sanitizeAssistantResult(raw: unknown): AssistantResponsePayload {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const reply =
    typeof obj.reply === 'string' && obj.reply.trim()
      ? obj.reply.trim()
      : 'Thank you for reaching out to His & Hers Circle of Hope. Please select one of the guided pathways below so our care circle can help you right away.';
  const rawLinks = Array.isArray(obj.suggestedLinks) ? obj.suggestedLinks : [];
  const suggestedLinks: AssistantSuggestedLink[] = rawLinks
    .map((item) => {
      const l = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
      const href = typeof l.href === 'string' ? l.href.trim() : '';
      const label = typeof l.label === 'string' ? l.label.trim().slice(0, 48) : '';
      const reason = typeof l.reason === 'string' ? l.reason.trim().slice(0, 110) : '';
      if (!ALLOWED_ASSISTANT_ROUTES.has(href) || !label) return null;
      return { label, href, reason };
    })
    .filter((x): x is AssistantSuggestedLink => x !== null)
    .slice(0, 3);

  const urgentSafetyNote =
    typeof obj.urgentSafetyNote === 'string' && obj.urgentSafetyNote.trim()
      ? obj.urgentSafetyNote.trim().slice(0, 220)
      : undefined;

  return {
    reply,
    suggestedLinks,
    urgentSafetyNote,
  };
}

export type ColourGradeId = 'golden-hope' | 'sage-calm' | 'royal-heritage' | 'true-daylight';

export interface ColourGradePreset {
  id: ColourGradeId;
  label: string;
  emotionLabel: string;
  meaning: string;
  swatchHex: string;
  secondaryHex: string;
  cssFilter: string;
  overlayTint: string;
}

export const COLOUR_GRADE_PRESETS: ColourGradePreset[] = [
  {
    id: 'golden-hope',
    label: 'Golden Hour Warmth',
    emotionLabel: 'Joy, Welcome & Belonging',
    meaning:
      'Sunlit amber highlights and warm terracotta contrast communicate hospitality, family laughter, and hopeful community presence.',
    swatchHex: '#C2593F',
    secondaryHex: '#D4AF37',
    cssFilter: 'contrast(1.06) saturate(1.14) sepia(0.08) brightness(1.02)',
    overlayTint: 'rgba(212, 130, 52, 0.08)',
  },
  {
    id: 'sage-calm',
    label: 'Calm Sage Sanctuary',
    emotionLabel: 'Peace, Sensory Ease & Healing',
    meaning:
      'Softened eucalyptus midtones and gentle contrast bring calm to weary guests, parents, and quiet listening rooms.',
    swatchHex: '#256358',
    secondaryHex: '#84B5A9',
    cssFilter: 'contrast(0.98) saturate(0.95) hue-rotate(-5deg) brightness(1.03)',
    overlayTint: 'rgba(37, 99, 88, 0.07)',
  },
  {
    id: 'royal-heritage',
    label: 'Plum & Gold Heritage',
    emotionLabel: 'Dignity, Prayer & Refuge',
    meaning:
      'Deep editorial shadow contrast paired with warm lantern gold highlights communicates quiet strength, reverence, and safe shelter.',
    swatchHex: '#3B155F',
    secondaryHex: '#E5CA7B',
    cssFilter: 'contrast(1.09) saturate(1.08) sepia(0.06) brightness(0.99)',
    overlayTint: 'rgba(59, 21, 95, 0.08)',
  },
  {
    id: 'true-daylight',
    label: 'True Documentary Daylight',
    emotionLabel: 'Clarity & Everyday Honesty',
    meaning:
      'Clean balanced daylight preserving unedited skin tones, natural courtyard greens, and authentic textures across the community.',
    swatchHex: '#5B4E6B',
    secondaryHex: '#FAF7F2',
    cssFilter: 'contrast(1.03) saturate(1.04) brightness(1.01)',
    overlayTint: 'rgba(255, 255, 255, 0)',
  },
];

export function getColourGradePreset(id: string): ColourGradePreset {
  return COLOUR_GRADE_PRESETS.find((g) => g.id === id) || COLOUR_GRADE_PRESETS[0];
}

export type PortfolioKind =
  | 'All'
  | 'Documentary Photo'
  | 'Lifelike Illustration'
  | 'Community Upload';

export interface PortfolioVisualItem {
  id: string;
  title: string;
  kind: Exclude<PortfolioKind, 'All'>;
  src: string;
  alt: string;
  location: string;
  recommendedGrade: ColourGradeId;
  caption: string;
}

export const PORTFOLIO_SHOWCASE_ITEMS: PortfolioVisualItem[] = [
  {
    id: 'port-ruiru-elders',
    title: 'Ruiru Elder Blanket & Maize Flour Sharing',
    kind: 'Documentary Photo',
    src: '/src/assets/images/ruiru_elder_outreach_1795094869017.jpg',
    alt: 'Community neighbour gently handing folded warm blankets, maize flour, and sugar to a smiling elder on a stone veranda in Ruiru, Kiambu County',
    location: 'Ruiru Wards, Kiambu County',
    recommendedGrade: 'golden-hope',
    caption: 'Where our story began: neighbours noticing each other across four Ruiru wards with blankets, unga, rice, sugar, and time.',
  },
  {
    id: 'port-special-mother',
    title: 'Special Needs Child & Mother Courtyard Care',
    kind: 'Documentary Photo',
    src: '/src/assets/images/special_needs_mother_care_1795102206738.jpg',
    alt: 'Kenyan mother sitting warmly on a grass mat beside her smiling young child in wooden therapy seating with sensory blocks',
    location: 'Kiambu & 47-County Family Desk',
    recommendedGrade: 'golden-hope',
    caption: 'Walking side-by-side with single mothers, fathers, and two-parent families raising differently abled children with dignity and respite.',
  },
  {
    id: 'port-mothers-circle',
    title: 'Mothers & Guardians Care Circle',
    kind: 'Documentary Photo',
    src: '/src/assets/images/mothers_support_circle_1795102208113.jpg',
    alt: 'Three Kenyan mothers and guardians speaking warmly around an outdoor garden table over tea',
    location: 'Caregiver & Single-Mothers Tea Table',
    recommendedGrade: 'sage-calm',
    caption: 'Listening directly to mothers and guardians caring for children with disabilities so nobody carries the weight unseen.',
  },
  {
    id: 'port-trauma-listening',
    title: 'Trauma, Stress & Quiet Listening Over Spiced Tea',
    kind: 'Documentary Photo',
    src: '/src/assets/images/trauma_calm_listening_1795094868840.jpg',
    alt: 'Two Kenyan adults seated calmly across a wooden table with warm tea mugs in a sunlit linen-curtained room',
    location: 'Mental Health & Trauma Desk',
    recommendedGrade: 'sage-calm',
    caption: 'Unhurried, trauma-informed listening rooms where chronic stress, grief, and anxiety are met safely without stigma.',
  },
  {
    id: 'port-homes',
    title: 'Storytime & Fresh Fruit at Partner Children’s Home',
    kind: 'Documentary Photo',
    src: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
    alt: 'Kenyan volunteers and smiling children reading picture books on woven mats under acacia trees',
    location: 'Partner Children’s Courtyard',
    recommendedGrade: 'golden-hope',
    caption: 'Warm afternoon light reflects shared friendship during corporate CSR & community reading visits.',
  },
  {
    id: 'port-rehab',
    title: 'Garden Veranda Listening & Family Recovery',
    kind: 'Documentary Photo',
    src: '/src/assets/images/doc_rehab_recovery_garden_1794832339842.jpg',
    alt: 'Kenyan counsellor and visitor seated peacefully in teak chairs beneath blooming bougainvillea over tea',
    location: 'Restoration & Counselling Sanctuary',
    recommendedGrade: 'sage-calm',
    caption: 'Natural foliage greens paired with warm stone communicate unhurried restoration and trust.',
  },
  {
    id: 'port-worship',
    title: 'GLOW Prayer Movement & Ruiru Courtyard Fellowship',
    kind: 'Documentary Photo',
    src: '/src/assets/images/ruiru_fellowship_courtyard_1795102206499.jpg',
    alt: 'East African neighbours gathered in a warm outdoor courtyard circle under acacia trees for prayer and conversation over tea',
    location: 'Ruiru Founding Courtyard',
    recommendedGrade: 'royal-heritage',
    caption: 'Open-air fellowship, interdenominational prayer, and neighbour care rooted in Ruiru since 2025.',
  },
  {
    id: 'port-courtyard-circle',
    title: 'Neighbour-to-Neighbour Veranda Pantry & Hope',
    kind: 'Documentary Photo',
    src: '/src/assets/images/community_circle_hero_1795102206455.jpg',
    alt: 'Kenyan community members packing kikapu baskets with maize flour and fresh sukuma wiki on a sunny courtyard veranda',
    location: 'Ruiru Shared Pantry Hub',
    recommendedGrade: 'true-daylight',
    caption: 'Real Kenyan families and neighbours sorting fresh greens and dry staples together after morning outreach.',
  },
];

export function buildPortfolioItemsFromSiteData(
  impactProjects: ImpactProject[] = [],
  events: EventItem[] = []
): PortfolioVisualItem[] {
  const knownSrcs = new Set(PORTFOLIO_SHOWCASE_ITEMS.map((item) => item.src));
  const uploaded: PortfolioVisualItem[] = [];

  for (const proj of impactProjects) {
    if (proj.imageUrl && proj.imageUrl.startsWith('/uploads/') && !knownSrcs.has(proj.imageUrl)) {
      knownSrcs.add(proj.imageUrl);
      uploaded.push({
        id: `upload-imp-${proj.id}`,
        title: proj.title,
        kind: 'Community Upload',
        src: proj.imageUrl,
        alt: proj.imageAlt || proj.title,
        location: proj.locationLabel || 'Community Outreach Upload',
        recommendedGrade: 'golden-hope',
        caption: proj.summary,
      });
    }
  }

  for (const evt of events) {
    if (evt.imageUrl && evt.imageUrl.startsWith('/uploads/') && !knownSrcs.has(evt.imageUrl)) {
      knownSrcs.add(evt.imageUrl);
      uploaded.push({
        id: `upload-evt-${evt.id}`,
        title: evt.title,
        kind: 'Community Upload',
        src: evt.imageUrl,
        alt: evt.imageAlt || evt.title,
        location: evt.venue || 'Community Event Upload',
        recommendedGrade: 'true-daylight',
        caption: evt.summary,
      });
    }
  }

  return [...uploaded, ...PORTFOLIO_SHOWCASE_ITEMS];
}

export function filterPortfolioItems(
  items: PortfolioVisualItem[],
  kind: PortfolioKind
): PortfolioVisualItem[] {
  if (kind === 'All') return items;
  return items.filter((item) => item.kind === kind);
}

export interface VillageSceneTier {
  id:
    | 'books'
    | 'pantry'
    | 'sensory'
    | 'counselling'
    | 'mentorship'
    | 'refuge';
  label: string;
  sceneElementName: string;
  missionFocus: string;
  unitAmountKes: number;
  beneficiaryImpact: string;
  accentHex: string;
}

export const VILLAGE_SCENE_TIERS: VillageSceneTier[] = [
  {
    id: 'books',
    label: 'Reading & Stationery Pack',
    sceneElementName: 'Courtyard Library Gazebo',
    missionFocus: 'Children’s Homes',
    unitAmountKes: 1500,
    beneficiaryImpact: 'Equips 5 children with storybooks, crayons & solar reading light.',
    accentHex: '#D4AF37',
  },
  {
    id: 'pantry',
    label: 'Warm Family Pantry Basket',
    sceneElementName: 'Shared Harvest Table',
    missionFocus: 'Community Outreach',
    unitAmountKes: 2500,
    beneficiaryImpact: 'Provides fresh greens, grain staples & fruit for a household week.',
    accentHex: '#C2593F',
  },
  {
    id: 'sensory',
    label: 'Trauma & Stress Healing Kit',
    sceneElementName: 'Quiet Eucalyptus Listening Room',
    missionFocus: 'Mental Health & Trauma',
    unitAmountKes: 3500,
    beneficiaryImpact: 'Supports trauma-informed listening hours, grounding guides & caregiver rest circles.',
    accentHex: '#256358',
  },
  {
    id: 'counselling',
    label: 'Counselling & Burden-Share Hour',
    sceneElementName: 'Listening Garden Lanterns',
    missionFocus: 'Mental Health & Rehab',
    unitAmountKes: 4000,
    beneficiaryImpact: 'Sponsors confidential counselling & rehab liaison accompaniment.',
    accentHex: '#59217C',
  },
  {
    id: 'mentorship',
    label: 'Children’s Home Mentorship Day',
    sceneElementName: 'Unity Play & Music Court',
    missionFocus: 'Children’s Home Visits',
    unitAmountKes: 6500,
    beneficiaryImpact: 'Co-funds a safe, joyful group mentorship workshop & sports gear.',
    accentHex: '#B85D19',
  },
  {
    id: 'refuge',
    label: 'Safe Refuge Emergency Night',
    sceneElementName: 'Royal Sanctuary Hearth Beacon',
    missionFocus: 'Find My Home Protection',
    unitAmountKes: 9500,
    beneficiaryImpact: 'Covers urgent emergency shelter, hygiene packs & child safety care.',
    accentHex: '#3B155F',
  },
];

export const VILLAGE_FUNDING_GOAL_KES = 180000;

export interface VillageProgressSummary {
  totalKes: number;
  pledgeCount: number;
  goalPercent: number;
  unlockedTierIds: VillageSceneTier['id'][];
  countsByTier: Record<VillageSceneTier['id'], number>;
}

export function computeVillageProgress(
  contributions: Array<{ tierId: VillageSceneTier['id']; amountKes: number; units: number }>
): VillageProgressSummary {
  const countsByTier: Record<VillageSceneTier['id'], number> = {
    books: 0,
    pantry: 0,
    sensory: 0,
    counselling: 0,
    mentorship: 0,
    refuge: 0,
  };
  let totalKes = 0;

  for (const item of contributions) {
    if (item.tierId in countsByTier) {
      countsByTier[item.tierId] += Math.max(1, item.units || 1);
      totalKes += Math.max(0, item.amountKes || 0);
    }
  }

  const unlockedTierIds = (Object.keys(countsByTier) as VillageSceneTier['id'][]).filter(
    (id) => countsByTier[id] > 0
  );
  const goalPercent = Math.min(100, Math.round((totalKes / VILLAGE_FUNDING_GOAL_KES) * 100));

  return {
    totalKes,
    pledgeCount: contributions.length,
    goalPercent,
    unlockedTierIds,
    countsByTier,
  };
}

export function validateVillageContribution(raw: Record<string, unknown>): {
  valid: boolean;
  errors: Record<string, string>;
  data?: {
    contributorName: string;
    region: string;
    tierId: VillageSceneTier['id'];
    tierLabel: string;
    units: number;
    amountKes: number;
    encouragementNote: string;
  };
} {
  const errors: Record<string, string> = {};
  const contributorName =
    typeof raw.contributorName === 'string' ? raw.contributorName.trim().slice(0, 100) : '';
  const region = typeof raw.region === 'string' ? raw.region.trim().slice(0, 60) : 'Nairobi';
  const tierId = typeof raw.tierId === 'string' ? (raw.tierId.trim() as VillageSceneTier['id']) : 'books';
  const tier = VILLAGE_SCENE_TIERS.find((t) => t.id === tierId);
  const unitsNum = Number(raw.units || 1);
  const units = Number.isFinite(unitsNum) ? Math.max(1, Math.min(20, Math.round(unitsNum))) : 1;
  const encouragementNote =
    typeof raw.encouragementNote === 'string' ? raw.encouragementNote.trim().slice(0, 220) : '';

  if (contributorName.length < 2) {
    errors.contributorName = 'Please enter your name, family name, or organization.';
  }
  if (!tier) {
    errors.tierId = 'Please choose a valid Care Family contribution kit.';
  }
  if (encouragementNote.length < 4) {
    errors.encouragementNote = 'Please share a brief word of encouragement for the care home.';
  }

  if (Object.keys(errors).length > 0 || !tier) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    data: {
      contributorName,
      region: region || 'Nairobi',
      tierId: tier.id,
      tierLabel: tier.label,
      units,
      amountKes: tier.unitAmountKes * units,
      encouragementNote,
    },
  };
}

export interface TransparentStewardshipItem {
  id: string;
  label: string;
  percent: number;
  colorHex: string;
  detail: string;
}

export const TRANSPARENT_STEWARDSHIP_ALLOCATIONS: TransparentStewardshipItem[] = [
  {
    id: 'homes',
    label: 'Partner Children’s Homes & Meals',
    percent: 34,
    colorHex: '#C2593F',
    detail: 'School books, nutritious food baskets, uniforms, and supervised mentorship visit kits.',
  },
  {
    id: 'mental-rehab',
    label: 'Mental Health, Trauma & Rehab Access',
    percent: 26,
    colorHex: '#256358',
    detail: 'Trauma-informed counsellor conversations, nervous-system care, and proximity rehabilitation referrals.',
  },
  {
    id: 'refuge',
    label: 'Find My Home Safe Refuge',
    percent: 22,
    colorHex: '#3B155F',
    detail: 'Confidential emergency shelter stays, child safeguarding, and relocation care packs.',
  },
  {
    id: 'asd',
    label: 'Special Needs Families & Elder Care Packs',
    percent: 12,
    colorHex: '#D4AF37',
    detail: 'Single-mother & family respite kits, elder blankets, and Ruiru maize flour, rice & sugar bundles.',
  },
  {
    id: 'ops',
    label: 'Verified Safeguarding & Hub Ops',
    percent: 6,
    colorHex: '#7A5A10',
    detail: 'Transparent audit recordkeeping, vetting of partner homes, and helpline coordination.',
  },
];

export interface CareRegionNode {
  county: 'Nairobi' | 'Kiambu' | 'Nakuru' | 'Kisumu' | 'Mombasa';
  hubSubtitle: string;
  mapX: number;
  mapY: number;
  safeRefugeActive: boolean;
  highlightNote: string;
}

export const KENYA_CARE_REGIONS: CareRegionNode[] = [
  {
    county: 'Kisumu',
    hubSubtitle: 'Lakeside Family Care & Youth Hub',
    mapX: 98,
    mapY: 162,
    safeRefugeActive: true,
    highlightNote: 'Lakeside Wholeness outpatient rehab circles & mental health listening outreach.',
  },
  {
    county: 'Nakuru',
    hubSubtitle: 'Rift Valley Renewal & Early Care',
    mapX: 168,
    mapY: 158,
    safeRefugeActive: true,
    highlightNote: 'Neema Cradle infant care partnerships & Trauma Sanctuary desk.',
  },
  {
    county: 'Kiambu',
    hubSubtitle: 'Ruiru Founding Circle & Highland Care (Est. 2025)',
    mapX: 215,
    mapY: 178,
    safeRefugeActive: true,
    highlightNote: 'Four-ward Ruiru elder blankets, Ruiru Boys food parcels & Christmas of Hope meals.',
  },
  {
    county: 'Nairobi',
    hubSubtitle: 'Nairobi Care Corridor & Hub Liaison',
    mapX: 222,
    mapY: 204,
    safeRefugeActive: true,
    highlightNote: 'Counselling & trauma desk, Amani Gardens CSR visits & 24/7 Find My Home desk.',
  },
  {
    county: 'Mombasa',
    hubSubtitle: 'Coastal Light & New Dawn Wing',
    mapX: 332,
    mapY: 286,
    safeRefugeActive: true,
    highlightNote: 'Pwani Light teen vocational skills & coastal medical detox referrals.',
  },
];

export interface RegionalCareSummary extends CareRegionNode {
  homesCount: number;
  rehabCount: number;
  eventsCount: number;
  pledgesKes: number;
}

export function buildRegionalCareSummary(input: {
  childrensHomes: Array<{ countyRegion: string }>;
  rehabFacilities: Array<{ countyRegion: string }>;
  events: Array<{ venue: string }>;
  contributions: Array<{ region: string; amountKes: number }>;
}): RegionalCareSummary[] {
  return KENYA_CARE_REGIONS.map((node) => {
    const lower = node.county.toLowerCase();
    const homesCount = input.childrensHomes.filter((h) =>
      h.countyRegion.toLowerCase().includes(lower)
    ).length;
    const rehabCount = input.rehabFacilities.filter((f) =>
      f.countyRegion.toLowerCase().includes(lower)
    ).length;
    const eventsCount = input.events.filter((e) => e.venue.toLowerCase().includes(lower)).length;
    const pledgesKes = input.contributions
      .filter((c) => c.region.toLowerCase().includes(lower))
      .reduce((acc, c) => acc + (c.amountKes || 0), 0);

    return {
      ...node,
      homesCount,
      rehabCount,
      eventsCount,
      pledgesKes,
    };
  });
}


