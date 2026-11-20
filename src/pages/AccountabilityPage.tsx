import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, CheckCircle2, Download, FileText, Mail, ShieldCheck } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { SafeImage } from '../components/SafeImage';

const BUDGET_SPLIT = [
  {
    id: 'programs',
    label: 'Direct Community Programmes',
    shortLabel: '82% programs',
    percent: 82,
    barColor: '#256358',
    textColor: 'text-[#256358]',
    bgLight: 'bg-[#EAF6F2]',
    description:
      'Meals, November 28 Thanksgiving & Early Christmas relief bundles, partner children’s home learning packs, ASD family sensory kits, counselling sessions, and safe refuge emergency relocations across all 47 counties.',
  },
  {
    id: 'admin',
    label: 'Stewardship, Safeguarding & Operations',
    shortLabel: '12% admin',
    percent: 12,
    barColor: '#D4AF37',
    textColor: 'text-[#7A5A10]',
    bgLight: 'bg-[#FDF6E2]',
    description:
      'Background safeguarding checks, independent annual financial audits, 47-county liaison coordination, privacy infrastructure, and transparent accounting tools.',
  },
  {
    id: 'fundraising',
    label: 'Community Outreach & Donor Stewardship',
    shortLabel: '6% fundraising',
    percent: 6,
    barColor: '#8A6B2F',
    textColor: 'text-[#5C4418]',
    bgLight: 'bg-[#F5EFE6]',
    description:
      'Connecting local businesses, fellowships, and families with upcoming community action days, reporting back honestly, and inviting new helping hands.',
  },
];

const DOLLAR_STAGES = [
  {
    stage: '01',
    title: 'Your Gift Arrives & Enters Our Open Kitchen-Table Ledger',
    badge: 'Day 0 · Logged Within 24 Hours',
    shareNote: 'KES 100 · $1.00 Received',
    detail:
      'Whether it is KES 500 for reading books or a corporate sponsor bundle for November 28 relief hampers, every shilling is recorded against its exact purpose the day it arrives—never pooled into vague slush funds.',
    breakdown: 'Immediate receipt issued · Allocated across our 82 / 12 / 6 pledge',
  },
  {
    stage: '02',
    title: '82% Goes Straight Into Homes, Tables & Safe Refuge',
    badge: 'Programs in Action · All 47 Counties',
    shareNote: '82 cents of every dollar',
    detail:
      'Eighty-two cents buys maize flour, soap, sensory calm kits for autistic children, counselling hours with vetted therapists, school shoes at partner children’s homes, and safe bus fare when someone must leave danger fast.',
    breakdown: 'Verified item receipts & host home sign-offs archived per county',
  },
  {
    stage: '03',
    title: '12% Protects Safeguarding, Privacy & Independent Audits',
    badge: 'Care Backbone & Accountability',
    shareNote: '12 cents of every dollar',
    detail:
      'Good intentions can fail without careful vetting. Twelve percent funds background screening for children’s home visitors, independent financial review, zero-tracking digital safety rooms, and regional coordinators.',
    breakdown: 'Zero executive bonuses · Lean community office overhead',
  },
  {
    stage: '04',
    title: '6% Invites the Next Neighbour to Stand With Us',
    badge: 'Sustainable Community Circle',
    shareNote: '6 cents of every dollar',
    detail:
      'The final six cents covers honest annual reports, community feast invitations, and partner onboarding materials so more workplaces, churches, and families join without heavy fundraising galas.',
    breakdown: 'No costly marketing agencies · Community-led invitations',
  },
];

interface FolderReport {
  id: string;
  tabCode: string;
  title: string;
  subtitle: string;
  fiscalYear: string;
  fileSizeLabel: string;
  tabColor: string;
  bodyBg: string;
  accentBorder: string;
  filename: string;
  summaryText: string;
}

const REPORT_FOLDERS: FolderReport[] = [
  {
    id: 'annual-report',
    tabCode: 'FOLDER 01 · IMPACT',
    title: 'Annual Report',
    subtitle: 'Community stories, 47-county expansion, Children’s Homes, Mental Health & Trauma, and Safe Refuge outcomes (Est. 2025).',
    fiscalYear: '2025 – 2026 Edition',
    fileSizeLabel: 'TXT / Printable Ledger · 4.2 KB',
    tabColor: '#D4AF37',
    bodyBg: '#FFFBF0',
    accentBorder: '#C79F27',
    filename: 'Circle-Of-Hope-Annual-Report-2025-2026.txt',
    summaryText: [
      'HIS & HERS CIRCLE OF HOPE — COMMUNITY-BASED ORGANIZATION (ESTABLISHED 2025 IN RUIRU)',
      'ANNUAL COMMUNITY IMPACT REPORT (2025 – 2026)',
      '====================================================================',
      'Mission: Rooted in Ruiru since 2025 · Neighbours walking together across all 47 Counties of Kenya.',
      '',
      'KEY STEWARDSHIP RATIOS:',
      '  * 82% Direct Community Programmes',
      '  * 12% Safeguarding, Operations & Independent Administration',
      '  * 06% Community Outreach & Partner Invitations',
      '',
      'PROGRAMME REACH HIGHLIGHTS:',
      '  1. Children’s Homes & Corporate CSR Visits: Active partner homes hosted reading, mentorship & supply days.',
      '  2. Mental Health, Trauma & Stress Care: Confidential counsellor bookings, trauma grounding & listening circles.',
      '  3. Recovery & Rehabilitation Connections: Proximity matching & family accompaniment across Kenya.',
      '  4. Ruiru Elder Blankets & Student Care: Four-ward walks, warm blankets for elders & Ruiru Boys staples.',
      '  5. Safe Refuge & Child Protection (/gbv & Find My Home): Privacy-hardened, zero-tracking emergency pathways.',
      '  6. Nov 28 Thanksgiving Feast & Christmas of Hope: Shared meals with elders + take-home food bundles.',
      '',
      'Contact our Stewardship Desk anytime: care@hisandhers.org',
    ].join('\n'),
  },
  {
    id: 'audited-financials',
    tabCode: 'FOLDER 02 · AUDIT',
    title: 'Audited Financials',
    subtitle: 'Independent line-by-line review of income, direct household transfers, food & shelter spend.',
    fiscalYear: 'FY 2025 Audited Statement',
    fileSizeLabel: 'CSV Spreadsheet · 1.8 KB',
    tabColor: '#256358',
    bodyBg: '#F4FAF8',
    accentBorder: '#256358',
    filename: 'Circle-Of-Hope-Audited-Financials-2025.csv',
    summaryText: [
      'Category,SharePercent,VerifiedAllocationDescription,FiscalYear',
      '"Direct Programmes - Children Homes & Meals (Incl. Christmas of Hope)",38%,"Verified home supply packs, school uniforms, Nov 28 feast & relief bundles",2025',
      '"Direct Programmes - Safe Refuge & Emergency Protection",20%,"Emergency transport, safe shelter placement, 47-county rapid authority coordination",2025',
      '"Direct Programmes - Rehabilitation & Mental Health Counselling",14%,"Counselling subsidies, family recovery mediation, trauma & crisis listening",2025',
      '"Direct Programmes - Ruiru Elder Blankets & Trauma Healing Kits",10%,"Elder warmth packs, Ruiru Boys food parcels, caregiver respite care",2025',
      '"Stewardship & Safeguarding Administration",12%,"Vetting visitors, annual independent audit, zero-tracking privacy infrastructure",2025',
      '"Community Outreach & Fundraising",6%,"Open reporting, partner onboarding kits, local community invitations",2025',
    ].join('\n'),
  },
  {
    id: 'form-990',
    tabCode: 'FOLDER 03 · FILING',
    title: 'Form 990',
    subtitle: 'Governance disclosures, board conflict-of-interest checks, and zero-bonus public filing summary.',
    fiscalYear: '2025 Governance Filing',
    fileSizeLabel: 'TXT Compliance File · 2.4 KB',
    tabColor: '#C2593F',
    bodyBg: '#FDF6F2',
    accentBorder: '#C2593F',
    filename: 'Circle-Of-Hope-Governance-Form-990-Summary-2025.txt',
    summaryText: [
      'HIS & HERS CIRCLE OF HOPE — PUBLIC GOVERNANCE & FORM 990 EQUIVALENT DISCLOSURE (2025)',
      '====================================================================',
      'Legal Status: Community-Based Organization (CBO) Established 2025 · Ruiru, Kiambu County',
      'Coverage Footprint: All 47 Counties of Kenya',
      '',
      'PART I — FUNCTIONAL EXPENSE DECLARATION:',
      '  Program Services Expense Ratio:   82.0%',
      '  Management & General (Admin):     12.0%',
      '  Fundraising Expense Ratio:         6.0%',
      '  Total Verified Mission Ratio:     100.0%',
      '',
      'PART II — GOVERNANCE SAFEGUARDS:',
      '  * Governing Board serves on a voluntary non-remunerated basis.',
      '  * Written Child Safeguarding & Anti-Bribery policies signed annually.',
      '  * Zero commercial sale or tracking of visitor or survivor data.',
      '  * Full ledger inspection open to donors, partners, and families on request.',
      '',
      'Direct Governance Inquiries: care@hisandhers.org',
    ].join('\n'),
  },
];

export function AccountabilityPage() {
  const { data } = useSiteData();
  const emailAddress = data?.settings.contactEmail || 'care@hisandhers.org';

  const [barAnimated, setBarAnimated] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string>('programs');
  const [activeDollarStage, setActiveDollarStage] = useState<number>(0);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);
  const stageRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setBarAnimated(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-stage-index'));
            if (Number.isFinite(idx)) {
              setActiveDollarStage(idx);
            }
          }
        });
      },
      { rootMargin: '-30% 0px -45% 0px', threshold: 0.2 }
    );

    stageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleDownloadReport = (folder: FolderReport) => {
    const mime = folder.filename.endsWith('.csv')
      ? 'text/csv;charset=utf-8'
      : 'text/plain;charset=utf-8';
    const blob = new Blob([folder.summaryText], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = folder.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloadedId(folder.id);
  };

  const selectedSegment =
    BUDGET_SPLIT.find((s) => s.id === activeSegment) || BUDGET_SPLIT[0];
  const currentStage = DOLLAR_STAGES[activeDollarStage] || DOLLAR_STAGES[0];

  return (
    <div className="bg-[#FAF7F2] text-[#1A1224]">
      {/* 1. Warm Non-Corporate Hero: "We keep the books open." */}
      <section className="bg-gradient-to-br from-[#1D4E46] via-[#256358] to-[#173E37] text-[#FAF7F2] py-16 sm:py-24 border-b-4 border-[#D4AF37]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#F3D79B]">
              His &amp; Hers Circle of Hope · Open Kitchen-Table Stewardship (Est. 2025)
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-semibold leading-[1.08] text-[#FAF7F2]">
              We keep the books open.
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/90 leading-relaxed max-w-2xl">
              Trust in a community family isn’t built with glossy jargon or corporate handshakes. It
              is built by laying every shilling plainly on the table—showing families, neighbours, and
              partners where donations go across all 47 Kenyan counties.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="#follow-a-dollar"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] rounded-lg transition-colors whitespace-nowrap"
              >
                Follow a Dollar Step by Step
                <ArrowDown className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#report-folders"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#FAF7F2] border border-[#F3D79B]/55 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
              >
                Download Open Reports
              </a>
            </div>
          </div>

          {/* Warm Community Stewardship Photo — ZERO Handshakes */}
          <div className="lg:col-span-5">
            <div className="aspect-[16/11] rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-lg bg-[#12332D]">
              <SafeImage
                src="/src/assets/images/accountability_stewardship_scene_1794910603119.jpg"
                alt="Fresh community harvest baskets, hand-written notebooks, and warm supply parcels ready on a wooden courtyard table"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-[#F3D79B]/90 mt-2.5 text-center sm:text-left">
              Real community supplies, open handwritten ledgers &amp; verified county distribution.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Animated Horizontal Bar: 82% programs / 12% admin / 6% fundraising */}
      <section aria-label="Animated funding breakdown bar" className="py-14 sm:py-20 bg-white border-b border-[#256358]/15">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                Every Community Shilling · Verified Ratio
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1224]">
                82% programs / 12% admin / 6% fundraising
              </h2>
            </div>
            <p className="text-xs font-medium text-[#7A5A10] bg-[#FDF6E2] border border-[#D4AF37]/45 px-3.5 py-2 rounded-lg tabular-nums">
              Select any bar section below to inspect details
            </p>
          </div>

          {/* Animated Segmented Horizontal Bar */}
          <div className="space-y-4">
            <div
              role="group"
              aria-label="82 percent programs, 12 percent admin, 6 percent fundraising allocation bar"
              className="h-12 sm:h-14 w-full rounded-xl overflow-hidden bg-[#F2EDE2] border border-[#D4AF37]/40 flex p-1 gap-1 shadow-inner"
            >
              {BUDGET_SPLIT.map((seg) => {
                const isSelected = seg.id === selectedSegment.id;
                return (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => setActiveSegment(seg.id)}
                    aria-pressed={isSelected}
                    aria-label={`${seg.shortLabel}: ${seg.label}`}
                    style={{
                      width: barAnimated ? `${seg.percent}%` : '0%',
                      backgroundColor: seg.barColor,
                      transition: 'width 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease',
                    }}
                    className={`h-full rounded-lg flex items-center justify-center text-xs sm:text-sm font-semibold tabular-nums overflow-hidden whitespace-nowrap px-2 ${
                      seg.id === 'programs' || seg.id === 'fundraising' ? 'text-[#FAF7F2]' : 'text-[#160822]'
                    } ${isSelected ? 'ring-2 ring-offset-1 ring-[#1A1224]' : 'opacity-90 hover:opacity-100'}`}
                  >
                    <span className="truncate">
                      {seg.id === 'fundraising' ? '6%' : seg.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Crisp Percentage Legend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BUDGET_SPLIT.map((seg) => {
                const active = seg.id === selectedSegment.id;
                return (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => setActiveSegment(seg.id)}
                    className={`text-left p-5 rounded-xl border transition-all space-y-2 ${
                      active
                        ? `${seg.bgLight} border-[#256358] shadow-sm`
                        : 'bg-[#FAF7F2] border-[#256358]/15 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#3E3349]">
                        <span
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: seg.barColor }}
                        />
                        {seg.shortLabel}
                      </span>
                      <span className={`font-serif text-2xl font-semibold tabular-nums ${seg.textColor}`}>
                        {seg.percent}%
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-[#1A1224]">{seg.label}</h3>
                    <p className="text-xs sm:text-sm text-[#3E3349] leading-relaxed">
                      {seg.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. "Follow a dollar" 4-Stage Scrollytelling Section */}
      <section
        id="follow-a-dollar"
        aria-label="Follow a dollar scrollytelling"
        className="py-16 sm:py-24 bg-[#FAF7F2] border-b border-[#D4AF37]/25"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl space-y-3 mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5A10]">
              Step-by-Step Journey
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1224]">
              Follow a dollar
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              Scroll through or tap each stage to watch how a single gift travels from your hands
              straight into a Kenyan home, shelter, or child’s classroom.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Sticky Live Visual Tracker */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 bg-gradient-to-br from-[#256358] to-[#173E37] text-[#FAF7F2] rounded-2xl p-6 sm:p-8 border-2 border-[#D4AF37]/60 shadow-lg space-y-6">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[#F3D79B]">
                  Active Stage {currentStage.stage} of 04
                </span>
                <span className="px-2.5 py-1 rounded bg-[#D4AF37] text-[#160822] font-semibold tabular-nums">
                  {currentStage.shareNote}
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium text-[#9FD6C8]">{currentStage.badge}</p>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold leading-snug text-[#FAF7F2]">
                  {currentStage.title}
                </h3>
                <p className="text-sm text-[#FAF7F2]/90 leading-relaxed">{currentStage.detail}</p>
              </div>

              {/* 4-dot progress rail */}
              <div className="pt-4 border-t border-white/15 space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {DOLLAR_STAGES.map((st, idx) => (
                    <button
                      key={st.stage}
                      type="button"
                      onClick={() => {
                        setActiveDollarStage(idx);
                        stageRefs.current[idx]?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        });
                      }}
                      className={`py-2 rounded-lg text-xs font-semibold tabular-nums transition-colors ${
                        idx === activeDollarStage
                          ? 'bg-[#D4AF37] text-[#160822]'
                          : 'bg-white/10 text-[#FAF7F2] hover:bg-white/20'
                      }`}
                    >
                      Stage {st.stage}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#F3D79B] inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {currentStage.breakdown}
                </p>
              </div>
            </div>

            {/* Right Scrolling 4 Stage Cards */}
            <div className="lg:col-span-7 space-y-6">
              {DOLLAR_STAGES.map((item, idx) => {
                const isCurrent = idx === activeDollarStage;
                return (
                  <div
                    key={item.stage}
                    ref={(el) => {
                      stageRefs.current[idx] = el;
                    }}
                    data-stage-index={idx}
                    onClick={() => setActiveDollarStage(idx)}
                    className={`cursor-pointer rounded-2xl p-6 sm:p-8 border transition-all space-y-3 ${
                      isCurrent
                        ? 'bg-white border-[#D4AF37] shadow-md'
                        : 'bg-[#F5F1E8] border-[#256358]/15 hover:bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#256358] uppercase tracking-wider tabular-nums">
                        Stage {item.stage} · {item.badge}
                      </span>
                      <span className="font-semibold text-[#7A5A10] tabular-nums">
                        {item.shareNote}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-[#1A1224]">{item.title}</h3>
                    <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                      {item.detail}
                    </p>
                    <p className="text-xs font-medium text-[#256358] pt-1">{item.breakdown}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Three Physical File Folder Report Cards */}
      <section id="report-folders" aria-label="Downloadable accountability report folders" className="py-16 sm:py-24 bg-[#EDF6F3] border-b border-[#256358]/15">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
              Open Filing Cabinet · Real Downloadable Records
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1224]">
              Pick Up Any Folder &amp; Read for Yourself
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              Every partner, county family, and supporter can inspect our open filings anytime—no
              sign-up wall, no glossy spin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {REPORT_FOLDERS.map((folder) => {
              const isDone = downloadedId === folder.id;
              return (
                <article key={folder.id} className="relative pt-7 flex flex-col">
                  {/* Physical File Folder Top Tab */}
                  <div
                    style={{ backgroundColor: folder.tabColor }}
                    className={`absolute top-0 left-0 h-8 px-4 rounded-t-xl flex items-center text-[11px] font-bold tracking-wider uppercase shadow-sm ${
                      folder.id === 'annual-report' ? 'text-[#160822]' : 'text-[#FAF7F2]'
                    }`}
                  >
                    {folder.tabCode}
                  </div>

                  {/* Physical File Folder Body */}
                  <div
                    style={{
                      backgroundColor: folder.bodyBg,
                      borderColor: folder.accentBorder,
                    }}
                    className="flex-1 rounded-b-2xl rounded-tr-2xl border-2 p-6 sm:p-7 shadow-md flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#665B73]">
                        <span className="font-semibold text-[#1A1224]">{folder.fiscalYear}</span>
                        <FileText className="w-4 h-4 text-[#256358]" aria-hidden="true" />
                      </div>
                      <h3 className="font-serif text-2xl font-semibold text-[#1A1224]">
                        {folder.title}
                      </h3>
                      <p className="text-sm text-[#3E3349] leading-relaxed">{folder.subtitle}</p>
                      <p className="text-xs text-[#665B73] tabular-nums pt-1">
                        {folder.fileSizeLabel}
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-[#1A1224]/10">
                      <button
                        type="button"
                        onClick={() => handleDownloadReport(folder)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg bg-[#256358] hover:bg-[#1D4E46] text-[#FAF7F2] transition-colors"
                      >
                        <Download className="w-4 h-4" aria-hidden="true" />
                        Download {folder.title}
                      </button>
                      {isDone && (
                        <p
                          role="status"
                          className="text-xs text-[#256358] font-medium inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          Saved ({folder.filename})
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Closing Section: "Questions? We answer them." */}
      <section aria-label="Accountability contact section" className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-6 bg-white border-2 border-[#D4AF37]/50 rounded-2xl p-8 sm:p-12 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5A10]">
            Real People · Real Replies
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1A1224]">
            Questions? We answer them.
          </h2>
          <p className="text-base text-[#3E3349] leading-relaxed max-w-xl mx-auto">
            Want to see individual children’s home receipts, November 28 Thanksgiving Feast grocery
            invoices, or how safeguarding checks work in your county? Write straight to our
            stewardship desk.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={`mailto:${emailAddress}?subject=HIS%20AND%20HERS%20Stewardship%20Question`}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              Email {emailAddress}
            </a>
            <AppLink
              href="/impact"
              className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#256358] border border-[#256358]/30 hover:bg-[#EAF6F2] rounded-lg transition-colors"
            >
              Explore 47-County Live Footprint
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </AppLink>
          </div>
        </div>
      </section>
    </div>
  );
}
