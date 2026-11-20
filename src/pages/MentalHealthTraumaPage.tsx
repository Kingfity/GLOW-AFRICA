import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Coffee, HeartHandshake, PhoneCall, Sparkles } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { SafeImage } from '../components/SafeImage';
import { TraumaGroundingPlanner } from '../components/TraumaGroundingPlanner';
import { useSiteData } from '../context/SiteDataContext';
import type { MentalHealthGuideTip } from '../shared/types';
import { validateAsdSupportRequest } from '../utils/validation';

const PILLAR_FILTERS: Array<{
  value: 'All' | MentalHealthGuideTip['pillar'];
  label: string;
}> = [
  { value: 'All', label: 'All Guides' },
  { value: 'Nervous System & Trauma', label: 'Nervous System & Trauma' },
  { value: 'Stress, Panic & Sleep', label: 'Stress, Panic & Sleep' },
  { value: 'Caregiver & Silent Burdens', label: 'Caregiver & Silent Burdens' },
  { value: 'Grief, Faith & Belonging', label: 'Grief, Faith & Belonging' },
];

const SUPPORT_STAGES: string[] = [
  'Chronic Stress, Anxiety & Sleeplessness',
  'Trauma Recovery & Emotional Healing',
  'Caregiver / Special Needs Parent Burnout',
  'Grief, Loss & Faith Pressure',
  'Youth / Student Pressure (15–24)',
];

export function MentalHealthTraumaPage() {
  const { data } = useSiteData();
  const guides = data?.asdGuides || [];
  const [activePillar, setActivePillar] = useState<string>('All');
  const [teaCoverMode, setTeaCoverMode] = useState(false);

  // Confidential Mental Health, Trauma & Stress Intake State
  const [parentName, setParentName] = useState('');
  const [childAgeGroup, setChildAgeGroup] = useState<string>(
    'Chronic Stress, Anxiety & Sleeplessness'
  );
  const [contact, setContact] = useState('');
  const [topicNeeded, setTopicNeeded] = useState('Trauma & Nervous System Recovery');
  const [questionOrStory, setQuestionOrStory] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const visibleGuides = useMemo(() => {
    if (activePillar === 'All') return guides;
    return guides.filter((g) => g.pillar === activePillar);
  }, [guides, activePillar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateAsdSupportRequest({
      parentName,
      childAgeGroup,
      contact,
      topicNeeded,
      questionOrStory,
      consentAccepted,
      website_url: honeypot,
    });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/asd-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentName,
          childAgeGroup,
          contact,
          topicNeeded,
          questionOrStory,
          consentAccepted,
          website_url: honeypot,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.errors) setErrors(result.errors);
        setSubmitError(result.error || 'Could not submit your evening listening note.');
        return;
      }
      setConfirmation(
        result.message ||
          'Thank you for reaching out. A listening companion from His & Hers Circle of Hope will respond gently and privately.'
      );
      setParentName('');
      setContact('');
      setQuestionOrStory('');
      setConsentAccepted(false);
    } catch {
      setSubmitError('Network error while sending your message.');
    } finally {
      setSubmitting(false);
    }
  };

  if (teaCoverMode) {
    return (
      <section className="py-16 sm:py-24 bg-[#FAF7F2] min-h-[75vh]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#3B155F]/12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#256358] inline-flex items-center gap-1.5">
              <Coffee className="w-4 h-4" aria-hidden="true" />
              Ruiru Kitchen Table &amp; Garden Notes
            </span>
            <button
              type="button"
              onClick={() => setTeaCoverMode(false)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#256358] text-white hover:bg-[#1D4E46]"
            >
              Return to Mental Health &amp; Trauma View
            </button>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
            Warm Spiced Masala Chai &amp; Evening Kitchen Garden Notes
          </h1>
          <p className="text-base text-[#3E3349] leading-relaxed">
            Simmer two cups of fresh milk with one cup of water, crushed green cardamom pods, a
            thumb of grated fresh ginger, and loose Kenyan black tea leaves for five unhurried
            minutes. Strain into warm mugs and share beside sweet potatoes or mandazi while neighbours
            catch up on the afternoon.
          </p>
          <div className="bg-white border border-[#256358]/20 rounded-xl p-6 space-y-2 text-sm text-[#3E3349]">
            <p className="font-semibold text-[#1D4E46]">Simple Kitchen Porch Checklist</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Water sukuma wiki and dhania beds once the evening sun drops.</li>
              <li>Soak dry beans overnight ahead of Friday neighbour fellowship supper.</li>
              <li>Save two clean blankets for elder doorstep check-ins this Saturday.</li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div>
      {/* Warm Trauma-Informed & Mental Health Hero */}
      <section className="bg-[#256358] text-[#FAF7F2] py-16 sm:py-24 border-b border-[#D4AF37]/25">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#F3D79B]">
                Mental Health, Trauma &amp; Stress Wing · His &amp; Hers Circle of Hope
              </p>
              <button
                type="button"
                onClick={() => setTeaCoverMode(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/15 hover:bg-white/25 text-[11px] font-semibold text-[#FAF7F2] border border-white/20 transition-colors"
              >
                <Coffee className="w-3.5 h-3.5 text-[#F3D79B]" aria-hidden="true" />
                Switch to Quick Tea Cover Page
              </button>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              Trauma Recovery, Stress Relief &amp; Mental Health Without Shame
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/90 leading-relaxed">
              In Ruiru and neighbourhoods across Kenya, many adults, single mothers, parents caring
              for children with special needs, and elders carry unspoken trauma, panic, or exhaustion
              behind a polite smile. Access nervous-system grounding exercises, trauma-informed
              listening, and confidential counselling that honours both clinical wisdom and faith.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#quiet-rest-guides"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap"
              >
                Explore Trauma &amp; Stress Guides
              </a>
              <a
                href="#listening-tea-intake"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#FAF7F2] border border-white/35 hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
              >
                Request Mental Health Callback
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/25 shadow-xl bg-[#143731]">
              <SafeImage
                src="/src/assets/images/trauma_calm_listening_1795094868840.jpg"
                alt="Calm sunlit Kenyan community room with two neighbours sitting quietly in trauma-informed listening over tea"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-2.5 text-xs text-[#F3D79B]/90">
              Trauma-informed listening, stress grounding, and caregiver care rooted in dignity across 47 counties.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Trauma & Stress Grounding Planner */}
      <TraumaGroundingPlanner />

      {/* Practical Trauma, Stress & Mental Health Guides */}
      <section
        id="quiet-rest-guides"
        className="py-16 sm:py-24 bg-[#EDF6F3] border-b border-[#256358]/15"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#256358]">
                Practical Mental Health &amp; Trauma Care Library
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Evidence-Grounded Tools for Trauma, Panic, Stress &amp; Caregiver Burnout
              </h2>
              <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                Filter across nervous system stabilisation, sleep &amp; stress, caregiver fatigue,
                and grief recovery to practise steady care at home.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-[#256358]/20 rounded-lg self-start">
              {PILLAR_FILTERS.map((pillar) => (
                <button
                  key={pillar.value}
                  type="button"
                  onClick={() => setActivePillar(pillar.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activePillar === pillar.value
                      ? 'bg-[#256358] text-white'
                      : 'text-[#3E3349] hover:text-[#1E0B2B]'
                  }`}
                >
                  {pillar.label}
                </button>
              ))}
            </div>
          </div>

          <div key={activePillar} className="tab-panel-smooth grid grid-cols-1 md:grid-cols-2 gap-8">
            {visibleGuides.map((guide, idx) => (
              <article
                key={guide.id}
                className="bg-white border border-[#256358]/15 rounded-xl p-6 sm:p-8 space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#665B73]">
                    <span className="font-semibold text-[#256358] tabular-nums">
                      0{idx + 1}. {guide.pillar}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{guide.audienceTag}</span>
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                    {guide.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                    {guide.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#256358]/10 space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5A10] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C2593F]" aria-hidden="true" />
                    Try These 3 Steady Steps
                  </p>
                  <ol className="space-y-2 text-sm text-[#1A1224] leading-relaxed list-decimal pl-5">
                    {guide.practicalSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Discreet Evening Tea & Listening Request Form */}
      <section id="listening-tea-intake" className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
              “And how are you doing?”
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
              Speak With a Listening Friend or Join a Quiet Tea Table
            </h2>
            <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
              Carrying unresolved grief, sleeplessness, heavy days, caregiver exhaustion, or silent
              household pressure does not mean weak faith. Write privately to our circle team to
              book a quiet listening call or join a small afternoon tea circle.
            </p>

            <div className="bg-[#FDF6EE] border border-[#C2593F]/20 rounded-xl p-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#C2593F]">
                Need One-on-One Guidance or Urgent Support?
              </p>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                For private one-on-one sessions or anonymous note sharing, visit{' '}
                <AppLink href="/counselling" className="underline text-[#3B155F] font-semibold">
                  Talk to a Counsellor
                </AppLink>
                . For 24-hour listening lines in Kenya, call{' '}
                <a href="tel:+254722178177" className="font-semibold text-[#256358] underline">
                  <PhoneCall className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
                  Befrienders Kenya (+254 722 178 177)
                </a>{' '}
                or{' '}
                <a href="tel:1199" className="font-semibold text-[#256358] underline">
                  Kenya Red Cross (1199)
                </a>
                .
              </p>
            </div>

            <div className="bg-[#EDF6F3] border border-[#256358]/20 rounded-xl p-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                Supporting Single Mothers &amp; Families of Differently Abled Children
              </p>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                Caring for a child with disability alongside intense stress or burnout?{' '}
                <AppLink
                  href="/special-needs-families"
                  className="underline text-[#256358] font-semibold inline-flex items-center gap-1"
                >
                  Open Special Needs Kids &amp; Mothers Care Hub
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </AppLink>
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            {confirmation ? (
              <div
                role="status"
                className="bg-white border border-[#256358]/20 rounded-xl p-8 sm:p-10 space-y-5"
              >
                <div className="flex items-start gap-3.5">
                  <CheckCircle2
                    className="w-6 h-6 text-[#256358] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                      Mental Health &amp; Trauma Request Received
                    </h3>
                    <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                      {confirmation}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmation(null)}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#256358] border border-[#256358]/25 rounded-md hover:bg-[#EDF6F3]"
                >
                  Send Another Request
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-white border border-[#3B155F]/15 rounded-xl p-6 sm:p-10 space-y-5"
              >
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#3B155F]/10">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                      Mental Health, Trauma &amp; Stress Intake
                    </h3>
                    <p className="text-sm text-[#665B73] mt-1">
                      Private, confidential outreach across Ruiru, Nairobi &amp; all 47 counties.
                    </p>
                  </div>
                  <HeartHandshake className="w-5 h-5 text-[#256358] shrink-0" aria-hidden="true" />
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="mh-website-url">Website</label>
                  <input
                    id="mh-website-url"
                    type="text"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="mh-name"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Your Name (or First Name) <span className="text-[#C2593F]">*</span>
                    </label>
                    <input
                      id="mh-name"
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                    {errors.parentName && (
                      <p className="mt-1 text-xs text-red-700" role="alert">
                        {errors.parentName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="mh-stage"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Primary Concern / Season
                    </label>
                    <select
                      id="mh-stage"
                      value={childAgeGroup}
                      onChange={(e) => setChildAgeGroup(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      {SUPPORT_STAGES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="mh-contact"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Phone, WhatsApp, or Email <span className="text-[#C2593F]">*</span>
                    </label>
                    <input
                      id="mh-contact"
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                    {errors.contact && (
                      <p className="mt-1 text-xs text-red-700" role="alert">
                        {errors.contact}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="mh-topic"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Support Focus Needed
                    </label>
                    <select
                      id="mh-topic"
                      value={topicNeeded}
                      onChange={(e) => setTopicNeeded(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      <option value="Trauma & Nervous System Recovery">
                        Trauma &amp; Nervous System Recovery
                      </option>
                      <option value="Panic, Anxiety & Evening Overwhelm">
                        Panic, Anxiety &amp; Evening Overwhelm
                      </option>
                      <option value="Caregiver & Parent Fatigue Support">
                        Caregiver &amp; Parent Fatigue Support
                      </option>
                      <option value="Grief, Loss & Faith Encouragement">
                        Grief, Loss &amp; Faith Encouragement
                      </option>
                      <option value="Trauma-Informed Counselling Referral">
                        Trauma-Informed Counselling Referral
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mh-question"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    Share Briefly What You Are Carrying <span className="text-[#C2593F]">*</span>
                  </label>
                  <textarea
                    id="mh-question"
                    rows={4}
                    required
                    value={questionOrStory}
                    onChange={(e) => setQuestionOrStory(e.target.value)}
                    placeholder="Tell us gently what has felt heavy lately or when a quiet call suits you best..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                  {errors.questionOrStory && (
                    <p className="mt-1 text-xs text-red-700" role="alert">
                      {errors.questionOrStory}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-start gap-3">
                    <input
                      id="mh-consent"
                      type="checkbox"
                      checked={consentAccepted}
                      onChange={(e) => setConsentAccepted(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#256358] rounded cursor-pointer"
                    />
                    <label
                      htmlFor="mh-consent"
                      className="text-xs sm:text-sm text-[#3E3349] leading-relaxed cursor-pointer"
                    >
                      I consent to His &amp; Hers Circle of Hope’s listening desk reviewing this note
                      privately under our{' '}
                      <AppLink href="/privacy" className="underline text-[#3B155F] font-medium">
                        Privacy &amp; Safeguarding Policy
                      </AppLink>
                      .
                    </label>
                  </div>
                  {errors.consentAccepted && (
                    <p className="text-xs text-red-700" role="alert">
                      {errors.consentAccepted}
                    </p>
                  )}
                </div>

                {submitError && (
                  <p role="alert" className="text-xs text-red-700 bg-red-50 p-3 rounded-md">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#256358] hover:bg-[#1C4D44] disabled:opacity-60 rounded-md transition-colors"
                >
                  {submitting ? 'Sending...' : 'Connect With a Listening Friend'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
