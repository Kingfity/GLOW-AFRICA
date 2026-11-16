import React, { useState } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { validatePrayerRequest } from '../utils/validation';

export function PrayerRequestForm() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [requestText, setRequestText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validatePrayerRequest({
      name,
      contact,
      requestText,
      isAnonymous,
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
      const res = await fetch('/api/prayer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contact,
          requestText,
          isAnonymous,
          consentAccepted,
          website_url: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setSubmitError(data.error || 'We could not send your prayer request. Please try again.');
        return;
      }
      setSubmittedMessage(
        data.message || 'Your prayer request has been received privately by our prayer team.'
      );
      setName('');
      setContact('');
      setRequestText('');
      setIsAnonymous(false);
      setConsentAccepted(false);
    } catch {
      setSubmitError('Network error while sending your prayer request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedMessage) {
    return (
      <div
        role="status"
        className="bg-white border border-[#3B155F]/15 rounded-lg p-8 sm:p-10 space-y-5"
      >
        <div className="flex items-start gap-3.5">
          <CheckCircle2 className="w-6 h-6 text-[#3B155F] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
              We Are Standing With You in Prayer
            </h3>
            <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
              {submittedMessage}
            </p>
            <p className="text-xs text-[#665B73]">
              For your privacy and dignity, prayer requests are never published on this website and
              are reviewed confidentially by our intercessory team.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSubmittedMessage(null)}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#3B155F] border border-[#3B155F]/25 rounded-md hover:bg-[#F3EEF8] transition-colors"
        >
          Submit Another Prayer Request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white border border-[#3B155F]/15 rounded-lg p-6 sm:p-10 space-y-6"
    >
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#3B155F]/10">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
            Share a Prayer Request
          </h3>
          <p className="text-sm text-[#665B73] mt-1">
            Handled privately and respectfully. Never displayed publicly.
          </p>
        </div>
        <Lock className="w-5 h-5 text-[#7A5A10] shrink-0" aria-hidden="true" />
      </div>

      {/* Honeypot field hidden from human visitors */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="prayer-website-url">Website</label>
        <input
          id="prayer-website-url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 bg-[#F3EEF8]/70 border border-[#3B155F]/10 rounded-md px-4 py-3">
        <input
          id="prayer-anonymous"
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="w-4 h-4 accent-[#3B155F] rounded cursor-pointer"
        />
        <label htmlFor="prayer-anonymous" className="text-sm font-medium text-[#1E0B2B] cursor-pointer">
          Submit this prayer request anonymously (omit my name and contact details)
        </label>
      </div>

      {!isAnonymous && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="prayer-name" className="block text-sm font-medium text-[#1E0B2B] mb-1.5">
              Your Name <span className="text-[#665B73] font-normal">(Optional)</span>
            </label>
            <input
              id="prayer-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name or full name"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1A1224] placeholder:text-[#665B73]/70"
            />
          </div>
          <div>
            <label
              htmlFor="prayer-contact"
              className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
            >
              Email or Phone <span className="text-[#665B73] font-normal">(Optional)</span>
            </label>
            <input
              id="prayer-contact"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="If you would like someone to follow up"
              aria-invalid={Boolean(errors.contact)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1A1224] placeholder:text-[#665B73]/70"
            />
            {errors.contact && (
              <p className="mt-1.5 text-xs text-red-700" role="alert">
                {errors.contact}
              </p>
            )}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="prayer-request-text" className="block text-sm font-medium text-[#1E0B2B] mb-1.5">
          How Can We Pray With You? <span className="text-[#7A5A10]">*</span>
        </label>
        <textarea
          id="prayer-request-text"
          rows={5}
          required
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          placeholder="Share what is on your heart—whether thanksgiving, healing, guidance, family needs, or strength for this season."
          aria-invalid={Boolean(errors.requestText)}
          className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1A1224] placeholder:text-[#665B73]/70 leading-relaxed"
        />
        {errors.requestText && (
          <p className="mt-1.5 text-xs text-red-700" role="alert">
            {errors.requestText}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <input
            id="prayer-consent"
            type="checkbox"
            checked={consentAccepted}
            onChange={(e) => setConsentAccepted(e.target.checked)}
            aria-invalid={Boolean(errors.consentAccepted)}
            className="w-4 h-4 mt-0.5 accent-[#3B155F] rounded cursor-pointer"
          />
          <label htmlFor="prayer-consent" className="text-xs sm:text-sm text-[#3E3349] leading-relaxed cursor-pointer">
            I consent to HIS AND HERS’s pastoral and care team receiving this request privately in
            accordance with our{' '}
            <AppLink href="/privacy" className="underline text-[#3B155F] font-medium">
              Privacy Policy
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
        <div role="alert" className="p-3.5 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
          {submitError}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] disabled:opacity-60 rounded-md transition-colors duration-150 whitespace-nowrap"
        >
          {submitting ? 'Sending Prayer Request...' : 'Submit Prayer Request'}
        </button>
      </div>
    </form>
  );
}
