import React, { useMemo, useState } from 'react';
import { CheckCircle2, HeartHandshake, Sparkles } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { AsdRoutineBuilder } from '../components/AsdRoutineBuilder';
import { CommunityVideoPlayer } from '../components/CommunityVideoPlayer';
import { useSiteData } from '../context/SiteDataContext';
import type { AsdGuideTip, AsdSupportRequest } from '../shared/types';
import { validateAsdSupportRequest } from '../utils/validation';

const PILLAR_FILTERS: Array<'All' | AsdGuideTip['pillar']> = [
  'All',
  'Sensory-Friendly Home',
  'Calm Overwhelm & Meltdowns',
  'Visual Routines & Speech',
  'Siblings, School & Faith',
];

const AGE_GROUPS: AsdSupportRequest['childAgeGroup'][] = [
  'Early Years (2–5)',
  'Primary Age (6–11)',
  'Teen & Adolescent (12–17)',
  'Young Adult / Caregiver',
];

export function AsdSupportPage() {
  const { data } = useSiteData();
  const guides = data?.asdGuides || [];
  const [activePillar, setActivePillar] = useState<string>('All');

  // Parent Support Form State
  const [parentName, setParentName] = useState('');
  const [childAgeGroup, setChildAgeGroup] =
    useState<AsdSupportRequest['childAgeGroup']>('Primary Age (6–11)');
  const [contact, setContact] = useState('');
  const [topicNeeded, setTopicNeeded] = useState('Calm Overwhelm & Daily Routines');
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
        setSubmitError(result.error || 'Could not submit your ASD family question.');
        return;
      }
      setConfirmation(
        result.message || 'Thank you. Our ASD Family Mentor team will reach out warmly.'
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

  return (
    <div>
      {/* Sensory-Calm Warm Hero */}
      <section className="bg-[#256358] text-[#FAF7F2] py-16 sm:py-24 border-b border-[#D4AF37]/25">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#F3D79B]">
              ASD Parents &amp; Kids Support Space
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              Living Joyfully &amp; Calmly With Autistic Kids
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/90 leading-relaxed">
              Easy-to-read practical tips, sensory home ideas, meltdown regulation guides, and warm
              parent-to-parent encouragement—written so every parent, sibling, grandparent, and
              teacher feels confident and supported.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#asd-daily-guides"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap"
              >
                Read Everyday Living Tips
              </a>
              <a
                href="#asd-mentor-form"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#FAF7F2] border border-white/35 hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
              >
                Ask a Parent Mentor
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-xl overflow-hidden border border-white/20 bg-[#160822]">
              <CommunityVideoPlayer
                videoSrc="/videos/asd_and_family_home_reel.mp4"
                posterSrc="/src/assets/images/doc_asd_family_moment_1794832339166.jpg"
                ariaLabel="Parent and young autistic child playing gently with wooden sensory blocks"
                soundMoodLabel="Warm Marimba Lullaby"
                chapters={[
                  { timeSeconds: 0, label: '01 · Sensory Play' },
                  { timeSeconds: 3.6, label: '02 · Care Family' },
                  { timeSeconds: 7.0, label: '03 · Fellowship' },
                ]}
              />
              <div className="px-5 py-3 bg-[#1B4A42] flex items-center justify-between text-xs text-[#FAF7F2]/85 border-t border-white/10">
                <span>Sensory Routines &amp; Family Peace</span>
                <span className="text-[#F3D79B] tabular-nums">0:10 Reel · Marimba Sound</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Daily Visual Routine Builder */}
      <AsdRoutineBuilder />

      {/* Practical Easy-to-Follow Daily Guides */}
      <section id="asd-daily-guides" className="py-16 sm:py-24 bg-[#EDF6F3] border-b border-[#256358]/15">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#256358]">
                Simple, Friendly Everyday Points
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Helpful Tips for Home, Communication &amp; Calm
              </h2>
              <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                Pick a topic below for clear, judgement-free steps you can try today at your
                child’s own pace.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-[#256358]/20 rounded-lg self-start">
              {PILLAR_FILTERS.map((pillar) => (
                <button
                  key={pillar}
                  type="button"
                  onClick={() => setActivePillar(pillar)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activePillar === pillar
                      ? 'bg-[#256358] text-white'
                      : 'text-[#3E3349] hover:text-[#1E0B2B]'
                  }`}
                >
                  {pillar}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    Try These 3 Gentle Steps
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

      {/* Parent Support & Mentor Connection Form */}
      <section id="asd-mentor-form" className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
              You Are Not Walking Alone
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
              Talk With an ASD Parent Mentor or Join Our Next Play Morning
            </h2>
            <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
              Need ideas for fussy eating, non-speaking communication tools, sibling questions, or
              a calm community &amp; neighbourhood welcome? Write to us—our mentors and fellow ASD
              parents love to share what really helps at home.
            </p>
            <div className="bg-[#FDF6EE] border border-[#C2593F]/20 rounded-xl p-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#C2593F]">
                Need Emotional Support as a Parent Too?
              </p>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                Caregiver burnout is real. You can also book a confidential session on our{' '}
                <AppLink href="/counselling" className="underline text-[#3B155F] font-medium">
                  Talk to a Counsellor
                </AppLink>{' '}
                page anytime.
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
                      ASD Family Support Request Received
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
                  Ask Another Question
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
                      Connect With Our ASD Parents &amp; Kids Desk
                    </h3>
                    <p className="text-sm text-[#665B73] mt-1">
                      Warm, private parent coaching and visual routine ideas.
                    </p>
                  </div>
                  <HeartHandshake className="w-5 h-5 text-[#256358] shrink-0" aria-hidden="true" />
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="asd-website-url">Website</label>
                  <input
                    id="asd-website-url"
                    type="text"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="asd-parent-name"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Your Name <span className="text-[#C2593F]">*</span>
                    </label>
                    <input
                      id="asd-parent-name"
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
                      htmlFor="asd-age-group"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Child’s Age Stage
                    </label>
                    <select
                      id="asd-age-group"
                      value={childAgeGroup}
                      onChange={(e) =>
                        setChildAgeGroup(e.target.value as AsdSupportRequest['childAgeGroup'])
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      {AGE_GROUPS.map((g) => (
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
                      htmlFor="asd-contact"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Phone, WhatsApp, or Email <span className="text-[#C2593F]">*</span>
                    </label>
                    <input
                      id="asd-contact"
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
                      htmlFor="asd-topic"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Topic Needed
                    </label>
                    <select
                      id="asd-topic"
                      value={topicNeeded}
                      onChange={(e) => setTopicNeeded(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      <option value="Calm Overwhelm & Daily Routines">
                        Calm Overwhelm &amp; Daily Routines
                      </option>
                      <option value="Sensory Setup at Home">Sensory Setup at Home</option>
                      <option value="Speech & Visual Picture Cards">
                        Speech &amp; Visual Picture Cards
                      </option>
                      <option value="School & Sibling Support">School &amp; Sibling Support</option>
                      <option value="Join ASD Parent Support Circle">
                        Join ASD Parent Support Circle
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="asd-question"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    Tell Us About Your Child or Question <span className="text-[#C2593F]">*</span>
                  </label>
                  <textarea
                    id="asd-question"
                    rows={4}
                    required
                    value={questionOrStory}
                    onChange={(e) => setQuestionOrStory(e.target.value)}
                    placeholder="Share sensory likes/dislikes, daily challenges, or how we can help..."
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
                      id="asd-consent"
                      type="checkbox"
                      checked={consentAccepted}
                      onChange={(e) => setConsentAccepted(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#256358] rounded cursor-pointer"
                    />
                    <label
                      htmlFor="asd-consent"
                      className="text-xs sm:text-sm text-[#3E3349] leading-relaxed cursor-pointer"
                    >
                      I consent to HIS AND HERS’s ASD family care mentor reviewing this note
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
                  {submitting ? 'Sending...' : 'Connect With an ASD Parent Mentor'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
