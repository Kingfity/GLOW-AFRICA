import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  Download,
  Globe2,
  HeartHandshake,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import { useAuth } from '../context/AuthContext';
import { AppLink } from '../context/RouterContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ALL_KENYA_COUNTIES } from '../utils/kenyaCounties';

const FUNDING_WINDOWS = [
  {
    id: 'win-care-bundles',
    code: 'WINDOW 01 · CAREGIVER RELIEF',
    title: 'Single-Mother & Kinship Caregiver Respite + Unga Cushioning',
    allocationTarget: '$15,000 – $50,000 / Annual Cohort',
    outcomes: [
      'Direct monthly maize flour, hygiene, and adult-size diaper relief packs across priority wards.',
      'Supervised neighbour-trained respite hours enabling sole mothers to rest, farm, or trade.',
      'Direct zero-middleman accompaniment to NCPWD disability registration and SHA healthcare cover.',
    ],
  },
  {
    id: 'win-47-county-desks',
    code: 'WINDOW 02 · 47-COUNTY INFRASTRUCTURE',
    title: 'Special Needs Schools, EARC Assessment & Therapy Equipment Bridges',
    allocationTarget: '$25,000 – $100,000 / Regional Scale-Up',
    outcomes: [
      'Low-cost locally crafted wooden corner chairs, bolsters, Braille kits, and Sign-Language flashpacks.',
      'Rapid warm linkage to Ministry of Education EARC offices and inclusive public schools in all 47 counties.',
      'Volunteer-supported clinic fare stipends for rural guardians attending hospital physiotherapy reviews.',
    ],
  },
  {
    id: 'win-christmas-feast',
    code: 'WINDOW 03 · ELDERS & YOUTH SOLIDARITY',
    title: 'Ruiru Elder Warm Blankets, Ruiru Boys Staples & Nov 28 Christmas of Hope',
    allocationTarget: '$5,000 – $25,000 / Seasonal Fellowship Grant',
    outcomes: [
      'Sustained blanket, meal, and winter companionship rounds for elders living alone across Ruiru wards.',
      'Annual November 28 Thanksgiving Feast & Christmas of Hope take-home family staples.',
      'Youth solidarity meals and mentorship supplies for student homes including Ruiru Boys.',
    ],
  },
  {
    id: 'win-safeguarding',
    code: 'WINDOW 04 · ZERO-TRACKING PROTECTION',
    title: 'Privacy-Hardened Safe Refuge & Trauma Counselling Expansion',
    allocationTarget: '$10,000 – $60,000 / Protection Endowment',
    outcomes: [
      'Confidential trauma-informed counselling and discreet safe-refuge bus-fare & shelter stabilization.',
      'Maintain zero-telemetry privacy rooms (/gbv & /recovery) protecting vulnerable survivors digitally.',
      '47-county rapid liaison training linking parish/ward stewards to Children’s Officers & Gender Desks.',
    ],
  },
];

const CONCEPT_NOTE_TEXT = [
  'HIS & HERS CIRCLE OF HOPE — INSTITUTIONAL PARTNER & PHILANTHROPIC GRANT CONCEPT NOTE (2025–2027)',
  '====================================================================================================',
  'Legal Identity: Community-Based Organization (CBO) founded in Ruiru, Kiambu County (2025)',
  'Conveners: Nancy Kariuki & GLOW Prayer Movement Community Network',
  'Coverage Footprint: All 47 Counties of Kenya (Phase I) -> East & Central Africa Scale-Up (Phase II)',
  '',
  '1. PROBLEM STATEMENT & NEIGHBOUR-LED SOLUTION',
  'In Kiambu wards and counties across Kenya, an elder sits quietly without supper while spare flour',
  'exists nearby, and mothers raising children with cerebral palsy, autism, epilepsy, or sensory',
  'disabilities shoulder severe back strain, stigma, and costly therapy queues alone.',
  'His & Hers Circle of Hope replaces isolated charity events with permanent ward-level care desks:',
  'practical physiotherapy-informed care playbooks, trusted local school/clinic navigation, dignified',
  'nutrition staples, and mental health accompaniment.',
  '',
  '2. FINANCIAL STEWARDSHIP PLEDGE (82 / 12 / 6)',
  '  * 82.0% Direct Community Programmes (Nutrition, Respite, School Supplies, Safe Refuge, Rehab)',
  '  * 12.0% Safeguarding Vetting, Independent Annual Audits & 47-County Coordination',
  '  *  6.0% Transparent Reporting & Community Partner Onboarding',
  'Zero executive bonuses. Unaudited public books accessible via /accountability.',
  '',
  '3. STRATEGIC FUNDING WINDOWS',
  '  - Window 01: Caregiver Respite & Pantry Cushioning ($15k-$50k)',
  '  - Window 02: 47-County Inclusive School & Adaptive Aid Bridges ($25k-$100k)',
  '  - Window 03: Elder Warmth, Student Staples & Christmas of Hope ($5k-$25k)',
  '  - Window 04: Zero-Tracking Safe Refuge & Trauma Counselling ($10k-$60k)',
  '',
  'Contact Institutional Partnerships Desk: care@hisandhers.org | +254 700 000 000',
].join('\n');

export function PartnersGrantsPage() {
  const { user, signInWithGoogle } = useAuth();

  const [organizationName, setOrganizationName] = useState('');
  const [partnerTier, setPartnerTier] = useState('Philanthropic Foundation / Grantmaker');
  const [grantWindow, setGrantWindow] = useState(FUNDING_WINDOWS[0].title);
  const [countyFocus, setCountyFocus] = useState('All 47 Counties (National)');
  const [pledgeAmountLabel, setPledgeAmountLabel] = useState('$25,000+ Institutional Grant');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmationMsg, setConfirmationMsg] = useState('');
  const [downloadedDossier, setDownloadedDossier] = useState(false);

  const handleDownloadConceptNote = () => {
    const blob = new Blob([CONCEPT_NOTE_TEXT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'His-And-Hers-Circle-Of-Hope-Institutional-Grant-Brief.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloadedDossier(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      organizationName.trim().length < 2 ||
      contactPerson.trim().length < 2 ||
      !contactEmail.includes('@') ||
      notes.trim().length < 10
    ) {
      setErrorMsg(
        'Please complete the organisation name, primary contact person, valid email, and collaboration focus.'
      );
      return;
    }

    setSubmitting(true);
    try {
      // 1. Always log to server partner onboarding queue
      const res = await fetch('/api/partner-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: organizationName.trim(),
          partnerType: 'Donor / Sponsor Network',
          contactPerson: contactPerson.trim(),
          email: contactEmail.trim(),
          phone: phone.trim() || '+254 700 000 000',
          regionArea: countyFocus,
          collaborationFocus: `${partnerTier} · ${grantWindow} (${pledgeAmountLabel}). ${notes.trim()}`,
          websiteOrProfile: '',
          website_url: honeypot,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || 'Could not log partner inquiry right now.');
        return;
      }

      // 2. If signed in via Firebase Auth, also persist structured institutional pledge record
      if (user) {
        try {
          await addDoc(collection(db, 'sponsorPledges'), {
            ownerUid: user.uid,
            organizationName: organizationName.trim().slice(0, 160),
            partnerTier: partnerTier.slice(0, 100),
            grantWindow: grantWindow.slice(0, 120),
            countyFocus: countyFocus.slice(0, 80),
            pledgeAmountLabel: pledgeAmountLabel.slice(0, 80),
            contactEmail: contactEmail.trim().slice(0, 160),
            notes: notes.trim().slice(0, 1500),
            status: 'submitted',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'sponsorPledges');
        }
      }

      setConfirmationMsg(
        json.message ||
          `Thank you. ${organizationName} has been logged with our Institutional Partnerships & Grants Desk.`
      );
      setOrganizationName('');
      setContactPerson('');
      setContactEmail('');
      setPhone('');
      setNotes('');
    } catch {
      setErrorMsg('Connection interrupted while submitting partner pledge. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] text-[#1A1224]">
      {/* Editorial Philanthropic Hero */}
      <section className="bg-gradient-to-br from-[#160822] via-[#3B155F] to-[#1D4E46] text-[#FAF7F2] py-16 lg:py-24 border-b-4 border-[#D4AF37]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#F5D67B]">
              Institutional Philanthropy · Corporate CSR · Foundation Grants Dossier
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.08]">
              Partner With Kenya’s Community Circle Built for Transparency &amp; Human Dignity
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/88 leading-relaxed max-w-2xl">
              Founded in Ruiru, Kiambu County in 2025, His &amp; Hers Circle of Hope pairs local
              neighbour solidarity with accountable 47-county service delivery—supporting special
              needs mothers, orphaned children, elders, and trauma recovery with an audited 82 / 12 / 6
              stewardship commitment.
            </p>
            <div className="flex flex-wrap gap-3.5 pt-1">
              <a
                href="#sponsor-pledge-form"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] rounded-md transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Initiate Grant or CSR Partnership
              </a>
              <button
                type="button"
                onClick={handleDownloadConceptNote}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold border border-[#FAF7F2]/35 text-[#FAF7F2] hover:bg-white/10 rounded-md transition-colors"
              >
                <Download className="w-4 h-4 text-[#F5D67B]" />
                {downloadedDossier
                  ? 'Downloaded Grant Concept Brief'
                  : 'Download Institutional Grant Brief'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl overflow-hidden border border-[#F5D67B]/35 bg-[#160822] shadow-xl">
              <SafeImage
                src="/src/assets/images/ruiru_fellowship_courtyard_1795102206499.jpg"
                alt="Kenyan community members and elders gathered peacefully outdoors in Ruiru courtyard"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="p-5 grid grid-cols-3 gap-3 text-center border-t border-white/12">
                <div>
                  <p className="font-display text-2xl font-semibold text-[#F5D67B] tabular-nums">
                    82%
                  </p>
                  <p className="text-[11px] text-[#FAF7F2]/80">Direct Programmes</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-[#F5D67B] tabular-nums">
                    47
                  </p>
                  <p className="text-[11px] text-[#FAF7F2]/80">Kenyan Counties</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-[#F5D67B] tabular-nums">
                    2025
                  </p>
                  <p className="text-[11px] text-[#FAF7F2]/80">Ruiru Founded</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Theory of Change & Governance Pillars */}
      <section className="py-16 lg:py-20 bg-[#F4EFE6] border-b border-[#3B155F]/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                Donor Due Diligence &amp; Measurable Outcomes
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Why Foundations, Churches &amp; Corporate CSR Teams Trust Our Ledger
              </h2>
            </div>
            <AppLink
              href="/accountability"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B155F] hover:text-[#C2593F] shrink-0"
            >
              Inspect Full 82/12/6 Open Books &amp; Audited Files
              <ArrowRight className="w-4 h-4" />
            </AppLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl border border-[#3B155F]/12 space-y-3">
              <ShieldCheck className="w-6 h-6 text-[#256358]" />
              <h3 className="font-display text-2xl font-semibold text-[#1E0B2B]">
                82 / 12 / 6 Open Kitchen-Table Ledger
              </h3>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                82 cents of every dollar directly purchases staples, school packs, respite caregiver
                hours, and rehabilitation subsidies; 12% safeguards independent audits and child
                vetting; 6% expands partner outreach. Zero executive bonuses.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-[#3B155F]/12 space-y-3">
              <Globe2 className="w-6 h-6 text-[#3B155F]" />
              <h3 className="font-display text-2xl font-semibold text-[#1E0B2B]">
                Kenya-Wide 47-County Referral Network
              </h3>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                Built from Ruiru outwards into every county—pairing community volunteers with public
                MoE EARC offices, NCPWD desks, APDK/CPSK therapy teams, and children’s homes without
                middlemen fees.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-[#3B155F]/12 space-y-3">
              <Award className="w-6 h-6 text-[#C2593F]" />
              <h3 className="font-display text-2xl font-semibold text-[#1E0B2B]">
                Privacy &amp; Child Safeguarding First
              </h3>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                Written child-safeguarding clearance before any CSR team visits a home, disguised
                identities in peer stories, and isolated zero-tracking routes protecting families in
                acute domestic danger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Four Structured Philanthropic Funding Windows */}
      <section className="py-16 lg:py-20 max-w-7xl mx-auto px-5 sm:px-8 border-b border-[#3B155F]/10">
        <div className="max-w-2xl space-y-2 mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#C2593F]">
            Earmarked Philanthropic Portfolios
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
            Four Ready-to-Fund Impact Windows
          </h2>
          <p className="text-sm text-[#3E3349] leading-relaxed">
            Foundations, family trusts, CSR boards, and bilateral partners can co-fund an entire
            national window or adopt specific priority counties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FUNDING_WINDOWS.map((win) => (
            <article
              key={win.id}
              className="bg-white rounded-xl border border-[#3B155F]/15 p-6 sm:p-8 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#256358]">
                    {win.code}
                  </span>
                  <span className="text-xs font-semibold text-[#7A5A10] bg-[#FDF6E2] px-2.5 py-1 rounded">
                    {win.allocationTarget}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-[#1E0B2B]">{win.title}</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-[#3E3349]">
                  {win.outcomes.map((out) => (
                    <li key={out} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#256358] shrink-0 mt-0.5" />
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGrantWindow(win.title);
                  document.getElementById('sponsor-pledge-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B155F] hover:text-[#C2593F] text-left"
              >
                Adopt or Sponsor This Window →
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Sponsor / Institutional Pledge Commitment Form */}
      <section id="sponsor-pledge-form" className="py-16 lg:py-20 bg-[#FAF7F2]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="bg-white rounded-xl border border-[#D4AF37]/45 p-6 sm:p-10 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3B155F]/10 pb-5">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#C2593F] inline-flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4" />
                  Partnerships, Grants &amp; CSR Commitment Desk
                </p>
                <h2 className="font-display text-3xl font-semibold text-[#1E0B2B]">
                  Submit Institutional Partnership or Funding Inquiry
                </h2>
              </div>
              {!user && (
                <button
                  type="button"
                  onClick={() => void signInWithGoogle('partner', 'Nairobi')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-[#3B155F]/25 text-[#3B155F] rounded-md hover:bg-[#F3EEF8] shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In With Google to Save Pledge Record
                </button>
              )}
            </div>

            {confirmationMsg ? (
              <div className="p-6 bg-[#EAF6F2] rounded-lg border border-[#256358]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#256358] font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  Partner &amp; Grant Inquiry Recorded
                </div>
                <p className="text-sm text-[#1E0B2B] leading-relaxed">{confirmationMsg}</p>
                <button
                  type="button"
                  onClick={() => setConfirmationMsg('')}
                  className="text-xs font-semibold text-[#3B155F] underline underline-offset-4"
                >
                  Submit another partner inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="partner-hp">Website</label>
                  <input
                    id="partner-hp"
                    type="text"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {errorMsg && (
                  <p role="alert" className="p-3.5 text-sm bg-rose-50 border border-rose-200 text-rose-800 rounded-md">
                    {errorMsg}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="part-org"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1"
                    >
                      Foundation / Company / Sponsor Name *
                    </label>
                    <input
                      id="part-org"
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g. East Africa Family Foundation"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="part-tier"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1"
                    >
                      Partner Category
                    </label>
                    <select
                      id="part-tier"
                      value={partnerTier}
                      onChange={(e) => setPartnerTier(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      <option value="Philanthropic Foundation / Grantmaker">
                        Philanthropic Foundation / Grantmaker
                      </option>
                      <option value="Corporate CSR & Workplace Sponsor">
                        Corporate CSR &amp; Workplace Sponsor
                      </option>
                      <option value="Church / Faith Network Partner">
                        Church / Faith Network Partner
                      </option>
                      <option value="Medical, Therapy or Technical NGO">
                        Medical, Therapy or Technical NGO
                      </option>
                      <option value="Individual Major Supporter">Individual Major Supporter</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="part-window"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1"
                    >
                      Preferred Funding Window
                    </label>
                    <select
                      id="part-window"
                      value={grantWindow}
                      onChange={(e) => setGrantWindow(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      {FUNDING_WINDOWS.map((w) => (
                        <option key={w.id} value={w.title}>
                          {w.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="part-amount"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1"
                    >
                      Indicative Contribution Band
                    </label>
                    <select
                      id="part-amount"
                      value={pledgeAmountLabel}
                      onChange={(e) => setPledgeAmountLabel(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      <option value="$5,000 – $25,000 Community Cohort Grant">
                        $5,000 – $25,000 Community Cohort Grant
                      </option>
                      <option value="$25,000+ Institutional Grant">
                        $25,000+ Institutional Grant
                      </option>
                      <option value="KES 50,000 – 500,000 Local CSR / Feast Bundle">
                        KES 50,000 – 500,000 Local CSR / Feast Bundle
                      </option>
                      <option value="In-Kind Medical / Mobility Equipment / Pro-Bono">
                        In-Kind Medical / Mobility Equipment / Pro-Bono
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="part-contact"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1"
                    >
                      Primary Contact Name *
                    </label>
                    <input
                      id="part-contact"
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Full name & title"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="part-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1"
                    >
                      Official Email *
                    </label>
                    <input
                      id="part-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="grants@organisation.org"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="part-county"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1"
                    >
                      Target County Focus
                    </label>
                    <select
                      id="part-county"
                      value={countyFocus}
                      onChange={(e) => setCountyFocus(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      <option value="All 47 Counties (National)">All 47 Counties (National)</option>
                      {ALL_KENYA_COUNTIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.name} County
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="part-phone"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1"
                  >
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    id="part-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 7XX XXX XXX"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                </div>

                <div>
                  <label
                    htmlFor="part-notes"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#1E0B2B] mb-1"
                  >
                    Grant Scope, Reporting Requirements or Partnership Proposal *
                  </label>
                  <textarea
                    id="part-notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Share your target counties, grant reporting cycle, site visit dates, or in-kind relief equipment."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#3B155F] text-[#FAF7F2] hover:bg-[#2C1042] disabled:opacity-60 rounded-md transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  {submitting
                    ? 'Submitting Institutional Inquiry...'
                    : 'Submit Institutional Grant / Partner Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
