import { useState } from 'react';
import {
  ArrowRight,
  Bot,
  Building2,
  Compass,
  HeartHandshake,
  MapPin,
  Palette,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useColourMood } from '../context/ColourMoodContext';
import type { ColourGradeId } from '../utils/careTools';
import { openCareGuideChatbot } from './CareGuideChatbot';

interface CompassNeed {
  id: string;
  label: string;
  eyebrow: string;
  headline: string;
  reassurance: string;
  stepOne: string;
  stepTwo: string;
  responseWindow: string;
  primaryCta: string;
  primaryHref: string;
  accentHex: string;
  moodGradeId: ColourGradeId;
  moodLabel: string;
  panelBgClass: string;
  stepOneBgClass: string;
  stepTwoBgClass: string;
  tabActiveBgClass: string;
  icon: typeof Compass;
}

const COMPASS_NEEDS: CompassNeed[] = [
  {
    id: 'children-home-visit',
    label: 'Visit a Children’s Home',
    eyebrow: 'Groups, Schools & Corporate CSR Teams',
    headline: 'Bring Your Team Directly to a Verified Children’s Home',
    reassurance:
      'All visits are organised toward vetted partner children’s homes—matching your team size with each home’s exact priority needs and safeguarding briefing.',
    stepOne: 'Browse our partner homes by county and check their current wishlists.',
    stepTwo: 'Pick your preferred home and date; we coordinate arrival and supplies.',
    responseWindow: 'Safeguarding brief sent within 24 hours',
    primaryCta: 'Open Children’s Homes Directory',
    primaryHref: '/home-visits',
    accentHex: '#C2593F',
    moodGradeId: 'golden-hope',
    moodLabel: 'Golden Hour Warmth',
    panelBgClass: 'bg-gradient-to-br from-[#FFF9F4] via-white to-[#FDF1E8] border-[#C2593F]/25',
    stepOneBgClass: 'bg-[#FFF3EB] border-[#C2593F]/20',
    stepTwoBgClass: 'bg-[#F5EFFB] border-[#3B155F]/15',
    tabActiveBgClass: 'bg-[#C2593F] text-white border-[#C2593F]',
    icon: Users,
  },
  {
    id: 'partner-org',
    label: 'Onboard My Organisation',
    eyebrow: 'Corporates, NGOs, Children’s Homes & Sponsors',
    headline: 'Co-Operate Across Our Community Care Network',
    reassurance:
      'Whether you are a corporate CSR department, registered children’s home, or partner NGO, you can onboard once and collaborate seamlessly.',
    stepOne: 'Submit your organisation profile and collaboration focus on our partner tab.',
    stepTwo: 'Connect with our partnership desk to align camps, supplies, or mentorship.',
    responseWindow: 'Partnership onboarding call within 2 business days',
    primaryCta: 'Onboard as a Partner Organisation',
    primaryHref: '/home-visits',
    accentHex: '#3B155F',
    moodGradeId: 'royal-heritage',
    moodLabel: 'Plum & Gold Heritage',
    panelBgClass: 'bg-gradient-to-br from-[#F7F2FC] via-white to-[#FDF6EE] border-[#3B155F]/22',
    stepOneBgClass: 'bg-[#F4EEF9] border-[#3B155F]/18',
    stepTwoBgClass: 'bg-[#FBF5E6] border-[#D4AF37]/30',
    tabActiveBgClass: 'bg-[#3B155F] text-white border-[#3B155F]',
    icon: Building2,
  },
  {
    id: 'rehab-near-me',
    label: 'Find Rehabilitation Nearby',
    eyebrow: 'Proximity-Matched Restoration Care',
    headline: 'Connect With a Trusted Rehab Facility Near Your Family',
    reassurance:
      'Sort partner rehabilitation centres by distance from your location or county, compare residential and outpatient care, and choose the facility you prefer.',
    stepOne: 'Tap "Sort by Nearest to Me" to see approximate distances and care specialties.',
    stepTwo: 'Select your preferred centre and send a private admission referral note.',
    responseWindow: 'Confidential family liaison within 24 hours',
    primaryCta: 'Find Nearest Rehabilitation Centre',
    primaryHref: '/rehabilitation',
    accentHex: '#256358',
    moodGradeId: 'sage-calm',
    moodLabel: 'Calm Sage Sanctuary',
    panelBgClass: 'bg-gradient-to-br from-[#EFF8F5] via-white to-[#F6FBF9] border-[#256358]/25',
    stepOneBgClass: 'bg-[#E9F5F0] border-[#256358]/20',
    stepTwoBgClass: 'bg-[#FFF4EB] border-[#C2593F]/18',
    tabActiveBgClass: 'bg-[#256358] text-white border-[#256358]',
    icon: MapPin,
  },
  {
    id: 'asd-family',
    label: 'ASD Tips for Parents & Kids',
    eyebrow: 'Gentle, Everyday Autism Family Guidance',
    headline: 'Calm Visual Routines, Sensory Ideas & Parent Mentors',
    reassurance:
      'Designed for parents, siblings, and kids: easy-to-follow sensory calm steps, an interactive visual routine builder you can print, and warm mentor chat.',
    stepOne: 'Build or filter daily sensory and visual routine cards tailored to your child.',
    stepTwo: 'Send a private question to our ASD parent mentors whenever you need ideas.',
    responseWindow: 'Warm mentor reply within 24–48 hours',
    primaryCta: 'Open ASD Parents & Kids Hub',
    primaryHref: '/asd-support',
    accentHex: '#256358',
    moodGradeId: 'sage-calm',
    moodLabel: 'Calm Sage Sanctuary',
    panelBgClass: 'bg-gradient-to-br from-[#EAF6F2] via-white to-[#FFF7EE] border-[#256358]/25',
    stepOneBgClass: 'bg-[#EDF6F3] border-[#256358]/20',
    stepTwoBgClass: 'bg-[#F5EFFB] border-[#3B155F]/15',
    tabActiveBgClass: 'bg-[#256358] text-white border-[#256358]',
    icon: Sparkles,
  },
  {
    id: 'counselling',
    label: 'Lighten Heavy Burdens',
    eyebrow: 'Mental Health & Stigma-Free Listening',
    headline: 'Talk to a Counsellor or Share Anonymously Today',
    reassurance:
      'You do not have to carry grief, burnout, anxiety, or quiet pressure alone. Choose either a confidential callback or one-way anonymous burden release.',
    stepOne: 'Try our 60-second grounding breath tool if today feels overwhelming.',
    stepTwo: 'Request a phone, WhatsApp, email, or in-person counselling conversation.',
    responseWindow: 'Priority requests answered within 24 hours',
    primaryCta: 'Talk to a Counsellor',
    primaryHref: '/counselling',
    accentHex: '#3B155F',
    moodGradeId: 'royal-heritage',
    moodLabel: 'Plum & Gold Heritage',
    panelBgClass: 'bg-gradient-to-br from-[#F4EEFA] via-white to-[#FDF6EE] border-[#3B155F]/22',
    stepOneBgClass: 'bg-[#F3EEF8] border-[#3B155F]/18',
    stepTwoBgClass: 'bg-[#EAF6F2] border-[#256358]/18',
    tabActiveBgClass: 'bg-[#3B155F] text-white border-[#3B155F]',
    icon: HeartHandshake,
  },
  {
    id: 'safe-refuge',
    label: 'Urgent Safety (Find My Home)',
    eyebrow: 'Gender-Based Violence & Child Abuse Refuge',
    headline: 'Reach Safe Shelter Coordination Discreetly',
    reassurance:
      'If you or a child are in danger from domestic violence or abuse, our safeguarded refuge desk coordinates protected shelter following your safe contact rules.',
    stepOne: 'Share only a safe contact method and times when it is safe to reach you.',
    stepTwo: 'Use the instant Quick Exit button anytime to leave the screen discreetly.',
    responseWindow: 'Urgent safeguarding desk triage immediately',
    primaryCta: 'Open Find My Home Desk',
    primaryHref: '/find-my-home',
    accentHex: '#8C5B0A',
    moodGradeId: 'true-daylight',
    moodLabel: 'True Documentary Daylight',
    panelBgClass: 'bg-gradient-to-br from-[#FBF4E4] via-white to-[#FFF5EE] border-[#B88F28]/35',
    stepOneBgClass: 'bg-[#FBF3E0] border-[#B88F28]/25',
    stepTwoBgClass: 'bg-[#FDF1EB] border-[#C2593F]/20',
    tabActiveBgClass: 'bg-[#8C5B0A] text-white border-[#8C5B0A]',
    icon: ShieldAlert,
  },
];

export function CareCompassSection() {
  const [selectedId, setSelectedId] = useState<string>(COMPASS_NEEDS[0].id);
  const { setGradeId, setGradingEnabled, gradeId } = useColourMood();
  const activeNeed = COMPASS_NEEDS.find((item) => item.id === selectedId) || COMPASS_NEEDS[0];
  const ActiveIcon = activeNeed.icon;

  const handleSelectNeed = (item: CompassNeed) => {
    setSelectedId(item.id);
    setGradeId(item.moodGradeId);
    setGradingEnabled(true);
  };

  return (
    <section
      aria-label="Care Family Compass wayfinding"
      className="py-14 sm:py-20 bg-gradient-to-b from-[#FDF4EB] via-[#FAF7F2] to-[#F3EEF8]/60 border-b border-[#C2593F]/15"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F] inline-flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              Care Family Compass · Guided Next Steps
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              What Connects You to Our Care Family Today?
            </h2>
          </div>

          <button
            type="button"
            onClick={() => openCareGuideChatbot()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#FAF7F2] bg-gradient-to-r from-[#3B155F] to-[#C2593F] hover:brightness-110 rounded-lg transition-all self-start lg:self-auto whitespace-nowrap shadow-sm"
          >
            <Bot className="w-4 h-4 text-[#E5CA7B]" aria-hidden="true" />
            Not sure? Ask Care Guide AI
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left selector list */}
          <div
            role="tablist"
            aria-label="Select how HIS AND HERS can help"
            className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5"
          >
            {COMPASS_NEEDS.map((item) => {
              const Icon = item.icon;
              const isSelected = item.id === activeNeed.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectNeed(item)}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-lg text-left transition-all duration-150 border ${
                    isSelected
                      ? `${item.tabActiveBgClass} shadow-sm`
                      : 'bg-white text-[#1E0B2B] border-[#3B155F]/12 hover:border-[#C2593F]/45'
                  }`}
                >
                  <span className="inline-flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#FFE7B3]' : ''}`}
                      style={isSelected ? undefined : { color: item.accentHex }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold truncate">{item.label}</span>
                  </span>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-[#FFE7B3]' : 'text-[#665B73]'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          {/* Right guided response panel */}
          <div className="lg:col-span-7 flex">
            <div
              key={activeNeed.id}
              role="tabpanel"
              aria-label={activeNeed.label}
              className={`w-full border rounded-xl p-6 sm:p-9 flex flex-col justify-between gap-6 transition-all duration-200 ${activeNeed.panelBgClass}`}
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#3B155F]/10">
                  <span
                    className="text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2"
                    style={{ color: activeNeed.accentHex }}
                  >
                    <ActiveIcon className="w-4 h-4" aria-hidden="true" />
                    {activeNeed.eyebrow}
                  </span>
                  <span className="text-xs text-[#665B73] tabular-nums inline-flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-[#C2593F]" aria-hidden="true" />
                    {activeNeed.responseWindow} · Mood: {activeNeed.moodLabel}
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B] leading-snug">
                  {activeNeed.headline}
                </h3>

                <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                  {activeNeed.reassurance}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className={`border rounded-lg p-4 space-y-1 ${activeNeed.stepOneBgClass}`}>
                    <p
                      className="text-xs font-semibold tabular-nums"
                      style={{ color: activeNeed.accentHex }}
                    >
                      Step 01
                    </p>
                    <p className="text-sm text-[#1E0B2B] leading-relaxed">{activeNeed.stepOne}</p>
                  </div>
                  <div className={`border rounded-lg p-4 space-y-1 ${activeNeed.stepTwoBgClass}`}>
                    <p className="text-xs font-semibold text-[#256358] tabular-nums">Step 02</p>
                    <p className="text-sm text-[#1E0B2B] leading-relaxed">{activeNeed.stepTwo}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <AppLink
                  href={activeNeed.primaryHref}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md transition-colors whitespace-nowrap"
                >
                  {activeNeed.primaryCta}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </AppLink>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => openCareGuideChatbot(`Help me with: ${activeNeed.label}`)}
                    className="text-xs sm:text-sm font-semibold text-[#C2593F] hover:text-[#3B155F] underline underline-offset-4"
                  >
                    Ask Care Guide AI about this
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
