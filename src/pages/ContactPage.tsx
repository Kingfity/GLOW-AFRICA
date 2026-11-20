import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { validateContactMessage } from '../utils/validation';

export function ContactPage() {
  const { data } = useSiteData();
  const settings = data?.settings;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const whatsappDigits = (settings?.whatsappNumber || '254700000000').replace(/\D/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateContactMessage({
      fullName,
      email,
      subject,
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          subject,
          message,
          website_url: honeypot,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.errors) setErrors(result.errors);
        setSubmitError(result.error || 'Could not send your message. Please try again.');
        return;
      }
      setConfirmation(
        result.message || 'Thank you for reaching out to His & Hers Circle of Hope. We will respond soon.'
      );
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      setSubmitError('Network error while sending your message.');
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
              Contact Us
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              We Would Love to Welcome You and Hear From You
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/85 leading-relaxed">
              Whether you are seeking care, organizing a corporate or group visit to a children’s
              home, or exploring community partnership with His &amp; Hers Circle of Hope, reach out through any of
              the channels below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Official Contact Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#3B155F]/12 rounded-lg p-6 sm:p-8 space-y-6">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Official Contact Details
              </h2>

              <div className="space-y-5 text-sm text-[#3E3349]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#3B155F] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-[#1E0B2B]">
                      {settings?.primaryLocationLabel || 'Primary Community Centre'}
                    </p>
                    <p className="mt-0.5 text-[#665B73]">
                      {settings?.primaryAddress ||
                        'Exact street address and directions configurable in Admin CMS.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#3B155F] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-[#1E0B2B]">Email</p>
                    <a
                      href={`mailto:${settings?.contactEmail || 'care@hisandhers.org'}`}
                      className="text-[#3B155F] hover:text-[#7A5A10] underline underline-offset-4"
                    >
                      {settings?.contactEmail || 'care@hisandhers.org'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#3B155F] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-[#1E0B2B]">Telephone</p>
                    <a
                      href={`tel:${(settings?.contactPhone || '').replace(/\s+/g, '')}`}
                      className="tabular-nums text-[#3B155F] hover:text-[#7A5A10]"
                    >
                      {settings?.contactPhone || '+254 700 000 000'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle
                    className="w-5 h-5 text-[#3B155F] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-[#1E0B2B]">WhatsApp</p>
                    <a
                      href={`https://wa.me/${whatsappDigits}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#3B155F] hover:text-[#7A5A10] underline underline-offset-4"
                    >
                      Message on WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-[#3B155F]/10 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5A10]">
                  Social Channels
                </p>
                <div className="flex flex-wrap gap-4 text-sm font-medium text-[#3B155F]">
                  {settings?.instagramUrl && (
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      Instagram
                    </a>
                  )}
                  {settings?.facebookUrl && (
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      Facebook
                    </a>
                  )}
                  {settings?.youtubeUrl && (
                    <a
                      href={settings.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            {confirmation ? (
              <div
                role="status"
                className="bg-white border border-[#3B155F]/15 rounded-lg p-8 sm:p-10 space-y-5"
              >
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-6 h-6 text-[#3B155F] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                      Message Received
                    </h2>
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
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-white border border-[#3B155F]/15 rounded-lg p-6 sm:p-10 space-y-5"
              >
                <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B] pb-4 border-b border-[#3B155F]/10">
                  Send a Direct Message
                </h2>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="contact-website-url">Website</label>
                  <input
                    id="contact-website-url"
                    type="text"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Your Name <span className="text-[#7A5A10]">*</span>
                    </label>
                    <input
                      id="contact-name"
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
                      htmlFor="contact-email"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Email Address <span className="text-[#7A5A10]">*</span>
                    </label>
                    <input
                      id="contact-email"
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

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    Subject <span className="text-[#7A5A10]">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Gathering directions, partnership, general enquiry"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-700" role="alert">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    Message <span className="text-[#7A5A10]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
                  {submitting ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
