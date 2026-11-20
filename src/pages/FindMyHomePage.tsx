import React, { useState } from 'react';
import { CheckCircle2, LogOut, MapPin, ShieldAlert, ShieldCheck } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { openCrisisTextChat } from '../components/CareGuideChatbot';
import { openEmergencyAlertModal } from '../components/EmergencyAuthorityAlert';
import { RefugeMapsLocator } from '../components/RefugeMapsLocator';
import { SafeImage } from '../components/SafeImage';
import type { SafeHomeRequest } from '../shared/types';
import { validateSafeHomeRequest } from '../utils/validation';

const SITUATION_TYPES: SafeHomeRequest['situationType'][] = [
  'Gender-Based Violence',
  'Child Abuse / Protection',
  'Both / Family Safety',
  'Other Urgent Safety Need',
];

export function FindMyHomePage() {
  const { data } = useSiteData();
  const settings = data?.settings;

  const [callerAlias, setCallerAlias] = useState('');
  const [safeContact, setSafeContact] = useState('');
  const [safeToCall, setSafeToCall] = useState(false);
  const [safeTimeWindow, setSafeTimeWindow] = useState('');
  const [situationType, setSituationType] =
    useState<SafeHomeRequest['situationType']>('Gender-Based Violence');
  const [peopleCount, setPeopleCount] = useState(1);
  const [immediateNeeds, setImmediateNeeds] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateSafeHomeRequest({
      callerAlias,
      safeContact,
      safeToCall,
      safeTimeWindow,
      situationType,
      peopleCount,
      immediateNeeds,
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
      const res = await fetch('/api/safe-home-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerAlias,
          safeContact,
          safeToCall,
          safeTimeWindow,
          situationType,
          peopleCount,
          immediateNeeds,
          consentAccepted,
          website_url: honeypot,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.errors) setErrors(result.errors);
        setSubmitError(result.error || 'Could not log your safe refuge request. Please try again.');
        return;
      }
      setConfirmation(
        result.message ||
          'Your safe refuge request has been logged confidentially. Our protection desk will follow your safe contact instructions carefully.'
      );
      setCallerAlias('');
      setSafeContact('');
      setSafeTimeWindow('');
      setPeopleCount(1);
      setImmediateNeeds('');
      setConsentAccepted(false);
    } catch {
      setSubmitError('Network error while sending request. If in immediate danger, call local emergency services.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Safety Exit Strip */}
      <div className="bg-[#2C1042] text-[#FAF7F2] border-b border-white/15">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-[#FAF7F2]/90 inline-flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#E5CA7B] shrink-0" aria-hidden="true" />
            <span>
              <strong>Safety Notice:</strong> If someone nearby may check your screen, use the Quick
              Exit button at any moment.
            </span>
          </p>
          <button
            type="button"
            onClick={handleQuickExit}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Quick Exit (Leave Page)
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E0B2B] via-[#3B155F] to-[#7B2E3C] text-[#FAF7F2] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Find My Home · Safe Refuge &amp; Protection
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              A Safe Place When Home Is No Longer Safe
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/85 leading-relaxed">
              No woman, man, or child should remain trapped in gender-based violence or child abuse.
              His &amp; Hers Circle of Hope connects survivors and endangered children with confidential shelter
              coordination, protective relocation guidance, trauma-informed counselling, and trusted
              community refuge.
            </p>
            <div className="flex flex-wrap gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => openEmergencyAlertModal()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#C2593F] hover:bg-[#A64831] rounded-md transition-colors shadow"
              >
                <ShieldAlert className="w-4 h-4 text-[#F3D79B]" aria-hidden="true" />
                Alert Area Authorities Now
              </button>
              <button
                type="button"
                onClick={() => openCrisisTextChat()}
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-[#160822] bg-[#D4AF37] hover:bg-[#E5CA7B] rounded-md transition-colors"
              >
                Open Discreet Crisis Text Chat
              </button>
              <a
                href="#refuge-locator"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F]/80 border border-white/30 hover:bg-white/15 rounded-md transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#F3D79B]" aria-hidden="true" />
                Locate Nearest Place of Refuge
              </a>
              <a
                href="#safe-refuge-form"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-[#FAF7F2] border border-white/30 hover:bg-white/10 rounded-md transition-colors"
              >
                Submit Safe Refuge Alert
              </a>
              <AppLink
                href="/gbv"
                className="inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-[#F3D79B] underline underline-offset-4 hover:text-white"
              >
                Private Quiet-Care Planner →
              </AppLink>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-[4/3] rounded-lg overflow-hidden border border-white/15">
              <SafeImage
                src="/src/assets/images/safe_home_refuge_1794823558780.jpg"
                alt="Warm, peaceful living space offering safety and dignity"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Google Maps Locator · Places of Refuge Only */}
      <section id="refuge-locator" className="py-14 sm:py-18 bg-[#FDF6EE] border-b border-[#7B2E3C]/15">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-6">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#7B2E3C]">
              Live Refuge Locator · Location Access Enabled for Immediate Safety
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Locate Verified Places of Refuge, Rescue Desks &amp; Safe Shelters Near You
            </h2>
            <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
              Google Maps is active exclusively on this refuge page to help survivors and community
              helpers find the closest Gender-Based Violence Recovery Centre (GVRC), safe house,
              police gender desk, or child protection office around your current position.
            </p>
          </div>

          <RefugeMapsLocator
            onSelectRefugeCounty={(countyName, hubName) => {
              setImmediateNeeds((prev) =>
                prev.trim()
                  ? prev
                  : `Looking for urgent safe refuge coordination near ${countyName} County (${hubName}).`
              );
              const formEl = document.getElementById('safe-refuge-form');
              formEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        </div>
      </section>

      {/* Safety Guidance & Safe Home Intake */}
      <section id="safe-refuge-form" className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
                Immediate Safety Steps
              </p>
              <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
                Leaving Safely &amp; Protecting Children
              </h2>
              <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                {settings?.emergencyHotlineNote ||
                  'If you or a child is in immediate physical danger, please call your local police or national emergency hotline immediately.'}
              </p>
            </div>

            <div className="bg-white border border-[#3B155F]/15 rounded-lg p-6 space-y-4">
              <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                How Find My Home Works
              </h3>
              <ul className="space-y-3 text-sm text-[#3E3349] leading-relaxed">
                <li>
                  <strong className="text-[#1E0B2B]">01. Safe Contact Only:</strong> Tell us whether
                  it is safe to call, or only text/message via a trusted friend or specific hours.
                </li>
                <li>
                  <strong className="text-[#1E0B2B]">02. Shelter &amp; Child Protection:</strong>{' '}
                  Our safeguarding leads coordinate verified safe housing referrals and child
                  protection partners.
                </li>
                <li>
                  <strong className="text-[#1E0B2B]">03. Ongoing Care:</strong> Access emergency
                  provisions, trauma counselling, and gentle transition support.
                </li>
              </ul>
            </div>

            <div className="bg-[#F3EEF8] border border-[#3B155F]/12 rounded-lg p-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#3B155F]">
                Helping Someone Else or a Child at Risk?
              </p>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                Neighbours, teachers, relatives, and friends can submit a confidential alert using
                this form on behalf of someone needing safe refuge—note your own safe callback
                details so our coordinator can verify safely.
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
                      Safe Refuge Request Logged Confidentially
                    </h3>
                    <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                      {confirmation}
                    </p>
                    <p className="text-xs text-[#665B73]">
                      Remember to clear your browser history or use the Quick Exit button if others
                      have access to this device.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleQuickExit}
                    className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold bg-[#3B155F] text-[#FAF7F2] rounded-md"
                  >
                    Quick Exit Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmation(null)}
                    className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#3B155F] border border-[#3B155F]/25 rounded-md hover:bg-[#F3EEF8]"
                  >
                    Submit Another Alert
                  </button>
                </div>
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
                      Confidential Safe Refuge Request
                    </h3>
                    <p className="text-sm text-[#665B73] mt-1">
                      Strict privacy. Share only what is safe to type right now.
                    </p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#3B155F] shrink-0" aria-hidden="true" />
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="safe-website-url">Website</label>
                  <input
                    id="safe-website-url"
                    type="text"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="safe-alias"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      First Name or Safe Alias <span className="text-[#665B73] font-normal">(Optional)</span>
                    </label>
                    <input
                      id="safe-alias"
                      type="text"
                      value={callerAlias}
                      onChange={(e) => setCallerAlias(e.target.value)}
                      placeholder="e.g. Grace or Protected Guest"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="safe-contact"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Safe Contact Method <span className="text-[#7A5A10]">*</span>
                    </label>
                    <input
                      id="safe-contact"
                      type="text"
                      required
                      value={safeContact}
                      onChange={(e) => setSafeContact(e.target.value)}
                      placeholder="Safe phone, friend's number, or safe email"
                      aria-invalid={Boolean(errors.safeContact)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                    {errors.safeContact && (
                      <p className="mt-1 text-xs text-red-700" role="alert">
                        {errors.safeContact}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="safe-situation"
                      className="block text-xs font-semibold uppercase tracking-wide text-[#3E3349] mb-1.5"
                    >
                      Situation Type
                    </label>
                    <select
                      id="safe-situation"
                      value={situationType}
                      onChange={(e) =>
                        setSituationType(e.target.value as SafeHomeRequest['situationType'])
                      }
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      {SITUATION_TYPES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="safe-people"
                      className="block text-xs font-semibold uppercase tracking-wide text-[#3E3349] mb-1.5"
                    >
                      People Needing Refuge
                    </label>
                    <input
                      id="safe-people"
                      type="number"
                      min={1}
                      max={20}
                      value={peopleCount}
                      onChange={(e) => setPeopleCount(Number(e.target.value) || 1)}
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md tabular-nums"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="safe-window"
                      className="block text-xs font-semibold uppercase tracking-wide text-[#3E3349] mb-1.5"
                    >
                      Safe Time to Contact
                    </label>
                    <input
                      id="safe-window"
                      type="text"
                      value={safeTimeWindow}
                      onChange={(e) => setSafeTimeWindow(e.target.value)}
                      placeholder="e.g. Mornings 9–12, text only"
                      className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#F3EEF8]/70 border border-[#3B155F]/10 rounded-md px-4 py-3">
                  <input
                    id="safe-to-call"
                    type="checkbox"
                    checked={safeToCall}
                    onChange={(e) => setSafeToCall(e.target.checked)}
                    className="w-4 h-4 accent-[#3B155F] rounded cursor-pointer"
                  />
                  <label htmlFor="safe-to-call" className="text-sm font-medium text-[#1E0B2B] cursor-pointer">
                    It is safe to call this contact directly (leave unchecked for text/discreet message only)
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="safe-needs"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    Immediate Shelter or Protection Needs <span className="text-[#7A5A10]">*</span>
                  </label>
                  <textarea
                    id="safe-needs"
                    rows={4}
                    required
                    value={immediateNeeds}
                    onChange={(e) => setImmediateNeeds(e.target.value)}
                    placeholder="Share approximate area/city, ages of any children involved, medical needs, or safe shelter timing."
                    aria-invalid={Boolean(errors.immediateNeeds)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md leading-relaxed"
                  />
                  {errors.immediateNeeds && (
                    <p className="mt-1 text-xs text-red-700" role="alert">
                      {errors.immediateNeeds}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-start gap-3">
                    <input
                      id="safe-consent"
                      type="checkbox"
                      checked={consentAccepted}
                      onChange={(e) => setConsentAccepted(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#3B155F] rounded cursor-pointer"
                    />
                    <label
                      htmlFor="safe-consent"
                      className="text-xs sm:text-sm text-[#3E3349] leading-relaxed cursor-pointer"
                    >
                      I consent to His &amp; Hers Circle of Hope’s safeguarding coordinator reviewing this privately
                      to help arrange safe refuge under our{' '}
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
                  {submitting ? 'Logging Safely...' : 'Request Safe Refuge Support'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
