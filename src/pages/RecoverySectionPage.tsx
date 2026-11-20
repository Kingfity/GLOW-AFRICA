import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Compass,
  ExternalLink,
  HeartPulse,
  Mail,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { ALL_KENYA_COUNTIES, KENYA_REGION_NAMES, findKenyaCounty } from '../utils/kenyaCounties';

interface SamhsaDimension {
  id: 'health' | 'home' | 'purpose' | 'community';
  title: string;
  subtitle: string;
  accentHex: string;
  resources: { name: string; detail: string; contactNote: string }[];
}

const RECOVERY_PILLARS: SamhsaDimension[] = [
  {
    id: 'health',
    title: 'Health',
    subtitle: 'Safe medical comfort, steady sleep, and caring physical care as your body heals.',
    accentHex: '#256358',
    resources: [
      {
        name: 'NACADA 24/7 Toll-Free Substance Care Line (Kenya)',
        detail: 'Speak calmly with a trained counsellor or nurse before making changes so your body stays medically safe.',
        contactNote: 'Call 1192 (Toll-Free 24/7) or +254 722 178 177 (Befrienders Kenya)',
      },
      {
        name: 'Kenyatta & County Level-5 Outpatient Clinics',
        detail: 'Walk-in confidential appointments for a person with a substance use disorder.',
        contactNote: 'Available across all 47 Kenyan county referral hospitals',
      },
      {
        name: 'Trauma-Informed Whole Health Checks',
        detail: 'Nutrition support, gentle rest guidance, and confidential lab screening.',
        contactNote: 'Coordinated privately on request',
      },
    ],
  },
  {
    id: 'home',
    title: 'Home',
    subtitle: 'A peaceful, predictable roof where your nervous system can exhale and feel protected.',
    accentHex: '#B85D19',
    resources: [
      {
        name: 'Sober & Supportive Transition Houses',
        detail: 'Verified peer-led shared homes in Nairobi, Kiambu, Nakuru, Kisumu, and Mombasa.',
        contactNote: 'Step-down accommodation after residential care',
      },
      {
        name: 'Family Mediation & Boundary Coaching',
        detail: 'Help household members build a calm, blame-free home rhythm together.',
        contactNote: 'Weekly family check-ins in person or by phone',
      },
      {
        name: 'Emergency Safe Housing Referral',
        detail: 'Immediate bridge shelter if your current housing feels unsafe tonight.',
        contactNote: 'Zero judgment · Urgent safety priority',
      },
    ],
  },
  {
    id: 'purpose',
    title: 'Purpose',
    subtitle: 'Meaningful daily structure through work, skills, parenting, art, or community contribution.',
    accentHex: '#7A5A10',
    resources: [
      {
        name: 'Vocational & Back-to-Work Mentorship',
        detail: 'Craft, digital skills, and flexible part-time placement with patient partner employers.',
        contactNote: 'Open to people 30+ days in recovery',
      },
      {
        name: 'Parenting & Caregiver Steadiness Groups',
        detail: 'Rebuild confidence with children step by step at your own pace.',
        contactNote: 'Tuesdays & Saturdays morning circle',
      },
    ],
  },
  {
    id: 'community',
    title: 'Community',
    subtitle: 'Warm relationships and belonging alongside people who understand the road firsthand.',
    accentHex: '#1D4E46',
    resources: [
      {
        name: 'Open Peer Coffee & Listening Circles',
        detail: 'Show up simply to listen. You never have to speak before you feel ready.',
        contactNote: 'Thursdays 5:30 PM & Sunday afternoons',
      },
      {
        name: 'Family & Loved-Ones Steadiness Circle',
        detail: 'Dedicated encouragement for spouses, parents, and siblings walking alongside you.',
        contactNote: 'Online audio option & in-person rooms',
      },
      {
        name: 'Regional Peer Companion Matching',
        detail: 'Connect with a steady peer mentor further along in recovery near your county.',
        contactNote: 'Matched across all 8 regions of Kenya',
      },
    ],
  },
];

const TRIAGE_OPTIONS = [
  {
    id: 'using-now',
    route: '/recovery/using-now',
    label: "I'm using and want help",
    tone: 'Start right where you are—no need to pause everything before talking to us.',
    tag: 'Immediate Support & Safety',
  },
  {
    id: 'early-recovery',
    route: '/recovery/early-recovery',
    label: "I'm in early recovery",
    tone: 'Build a steady first 90 days with sleep tools, peer check-ins, and trigger planning.',
    tag: 'First 90 Days Rhythm',
  },
  {
    id: 'family-member',
    route: '/recovery/family-member',
    label: "I'm a family member",
    tone: 'Learn calm words, healthy boundaries, and practical support when someone you love struggles.',
    tag: 'Loved Ones & Caregivers',
  },
  {
    id: 'not-sure',
    route: '/recovery/not-sure',
    label: "I'm not sure yet",
    tone: 'Quietly read what support looks like, explore questions, and decide in your own time.',
    tag: 'No-Pressure Exploration',
  },
];

interface PeerStory {
  id: string;
  name: string;
  county: string;
  duration: string;
  headline: string;
  summary: string;
  transcript: string;
  imageUrl: string;
  imageAlt: string;
}

const PEER_STORIES: PeerStory[] = [
  {
    id: 'story-david',
    name: 'David M.',
    county: 'Kiambu County',
    duration: '2 min written story',
    headline: '“Asking one honest question opened a door I thought was locked.”',
    summary:
      'After four exhausting years trying to cope silently, David shares how his first calm phone call with a care coordinator felt completely different from what he feared.',
    transcript:
      'I expected a lecture. Instead, the counsellor asked if I had eaten that day and helped my family map a quiet three-week outpatient plan near Thika. Today I am two years in recovery and coaching younger carpenters.',
    imageUrl: '/src/assets/images/peer_story_david_1795094868646.jpg',
    imageAlt:
      'Illustrative community portrait representing David M. standing beside a wooden workbench in morning daylight (protected identity portrait)',
  },
  {
    id: 'story-grace',
    name: 'Grace W.',
    county: 'Nakuru County',
    duration: '2 min written story',
    headline: '“A return to use was not the end of my daughter’s story—or mine.”',
    summary:
      'A mother speaks tenderly about shifting from fear and shouting to steady boundaries and open morning tea.',
    transcript:
      'When my daughter experienced a return to use after five months, I panicked at first. Our His & Hers Circle of Hope family group walked me through how to respond with warmth rather than shame. That week changed everything between us.',
    imageUrl: '/src/assets/images/peer_story_grace_1795094868372.jpg',
    imageAlt:
      'Illustrative community portrait representing Grace W. holding a ceramic mug in morning light (protected identity portrait)',
  },
  {
    id: 'story-hassan',
    name: 'Hassan K.',
    county: 'Mombasa County',
    duration: '2 min written story',
    headline: '“Having somewhere purposeful to go at 8 AM gave me my dignity back.”',
    summary:
      'Hassan reflects on rebuilding structure through community carpentry mentorship and steady evening peer check-ins along the coast.',
    transcript:
      'For a long time I felt invisible. Finding a mentor who treated me as a whole person with a substance use disorder—someone with gifts to offer—reminded me I belonged to a neighbourhood again.',
    imageUrl: '/src/assets/images/peer_story_hassan_1795094868470.jpg',
    imageAlt:
      'Illustrative community portrait representing Hassan K. sitting in warm coastal shade (protected identity portrait)',
  },
];

type FamilyTabId = 'say' | 'dont-say' | 'boundaries' | 'return-to-use';

const FAMILY_TABS: {
  id: FamilyTabId;
  label: string;
  heading: string;
  points: { lead: string; detail: string }[];
}[] = [
  {
    id: 'say',
    label: 'What to say',
    heading: 'Warm Phrases That Open Honest Doors',
    points: [
      {
        lead: '“You don’t have to carry this alone today.”',
        detail: 'Signals steady presence without demanding overnight perfection.',
      },
      {
        lead: '“What feels like the smallest helpful next step for you?”',
        detail: 'Returns dignity and agency to a person with a substance use disorder.',
      },
      {
        lead: '“I love you and I’m grateful you told me the truth.”',
        detail: 'Lowers shame—because isolation fuels secrecy while safety invites honesty.',
      },
    ],
  },
  {
    id: 'dont-say',
    label: 'What not to say',
    heading: 'Words That Accidentally Close Down Trust',
    points: [
      {
        lead: 'Avoid harsh labels or ultimatums spoken in anger.',
        detail: 'Shame pushes a loved one further from reaching out when it matters most.',
      },
      {
        lead: 'Avoid “Why can’t you just stop?”',
        detail: 'Substance use disorders reshape brain stress pathways; medical & peer support genuinely helps.',
      },
      {
        lead: 'Avoid keeping secrets out of fear of neighbour gossip.',
        detail: 'Safe, vetted peer circles exist precisely so families do not carry this silently.',
      },
    ],
  },
  {
    id: 'boundaries',
    label: 'Supporting without enabling',
    heading: 'Loving Deeply With Clear Household Boundaries',
    points: [
      {
        lead: 'Fund nourishment and treatment, never cash without accountability.',
        detail: 'Pay clinic fees, groceries, or bus fare directly rather than handing over unmonitored cash.',
      },
      {
        lead: 'Let natural responsibilities stay gently theirs.',
        detail: 'Supporting means walking beside someone—not masking every consequence at home.',
      },
      {
        lead: 'Protect your own sleep, finances, and younger children’s calm.',
        detail: 'Your steadiness is part of the healing environment for the whole household.',
      },
    ],
  },
  {
    id: 'return-to-use',
    label: 'Coping with a return to use',
    heading: 'Steady Steps If a Return to Use Happens',
    points: [
      {
        lead: 'Treat a return to use as signal data, not a failure.',
        detail: 'Many people adjust their care plan along the way. Ask gently what overwhelmed the week.',
      },
      {
        lead: 'Check immediate physical safety first.',
        detail: 'Call 1192 (NACADA), 1199 (Kenya Red Cross), +254 722 178 177 (Befrienders Kenya), or nearby medical care calmly if physical symptoms look concerning.',
      },
      {
        lead: 'Re-connect with the support team within 24 hours.',
        detail: 'Shortening the gap between a stumble and re-connecting with a peer circle protects momentum.',
      },
    ],
  },
];

type ResourceCategory =
  | 'All'
  | 'Medical & Detox Care'
  | 'Outpatient Counselling'
  | 'Peer Circles'
  | 'Family & Transitional Housing';

interface LocalRecoveryResource {
  id: string;
  name: string;
  county: string;
  region: string;
  type: Exclude<ResourceCategory, 'All'>;
  description: string;
  format: string;
  physicalAddress: string;
  phone: string;
  email: string;
  websiteUrl: string;
}

const CURATED_RECOVERY_RESOURCES: LocalRecoveryResource[] = [
  {
    id: 'rec-upendo',
    name: 'Upendo Gentle Stabilization & Outpatient Clinic',
    county: 'Nairobi',
    region: 'Nairobi',
    type: 'Medical & Detox Care',
    description: 'Nurse-supported medical assessment and respectful comfort protocols.',
    format: 'Outpatient & short-stay medical unit',
    physicalAddress: 'Hospital Road, Upper Hill · KNH Recovery Wing Liaison, Nairobi',
    phone: '+254 20 272 6300',
    email: 'recovery@knh.or.ke',
    websiteUrl: 'https://knh.or.ke',
  },
  {
    id: 'rec-kiambu-circles',
    name: 'Maji Mazuri Morning Peer Circle',
    county: 'Kiambu',
    region: 'Central',
    type: 'Peer Circles',
    description: 'Walk-in coffee & tea peer gathering led by long-term community mentors.',
    format: 'In-person & phone bridge · Free',
    physicalAddress: 'Ruiru Eastern Bypass Community Hall, Kiambu County',
    phone: '+254 711 220 402',
    email: 'kiambucare@hisandhers.org',
    websiteUrl: 'https://www.nacada.go.ke',
  },
  {
    id: 'rec-nakuru-home',
    name: 'Rift Quiet Bridge Transitional House',
    county: 'Nakuru',
    region: 'Rift Valley',
    type: 'Family & Transitional Housing',
    description: 'Calm 60-to-90 day shared housing with vocational carpentry and garden rhythm.',
    format: 'Supported communal housing',
    physicalAddress: 'Milimani Quiet Lane, Plot 14, Nakuru',
    phone: '+254 51 221 5580',
    email: 'nakurucare@hisandhers.org',
    websiteUrl: 'https://nakuru.go.ke',
  },
  {
    id: 'rec-kisumu-care',
    name: 'Lakeside Family Mediation & Counselling Room',
    county: 'Kisumu',
    region: 'Nyanza',
    type: 'Outpatient Counselling',
    description: 'Trauma-informed individual sessions plus calm family dialogue support.',
    format: 'Evening & Saturday flexible hours',
    physicalAddress: 'Angawa Avenue, Near Jaramogi Referral Hospital, Kisumu',
    phone: '+254 57 202 0801',
    email: 'kisumucare@hisandhers.org',
    websiteUrl: 'https://www.befrienderskenya.org',
  },
  {
    id: 'rec-mombasa-detox',
    name: 'Pwani Calm Harbour Care Desk',
    county: 'Mombasa',
    region: 'Coast',
    type: 'Medical & Detox Care',
    description: 'Confidential coastal medical screening and gentle step-down recovery planning.',
    format: 'Confidential walk-in & hotline',
    physicalAddress: 'Links Road, Nyali / Coast General Referral Wing, Mombasa',
    phone: '+254 41 231 4201',
    email: 'coastcare@hisandhers.org',
    websiteUrl: 'https://www.mombasa.go.ke',
  },
];

const RESOURCE_TYPES: ResourceCategory[] = [
  'All',
  'Medical & Detox Care',
  'Outpatient Counselling',
  'Peer Circles',
  'Family & Transitional Housing',
];

export function RecoverySectionPage() {
  const { path, navigate } = useRouter();
  const normalized = path === '/recovery' ? '/recovery' : path.replace(/\/+$/, '');

  // All interactive tools live in local React state (Zero analytics, zero cookies, zero server pings)
  const [bannerClosed, setBannerClosed] = useState(false);
  const [expandedDimensions, setExpandedDimensions] = useState<string[]>(['health']);
  const [activeFamilyTab, setActiveFamilyTab] = useState<FamilyTabId>('say');
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [mapTypeFilter, setMapTypeFilter] = useState<ResourceCategory>('All');
  const [mapRegionFilter, setMapRegionFilter] = useState<string>('All');
  const [selectedCounty, setSelectedCounty] = useState<string>('Nairobi');

  const handleLeaveThisSite = () => {
    window.open('https://www.google.com', '_blank', 'noopener,noreferrer');
    try {
      window.close();
    } catch {
      // Browser fallback
    }
    window.location.replace('https://www.google.com');
  };

  const toggleDimension = (id: string) => {
    setExpandedDimensions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const mapCounties = useMemo(() => {
    if (mapRegionFilter === 'All') return ALL_KENYA_COUNTIES;
    return ALL_KENYA_COUNTIES.filter((c) => c.region === mapRegionFilter);
  }, [mapRegionFilter]);

  const activeCountyInfo = useMemo(() => findKenyaCounty(selectedCounty), [selectedCounty]);

  const filteredResources = useMemo(() => {
    const countyResource: LocalRecoveryResource = {
      id: `county-desk-${activeCountyInfo.code}`,
      name: `${activeCountyInfo.name} · ${activeCountyInfo.facilityHubName}`,
      county: activeCountyInfo.name,
      region: activeCountyInfo.region,
      type: 'Outpatient Counselling',
      description: `Local county linkage: ${activeCountyInfo.partnerProgrammes}. Walk-in or telephone guidance tailored to ${activeCountyInfo.capitalTown}.`,
      format: 'Active across all 47 counties · Private intake',
      physicalAddress: activeCountyInfo.physicalAddress,
      phone: activeCountyInfo.facilityPhone,
      email: activeCountyInfo.facilityEmail,
      websiteUrl: activeCountyInfo.websiteUrl,
    };

    const combined = [countyResource, ...CURATED_RECOVERY_RESOURCES];
    return combined.filter((item) => {
      const matchType = mapTypeFilter === 'All' || item.type === mapTypeFilter;
      const matchRegion = mapRegionFilter === 'All' || item.region === mapRegionFilter;
      return matchType && matchRegion;
    });
  }, [activeCountyInfo, mapTypeFilter, mapRegionFilter]);

  const activeFamilyContent = FAMILY_TABS.find((t) => t.id === activeFamilyTab) || FAMILY_TABS[0];

  const isSubPage = normalized !== '/recovery';

  return (
    <div className="bg-[#FAF7F2] text-[#1A1224]">
      {/* TOP TRIGGER WARNING BANNER (No cookies, zero telemetry) */}
      {!bannerClosed && (
        <div
          role="region"
          aria-label="Recovery supportive notice"
          className="bg-[#1D4E46] text-[#FAF7F2] border-b border-[#D4AF37]/40 px-4 sm:px-8 py-2.5"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              This space talks gently about substance use and healing. Take breaks whenever you
              need—there is zero rush and zero judgement here.
            </p>
            <button
              type="button"
              onClick={() => setBannerClosed(true)}
              className="self-start sm:self-center px-3 py-1 text-xs font-semibold rounded bg-white/15 hover:bg-white/25 text-[#FAF7F2] transition-colors shrink-0"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ISOLATED RECOVERY HEADER ON EVERY /recovery/* PAGE: KENYA & EAST AFRICA HELPLINES + LEAVE THIS SITE */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-sm border-b-2 border-[#256358]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/recovery')}
              className="font-serif text-lg sm:text-xl font-semibold text-[#1D4E46] inline-flex items-center gap-2"
            >
              <HeartPulse className="w-5 h-5 text-[#256358]" aria-hidden="true" />
              <span>His &amp; Hers Circle of Hope · Recovery Hub</span>
            </button>
            {/* Kenyan & Regional Crisis Lines Always Visible in Header */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <a
                href="tel:1192"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EDF6F3] text-[#1D4E46] border border-[#256358]/30 hover:bg-[#DCEEE8] tabular-nums"
              >
                <PhoneCall className="w-3 h-3" aria-hidden="true" />
                NACADA Recovery: 1192
              </a>
              <a
                href="tel:1199"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FDF6E2] text-[#7A5A10] border border-[#D4AF37]/45 hover:bg-[#F9ECC8] tabular-nums"
              >
                <PhoneCall className="w-3 h-3" aria-hidden="true" />
                Red Cross Crisis: 1199
              </a>
              <a
                href="tel:+254722178177"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-[#1D4E46] border border-[#256358]/25 hover:bg-[#EDF6F3] tabular-nums"
              >
                <PhoneCall className="w-3 h-3" aria-hidden="true" />
                Befrienders: +254 722 178 177
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/recovery/what-to-expect')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                normalized === '/recovery/what-to-expect'
                  ? 'bg-[#256358] text-[#FAF7F2]'
                  : 'bg-white border border-[#256358]/25 text-[#256358] hover:bg-[#EDF6F3]'
              }`}
            >
              What to Expect
            </button>
            <button
              type="button"
              onClick={handleLeaveThisSite}
              aria-label="Leave this site immediately"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-md bg-[#111111] text-[#F8DF8C] hover:bg-black border-2 border-[#D4AF37] shadow-sm transition-colors whitespace-nowrap"
            >
              <span>Leave this site</span>
              <span aria-hidden="true">🚪</span>
            </button>
          </div>
        </div>
      </header>

      {/* SUB-PAGES FOR TRIAGE OR "WHAT TO EXPECT" */}
      {isSubPage && (
        <section className="py-12 sm:py-16 bg-gradient-to-br from-[#EDF6F3] via-[#FAF7F2] to-[#FDF6E2] border-b border-[#256358]/15">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-8">
            <button
              type="button"
              onClick={() => navigate('/recovery')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#256358] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to Recovery Hub Overview
            </button>

            {normalized === '/recovery/using-now' && (
              <div className="bg-white border-2 border-[#256358]/30 rounded-2xl p-6 sm:p-10 space-y-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                  Right Where You Are · Zero Pressure
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1224]">
                  You can reach out even while you are still using.
                </h1>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  You do not have to stop alone before asking a doctor, peer, or counsellor for
                  help. Stopping suddenly without medical advice can be physically uncomfortable or
                  unsafe for some substances—so our priority is keeping your body safe first.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-[#EDF6F3] space-y-2">
                    <h2 className="font-serif text-xl font-semibold text-[#1D4E46]">
                      1. Gentle First Conversation
                    </h2>
                    <p className="text-sm text-[#3E3349]">
                      Call <strong>1192</strong> (NACADA Toll-Free), <strong>1199</strong> (Kenya
                      Red Cross), or <strong>+254 722 178 177</strong> (Befrienders Kenya) anytime
                      for calm, confidential guidance tonight.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-[#FDF6E2] space-y-2">
                    <h2 className="font-serif text-xl font-semibold text-[#7A5A10]">
                      2. Medical Comfort Assessment
                    </h2>
                    <p className="text-sm text-[#3E3349]">
                      See our plain-language{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/recovery/what-to-expect')}
                        className="underline font-semibold text-[#256358]"
                      >
                        What to expect
                      </button>{' '}
                      guide so there are zero surprises on day one.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {normalized === '/recovery/early-recovery' && (
              <div className="bg-white border-2 border-[#D4AF37]/50 rounded-2xl p-6 sm:p-10 space-y-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5A10]">
                  First 90 Days · Protecting Your Rhythm
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1224]">
                  Building steady mornings in early recovery.
                </h1>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  Early days can feel surprisingly noisy—emotions return faster, sleep can feel uneven,
                  and social invitations take planning. Every morning you stay connected to supportive
                  people counts.
                </p>
                <ul className="space-y-3 text-sm sm:text-base text-[#3E3349]">
                  <li>• Keep one predictable evening routine (tea, stretch, low lighting, phone rest).</li>
                  <li>• Identify 2 trusted peer numbers to text before stepping into stressful events.</li>
                  <li>• Remember: if a return to use happens, step straight back toward care—never into isolation.</li>
                </ul>
              </div>
            )}

            {normalized === '/recovery/family-member' && (
              <div className="bg-white border-2 border-[#256358]/30 rounded-2xl p-6 sm:p-10 space-y-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                  For Parents, Partners &amp; Siblings
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1224]">
                  Caring for someone you love—without losing yourself.
                </h1>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  Watching a person with a substance use disorder you deeply love struggle takes a
                  quiet toll on the whole household. Scroll directly to the 4-part Family Guide below
                  for calm language, boundaries, and what to do after a return to use.
                </p>
              </div>
            )}

            {normalized === '/recovery/not-sure' && (
              <div className="bg-white border-2 border-[#D4AF37]/50 rounded-2xl p-6 sm:p-10 space-y-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5A10]">
                  Exploring Quietly · Zero Labels Forced
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1224]">
                  It is okay to simply pause and ask honest questions.
                </h1>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  You might just be noticing that drinking or substance habits are costing more energy,
                  sleep, or peace than they used to. Nobody here forces a label on you—browse our
                  Health, Home, Purpose, and Community pillars below at your own pace.
                </p>
              </div>
            )}

            {normalized === '/recovery/what-to-expect' && (
              <div className="bg-white border-2 border-[#256358]/35 rounded-2xl p-6 sm:p-10 space-y-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                  Plain-Language Walkthrough
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1224]">
                  What to expect when you reach out
                </h1>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  Fear of the unknown keeps many people waiting months. Here is exactly how the first
                  three days look—in simple, honest everyday words.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-xl bg-[#EDF6F3] space-y-2">
                    <p className="text-xs font-bold text-[#256358]">STEP 01 · DAY 1 HELLO</p>
                    <h2 className="font-serif text-xl font-semibold text-[#1A1224]">
                      A Warm Desk, Never an Interrogation
                    </h2>
                    <p className="text-sm text-[#3E3349] leading-relaxed">
                      A calm nurse or coordinator asks about your health, allergies, sleep, and who is
                      safe to call. Your privacy is guarded strictly.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-[#FDF6E2] space-y-2">
                    <p className="text-xs font-bold text-[#7A5A10]">STEP 02 · DAYS 2–5 COMFORT</p>
                    <h2 className="font-serif text-xl font-semibold text-[#1A1224]">
                      Gentle Physical Settling
                    </h2>
                    <p className="text-sm text-[#3E3349] leading-relaxed">
                      Warm meals, hydration, rest, and medical supervision keep your body steady while
                      cravings pass. Nobody pushes intense lectures while you are exhausted.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-[#EDF6F3] space-y-2">
                    <p className="text-xs font-bold text-[#256358]">STEP 03 · WEEK 2 ONWARD</p>
                    <h2 className="font-serif text-xl font-semibold text-[#1A1224]">
                      Your Own Pace With Peer Community
                    </h2>
                    <p className="text-sm text-[#3E3349] leading-relaxed">
                      You help shape your weekly goals across Health, Home, Purpose, and Community—at
                      home with outpatient check-ins or residential care.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 1. HERO SECTION: "You don't have to do this alone." */}
      <section className="bg-gradient-to-br from-[#256358] via-[#1D4E46] to-[#163A34] text-[#FAF7F2] py-14 sm:py-20 border-b-4 border-[#D4AF37]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F3D79B]">
              Warm Support · Zero Judgement · Whole-Person Healing
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-semibold leading-[1.08]">
              You don't have to do this alone.
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/90 leading-relaxed max-w-2xl">
              Whether you are a person with a substance use disorder wondering where to begin,
              someone protecting early recovery, or a family member searching for calm next steps—you
              are met here with patience, science-backed guidance, and steady community across all 47
              Kenyan counties.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="#recovery-triage"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] rounded-lg transition-colors"
              >
                Where Are You Right Now?
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => navigate('/recovery/what-to-expect')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#FAF7F2] border border-[#F3D79B]/55 hover:bg-white/10 rounded-lg transition-colors"
              >
                Read What to Expect First
              </button>
            </div>
          </div>

          {/* Warm Photo of a Real Person in Recovery — Zero Distress Photos */}
          <div className="lg:col-span-5">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-[#D4AF37]/65 shadow-xl bg-[#143731]">
              <img
                src="/src/assets/images/recovery_hope_portrait_1794910602727.jpg"
                alt="Warm smiling Kenyan person sitting peacefully in a morning garden holding herbal tea in early recovery"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOUR TAPPABLE RECOVERY DIMENSIONS: HEALTH, HOME, PURPOSE, COMMUNITY */}
      <section aria-label="Four pillars of recovery support" className="py-14 sm:py-20 bg-white border-b border-[#256358]/15">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
              Four Pillars of Whole-Person Recovery · Kenya &amp; East/Central Africa
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1224]">
              Tap Any Pillar to View Local Support
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {RECOVERY_PILLARS.map((dim) => {
              const expanded = expandedDimensions.includes(dim.id);
              return (
                <div
                  key={dim.id}
                  className="bg-[#FAF7F2] border border-[#256358]/20 rounded-2xl overflow-hidden transition-shadow hover:shadow-sm"
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => toggleDimension(dim.id)}
                    className="w-full text-left p-6 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <span
                        style={{ backgroundColor: dim.accentHex }}
                        className="inline-block w-8 h-1.5 rounded-full"
                      />
                      <h3 className="font-serif text-2xl font-semibold text-[#1A1224]">
                        {dim.title}
                      </h3>
                      <p className="text-sm text-[#3E3349] leading-relaxed">{dim.subtitle}</p>
                    </div>
                    <span className="w-9 h-9 rounded-full bg-white border border-[#256358]/20 flex items-center justify-center shrink-0 text-[#256358]">
                      {expanded ? (
                        <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      )}
                    </span>
                  </button>

                  {expanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-[#256358]/12 space-y-3 bg-white">
                      {dim.resources.map((res) => (
                        <div
                          key={res.name}
                          className="p-3.5 rounded-xl bg-[#EDF6F3]/75 border border-[#256358]/15 space-y-1"
                        >
                          <p className="text-sm font-semibold text-[#1D4E46]">{res.name}</p>
                          <p className="text-xs text-[#3E3349] leading-relaxed">{res.detail}</p>
                          <p className="text-[11px] font-semibold text-[#7A5A10]">{res.contactNote}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. "WHERE ARE YOU RIGHT NOW?" 4-OPTION TRIAGE ROUTER */}
      <section
        id="recovery-triage"
        aria-label="Where are you right now triage tool"
        className="py-14 sm:py-20 bg-[#EDF6F3] border-b border-[#256358]/15"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5A10]">
              Gentle Next Steps · Select Your Moment
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1224]">
              Where are you right now?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRIAGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => navigate(opt.route)}
                className="text-left bg-white hover:bg-[#FDF6E2] border-2 border-[#256358]/20 hover:border-[#D4AF37] rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all shadow-sm"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#256358]">
                    {opt.tag}
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-[#1A1224]">{opt.label}</h3>
                  <p className="text-sm text-[#3E3349] leading-relaxed">{opt.tone}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A5A10]">
                  Open tailored guide
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PEER STORIES (3 REPRESENTATIVE PORTRAITS + WRITTEN STORIES ONLY) */}
      <section aria-label="Peer recovery stories" className="py-14 sm:py-20 bg-[#FAF7F2] border-b border-[#D4AF37]/25">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                Peer Voices · Written Community Write-Ups
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1224]">
                Honest Written Stories From People in Recovery &amp; Families
              </h2>
            </div>

            {/* Data Protection & Confidentiality Notice */}
            <div className="bg-[#EDF6F3] border border-[#256358]/25 rounded-xl px-4 py-3 max-w-md flex items-start gap-2.5 text-xs text-[#1D4E46] leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-[#256358] shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                <strong>Data Protection &amp; Identity Privacy:</strong> Portraits shown below are{' '}
                <strong>representative photographs—not the speakers’ actual faces</strong>—to
                safeguard peer confidentiality. All peer stories are shared cleanly in writing for
                private reading.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PEER_STORIES.map((story) => {
              const isExpanded = expandedStoryId === story.id;

              return (
                <article
                  key={story.id}
                  className="bg-white border border-[#256358]/20 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm"
                >
                  <div>
                    {/* Documentary Representative Portrait */}
                    <div className="relative aspect-[4/3] bg-[#1D4E46] overflow-hidden">
                      <img
                        src={story.imageUrl}
                        alt={story.imageAlt}
                        className="w-full h-full object-cover object-top"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-[#160822]/90 via-[#160822]/25 to-transparent"
                      />

                      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 text-[11px] font-semibold">
                        <span className="px-2.5 py-1 rounded bg-[#160822]/75 text-[#F3D79B]">
                          {story.county}
                        </span>
                        <span className="px-2.5 py-1 rounded bg-[#160822]/75 text-[#FAF7F2]">
                          {story.duration}
                        </span>
                      </div>

                      <div className="absolute bottom-3 inset-x-3 flex items-end justify-between gap-3">
                        <div className="text-[#FAF7F2]">
                          <p className="font-serif text-lg font-semibold leading-tight">
                            {story.name}
                          </p>
                          <p className="text-[10px] text-[#E5CA7B]">
                            Representative photo · Protected identity
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#160822]/80 text-[#E5CA7B] text-[11px] font-semibold">
                          <BookOpen className="w-3 h-3" aria-hidden="true" />
                          Written Story
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <h3 className="font-serif text-xl font-semibold text-[#1A1224] leading-snug">
                        {story.headline}
                      </h3>
                      <p className="text-sm text-[#3E3349] leading-relaxed">{story.summary}</p>
                    </div>

                    {isExpanded && (
                      <div className="tab-panel-smooth mx-5 mb-4 p-4 rounded-xl bg-[#EDF6F3] border border-[#256358]/20 space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#256358]">
                          Full Written Account
                        </p>
                        <p className="text-xs sm:text-sm leading-relaxed text-[#1A1224]">
                          “{story.transcript}”
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="px-5 pb-5 pt-2 border-t border-[#256358]/10">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedStoryId(isExpanded ? null : story.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#256358] hover:underline"
                    >
                      {isExpanded ? 'Hide full written story' : 'Read Full Written Story →'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FAMILY GUIDE TABS: WHAT TO SAY / WHAT NOT TO SAY / SUPPORTING WITHOUT ENABLING / COPING WITH A RETURN TO USE */}
      <section aria-label="Family guide for supporting someone in recovery" className="py-14 sm:py-20 bg-white border-b border-[#256358]/15">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5A10] inline-flex items-center gap-1.5">
              <Users className="w-4 h-4" aria-hidden="true" />
              Practical Family Guide
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1224]">
              Walking Gently Beside Someone You Love
            </h2>
          </div>

          <div role="tablist" aria-label="Family guidance sections" className="flex flex-wrap gap-2">
            {FAMILY_TABS.map((tab) => {
              const active = tab.id === activeFamilyTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveFamilyTab(tab.id)}
                  className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg border transition-colors ${
                    active
                      ? 'bg-[#256358] text-[#FAF7F2] border-[#256358]'
                      : 'bg-[#FAF7F2] text-[#1A1224] border-[#256358]/20 hover:bg-[#EDF6F3]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div
            key={activeFamilyTab}
            role="tabpanel"
            aria-label={activeFamilyContent.label}
            className="tab-panel-smooth bg-[#FAF7F2] border border-[#D4AF37]/45 rounded-2xl p-6 sm:p-8 space-y-5"
          >
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1224]">
              {activeFamilyContent.heading}
            </h3>
            <div className="space-y-4">
              {activeFamilyContent.points.map((pt) => (
                <div key={pt.lead} className="bg-white border border-[#256358]/15 rounded-xl p-4 space-y-1">
                  <p className="font-semibold text-sm sm:text-base text-[#1D4E46]">{pt.lead}</p>
                  <p className="text-sm text-[#3E3349] leading-relaxed">{pt.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. LOCAL RESOURCE MAP FILTERABLE BY TYPE & 47 KENYAN COUNTIES */}
      <section aria-label="Filterable local recovery resource map" className="py-14 sm:py-20 bg-[#EDF6F3]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#256358] inline-flex items-center gap-1.5">
                <Compass className="w-4 h-4" aria-hidden="true" />
                47-County Local Support Map
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1224]">
                Find Recovery Resources Filterable by Type &amp; County
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="text-xs font-semibold text-[#1A1224] flex items-center gap-2">
                <span>Region:</span>
                <select
                  aria-label="Filter recovery map by region"
                  value={mapRegionFilter}
                  onChange={(e) => {
                    const reg = e.target.value;
                    setMapRegionFilter(reg);
                    const match =
                      reg === 'All'
                        ? ALL_KENYA_COUNTIES[46]
                        : ALL_KENYA_COUNTIES.find((c) => c.region === reg);
                    if (match) setSelectedCounty(match.name);
                  }}
                  className="px-3 py-2 text-xs font-medium bg-white border border-[#256358]/25 rounded-md"
                >
                  <option value="All">All 47 Counties</option>
                  {KENYA_REGION_NAMES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-[#1A1224] flex items-center gap-2">
                <span>County:</span>
                <select
                  aria-label="Select Kenyan county on recovery map"
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  className="px-3 py-2 text-xs font-medium bg-white border border-[#256358]/25 rounded-md"
                >
                  {mapCounties.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.code} · {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Resource Type Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {RESOURCE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMapTypeFilter(type)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  mapTypeFilter === type
                    ? 'bg-[#D4AF37] text-[#160822] border-[#C79F27]'
                    : 'bg-white text-[#3E3349] border-[#256358]/15 hover:bg-[#FDF6E2]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Local Client-Only Interactive 47-County SVG Map */}
            <div className="lg:col-span-5 bg-[#1D4E46] rounded-2xl p-5 border-2 border-[#D4AF37]/50 text-[#FAF7F2] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F3D79B]">All 47 Counties Covered</span>
                <span className="tabular-nums text-[#9FD6C8]">
                  Selected: {activeCountyInfo.name} ({activeCountyInfo.code})
                </span>
              </div>
              <svg
                viewBox="0 0 420 360"
                role="img"
                aria-label="47 Counties Kenya Recovery Resource Map"
                className="w-full h-auto bg-[#153B35] rounded-xl p-2"
              >
                <path
                  d="M148 32 L255 24 L318 68 L374 176 L352 292 L292 332 L212 292 L126 244 L80 176 L96 102 Z"
                  fill="#215B52"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  strokeOpacity="0.65"
                />
                {mapCounties.map((c) => {
                  const isSel = c.name === activeCountyInfo.name;
                  return (
                    <g
                      key={c.code}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${c.name} County recovery resources`}
                      onClick={() => setSelectedCounty(c.name)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedCounty(c.name);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {isSel && (
                        <circle cx={c.mapX} cy={c.mapY} r="13" fill="#D4AF37" fillOpacity="0.35" />
                      )}
                      <circle
                        cx={c.mapX}
                        cy={c.mapY}
                        r={isSel ? '7' : '3.8'}
                        fill={isSel ? '#F8DF8C' : '#9FD6C8'}
                        stroke="#153B35"
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}
              </svg>
              <div className="p-3.5 rounded-xl bg-[#153B35] border border-[#D4AF37]/35 space-y-2 text-xs">
                <p className="font-semibold text-[#F8DF8C]">
                  {activeCountyInfo.facilityHubName}
                </p>
                <p className="text-[#FAF7F2]/85 leading-relaxed">
                  <strong>Address:</strong> {activeCountyInfo.physicalAddress}
                </p>
                <div className="flex flex-wrap gap-3 pt-0.5 font-semibold">
                  <a
                    href={`tel:${activeCountyInfo.facilityPhone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1 text-[#9FD6C8] hover:underline tabular-nums"
                  >
                    <PhoneCall className="w-3 h-3" aria-hidden="true" />
                    {activeCountyInfo.facilityPhone}
                  </a>
                  <a
                    href={`mailto:${activeCountyInfo.facilityEmail}`}
                    className="inline-flex items-center gap-1 text-[#F8DF8C] hover:underline"
                  >
                    <Mail className="w-3 h-3" aria-hidden="true" />
                    {activeCountyInfo.facilityEmail}
                  </a>
                </div>
                <div className="pt-1">
                  <a
                    href={activeCountyInfo.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] font-semibold transition-colors"
                  >
                    Visit {activeCountyInfo.name} Webpage
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>

            {/* Filtered Local Resource Cards */}
            <div className="lg:col-span-7 space-y-4">
              {filteredResources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white border border-[#256358]/20 rounded-xl p-5 space-y-3 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#256358] inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      {res.county} · {res.region}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-[#FDF6E2] text-[#7A5A10] font-semibold">
                      {res.type}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#1A1224]">{res.name}</h3>
                  <p className="text-sm text-[#3E3349] leading-relaxed">{res.description}</p>
                  <p className="text-xs font-medium text-[#256358]">{res.format}</p>
                  <div className="p-3 rounded-lg bg-[#EDF6F3]/80 border border-[#256358]/15 text-xs space-y-1.5 text-[#3E3349]">
                    <p>
                      <strong className="text-[#1D4E46]">Address:</strong> {res.physicalAddress}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5 font-semibold">
                      <div className="flex flex-wrap gap-4">
                        <a
                          href={`tel:${res.phone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1 text-[#256358] hover:underline tabular-nums"
                        >
                          <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                          {res.phone}
                        </a>
                        <a
                          href={`mailto:${res.email}`}
                          className="inline-flex items-center gap-1 text-[#3B155F] hover:underline"
                        >
                          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                          {res.email}
                        </a>
                      </div>
                      <a
                        href={res.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#7A5A10] hover:underline"
                      >
                        Visit Webpage
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional East & Central Africa Helpline Corridor */}
          <div className="bg-white border border-[#256358]/20 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#256358]/10 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                  Launching in Kenya · East &amp; Central Africa Phase-2 Corridor
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1A1224]">
                  Regional Mental Health &amp; Substance Support Numbers
                </h3>
              </div>
              <span className="text-xs font-medium text-[#7A5A10] bg-[#FDF6E2] px-3 py-1 rounded-md self-start sm:self-center">
                Kenya Live · Pan-African Roadmap
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#EDF6F3] space-y-1">
                <p className="font-bold text-[#1D4E46]">Kenya (Active Hub)</p>
                <p className="text-[#3E3349]">
                  <strong>1192</strong> NACADA · <strong>1199</strong> Red Cross ·{' '}
                  <strong>+254 722 178 177</strong> Befrienders · <strong>116</strong> Childline
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#256358]/15 space-y-1">
                <p className="font-bold text-[#1E0B2B]">Uganda (East Africa)</p>
                <p className="text-[#3E3349]">
                  <strong>0800 21 21 21</strong> Mental Health Uganda · <strong>116</strong> Child Helpline
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#256358]/15 space-y-1">
                <p className="font-bold text-[#1E0B2B]">Rwanda &amp; Tanzania</p>
                <p className="text-[#3E3349]">
                  Rwanda: <strong>114 / 3029</strong> (RBC / Isange) · Tanzania:{' '}
                  <strong>116</strong> National Helpline
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#256358]/15 space-y-1">
                <p className="font-bold text-[#1E0B2B]">Central Africa &amp; Wider Continent</p>
                <p className="text-[#3E3349]">
                  Cross-border referral coordination via <strong>care@hisandhers.org</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#D4AF37]/45 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#7A5A10] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-[#3E3349]">
                Want to walk through how day-one care actually works in simple everyday words?
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/recovery/what-to-expect')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#256358] text-[#FAF7F2] hover:bg-[#1D4E46] whitespace-nowrap shrink-0"
            >
              Read What to Expect →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
