import React, { useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { SafeImage } from '../components/SafeImage';
import { formatEventDate, validateEventRegistration } from '../utils/validation';

export function EventDetailPage({ slug }: { slug: string }) {
  const { data, loading } = useSiteData();
  const event = data?.events.find((e) => e.slug === slug || e.id === slug);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
        <div className="h-72 bg-white border border-[#3B155F]/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-24 text-center space-y-5">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
          Gathering Not Found
        </h1>
        <p className="text-base text-[#3E3349]">
          This event could not be found or has already concluded.
        </p>
        <AppLink
          href="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] rounded-md"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Events
        </AppLink>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateEventRegistration({
      eventId: event.id,
      fullName,
      email,
      phone,
      attendeesCount,
      notes,
      website_url: honeypot,
    });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/event-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          fullName,
          email,
          phone,
          attendeesCount,
          notes,
          website_url: honeypot,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.errors) setErrors(result.errors);
        setSubmitError(result.error || 'Could not complete registration. Please try again.');
        return;
      }
      setConfirmation(result.message || 'Your registration has been received.');
      setFullName('');
      setEmail('');
      setPhone('');
      setAttendeesCount(1);
      setNotes('');
    } catch {
      setSubmitError('Network error while submitting registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2]">
      {/* Banner */}
      <section className="bg-[#1E0B2B] text-[#FAF7F2] py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-5">
          <AppLink
            href="/events"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#E5CA7B] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            All Events &amp; Gatherings
          </AppLink>
          <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
            {event.category}
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-semibold leading-tight">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-6 pt-2 text-sm text-[#FAF7F2]/90">
            <span className="inline-flex items-center gap-2 tabular-nums">
              <Calendar className="w-4 h-4 text-[#D4AF37]" aria-hidden="true" />
              {formatEventDate(event.dateISO)}
            </span>
            <span className="inline-flex items-center gap-2 tabular-nums">
              <Clock className="w-4 h-4 text-[#D4AF37]" aria-hidden="true" />
              {event.timeLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" aria-hidden="true" />
              {event.venue}
            </span>
          </div>
        </div>
      </section>

      {/* Content + Registration */}
      <section className="py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="aspect-[16/10] rounded-lg overflow-hidden border border-[#3B155F]/15 bg-white">
              <SafeImage
                src={event.imageUrl}
                alt={event.imageAlt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
                About This Gathering
              </h2>
              <p className="text-base text-[#3E3349] leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
            <div className="bg-white border border-[#3B155F]/12 rounded-lg p-6 space-y-2">
              <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                Attendance &amp; Hospitality Note
              </h3>
              <p className="text-sm text-[#3E3349] leading-relaxed">{event.registrationNote}</p>
            </div>
          </div>

          <div className="lg:col-span-5">
            {!event.registrationOpen ? (
              <div className="bg-white border border-[#3B155F]/15 rounded-lg p-6 sm:p-8 space-y-3">
                <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                  Open Gathering
                </h2>
                <p className="text-sm text-[#3E3349] leading-relaxed">
                  No advance registration is required for this gathering—simply arrive and feel at
                  home.
                </p>
              </div>
            ) : confirmation ? (
              <div
                role="status"
                className="bg-white border border-[#3B155F]/15 rounded-lg p-6 sm:p-8 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#3B155F] shrink-0" aria-hidden="true" />
                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                      RSVP Confirmed
                    </h2>
                    <p className="text-sm text-[#3E3349] leading-relaxed">{confirmation}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmation(null)}
                  className="text-sm font-semibold text-[#3B155F] hover:text-[#7A5A10] underline"
                >
                  Register another guest
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleRegister}
                noValidate
                className="bg-white border border-[#3B155F]/15 rounded-lg p-6 sm:p-8 space-y-5"
              >
                <div className="pb-4 border-b border-[#3B155F]/10">
                  <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                    Let Us Know You’re Coming
                  </h2>
                  <p className="text-xs sm:text-sm text-[#665B73] mt-1">
                    Registering helps our hospitality team welcome you well.
                  </p>
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="evt-website-url">Website</label>
                  <input
                    id="evt-website-url"
                    type="text"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="reg-name" className="block text-sm font-medium text-[#1E0B2B] mb-1">
                    Full Name <span className="text-[#7A5A10]">*</span>
                  </label>
                  <input
                    id="reg-name"
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
                  <label htmlFor="reg-email" className="block text-sm font-medium text-[#1E0B2B] mb-1">
                    Email Address <span className="text-[#7A5A10]">*</span>
                  </label>
                  <input
                    id="reg-email"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-phone" className="block text-sm font-medium text-[#1E0B2B] mb-1">
                      Phone (Optional)
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-count" className="block text-sm font-medium text-[#1E0B2B] mb-1">
                      Attendees
                    </label>
                    <input
                      id="reg-count"
                      type="number"
                      min={1}
                      max={20}
                      value={attendeesCount}
                      onChange={(e) => setAttendeesCount(Number(e.target.value) || 1)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-notes" className="block text-sm font-medium text-[#1E0B2B] mb-1">
                    Notes or Accessibility Needs
                  </label>
                  <textarea
                    id="reg-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                </div>

                {submitError && (
                  <p role="alert" className="text-xs text-red-700 bg-red-50 p-3 rounded-md">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-5 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] disabled:opacity-60 rounded-md transition-colors"
                >
                  {submitting ? 'Submitting RSVP...' : 'Confirm Attendance'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
