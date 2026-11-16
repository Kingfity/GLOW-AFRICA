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

export type RoutineMode = 'morning' | 'after-school' | 'bedtime';

export interface AsdRoutineStep {
  id: string;
  timeHint: string;
  title: string;
  gentleCue: string;
  done: boolean;
}

const ROUTINE_PRESETS: Record<RoutineMode, Omit<AsdRoutineStep, 'done'>[]> = {
  morning: [
    {
      id: 'm1',
      timeHint: 'Step 1',
      title: 'Soft Wake-Up & Warm Hello',
      gentleCue: 'Open curtains slowly—no sudden loud voices.',
    },
    {
      id: 'm2',
      timeHint: 'Step 2',
      title: 'Wash Face & Brush Teeth',
      gentleCue: 'Offer choice: warm cloth or cool water, favourite cup.',
    },
    {
      id: 'm3',
      timeHint: 'Step 3',
      title: 'Calm Breakfast Plate',
      gentleCue: 'Keep familiar safe foods separate on the plate.',
    },
    {
      id: 'm4',
      timeHint: 'Step 4',
      title: '2-Minute Sensory Pocket Reset',
      gentleCue: 'Pack fidget, ear defenders, and give a 5-minute shoe countdown.',
    },
  ],
  'after-school': [
    {
      id: 'a1',
      timeHint: 'Step 1',
      title: '15 Minutes Quiet Unwind First',
      gentleCue: 'Hold off on homework questions right at the door.',
    },
    {
      id: 'a2',
      timeHint: 'Step 2',
      title: 'Crunchy Snack & Water Break',
      gentleCue: 'Offer familiar snack and drink in their favourite cup.',
    },
    {
      id: 'a3',
      timeHint: 'Step 3',
      title: 'One-Step Play or Visual Timer Task',
      gentleCue: 'Use a visual sand timer or 10-minute gentle warning.',
    },
    {
      id: 'a4',
      timeHint: 'Step 4',
      title: 'Check Feelings Card Together',
      gentleCue: 'Point to Calm, Tired, Loud, or Hug Needed without pressure.',
    },
  ],
  bedtime: [
    {
      id: 'b1',
      timeHint: 'Step 1',
      title: 'Screens Off & Warm Lamp On',
      gentleCue: 'Switch bright overhead lights off 30 minutes before sleep.',
    },
    {
      id: 'b2',
      timeHint: 'Step 2',
      title: 'Warm Bath or Gentle Wipe-Down',
      gentleCue: 'Soft towel wrap and slow drying pace.',
    },
    {
      id: 'b3',
      timeHint: 'Step 3',
      title: 'Predictable Story or Soft Prayer',
      gentleCue: 'Same calm song or blessing sentence every evening.',
    },
    {
      id: 'b4',
      timeHint: 'Step 4',
      title: 'Weighted Blanket & Safe Sleep Cue',
      gentleCue: 'Keep comfort plush or pillow within easy reach.',
    },
  ],
};

export function getAsdRoutinePreset(mode: RoutineMode): AsdRoutineStep[] {
  return ROUTINE_PRESETS[mode].map((item) => ({ ...item, done: false }));
}

export function toggleRoutineStep(steps: AsdRoutineStep[], id: string): AsdRoutineStep[] {
  return steps.map((step) => (step.id === id ? { ...step, done: !step.done } : step));
}

export function addCustomRoutineStep(
  steps: AsdRoutineStep[],
  rawTitle: string
): AsdRoutineStep[] {
  const cleanTitle = rawTitle.trim().slice(0, 70);
  if (cleanTitle.length < 2) return steps;
  return [
    ...steps,
    {
      id: `custom-${steps.length + 1}-${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}`,
      timeHint: `Step ${steps.length + 1}`,
      title: cleanTitle,
      gentleCue: 'Added by your family at home—go at a gentle pace.',
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
  '/rehabilitation',
  '/asd-support',
  '/counselling',
  '/find-my-home',
  '/prayer-worship',
  '/events',
  '/get-involved',
  '/contact',
  '/impact',
  '/about',
]);

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
      : 'Thank you for reaching out to HIS AND HERS. Please select one of the guided pathways below so our care family can help you right away.';
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
      'Softened eucalyptus midtones and gentle contrast ease visual overwhelm for autistic children, parents, and counselling rest.',
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
    id: 'port-homes',
    title: 'Storytime & Fresh Fruit at Partner Children’s Home',
    kind: 'Documentary Photo',
    src: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
    alt: 'Kenyan volunteers and smiling children reading picture books on woven mats under acacia trees',
    location: 'Nairobi Partner Courtyard',
    recommendedGrade: 'golden-hope',
    caption: 'Warm afternoon light reflects shared friendship during corporate CSR & community reading visits.',
  },
  {
    id: 'port-art',
    title: 'Care Family Home Courtyard at Golden Dusk',
    kind: 'Lifelike Illustration',
    src: '/src/assets/images/lifelike_care_family_art_1794832340734.jpg',
    alt: 'Lifelike painterly illustration of a warm Kenyan Care Family Home courtyard with elders, parents, and children walking beneath acacia and jacaranda trees',
    location: 'Care Family Editorial Artwork',
    recommendedGrade: 'golden-hope',
    caption: 'Lifelike painterly artwork illustrating our vision—every generation welcomed at the glowing doorway.',
  },
  {
    id: 'port-asd',
    title: 'Calm Sensory Blocks & Mother-Son Rhythm',
    kind: 'Documentary Photo',
    src: '/src/assets/images/doc_asd_family_moment_1794832339166.jpg',
    alt: 'Smiling Kenyan mother sitting beside her young autistic son gently sorting wooden sensory blocks in soft window daylight',
    location: 'ASD Family Care Home Space',
    recommendedGrade: 'sage-calm',
    caption: 'Gentle natural daylight and soft neutral tones support sensory peace and unhurried focus.',
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
    title: 'Golden Hour Prayer & Fellowship Gathering',
    kind: 'Documentary Photo',
    src: '/src/assets/images/doc_worship_gathering_1794832340911.jpg',
    alt: 'East African congregation standing together in sunlit stone and timber sanctuary in prayer and song',
    location: 'Interdenominational Sanctuary',
    recommendedGrade: 'royal-heritage',
    caption: 'Sunbeams through arched windows express warmth, reverence, and unity across backgrounds.',
  },
  {
    id: 'port-outreach',
    title: 'Neighbour-to-Neighbour Fresh Harvest Sharing',
    kind: 'Documentary Photo',
    src: '/src/assets/images/impact_community_outreach_1794821887071.jpg',
    alt: 'Community volunteers and elder neighbours sharing woven baskets of fresh produce joyfully outdoors',
    location: 'Neighbourhood Food Outreach',
    recommendedGrade: 'true-daylight',
    caption: 'Crisp documentary tones honour genuine smiles and everyday dignity while awaiting upcoming uploads.',
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


