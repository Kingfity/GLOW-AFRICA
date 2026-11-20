export type ChallengeCategoryId =
  | 'all'
  | 'physical-touch'
  | 'feeding-swallowing'
  | 'sensory-communication'
  | 'medical-seizures'
  | 'kenya-systems'
  | 'neighbour-help';

export interface ParentingChallengePlaybook {
  id: string;
  category: Exclude<ChallengeCategoryId, 'all'>;
  categoryLabel: string;
  title: string;
  whatParentsFeel: string;
  whyItHappens: string;
  practicalTips: string[];
  whatNeighboursCanDo: string;
  specialistDesk: string;
  recommendedRoute: string;
}

export interface KenyaSupportInstitution {
  id: string;
  acronym: string;
  fullName: string;
  whatItProvides: string;
  howToAccess: string;
  contactOrUrl: string;
}

export const PARENTING_CHALLENGE_PLAYBOOKS: ParentingChallengePlaybook[] = [
  {
    id: 'ch-safe-lifting-touch',
    category: 'physical-touch',
    categoryLabel: 'Physical Touch & Safe Lifting',
    title: 'Carrying a Growing Child Without Wrecking Mama’s Back or Hurting Spastic Limbs',
    whatParentsFeel:
      '“My child is now seven or eleven years old, stiff or heavy, and lifting them onto the bed, basin, or matatu leaves my lower back in agony while sudden pulls startle or pain their muscles.”',
    whyItHappens:
      'Children with cerebral palsy or high muscle tone (spasticity) tighten sharply when lifted from underneath the armpits or moved suddenly without warning.',
    practicalTips: [
      'Always use the “Narrate First, Touch Slowly” rhythm: place a steady warm palm on their shoulder for 3 seconds and say calmly, “I am about to lift you now,” before moving.',
      'Hold under the hips and upper thighs close to your own centre of gravity—never yank by the hands, wrists, or underarms.',
      'Fold a sturdy leso or kanga lengthwise as a two-person pelvis sling when moving an older child across mats or into bathing chairs.',
      'Kneel on a folded cushion beside a low bed rather than bending your lumbar spine straight down from standing.',
    ],
    whatNeighboursCanDo:
      'Offer a trained second pair of hands at bath time or matatu boarding so the mother never lifts a dead weight alone.',
    specialistDesk: 'Paediatric Physiotherapist & Mother Respite Circle',
    recommendedRoute: '#guardian-conversation-form',
  },
  {
    id: 'ch-positioning-contractures',
    category: 'physical-touch',
    categoryLabel: 'Positioning & Comfort Without Expensive Chairs',
    title: 'Preventing Tight Joints (Contractures) & Pressure Sores at Home',
    whatParentsFeel:
      '“Specialized corner seats or standing frames cost tens of thousands of shillings I cannot afford, and leaving my child lying flat on one side all day stiffens their hips and hurts their breathing.”',
    whyItHappens:
      'Staying in one flat position causes shortened tendons, scissoring legs, hip discomfort, and trapped mucus in the chest.',
    practicalTips: [
      'Roll two thick bath towels or blankets into firm bolsters tucked under the knees and behind the back to keep a gentle 90-degree upright sitting curve on any floor mat.',
      'Place a firm rolled pillow between the knees when lying on the side so the legs do not scissor tightly against one another.',
      'Shift resting posture every 2 hours between left side-lying, propped sitting, and supported tummy time with a soft wedge under the chest.',
      'During gentle warm-oil skin massage, move joints only as far as they relax comfortably—never force a stiff joint past resistance.',
    ],
    whatNeighboursCanDo:
      'Bring spare firm foam cushions, extra clean cotton sheets, or help link the family with APDK / CPSK low-cost adaptive timber corner seats.',
    specialistDesk: 'Occupational Therapist & Low-Cost Adaptive Aid Liaison',
    recommendedRoute: '#guardian-conversation-form',
  },
  {
    id: 'ch-feeding-swallowing',
    category: 'feeding-swallowing',
    categoryLabel: 'Feeding, Swallowing & Food Textures',
    title: 'Calming Choking Anxiety During Uji, Rice, or Solid Meals',
    whatParentsFeel:
      '“Every spoonful takes forty minutes, my child coughs or gags easily, and I live in constant fear of choking or losing weight.”',
    whyItHappens:
      'Oral-motor coordination challenges in CP, Down syndrome, or developmental delay slow swallowing reflexes, while autistic texture sensitivity triggers gagging when food mixes abruptly.',
    practicalTips: [
      'Never feed a child while lying flat on their back: sit them upright at 90 degrees with a light cushion behind the head slightly tucked forward (chin gently down).',
      'Use a flat, shallow metal or silicone-tipped baby spoon placing soft mashed foods (ndengu, pumpkin, avocado, thick uji) on the middle of the tongue rather than scraping upper teeth.',
      'Offer one single texture at a time rather than mixing watery broth with hard pieces inside one spoon.',
      'Pause after every bite until you see a clear second swallow and keep the child upright for 25 minutes after finishing to prevent reflux.',
    ],
    whatNeighboursCanDo:
      'Donate smooth staple proteins (peanut butter, green grams, eggs, ripe avocados) and blender sharing so meals remain rich in calories without choking risk.',
    specialistDesk: 'Speech & Swallowing Therapist / Nutrition Care Lead',
    recommendedRoute: '#guardian-conversation-form',
  },
  {
    id: 'ch-sensory-touch-meltdowns',
    category: 'sensory-communication',
    categoryLabel: 'Sensory Overwhelm & Gentle Touch',
    title: 'Understanding Non-Verbal Signals, Stimming & Matatu Meltdowns',
    whatParentsFeel:
      '“When crowds stare or horns blare in town, my child screams, covers their ears, or pulls away from hugs—and strangers blame my parenting.”',
    whyItHappens:
      'For autistic children and kids with sensory processing differences, loud hooting, bright fluorescents, and sudden light touches register like physical pain rather than stubbornness.',
    practicalTips: [
      'Use firm, predictable touch rather than light brushing or surprise pats—many sensory-sensitive children calm quickly with slow deep pressure along the shoulders or arms.',
      'Build a simple visual choice board on cardboard with 4 cutouts (Water, Toilet, Quiet Break, Hurt) so non-verbal children can point clearly without frustration.',
      'Pack soft ear defenders, a favourite smooth cloth, or sunglasses before boarded matatus, clinics, or noisy church fellowships.',
      'Reserve a dim, low-noise “Calm Corner” behind a curtain at home where tears settle without shouting or restraint.',
    ],
    whatNeighboursCanDo:
      'Lower voices when visiting the home, greet the child calmly at eye level without forcing hugs, and step in to shield Mama from judging bystanders in public.',
    specialistDesk: 'Sensory Integration & Autism Peer Mothers Group',
    recommendedRoute: '/mental-health',
  },
  {
    id: 'ch-seizures-night-vigilance',
    category: 'medical-seizures',
    categoryLabel: 'Seizure Response & Night Exhaustion',
    title: 'Staying Calm During Seizures & Sharing Sleepless Nights',
    whatParentsFeel:
      '“I sleep with one ear open waiting for an epilepsy fit at 2:00 AM, and relatives warn neighbours it is a curse rather than medical nerve activity.”',
    whyItHappens:
      'Fevers, missed doses when pharmacy transport fails, or neurological pathways trigger seizures that demand calm air protection and steady clinical follow-up.',
    practicalTips: [
      'During a seizure: gently roll the child onto their side (recovery position) on a soft mat, loosen neck buttons, and move hard objects aside—NEVER force a spoon, stick, or fingers into the mouth.',
      'Check a clock immediately: if convulsions last longer than 5 minutes or another starts before waking, seek urgent hospital medical care right away.',
      'Keep an extra 7-day emergency reserve of prescribed anticonvulsants beside a simple dosing checklist on the wall.',
      'If two adults or trusted neighbours live nearby, assign alternating 3-hour sleep shifts so no mother endures weeks on two hours of nightly sleep.',
    ],
    whatNeighboursCanDo:
      'Refill transport fare or sit reliably for two evening hours twice a week so Mama can sleep deeply with peace of mind.',
    specialistDesk: 'Community Health Nurse & Urgent County Clinic Link',
    recommendedRoute: '/counselling',
  },
  {
    id: 'ch-kenya-support-systems',
    category: 'kenya-systems',
    categoryLabel: 'Kenyan Relief, EARS & Registration Bridges',
    title: 'Unlocking NCPWD Cards, Free EARS School Assessments & SHA Cover Without Middlemen',
    whatParentsFeel:
      '“Everyone says I need assessments and cards to get bursaries or wheelchairs, yet every office sends me back and forth while transport money runs out.”',
    whyItHappens:
      'Important national entitlements—tax exemptions, cash transfers, free special school placements, and rehab coverage—sit across separate ministries without a friendly neighbour guiding step one.',
    practicalTips: [
      'Start at your sub-county EARC (Educational Assessment & Resource Centre) for a free functional & educational evaluation rather than paying private brokers.',
      'Ask your County Referral Hospital Medical Assessment Board to complete the NCPWD Medical Assessment form so you can register freely on the eCitizen / NCPWD portal for assistive device subsidies & cash transfer eligibility.',
      'Link your household SHA (Social Health Authority) household profile early so chronic outpatient physiotherapy and pediatric clinic costs are cushioned.',
      'Always carry one clear waterproof folder containing clinic discharge notes, immunization book, and guardian ID copy.',
    ],
    whatNeighboursCanDo:
      'Walk physically beside a single parent into the hospital board or sub-county EARC queue so she is treated with respect and companionship.',
    specialistDesk: 'Kenyan Disability Rights & EARS Navigation Steward',
    recommendedRoute: '#kenya-support-institutions',
  },
  {
    id: 'ch-neighbour-shoulder',
    category: 'neighbour-help',
    categoryLabel: 'How Any Neighbour Can Lighten the Burden Today',
    title: 'Becoming the Friendly Neighbour Who Actually Helps (No Medical Degree Needed)',
    whatParentsFeel:
      '“Friends stop inviting us after our child’s diagnosis; people whisper pity from afar instead of knocking with two kilos of unga and sitting on our steps.”',
    whyItHappens:
      'Neighbours often stay away out of fear of saying the wrong thing, leaving the mother isolated at the very hour she most needs everyday companionship.',
    practicalTips: [
      'Never ask “Let me know if you need anything.” Instead say specifically: “I am going to the market at 3 PM—can I watch Jason on the verandah for 90 minutes while you shower and rest, or pick up your shopping list?”',
      'Ask the parent respectfully: “What helps Daniel feel comfortable when guests visit?” and learn two calming habits in five minutes.',
      'Remember both children AND siblings: bring a simple storybook or ball for brothers and sisters so they feel equally cherished.',
      'Stand up warmly against stigma in chamas, churches, and estates: speak a child’s name first rather than defining them by their diagnosis.',
    ],
    whatNeighboursCanDo:
      'Click "Join Respite Circle" or pledge a Monthly Cushion Pack right here in our Special Needs Care Plan so a local Ruiru or county family feels your shoulder beside theirs.',
    specialistDesk: 'Neighbour Respite & Community Mobilisation Desk',
    recommendedRoute: '/get-involved',
  },
];

export const KENYA_SUPPORT_INSTITUTIONS: KenyaSupportInstitution[] = [
  {
    id: 'inst-ncpwd',
    acronym: 'NCPWD',
    fullName: 'National Council for Persons with Disabilities',
    whatItProvides:
      'Official disability registration card, assistive device subsidies (wheelchairs, standing frames, hearing aids), education bursaries, and cash-transfer linkages for severe disability households.',
    howToAccess:
      'Obtain a clinical disability assessment from a Gazetted County Hospital board, then submit at your nearest County NCPWD office or via eCitizen.',
    contactOrUrl: 'https://ncpwd.go.ke',
  },
  {
    id: 'inst-earc',
    acronym: 'EARC / MoE',
    fullName: 'Ministry of Education — Educational Assessment & Resource Centres',
    whatItProvides:
      'Free multi-disciplinary screening, early childhood intervention referrals, and placement guidance into inclusive or special primary/secondary schools across all 47 counties.',
    howToAccess:
      'Visit your Sub-County Education Office EARC desk with the child and any clinic notes (no referral fee required).',
    contactOrUrl: 'https://www.education.go.ke',
  },
  {
    id: 'inst-kise',
    acronym: 'KISE',
    fullName: 'Kenya Institute of Special Education (Kasarani & Regional)',
    whatItProvides:
      'Functional clinical assessments, parent empowerment workshops on home handling and therapy, speech/auditory screening, and inclusive teaching resources.',
    howToAccess:
      'Schedule a family functional assessment via KISE Kasarani (Nairobi) or ask our Mother & Guardian Lead to match your nearest regional KISE outreach date.',
    contactOrUrl: 'https://www.kise.ac.ke',
  },
  {
    id: 'inst-cpsk',
    acronym: 'CPSK & APDK',
    fullName: 'Cerebral Palsy Society of Kenya & Association for the Physically Disabled of Kenya',
    whatItProvides:
      'Subsidised physiotherapy, occupational therapy, custom timber corner seats, braces, wheelchairs, and psycho-social parent circles.',
    howToAccess:
      'Connect via Donholm/Nairobi & regional branches (Kisumu, Mombasa, Eldoret, Nakuru, Nyeri) or ask our Care Desk for a warm introduction.',
    contactOrUrl: 'https://www.cpsk.or.ke',
  },
  {
    id: 'inst-sha',
    acronym: 'SHA Kenya',
    fullName: 'Social Health Authority — Chronic & Disability Care Benefits',
    whatItProvides:
      'National public health risk-pooling helping households access outpatient clinics, essential medicines, and rehabilitative hospital care.',
    howToAccess:
      'Update household dependants under your SHA profile via USSD *147# or county Huduma Centre so all children are listed cleanly.',
    contactOrUrl: 'https://sha.go.ke',
  },
  {
    id: 'inst-mtrh-nekiwa',
    acronym: 'MTRH / NEKIWA / Doors of Hope',
    fullName: 'Wezesha Watoto (Eldoret), Neuro Kids Warriors & Doors of Hope (Athi River)',
    whatItProvides:
      'County neurodevelopmental screening, therapy grant assistance, local WhatsApp mother circles in Swahili & English, and respite fellowships.',
    howToAccess:
      'Message our Mother & Guardian Lead below and specify your county for a vetted local coordinator phone introduction.',
    contactOrUrl: 'https://nekiwa.org',
  },
];
