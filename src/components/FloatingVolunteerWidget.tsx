import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { ALL_47_COUNTY_NAMES } from '../utils/kenyaCounties';

type VolunteerKind = 'individual' | 'team' | 'institution';

const HELP_AREAS = [
  'Nov 28 Thanksgiving Feast & Relief Token Bundles',
  'Visiting Partner Children’s Homes',
  'Packing Pantry & School Kits',
  'ASD Parents & Kids Support Mornings',
  'Listening Circles & Community Care',
  '47-County Outreach Logistics',
];

export function FloatingVolunteerWidget() {
  const { path } = useRouter();
  const isPrivacyIsolated = path.startsWith('/gbv') || path.startsWith('/recovery');

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [volunteerKind, setVolunteerKind] = useState<VolunteerKind>('individual');
  // Step 2
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    'Nov 28 Thanksgiving Feast & Relief Token Bundles',
  ]);
  // Step 3
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('Nairobi');
  const [groupName, setGroupName] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [pointOfContact, setPointOfContact] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area]
    );
  };

  const resetModal = () => {
    setStep(1);
    setVolunteerKind('individual');
    setSelectedAreas(['Nov 28 Thanksgiving Feast & Relief Token Bundles']);
    setFullName('');
    setEmail('');
    setPhone('');
    setGroupName('');
    setGroupSize('');
    setPointOfContact('');
    setNotes('');
    setErrorMsg(null);
    setSubmitted(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg('Please share your name so we know how to greet you.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if ((volunteerKind === 'team' || volunteerKind === 'institution') && groupName.trim().length < 2) {
      setErrorMsg('Please enter your team or institution name.');
      return;
    }

    const combinedArea = selectedAreas.length ? selectedAreas.join(', ') : 'General Care Family Support';
    const messageBody = [
      `County: ${county}`,
      volunteerKind !== 'individual' ? `Group: ${groupName} (Size: ${groupSize || 'Flexible'})` : '',
      notes.trim() ? `Notes: ${notes.trim()}` : 'Raised hand via Stand With Us volunteer modal.',
    ]
      .filter(Boolean)
      .join(' | ');

    // Strict Zero-Network Rule on /gbv/ and /recovery/: complete locally without transmitting data
    if (isPrivacyIsolated) {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          volunteerKind,
          groupName: volunteerKind === 'individual' ? undefined : groupName.trim(),
          groupSize: volunteerKind === 'individual' ? undefined : groupSize.trim(),
          pointOfContact: volunteerKind === 'individual' ? undefined : pointOfContact.trim() || fullName.trim(),
          areaOfInterest: combinedArea,
          availability: `Weekends / Flexible (${county} County)`,
          message: messageBody,
          website_url: honeypot,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setErrorMsg(result.error || 'Please review your details and try again.');
        return;
      }
      setSubmitted(true);
    } catch {
      setErrorMsg('We could not send right now. Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Circular Volunteer Button — bottom-right on EVERY page */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
        aria-label="Open Volunteer sign-up modal"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[70px] h-[70px] rounded-full bg-[#D4AF37] hover:bg-[#E5CA7B] text-[#160822] shadow-xl border-2 border-[#FAF7F2] flex flex-col items-center justify-center gap-0.5 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#7A5A10] print:hidden"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          🙋
        </span>
        <span className="text-[11px] font-bold tracking-tight leading-none">Volunteer</span>
      </button>

      {/* Stand With Us 3-Step Modal Popup */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="volunteer-modal-heading"
          className="fixed inset-0 z-50 bg-[#160822]/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={handleClose}
        >
          <div
            className="bg-[#FAF7F2] border border-[#D4AF37]/45 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 sm:px-8 pt-6 pb-5 bg-gradient-to-r from-[#FDF6EE] via-[#FBF5E6] to-[#EAF6F2] border-b border-[#D4AF37]/25 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5A10]">
                  HIS AND HERS · Community Hands
                </p>
                <h2
                  id="volunteer-modal-heading"
                  className="font-serif text-3xl font-semibold text-[#1E0B2B]"
                >
                  Stand With Us
                </h2>
                <p className="text-sm text-[#3E3349]">
                  A warm welcome awaits—tell us who you are and how you’d love to lend a hand.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close volunteer popup"
                className="w-9 h-9 rounded-full bg-white border border-[#D4AF37]/30 text-[#1E0B2B] hover:bg-[#FDF0D5] flex items-center justify-center shrink-0 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="p-6 sm:p-8 space-y-5 text-center">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-[#D4AF37]/30 bg-[#EAE2D3]">
                  <img
                    src="/src/assets/images/real_volunteers_community_1794910602572.jpg"
                    alt="Real community volunteers smiling together while packing relief baskets and children books"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-[#256358] font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    Thank you for raising your hand!
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
                    No commitment — just a conversation.
                  </h3>
                  <p className="text-sm text-[#3E3349] leading-relaxed max-w-md mx-auto">
                    {isPrivacyIsolated
                      ? 'Your response stayed safely inside this browser session with zero external tracking. When ready, call or email care@hisandhers.org from your main device.'
                      : 'Our care coordinator will reach out warmly by email or phone to say hello and answer any questions.'}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetModal();
                      handleClose();
                    }}
                    className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-[#D4AF37] hover:bg-[#E5CA7B] text-[#160822] transition-colors"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-white border border-[#D4AF37]/40 text-[#7A5A10] hover:bg-[#FDF6EE] transition-colors"
                  >
                    Submit Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                {/* 3-Step Indicator */}
                <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        if (num < step) setStep(num as 1 | 2 | 3);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl border text-center transition-colors ${
                        step === num
                          ? 'bg-[#D4AF37] text-[#160822] border-[#B88F28]'
                          : step > num
                            ? 'bg-[#EAF6F2] text-[#256358] border-[#256358]/25'
                            : 'bg-white text-[#665B73] border-[#D4AF37]/20'
                      }`}
                    >
                      Step {num}:{' '}
                      {num === 1 ? 'Who You Are' : num === 2 ? 'How to Help' : 'Your Details'}
                    </button>
                  ))}
                </div>

                {/* Honeypot */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="vol-modal-website">Website</label>
                  <input
                    id="vol-modal-website"
                    type="text"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {/* Step 1: Individual / Team / Institution */}
                {step === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-[#1E0B2B]">
                      1. I am volunteering as:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(
                        [
                          {
                            id: 'individual',
                            label: 'Individual',
                            note: 'One neighbour lending warm hands',
                          },
                          {
                            id: 'team',
                            label: 'Team',
                            note: 'Friends, family, or fellowship circle',
                          },
                          {
                            id: 'institution',
                            label: 'Institution',
                            note: 'Company CSR, school, or NGO partner',
                          },
                        ] as const
                      ).map((opt) => {
                        const active = volunteerKind === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setVolunteerKind(opt.id)}
                            aria-pressed={active}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                              active
                                ? 'bg-[#FDF0D5] border-[#D4AF37] shadow-sm'
                                : 'bg-white border-[#D4AF37]/25 hover:bg-[#FAF7F2]'
                            }`}
                          >
                            <span className="block font-serif text-lg font-semibold text-[#1E0B2B]">
                              {opt.label}
                            </span>
                            <span className="block text-xs text-[#3E3349] mt-1">{opt.note}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-[#D4AF37] hover:bg-[#E5CA7B] text-[#160822] transition-colors"
                      >
                        Next: Pick Ways to Help
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Checkboxes */}
                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-[#1E0B2B]">
                      2. I’d like to help with (pick any that inspire you):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {HELP_AREAS.map((area) => {
                        const checked = selectedAreas.includes(area);
                        return (
                          <label
                            key={area}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                              checked
                                ? 'bg-[#EAF6F2] border-[#256358]/40 text-[#1E0B2B] font-medium'
                                : 'bg-white border-[#D4AF37]/20 text-[#3E3349] hover:bg-[#FDF6EE]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleArea(area)}
                              className="mt-0.5 w-4 h-4 accent-[#256358] rounded"
                            />
                            <span>{area}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-white border border-[#D4AF37]/35 text-[#3E3349] hover:bg-[#FDF6EE]"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-[#D4AF37] hover:bg-[#E5CA7B] text-[#160822] transition-colors"
                      >
                        Next: Contact Details
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Contact Details (+ Team / Institution fields) */}
                {step === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-[#1E0B2B]">
                      3. Share your contact details
                    </p>

                    {(volunteerKind === 'team' || volunteerKind === 'institution') && (
                      <div className="p-4 rounded-2xl bg-[#FDF0D5]/55 border border-[#D4AF37]/35 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5A10]">
                          {volunteerKind === 'team' ? 'Team Details' : 'Institution Details'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label
                              htmlFor="vol-group-name"
                              className="block text-xs font-medium text-[#1E0B2B] mb-1"
                            >
                              Group Name *
                            </label>
                            <input
                              id="vol-group-name"
                              type="text"
                              value={groupName}
                              onChange={(e) => setGroupName(e.target.value)}
                              placeholder="e.g. Savannah CSR Team"
                              className="w-full px-3 py-2 text-sm bg-white border border-[#D4AF37]/35 rounded-xl"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="vol-group-size"
                              className="block text-xs font-medium text-[#1E0B2B] mb-1"
                            >
                              Group Size
                            </label>
                            <input
                              id="vol-group-size"
                              type="text"
                              value={groupSize}
                              onChange={(e) => setGroupSize(e.target.value)}
                              placeholder="e.g. 12 people"
                              className="w-full px-3 py-2 text-sm bg-white border border-[#D4AF37]/35 rounded-xl"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="vol-poc"
                              className="block text-xs font-medium text-[#1E0B2B] mb-1"
                            >
                              Point of Contact
                            </label>
                            <input
                              id="vol-poc"
                              type="text"
                              value={pointOfContact}
                              onChange={(e) => setPointOfContact(e.target.value)}
                              placeholder="Lead coordinator name"
                              className="w-full px-3 py-2 text-sm bg-white border border-[#D4AF37]/35 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label
                          htmlFor="vol-full-name"
                          className="block text-xs font-medium text-[#1E0B2B] mb-1"
                        >
                          Your Full Name *
                        </label>
                        <input
                          id="vol-full-name"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Miriam Wanjiku"
                          className="w-full px-3 py-2 text-sm bg-white border border-[#D4AF37]/30 rounded-xl"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="vol-email"
                          className="block text-xs font-medium text-[#1E0B2B] mb-1"
                        >
                          Email Address *
                        </label>
                        <input
                          id="vol-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-3 py-2 text-sm bg-white border border-[#D4AF37]/30 rounded-xl"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="vol-phone"
                          className="block text-xs font-medium text-[#1E0B2B] mb-1"
                        >
                          Phone / WhatsApp
                        </label>
                        <input
                          id="vol-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+254 7..."
                          className="w-full px-3 py-2 text-sm bg-white border border-[#D4AF37]/30 rounded-xl"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="vol-county"
                          className="block text-xs font-medium text-[#1E0B2B] mb-1"
                        >
                          County (All 47 Counties)
                        </label>
                        <select
                          id="vol-county"
                          value={county}
                          onChange={(e) => setCounty(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-[#D4AF37]/30 rounded-xl"
                        >
                          {ALL_47_COUNTY_NAMES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="vol-notes"
                        className="block text-xs font-medium text-[#1E0B2B] mb-1"
                      >
                        Anything else you’d like to share?
                      </label>
                      <input
                        id="vol-notes"
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Available Saturdays or can help pack Nov 28 relief bundles"
                        className="w-full px-3 py-2 text-sm bg-white border border-[#D4AF37]/30 rounded-xl"
                      />
                    </div>

                    {errorMsg && (
                      <p role="alert" className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl">
                        {errorMsg}
                      </p>
                    )}

                    <div className="pt-1 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-white border border-[#D4AF37]/35 text-[#3E3349] hover:bg-[#FDF6EE]"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl bg-[#D4AF37] hover:bg-[#E5CA7B] disabled:opacity-60 text-[#160822] shadow-sm transition-colors"
                      >
                        {submitting ? 'Sending...' : 'Send My Hand Up'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
