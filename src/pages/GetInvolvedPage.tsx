import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { validateVolunteerEnquiry } from '../utils/validation';

const PARTICIPATION_PATHS = [
  {
    index: '01.',
    title: 'Join the Prayer Movement',
    description:
      'Stand alongside our intercessory community during midweek prayer watches or commit to praying regularly for families and communities.',
    actionLabel: 'Explore Prayer & Worship',
    actionHref: '/prayer-worship',
  },
  {
    index: '02.',
    title: 'Attend Worship Gatherings',
    description:
      'Come as you are to an upcoming worship gathering or special service. Bring a friend, experience fellowship, and find a welcoming spiritual home.',
    actionLabel: 'View Upcoming Gatherings',
    actionHref: '/events',
  },
  {
    index: '03.',
    title: 'Volunteer in Community Initiatives',
    description:
      'Serve practically in neighbourhood food sharing, family visitation, youth mentorship tables, logistics, or hospitality.',
    actionLabel: 'Apply Below',
    actionHref: '#volunteer-form',
  },
  {
    index: '04.',
    title: 'Partner With GLOW',
    description:
      'Fellowships, community groups, and individuals can collaborate with us on compassionate outreach initiatives and neighbourhood support.',
    actionLabel: 'Contact Leadership',
    actionHref: '/contact',
  },
];

const INTEREST_AREAS = [
  'Community Outreach & Food Care',
  'Prayer & Intercession Team',
  'Worship & Sanctuary Hospitality',
  'Youth Encouragement & Mentorship',
  'Media, Communications & Storytelling',
  'Community Partnership / Collaboration',
];

export function GetInvolvedPage() {
  const { data } = useSiteData();
  const settings = data?.settings;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [areaOfInterest, setAreaOfInterest] = useState(INTEREST_AREAS[0]);
  const [availability, setAvailability] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateVolunteerEnquiry({
      fullName,
      email,
      phone,
      areaOfInterest,
      availability,
      message,
      website_url: honeypot,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          areaOfInterest,
          availability,
          message,
          website_url: honeypot,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.errors) setErrors(result.errors);
        setSubmitError(result.error || 'Unable to submit enquiry. Please try again.');
        return;
      }
      setConfirmation(
        result.message ||
          'Thank you for stepping forward to serve. Our coordination team will connect with you.'
      );
      setFullName('');
      setEmail('');
      setPhone('');
      setAvailability('');
      setMessage('');
    } catch {
      setSubmitError('Network error while submitting your enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-[#1E0B2B] text-[#FAF7F2] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Get Involved
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              From Visitor to Companion in Mission
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/85 leading-relaxed">
              GLOW Church Africa grows through ordinary people offering prayer, time, warmth, and
              compassionate service. Discover where your heart and hands fit.
            </p>
          </div>
        </div>
      </section>

      {/* Four Ways to Participate */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#3B155F]/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
            {PARTICIPATION_PATHS.map((item) => (
              <div key={item.index} className="pt-6 border-t border-[#3B155F]/15 space-y-3">
                <p className="text-xs font-semibold text-[#7A5A10] tabular-nums">{item.index}</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
                  {item.title}
                </h2>
                <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                  {item.description}
                </p>
                <div className="pt-1">
                  {item.actionHref.startsWith('#') ? (
                    <a
                      href={item.actionHref}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B155F] hover:text-[#7A5A10]"
                    >
                      {item.actionLabel}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <AppLink
                      href={item.actionHref}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B155F] hover:text-[#7A5A10]"
                    >
                      {item.actionLabel}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </AppLink>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Enquiry Form & Approved Resource Contribution Guidance */}
      <section id="volunteer-form" className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
              Serve &amp; Steward Together
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Volunteer or Partner Enquiry
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              Let us know how you would like to participate—whether serving at an outreach day,
              joining an intercession team, or welcoming newcomers.
            </p>

            <div className="bg-white border border-[#3B155F]/12 rounded-lg p-6 space-y-3">
              <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                Charitable Support &amp; Stewardship
              </h3>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                {settings?.approvedGivingNote ||
                  'Stewardship and charitable contributions are coordinated strictly through verified GLOW Church Africa channels confirmed directly by our leadership team.'}
              </p>
              <AppLink
                href="/contact"
                className="inline-block text-sm font-semibold text-[#3B155F] hover:text-[#7A5A10] underline underline-offset-4"
              >
                Enquire About Approved Stewardship Channels
              </AppLink>
            </div>
          </div>

          <div className="lg:col-span-7">
            {confirmation ? (
              <div
                role="status"
                className="bg-white border border-[#3B155F]/15 rounded-lg p-8 sm:p-10 space-y-5"
              >
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-6 h-6 text-[#3B155F] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                      Volunteer Enquiry Received
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
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-white border border-[#3B155F]/15 rounded-lg p-6 sm:p-10 space-y-5"
              >
                <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B] pb-4 border-b border-[#3B155F]/10">
                  Express Interest to Serve
                </h3>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="vol-website-url">Website</label>
                  <input
                    id="vol-website-url"
                    type="text"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="vol-name"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Full Name <span className="text-[#7A5A10]">*</span>
                    </label>
                    <input
                      id="vol-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-700" role="alert">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="vol-email"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Email Address <span className="text-[#7A5A10]">*</span>
                    </label>
                    <input
                      id="vol-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-700" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="vol-phone"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Phone / WhatsApp <span className="text-[#665B73] font-normal">(Optional)</span>
                    </label>
                    <input
                      id="vol-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="vol-availability"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Availability <span className="text-[#665B73] font-normal">(Optional)</span>
                    </label>
                    <input
                      id="vol-availability"
                      type="text"
                      placeholder="e.g. Weekends, Midweek evenings"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="vol-area"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    Area of Participation <span className="text-[#7A5A10]">*</span>
                  </label>
                  <select
                    id="vol-area"
                    value={areaOfInterest}
                    onChange={(e) => setAreaOfInterest(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  >
                    {INTEREST_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="vol-message"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    Tell Us Briefly How You Would Like to Help{' '}
                    <span className="text-[#7A5A10]">*</span>
                  </label>
                  <textarea
                    id="vol-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your interest, background, or any questions you have."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-700" role="alert">
                      {errors.message}
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
                  {submitting ? 'Submitting Enquiry...' : 'Submit Volunteer Enquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
