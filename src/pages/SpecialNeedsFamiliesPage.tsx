import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import type { HouseholdStructureType, SpecialNeedsFamilyRequest } from '../shared/types';
import { calculateSpecialNeedsSupportPlan } from '../utils/careTools';
import { ALL_KENYA_COUNTIES, findKenyaCounty } from '../utils/kenyaCounties';
import { validateSpecialNeedsSupport } from '../utils/validation';

const HOUSEHOLD_OPTIONS: HouseholdStructureType[] = [
  'Single Mother Household',
  'Single Father / Sole Guardian',
  'Two-Parent Family',
  'Grandparent / Kinship Guardian',
  'Foster / Community Caregiver',
];

const DISABILITY_FOCUSES = [
  'Autism, Speech & Developmental Support',
  'Physical Disability / Cerebral Palsy / Spina Bifida',
  'Deaf or Hard-of-Hearing Support',
  'Blind or Low-Vision Support',
  'Intellectual or Multiple Disabilities',
  'Rare Condition / Chronic Pediatric Care',
];

const PRACTICAL_NEEDS_CHECKLIST = [
  'Respite Caregiver Hours & Emergency Backup',
  'Maize Flour, Hygiene & Diaper Cushion Pack',
  'Physiotherapy / Speech / Mobility Aid Co-Pay',
  'NCPWD Disability Card & SHA / EARS Assessment Guide',
  'Inclusive School Matching & Bursary Bridge',
  'Weekly Mother-to-Mother Phone Check-In',
];

const GUARDIAN_CIRCLES_NOTES = [
  {
    id: 'mama-ruiru',
    title: '“When people see my son, they rarely ask how I slept.”',
    speaker: 'Grace W., Single Mother · Ruiru, Kiambu',
    story:
      'For three years I carried my boy on my back between public matatus and clinic queues while selling vegetables in the evening. When a volunteer from His & Hers Circle of Hope sat with me on our verandah, brought two packs of unga and adult-sized diapers, and stayed two hours so I could finally wash and nap uninterrupted, the isolation broke. You don’t just need advice—you need someone who listens to the mother first.',
  },
  {
    id: 'two-parent-nakuru',
    title: '“Walking together as father and mother without hiding our daughter.”',
    speaker: 'Samuel & Beatrice M., Parents · Nakuru County',
    story:
      'Extended relatives whispered blame when our daughter needed leg braces and speech support. Sitting in a mothers-and-guardians tea table helped both of us speak openly, link directly to EARS assessment officers, and find a welcoming inclusive primary school without paying middlemen.',
  },
  {
    id: 'grandmother-kisumu',
    title: '“Stepping in as a grandmother needs real village hands beside you.”',
    speaker: 'Mama Mary A., Kinship Guardian · Kisumu',
    story:
      'Raising my seven-year-old grandson with epilepsy and mobility needs at sixty-four felt overwhelming until the Circle connected me with local physiotherapy check-ins and monthly food parcels alongside my neighbours.',
  },
];

export function SpecialNeedsFamiliesPage() {
  const { data } = useSiteData();
  const guardianDesk = useMemo(
    () =>
      data?.administrators?.find((a) => a.id === 'adm-desk-5') ||
      data?.administrators?.find((a) => a.routingHref === '/special-needs-families') ||
      data?.administrators?.[0],
    [data?.administrators]
  );

  const [pathwayTab, setPathwayTab] = useState<'single-parent' | 'two-parent'>('single-parent');

  // Interactive Estimator state
  const [estHousehold, setEstHousehold] = useState<HouseholdStructureType>(
    'Single Mother Household'
  );
  const [estFocus, setEstFocus] = useState(DISABILITY_FOCUSES[0]);
  const [estDependants, setEstDependants] = useState(1);

  const plan = useMemo(
    () => calculateSpecialNeedsSupportPlan(estHousehold, estFocus, estDependants),
    [estHousehold, estFocus, estDependants]
  );

  // Inclusive Schools across 47 counties
  const specialSchools = useMemo(
    () =>
      (data?.childrensHomes || []).filter(
        (h) => h.institutionType === 'School for Differently Abled'
      ),
    [data?.childrensHomes]
  );
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolCountyFilter, setSchoolCountyFilter] = useState('All');

  const filteredSchools = useMemo(() => {
    const q = schoolQuery.trim().toLowerCase();
    return specialSchools.filter((s) => {
      const countyOk =
        schoolCountyFilter === 'All' ||
        s.countyRegion.toLowerCase().includes(schoolCountyFilter.toLowerCase());
      if (!countyOk) return false;
      if (!q) return true;
      return `${s.name} ${s.countyRegion} ${s.townArea} ${s.specialization || ''} ${s.description}`
        .toLowerCase()
        .includes(q);
    });
  }, [specialSchools, schoolCountyFilter, schoolQuery]);

  // Direct Mother / Guardian Conversation Form state
  const [guardianName, setGuardianName] = useState('');
  const [householdStructure, setHouseholdStructure] = useState<HouseholdStructureType>(
    'Single Mother Household'
  );
  const [phoneOrWhatsapp, setPhoneOrWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] =
    useState<SpecialNeedsFamilyRequest['preferredContactMethod']>(
      'Phone Call With Mother/Guardian Lead'
    );
  const [county, setCounty] = useState('Kiambu');
  const [townWard, setTownWard] = useState('');
  const [childAgeGroup, setChildAgeGroup] = useState('Early Childhood (Ages 0–5)');
  const [disabilityFocus, setDisabilityFocus] = useState(DISABILITY_FOCUSES[0]);
  const [practicalNeeds, setPracticalNeeds] = useState<string[]>([
    'Maize Flour, Hygiene & Diaper Cushion Pack',
    'Weekly Mother-to-Mother Phone Check-In',
  ]);
  const [storyMessage, setStoryMessage] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [confirmationMsg, setConfirmationMsg] = useState('');

  const selectedCountyHub = useMemo(() => findKenyaCounty(county), [county]);

  const toggleNeed = (need: string) => {
    setPracticalNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const applyEstimatorToForm = () => {
    setHouseholdStructure(estHousehold);
    setDisabilityFocus(estFocus);
    const mergedNeeds = Array.from(new Set([...practicalNeeds, ...plan.suggestedNeeds])).slice(
      0,
      6
    );
    setPracticalNeeds(mergedNeeds);
    if (!storyMessage.trim()) {
      setStoryMessage(
        `I am writing as a ${estHousehold.toLowerCase()} caring for ${estDependants} child(ren) needing ${estFocus.toLowerCase()}. Please connect me directly with the Mother & Guardian Care Lead for a gentle conversation about respite and support packs.`
      );
    }
    const target = document.getElementById('guardian-conversation-form');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setServerError('');

    const check = validateSpecialNeedsSupport({
      guardianName,
      householdStructure,
      phoneOrWhatsapp,
      email,
      preferredContactMethod,
      county,
      townWard,
      childAgeGroup,
      disabilityFocus,
      practicalNeeds,
      storyMessage,
      consentAccepted,
      website_url: honeypot,
    });

    if (!check.valid) {
      setFieldErrors(check.errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/special-needs-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianName,
          householdStructure,
          phoneOrWhatsapp,
          email,
          preferredContactMethod,
          county,
          townWard,
          childAgeGroup,
          disabilityFocus,
          practicalNeeds,
          storyMessage,
          consentAccepted,
          website_url: honeypot,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.errors) setFieldErrors(json.errors);
        setServerError(json.error || 'Could not send your note right now. Please try again.');
        return;
      }
      setConfirmationMsg(
        json.message ||
          'Thank you. Our Mother & Guardian Care Lead will contact you personally in confidence.'
      );
      setGuardianName('');
      setPhoneOrWhatsapp('');
      setEmail('');
      setTownWard('');
      setStoryMessage('');
      setConsentAccepted(false);
    } catch {
      setServerError('Connection interrupted. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2]">
      {/* Hero Banner — Speaking directly to Mothers & Guardians */}
      <section className="relative bg-gradient-to-br from-[#1E0B2B] via-[#3B155F] to-[#256358] text-[#FAF7F2] py-16 lg:py-22 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#D4AF37]/12 blur-3xl pointer-events-none"
        />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#F5D67B]">
              Special Needs Kids &amp; Families · Single-Parent &amp; Two-Parent Support
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.08]">
              And how are you doing, Mama? You never have to carry this alone.
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/88 leading-relaxed">
              Whether you are a single mother, a sole father or grandmother carrying every
              clinic appointment on your own shoulders, or a two-parent household navigating
              daily care and schooling—His &amp; Hers Circle of Hope walks beside you directly.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#guardian-conversation-form"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#1E0B2B] bg-[#F5D67B] hover:bg-[#D4AF37] rounded-md transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Speak With Our Mother &amp; Guardian Lead
              </a>
              <a
                href="#family-support-estimator"
                className="inline-flex items-center px-5 py-3 text-sm font-semibold text-[#FAF7F2] border border-[#FAF7F2]/35 hover:bg-white/10 rounded-md transition-colors"
              >
                Estimate Family Support Kit
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <figure className="rounded-lg overflow-hidden border border-[#F5D67B]/35 shadow-xl bg-[#160822]">
              <SafeImage
                src="/src/assets/images/special_needs_mother_care_1795102206738.jpg"
                alt="Kenyan mother seated affectionately beside her smiling young child in wooden supportive chair with bright sensory blocks outdoors"
                className="w-full aspect-[4/3] object-cover"
              />
              <figcaption className="px-5 py-3.5 text-xs text-[#FAF7F2]/82 bg-[#160822]/90 leading-relaxed">
                Rooted in Ruiru since 2025: walking with single mothers, sole guardians, and
                two-parent families raising differently abled children across all 47 Kenyan counties.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Direct Connection to the Mother / Guardian in Charge */}
      <section className="py-14 lg:py-18 border-b border-[#3B155F]/10 bg-[#F4EFE6]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
              A Direct Word to the Mother or Guardian in Charge
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Speak straight to a fellow mother and coordinator—not a cold bureaucracy
            </h2>
            <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
              Raising a child or adult dependant with cerebral palsy, autism, Down syndrome, hearing
              or visual differences, or multiple medical needs takes quiet heroism. Neighbours
              often mean well, yet shy away because they do not know what to say. We started this
              hub so the mother or guardian carrying day-to-day care has a warm, direct line to
              sister-to-sister check-ins, real household relief, and trusted Kenyan pathways.
            </p>

            {/* Direct Guardian Lead Contact Box */}
            {guardianDesk && (
              <div className="p-5 bg-[#FAF7F2] rounded-lg border border-[#D4AF37]/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C2593F]">
                      {guardianDesk.deskCode} · {guardianDesk.department}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-[#1E0B2B]">
                      {guardianDesk.roleTitle}
                    </h3>
                  </div>
                  <span className="text-xs font-medium text-[#256358]">
                    {guardianDesk.officeHours}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#3E3349] leading-relaxed">
                  {guardianDesk.focusSummary}
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href={`tel:${(guardianDesk.phone || '+254700000000').replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#3B155F] text-[#FAF7F2] hover:bg-[#2C1042] rounded-md transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Desk ({guardianDesk.phone})
                  </a>
                  {guardianDesk.whatsapp && (
                    <a
                      href={`https://wa.me/${guardianDesk.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Habari His & Hers Circle of Hope, I am a parent/guardian raising a child with special needs and would like to talk.')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#256358] text-[#FAF7F2] hover:bg-[#1E4F47] rounded-md transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp Mothers Lead
                    </a>
                  )}
                  <a
                    href={`mailto:${guardianDesk.email}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-[#3B155F]/25 text-[#1E0B2B] hover:bg-white rounded-md transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {guardianDesk.email}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div className="rounded-lg overflow-hidden border border-[#3B155F]/15 shadow-sm bg-white">
              <SafeImage
                src="/src/assets/images/mothers_support_circle_1795102208113.jpg"
                alt="Kenyan mothers seated together around an outdoor garden table over tea speaking openly and encouraging one another"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>

            <div className="space-y-3">
              {GUARDIAN_CIRCLES_NOTES.map((item) => (
                <article
                  key={item.id}
                  className="p-4 bg-[#FAF7F2] rounded-lg border border-[#3B155F]/10 space-y-1.5"
                >
                  <h3 className="font-display text-lg font-semibold text-[#1E0B2B]">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#C2593F]">{item.speaker}</p>
                  <p className="text-xs sm:text-sm text-[#3E3349] leading-relaxed">
                    {item.story}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Single-Parent vs Two-Parent Tailored Pathways */}
      <section className="py-14 lg:py-18 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#3B155F]/12">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
              Tailored to Your Real Household Structure
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Single-Parent / Sole Guardians &amp; Standard Two-Parent Families
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Household family pathway tabs"
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              role="tab"
              aria-selected={pathwayTab === 'single-parent'}
              onClick={() => setPathwayTab('single-parent')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                pathwayTab === 'single-parent'
                  ? 'bg-[#3B155F] text-[#FAF7F2] shadow-sm'
                  : 'bg-[#F4EFE6] text-[#1E0B2B] hover:bg-[#E7DFF1]'
              }`}
            >
              Single Mothers &amp; Sole Guardians
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={pathwayTab === 'two-parent'}
              onClick={() => setPathwayTab('two-parent')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                pathwayTab === 'two-parent'
                  ? 'bg-[#256358] text-[#FAF7F2] shadow-sm'
                  : 'bg-[#F4EFE6] text-[#1E0B2B] hover:bg-[#E4EEEB]'
              }`}
            >
              Standard Two-Parent &amp; Extended Homes
            </button>
          </div>
        </div>

        <div key={pathwayTab} className="tab-panel-smooth pt-8">
          {pathwayTab === 'single-parent' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-lg border border-[#3B155F]/12 space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C2593F]">
                  01 · Practical Respite &amp; Backup
                </span>
                <h3 className="font-display text-2xl font-semibold text-[#1E0B2B]">
                  Trained Relief When You Work or Rest
                </h3>
                <p className="text-sm text-[#3E3349] leading-relaxed">
                  Single mothers, sole fathers, and grandmothers cannot drop everything when fever
                  strikes or an errand takes four hours. We help pair vetted community carers for
                  supervised respite hours so the sole guardian can sleep, work, or attend medical
                  reviews safely.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg border border-[#3B155F]/12 space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C2593F]">
                  02 · Pantry &amp; Dignity Cushioning
                </span>
                <h3 className="font-display text-2xl font-semibold text-[#1E0B2B]">
                  One-Income Relief Bundles
                </h3>
                <p className="text-sm text-[#3E3349] leading-relaxed">
                  Ongoing maize flour, rice, cooking oil, warm blankets, and high-need hygiene or
                  adult-size diaper packs delivered discreetly so no single mother chooses between
                  food and physiotherapy transport fare.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg border border-[#3B155F]/12 space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C2593F]">
                  03 · Legal, School &amp; Clinic Advocacy
                </span>
                <h3 className="font-display text-2xl font-semibold text-[#1E0B2B]">
                  Accompaniment Without Shame
                </h3>
                <p className="text-sm text-[#3E3349] leading-relaxed">
                  Step-by-step accompaniment through County EARS education assessment, NCPWD
                  disability registration (tax exemption &amp; cash-transfer guidance), and
                  stigma-free inclusive school admissions across Kenya.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-lg border border-[#256358]/20 space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                  01 · Protecting Both Parents
                </span>
                <h3 className="font-display text-2xl font-semibold text-[#1E0B2B]">
                  Preventing Quiet Home Exhaustion
                </h3>
                <p className="text-sm text-[#3E3349] leading-relaxed">
                  Even two-parent households often split into silent exhaustion—one working long
                  shifts while the mother or primary caregiver carries endless daily therapy. Our
                  counsellors walk alongside both partners so hope and marriage stay steady.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg border border-[#256358]/20 space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                  02 · Siblings &amp; Extended Family
                </span>
                <h3 className="font-display text-2xl font-semibold text-[#1E0B2B]">
                  Belonging for Brothers &amp; Sisters
                </h3>
                <p className="text-sm text-[#3E3349] leading-relaxed">
                  Siblings growing up alongside a brother or sister with high support needs also
                  need space to play, ask honest questions, and join inclusive youth circles and
                  Christmas of Hope gatherings without feeling overlooked.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg border border-[#256358]/20 space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                  03 · Shared Referral &amp; Care Planning
                </span>
                <h3 className="font-display text-2xl font-semibold text-[#1E0B2B]">
                  Therapy, Assistive Devices &amp; SHA
                </h3>
                <p className="text-sm text-[#3E3349] leading-relaxed">
                  Practical guidance connecting families to vetted occupational therapists, speech
                  clinics, mobility chairs, Braille/KSL schools across 47 counties, and NCPWD + SHA
                  benefit navigation.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Household Care & Support Kit Estimator */}
      <section
        id="family-support-estimator"
        className="py-14 lg:py-18 bg-[#F4EFE6] border-y border-[#3B155F]/10"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
              Interactive Household Support Planner
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Build a Realistic Care Plan Around Your Household
            </h2>
            <p className="text-sm text-[#3E3349] leading-relaxed">
              Select whether you are carrying care as a single mother, sole guardian, or two-parent
              family to see suggested monthly respite hours, pantry bundles, and Kenyan registration
              steps you can send straight to our Mother &amp; Guardian Lead.
            </p>
            <div className="rounded-lg overflow-hidden border border-[#3B155F]/15 bg-white">
              <SafeImage
                src="/src/assets/images/doc_asd_family_moment_1794832339166.jpg"
                alt="Kenyan parent and young child playing calmly together with learning toys in a sunlit community care courtyard"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#FAF7F2] rounded-lg border border-[#3B155F]/15 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="est-household"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
                >
                  Household Structure
                </label>
                <select
                  id="est-household"
                  value={estHousehold}
                  onChange={(e) => setEstHousehold(e.target.value as HouseholdStructureType)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#3B155F]/20 rounded-md text-[#1A1224]"
                >
                  {HOUSEHOLD_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="est-dependants"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
                >
                  Children / Dependants With Special Needs
                </label>
                <input
                  id="est-dependants"
                  type="number"
                  min={1}
                  max={8}
                  value={estDependants}
                  onChange={(e) => setEstDependants(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#3B155F]/20 rounded-md text-[#1A1224] tabular-nums"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="est-focus"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
              >
                Primary Disability or Care Need
              </label>
              <select
                id="est-focus"
                value={estFocus}
                onChange={(e) => setEstFocus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#3B155F]/20 rounded-md text-[#1A1224]"
              >
                {DISABILITY_FOCUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-white rounded-md border border-[#D4AF37]/35">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7A5A10]">
                  Monthly Respite Target
                </p>
                <p className="font-display text-3xl font-semibold text-[#1E0B2B] tabular-nums mt-1">
                  {plan.monthlyRespiteHours} hrs
                </p>
              </div>
              <div className="p-4 bg-white rounded-md border border-[#D4AF37]/35">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C2593F]">
                  Pantry &amp; Hygiene Packs
                </p>
                <p className="font-display text-3xl font-semibold text-[#1E0B2B] tabular-nums mt-1">
                  {plan.pantryAndCareBundles} / mo
                </p>
              </div>
              <div className="p-4 bg-white rounded-md border border-[#D4AF37]/35">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#256358]">
                  Care Kit Benchmark
                </p>
                <p className="font-display text-3xl font-semibold text-[#1E0B2B] tabular-nums mt-1">
                  KES {plan.estimatedMonthlySupportKes.toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#3E3349] leading-relaxed bg-[#E7DFF1]/45 p-4 rounded-md">
              {plan.guidanceNote}
            </p>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1E0B2B]">
                Included Priority Pathways:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-[#3E3349]">
                {plan.suggestedNeeds.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={applyEstimatorToForm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md transition-colors"
            >
              Use This Plan to Message Our Mother &amp; Guardian Lead →
            </button>
          </div>
        </div>
      </section>

      {/* 47-County Inclusive Schools Directory */}
      <section className="py-14 lg:py-18 max-w-7xl mx-auto px-5 sm:px-8 border-b border-[#3B155F]/10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#256358]">
              47-County Educational Assessment &amp; School Links
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Schools for Differently Abled Children Across Kenya
            </h2>
            <p className="text-sm text-[#3E3349] leading-relaxed">
              Every county also holds Ministry of Education EARS assessment desks. Search vetted
              Kenyan special schools or visit our Children’s Homes directory to plan a family check
              or group CSR support visit.
            </p>
          </div>
          <AppLink
            href="/home-visits"
            className="text-sm font-semibold text-[#3B155F] hover:text-[#C2593F] transition-colors shrink-0"
          >
            View All Homes &amp; Schools Directory →
          </AppLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-[#665B73] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={schoolQuery}
              onChange={(e) => setSchoolQuery(e.target.value)}
              placeholder="Search school name, Braille, Sign Language, cerebral palsy..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#3B155F]/20 rounded-md text-[#1A1224]"
            />
          </div>
          <select
            aria-label="Filter schools by county"
            value={schoolCountyFilter}
            onChange={(e) => setSchoolCountyFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#3B155F]/20 rounded-md text-[#1A1224]"
          >
            <option value="All">All 47 Counties ({specialSchools.length} Highlighted Schools)</option>
            {ALL_KENYA_COUNTIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} County ({c.region})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.slice(0, 6).map((school) => (
            <article
              key={school.id}
              className="bg-white rounded-lg border border-[#3B155F]/12 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <SafeImage
                  src={school.imageUrl}
                  alt={school.imageAlt}
                  className="w-full aspect-[16/10] object-cover"
                />
                <div className="p-5 space-y-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#256358]">
                    {school.countyRegion} County · {school.townArea}
                  </p>
                  <h3 className="font-display text-xl font-semibold text-[#1E0B2B] leading-snug">
                    {school.name}
                  </h3>
                  {school.specialization && (
                    <p className="text-xs font-medium text-[#7A5A10]">{school.specialization}</p>
                  )}
                  <p className="text-xs sm:text-sm text-[#3E3349] leading-relaxed">
                    {school.description}
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-3 border-t border-[#3B155F]/10 space-y-1.5 text-xs text-[#3E3349]">
                {school.physicalAddress && (
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C2593F] shrink-0 mt-0.5" />
                    <span>{school.physicalAddress}</span>
                  </p>
                )}
                {school.contactPhone && (
                  <p className="flex items-center gap-1.5 tabular-nums">
                    <Phone className="w-3.5 h-3.5 text-[#3B155F] shrink-0" />
                    <a
                      href={`tel:${school.contactPhone.replace(/\s+/g, '')}`}
                      className="hover:underline"
                    >
                      {school.contactPhone}
                    </a>
                  </p>
                )}
                {school.websiteUrl && (
                  <p className="pt-1">
                    <a
                      href={school.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#3B155F] hover:text-[#C2593F]"
                    >
                      County / School Webpage
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        {filteredSchools.length === 0 && (
          <div className="p-6 bg-[#F4EFE6] rounded-lg border border-[#3B155F]/15 text-sm text-[#3E3349] space-y-2">
            <p className="font-semibold text-[#1E0B2B]">
              {schoolCountyFilter !== 'All'
                ? `${schoolCountyFilter} County Inclusive Care & EARS Hub`
                : 'No matching schools in your filter right now.'}
            </p>
            <p>
              Our {selectedCountyHub.name} Care Corridor desk ({selectedCountyHub.physicalAddress} ·{' '}
              {selectedCountyHub.facilityPhone}) connects guardians directly to County EARS
              assessment offices and neighbouring residential special schools. Use the conversation
              form below and select <strong>{selectedCountyHub.name}</strong>.
            </p>
          </div>
        )}
      </section>

      {/* Direct Mother & Guardian Conversation Form */}
      <section id="guardian-conversation-form" className="py-14 lg:py-20 bg-[#FAF7F2]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="bg-white rounded-xl border border-[#D4AF37]/40 shadow-sm p-6 sm:p-10 space-y-6">
            <div className="space-y-2 border-b border-[#3B155F]/10 pb-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C2593F]">
                <HeartHandshake className="w-4 h-4" />
                Direct Mother &amp; Guardian Conversation Desk
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Talk Directly to the Mother &amp; Guardian Care Lead
              </h2>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                Tell us plainly whether you are raising a special needs child as a single mother,
                sole father, grandparent, or two-parent family. This message goes straight to our
                Mother &amp; Guardian Care Desk so someone who understands answers personally.
              </p>
            </div>

            {confirmationMsg ? (
              <div className="p-6 bg-[#E4EEEB] rounded-lg border border-[#256358]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#256358] font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  Note Received Privately
                </div>
                <p className="text-sm text-[#1E0B2B] leading-relaxed">{confirmationMsg}</p>
                <button
                  type="button"
                  onClick={() => setConfirmationMsg('')}
                  className="text-xs font-semibold text-[#3B155F] underline underline-offset-4"
                >
                  Send another family note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="snf-honeypot">Website</label>
                  <input
                    id="snf-honeypot"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {serverError && (
                  <p
                    role="alert"
                    className="p-3.5 text-sm bg-rose-50 text-rose-800 border border-rose-200 rounded-md"
                  >
                    {serverError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="snf-guardian-name"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
                    >
                      Mother / Father / Guardian Name *
                    </label>
                    <input
                      id="snf-guardian-name"
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Mama Joy Wanjiku / David Ochieng"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1A1224]"
                    />
                    {fieldErrors.guardianName && (
                      <p className="text-xs text-rose-700 mt-1">{fieldErrors.guardianName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="snf-household"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
                    >
                      Your Household Structure *
                    </label>
                    <select
                      id="snf-household"
                      value={householdStructure}
                      onChange={(e) =>
                        setHouseholdStructure(e.target.value as HouseholdStructureType)
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1A1224]"
                    >
                      {HOUSEHOLD_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="snf-phone"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
                    >
                      Phone or WhatsApp Number *
                    </label>
                    <input
                      id="snf-phone"
                      type="tel"
                      value={phoneOrWhatsapp}
                      onChange={(e) => setPhoneOrWhatsapp(e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1A1224]"
                    />
                    {fieldErrors.phoneOrWhatsapp && (
                      <p className="text-xs text-rose-700 mt-1">{fieldErrors.phoneOrWhatsapp}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="snf-contact-method"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
                    >
                      How Should We Talk With You?
                    </label>
                    <select
                      id="snf-contact-method"
                      value={preferredContactMethod}
                      onChange={(e) =>
                        setPreferredContactMethod(
                          e.target.value as SpecialNeedsFamilyRequest['preferredContactMethod']
                        )
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1A1224]"
                    >
                      <option value="Phone Call With Mother/Guardian Lead">
                        Phone Call With Mother/Guardian Lead
                      </option>
                      <option value="WhatsApp Chat">WhatsApp Chat</option>
                      <option value="Mothers Support Tea Circle">Mothers Support Tea Circle</option>
                      <option value="Home Visit in Ward">Home Visit in Ward</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="snf-county"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
                    >
                      County (All 47 Counties) *
                    </label>
                    <select
                      id="snf-county"
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1A1224]"
                    >
                      {ALL_KENYA_COUNTIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.county && (
                      <p className="text-xs text-rose-700 mt-1">{fieldErrors.county}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="snf-ward"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
                    >
                      Ward / Estate / Town
                    </label>
                    <input
                      id="snf-ward"
                      type="text"
                      value={townWard}
                      onChange={(e) => setTownWard(e.target.value)}
                      placeholder="e.g. Ruiru / Membley / Githurai"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1A1224]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="snf-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
                    >
                      Email (Optional)
                    </label>
                    <input
                      id="snf-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="optional@example.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1A1224]"
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-rose-700 mt-1">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="snf-age"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
                    >
                      Child / Dependant Age Group
                    </label>
                    <select
                      id="snf-age"
                      value={childAgeGroup}
                      onChange={(e) => setChildAgeGroup(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1A1224]"
                    >
                      <option value="Early Childhood (Ages 0–5)">Early Childhood (Ages 0–5)</option>
                      <option value="Primary School (Ages 6–12)">Primary School (Ages 6–12)</option>
                      <option value="Adolescent / Teen (Ages 13–18)">
                        Adolescent / Teen (Ages 13–18)
                      </option>
                      <option value="Adult Dependant (18+)">Adult Dependant (18+)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="snf-focus"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
                    >
                      Disability / Support Focus
                    </label>
                    <select
                      id="snf-focus"
                      value={disabilityFocus}
                      onChange={(e) => setDisabilityFocus(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1A1224]"
                    >
                      {DISABILITY_FOCUSES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-2">
                    What Would Lighten Your Week Right Now? (Select any)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PRACTICAL_NEEDS_CHECKLIST.map((need) => {
                      const checked = practicalNeeds.includes(need);
                      return (
                        <label
                          key={need}
                          className={`flex items-start gap-2.5 p-3 rounded-md border text-xs sm:text-sm cursor-pointer transition-colors ${
                            checked
                              ? 'bg-[#F3EEF8] border-[#3B155F]/40 text-[#1E0B2B] font-medium'
                              : 'bg-[#FAF7F2] border-[#3B155F]/15 text-[#3E3349]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleNeed(need)}
                            className="mt-0.5 accent-[#3B155F]"
                          />
                          <span>{need}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="snf-story"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1.5"
                  >
                    Tell Our Mother &amp; Guardian Lead How You &amp; Your Child Are Doing *
                  </label>
                  <textarea
                    id="snf-story"
                    rows={4}
                    value={storyMessage}
                    onChange={(e) => setStoryMessage(e.target.value)}
                    placeholder="Share honestly about daily care, schooling hurdles, food/diaper needs, or simply when you want a gentle call."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1A1224]"
                  />
                  {fieldErrors.storyMessage && (
                    <p className="text-xs text-rose-700 mt-1">{fieldErrors.storyMessage}</p>
                  )}
                </div>

                <label className="flex items-start gap-2.5 text-xs sm:text-sm text-[#3E3349] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="mt-1 accent-[#3B155F]"
                  />
                  <span>
                    I consent to His &amp; Hers Circle of Hope’s Mother &amp; Guardian Care Lead
                    receiving my note privately so someone can call, WhatsApp, or visit warmly.
                  </span>
                </label>
                {fieldErrors.consentAccepted && (
                  <p className="text-xs text-rose-700">{fieldErrors.consentAccepted}</p>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] disabled:opacity-60 rounded-md transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    {submitting
                      ? 'Sending Note to Mother & Guardian Lead...'
                      : 'Send Note to Mother & Guardian Lead'}
                  </button>
                  <AppLink
                    href="/mental-health"
                    className="text-xs sm:text-sm font-semibold text-[#256358] hover:underline"
                  >
                    Also need Trauma &amp; Caregiver Burnout support? Visit Mental Health Desk →
                  </AppLink>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
