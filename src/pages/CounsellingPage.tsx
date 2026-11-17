import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Lock, PhoneCall } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { CalmBreathWidget } from '../components/CalmBreathWidget';
import { openCrisisTextChat } from '../components/CareGuideChatbot';
import { useSiteData } from '../context/SiteDataContext';
import { SafeImage } from '../components/SafeImage';
import type { CounsellingRequest } from '../shared/types';
import { validateCounsellingRequest } from '../utils/validation';

const SUPPORT_AREAS: CounsellingRequest['supportArea'][] = [
  'Individual Counselling',
  'Lighten Your Burden (Listening Ear)',
  'Anxiety, Stress & Burnout',
  'Grief & Loss Support',
  'Family & Relationship Guidance',
  'Youth Mental Health Support',
];

const CONTACT_METHODS: CounsellingRequest['preferredMethod'][] = [
  'Phone Call',
  'WhatsApp Chat',
  'Email',
  'In-Person / Video Session',
];

const URGENCY_LEVELS: CounsellingRequest['urgency'][] = [
  'Routine (Within 48 hours)',
  'Priority (Within 24 hours)',
  'Urgent Today',
];

export function CounsellingPage() {
  const { data } = useSiteData();
  const settings = data?.settings;

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [preferredMethod, setPreferredMethod] =
    useState<CounsellingRequest['preferredMethod']>('Phone Call');
  const [supportArea, setSupportArea] =
    useState<CounsellingRequest['supportArea']>('Individual Counselling');
  const [urgency, setUrgency] =
    useState<CounsellingRequest['urgency']>('Routine (Within 48 hours)');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateCounsellingRequest({
      name,
      contact,
      preferredMethod,
      supportArea,
      urgency,
      isAnonymous,
      message,
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
      const res = await fetch('/api/counselling-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contact,
          preferredMethod,
          supportArea,
          urgency,
          isAnonymous,
          message,
          consentAccepted,
          website_url: honeypot,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.errors) setErrors(result.errors);
        setSubmitError(result.error || 'Could not submit your request. Please try again.');
        return;
      }
      setConfirmation(
        result.message ||
          'Your request has been received confidentially. A counsellor will reach out through your preferred channel.'
      );
      setName('');
      setContact('');
      setMessage('');
      setIsAnonymous(false);
      setConsentAccepted(false);
    } catch {
      setSubmitError('Network error while sending your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E0B2B] via-[#3B155F] to-[#256358] text-[#FAF7F2] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Mental Health &amp; Wellbeing Space
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              Talk to a Counsellor. Lighten Your Burden.
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/85 leading-relaxed">
              Emotional exhaustion, grief, anxiety, and quiet trauma do not have to be carried in
              silence. At HIS AND HERS, our counsellors and trained care companions hold a safe,
              stigma-free space where you can speak honestly and receive steady guidance.
            </p>
            <div className="flex flex-wrap gap-3.5 pt-1">
              <a
                href="#counselling-form"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#160822] bg-[#D4AF37] hover:bg-[#E5CA7B] rounded-md transition-colors"
              >
                Speak With a Counsellor
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => openCrisisTextChat()}
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#256358] hover:bg-[#1D4E46] rounded-md transition-colors"
              >
                Open Confidential Crisis Text Chat
              </button>
              <AppLink
                href="/prayer-worship"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-[#FAF7F2] border border-white/30 hover:bg-white/10 rounded-md transition-colors"
              >
                Prayer &amp; Spiritual Care
              </AppLink>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-[4/3] rounded-lg overflow-hidden border border-white/15">
              <SafeImage
                src="/src/assets/images/counselling_safe_space_1794823558841.jpg"
                alt="Calm sunlit counselling room with comfortable timber chairs and plants"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Calm Grounding Breath & Private Local Burden Release */}
      <CalmBreathWidget />

      {/* Main Content + Form */}
      <section id="counselling-form" className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
                What to Expect
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Compassionate Listening &amp; Professional Care
              </h2>
              <p className="text-base text-[#3E3349] leading-relaxed">
                Whether you want an ongoing counselling conversation, support through grief and
                burnout, or simply an anonymous space to unburden your heart, every disclosure is
                treated with complete respect and privacy.
              </p>
            </div>

            <div className="space-y-4 pt-2 border-t border-[#3B155F]/12">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                  01. Confidential &amp; Judgement-Free
                </h3>
                <p className="text-sm text-[#3E3349] mt-1 leading-relaxed">
                  Nothing shared here is ever posted publicly. Requests are accessed only by
                  authorised HIS AND HERS care and counselling coordinators.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                  02. Faith &amp; Mental Health Together
                </h3>
                <p className="text-sm text-[#3E3349] mt-1 leading-relaxed">
                  We champion professional counselling alongside compassionate community support—you
                  decide whether you want purely clinical/practical support or prayer as well.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#3B155F]/15 rounded-lg p-6 space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5A10] inline-flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                Immediate Crisis Notice
              </p>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                {settings?.emergencyHotlineNote ||
                  'If you or a child is in immediate physical danger or acute crisis, please contact local emergency services immediately.'}
              </p>
              <p className="text-xs text-[#665B73]">
                Fleeing abuse?{' '}
                <AppLink
                  href="/find-my-home"
                  className="text-[#3B155F] font-semibold underline underline-offset-4"
                >
                  Visit Find My Home Safe Refuge
                </AppLink>
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            {confirmation ? (
              <div
                role="status"
                className="bg-white border border-[#3B155F]/15 rounded-lg p-8 sm:p-10 space-y-5"
              >
                <div className="flex items-start gap-3.5">
                  <CheckCircle2
                    className="w-6 h-6 text-[#3B155F] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                      You Are Not Carrying This Alone
                    </h3>
                    <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                      {confirmation}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmation(null)}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#3B155F] border border-[#3B155F]/25 rounded-md hover:bg-[#F3EEF8]"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-white border border-[#3B155F]/15 rounded-lg p-6 sm:p-10 space-y-6"
              >
                <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#3B155F]/10">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                      Talk to a Counsellor or Lighten Your Burden
                    </h3>
                    <p className="text-sm text-[#665B73] mt-1">
                      Request a callback or share anonymously in confidence.
                    </p>
                  </div>
                  <Lock className="w-5 h-5 text-[#7A5A10] shrink-0" aria-hidden="true" />
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="cnsl-website-url">Website</label>
                  <input
                    id="cnsl-website-url"
                    type="text"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 bg-[#F3EEF8]/70 border border-[#3B155F]/10 rounded-md px-4 py-3">
                  <input
                    id="cnsl-anonymous"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 accent-[#3B155F] rounded cursor-pointer"
                  />
                  <label
                    htmlFor="cnsl-anonymous"
                    className="text-sm font-medium text-[#1E0B2B] cursor-pointer"
                  >
                    Share anonymously just to lighten my burden (no follow-up contact required)
                  </label>
                </div>

                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="cnsl-name"
                        className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                      >
                        Your Name or Preferred Name
                      </label>
                      <input
                        id="cnsl-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="First name is completely fine"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cnsl-contact"
                        className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                      >
                        Phone, WhatsApp, or Email <span className="text-[#7A5A10]">*</span>
                      </label>
                      <input
                        id="cnsl-contact"
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="How a counsellor can reach you"
                        aria-invalid={Boolean(errors.contact)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                      />
                      {errors.contact && (
                        <p className="mt-1 text-xs text-red-700" role="alert">
                          {errors.contact}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="cnsl-area"
                      className="block text-xs font-semibold uppercase tracking-wide text-[#3E3349] mb-1.5"
                    >
                      Area of Support
                    </label>
                    <select
                      id="cnsl-area"
                      value={supportArea}
                      onChange={(e) =>
                        setSupportArea(e.target.value as CounsellingRequest['supportArea'])
                      }
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      {SUPPORT_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="cnsl-method"
                      className="block text-xs font-semibold uppercase tracking-wide text-[#3E3349] mb-1.5"
                    >
                      Preferred Contact
                    </label>
                    <select
                      id="cnsl-method"
                      value={preferredMethod}
                      onChange={(e) =>
                        setPreferredMethod(e.target.value as CounsellingRequest['preferredMethod'])
                      }
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      {CONTACT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="cnsl-urgency"
                      className="block text-xs font-semibold uppercase tracking-wide text-[#3E3349] mb-1.5"
                    >
                      Urgency
                    </label>
                    <select
                      id="cnsl-urgency"
                      value={urgency}
                      onChange={(e) =>
                        setUrgency(e.target.value as CounsellingRequest['urgency'])
                      }
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      {URGENCY_LEVELS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="cnsl-message"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    What Would You Like to Share? <span className="text-[#7A5A10]">*</span>
                  </label>
                  <textarea
                    id="cnsl-message"
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write freely at your own pace. Share as much or as little as feels safe right now."
                    aria-invalid={Boolean(errors.message)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md leading-relaxed"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-700" role="alert">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-start gap-3">
                    <input
                      id="cnsl-consent"
                      type="checkbox"
                      checked={consentAccepted}
                      onChange={(e) => setConsentAccepted(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#3B155F] rounded cursor-pointer"
                    />
                    <label
                      htmlFor="cnsl-consent"
                      className="text-xs sm:text-sm text-[#3E3349] leading-relaxed cursor-pointer"
                    >
                      I consent to HIS AND HERS’s confidential counselling and care team reviewing
                      this message under our{' '}
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
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] disabled:opacity-60 rounded-md transition-colors"
                >
                  {submitting ? 'Sending Confidentially...' : 'Connect With a Counsellor'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
