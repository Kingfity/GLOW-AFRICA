import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, LocateFixed, MapPin, ShieldCheck } from 'lucide-react';
import { CommunityVideoPlayer } from '../components/CommunityVideoPlayer';
import { SafeImage } from '../components/SafeImage';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import type { RehabFacility, RehabReferralRequest } from '../shared/types';
import { ALL_47_COUNTY_NAMES, ALL_KENYA_COUNTIES } from '../utils/kenyaCounties';
import { sortFacilitiesByProximity, validateRehabReferral } from '../utils/validation';

const FOCUS_FILTERS: Array<'All' | RehabFacility['focusType']> = [
  'All',
  'Substance & Addiction Recovery',
  'Trauma & Crisis Rehabilitation',
  'Youth & Adolescent Restoration',
  'Family & Holistic Care',
];

const TOWN_COORDS: Record<string, { lat: number; lng: number }> = Object.fromEntries(
  ALL_KENYA_COUNTIES.map((c) => [c.name, { lat: c.lat, lng: c.lng }])
);

const RELATIONSHIPS: RehabReferralRequest['relationship'][] = [
  'Self',
  'Parent / Guardian',
  'Spouse / Family Member',
  'Community Referrer',
];

export function RehabilitationPage() {
  const { data } = useSiteData();
  const facilities = data?.rehabFacilities || [];

  const [countyFilter, setCountyFilter] = useState<string>('All');
  const [focusFilter, setFocusFilter] = useState<string>('All');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>('');
  const [locating, setLocating] = useState(false);

  // Referral Form State
  const formRef = useRef<HTMLDivElement | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [relationship, setRelationship] =
    useState<RehabReferralRequest['relationship']>('Parent / Guardian');
  const [contact, setContact] = useState('');
  const [preferredCounty, setPreferredCounty] = useState('Nairobi');
  const [chosenFacilityId, setChosenFacilityId] = useState('nearest-match');
  const [chosenFacilityName, setChosenFacilityName] = useState('Nearest Verified Partner Facility');
  const [supportType, setSupportType] = useState<RehabFacility['focusType']>(
    'Substance & Addiction Recovery'
  );
  const [notes, setNotes] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const counties = useMemo(() => ['All', ...ALL_47_COUNTY_NAMES], []);

  const effectiveCoords = useMemo(() => {
    if (userCoords) return userCoords;
    if (countyFilter !== 'All' && TOWN_COORDS[countyFilter]) {
      return TOWN_COORDS[countyFilter];
    }
    return null;
  }, [userCoords, countyFilter]);

  const displayedFacilities = useMemo(() => {
    return sortFacilitiesByProximity(facilities, effectiveCoords, countyFilter, focusFilter);
  }, [facilities, effectiveCoords, countyFilter, focusFilter]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationLabel('Select your county below to sort nearest facilities.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCountyFilter('All');
        setLocationLabel('Sorted by distance from your current location');
        setLocating(false);
      },
      () => {
        setUserCoords(TOWN_COORDS.Nairobi);
        setLocationLabel('Location permission unavailable — sorted relative to Nairobi Hub (or choose your county)');
        setLocating(false);
      },
      { timeout: 6000 }
    );
  };

  const selectFacility = (facility: RehabFacility) => {
    setChosenFacilityId(facility.id);
    setChosenFacilityName(facility.name);
    setPreferredCounty(facility.countyRegion);
    setSupportType(facility.focusType);
    setConfirmation(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateRehabReferral({
      applicantName,
      relationship,
      contact,
      preferredCounty,
      chosenFacilityId,
      chosenFacilityName,
      supportType,
      notes,
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
      const res = await fetch('/api/rehab-referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName,
          relationship,
          contact,
          preferredCounty,
          chosenFacilityId,
          chosenFacilityName,
          supportType,
          notes,
          consentAccepted,
          website_url: honeypot,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.errors) setErrors(result.errors);
        setSubmitError(result.error || 'Could not log referral request.');
        return;
      }
      setConfirmation(
        result.message ||
          `Your referral request for ${chosenFacilityName} has been received confidentially.`
      );
      setApplicantName('');
      setContact('');
      setNotes('');
      setConsentAccepted(false);
    } catch {
      setSubmitError('Network error while submitting referral request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero with Video Reel */}
      <section className="bg-[#1E0B2B] text-[#FAF7F2] py-16 sm:py-24 border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Rehabilitation &amp; Family Restoration Finder
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              Connect With Recovery Care Closest to Your Family
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/85 leading-relaxed">
              Walking alongside addiction, trauma, or youth crisis shouldn’t require navigating alone.
              Compare nearby verified rehabilitation facilities by proximity and care type, choose
              the facility your family trusts, and let our liaison coordinate admission gently.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locating}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap"
              >
                <LocateFixed className="w-4 h-4" aria-hidden="true" />
                {locating ? 'Locating...' : 'Sort by Nearest to Me'}
              </button>
              <AppLink
                href="/counselling"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-[#FAF7F2] border border-white/30 hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
              >
                Talk to a Counsellor First
              </AppLink>
            </div>
            {locationLabel && (
              <p className="text-xs text-[#E5CA7B]" role="status">
                {locationLabel}
              </p>
            )}
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-xl overflow-hidden border border-white/15 bg-[#160822]">
              <CommunityVideoPlayer
                videoSrc="/videos/healing_and_recovery_reel.mp4"
                posterSrc="/src/assets/images/doc_rehab_recovery_garden_1794832339842.jpg"
                ariaLabel="Counselling room and calm rehabilitation garden pathway"
                soundMoodLabel="Warm Rhodes Sanctuary"
                chapters={[
                  { timeSeconds: 0, label: '01 · Garden Talk' },
                  { timeSeconds: 3.7, label: '02 · Quiet Room' },
                  { timeSeconds: 7.4, label: '03 · Safe Haven' },
                ]}
              />
              <div className="px-5 py-3 bg-[#160822] flex items-center justify-between text-xs text-[#FAF7F2]/80 border-t border-white/10">
                <span>Restoration &amp; Counselling Centres (47 Counties)</span>
                <span className="text-[#E5CA7B] tabular-nums">0:12 Reel · Warm Rhodes Sound</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facility Proximity Filter & Directory */}
      <section className="py-16 sm:py-20 bg-[#EDF6F3] border-b border-[#256358]/15">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#256358]">
                Proximity &amp; Facility Choice
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Verified Rehabilitation Centres
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <label className="text-xs font-semibold text-[#1E0B2B] flex items-center gap-2">
                <span>County / Town:</span>
                <select
                  aria-label="Filter by county or town"
                  value={countyFilter}
                  onChange={(e) => {
                    setUserCoords(null);
                    setLocationLabel('');
                    setCountyFilter(e.target.value);
                  }}
                  className="px-3 py-2 text-xs font-medium bg-white border border-[#256358]/25 rounded-md"
                >
                  {counties.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-[#1E0B2B] flex items-center gap-2">
                <span>Care Focus:</span>
                <select
                  aria-label="Filter by rehabilitation care focus"
                  value={focusFilter}
                  onChange={(e) => setFocusFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-medium bg-white border border-[#256358]/25 rounded-md"
                >
                  {FOCUS_FILTERS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFacilities.map((facility) => (
              <article
                key={facility.id}
                className="bg-white border border-[#256358]/15 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-[#F3EEF8] overflow-hidden">
                  <SafeImage
                    src={facility.imageUrl}
                    alt={facility.imageAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#665B73]">
                      <span className="font-semibold text-[#256358] inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        {facility.townArea}, {facility.countyRegion}
                      </span>
                      {typeof facility.distanceKm === 'number' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-[#3B155F] tabular-nums">
                            ~{facility.distanceKm} km away
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                      {facility.name}
                    </h3>
                    <p className="text-xs font-medium text-[#7A5A10]">
                      {facility.focusType} · {facility.careFormat}
                    </p>
                    <p className="text-sm text-[#3E3349] leading-relaxed">{facility.summary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectFacility(facility)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-[#256358] text-white hover:bg-[#1C4D44] rounded-md transition-colors"
                  >
                    Connect With This Facility
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Confidential Family Referral Request Form */}
      <section ref={formRef} className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
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
                    Rehabilitation Connection Request Logged
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
                Submit Another Referral
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white border border-[#3B155F]/15 rounded-xl p-6 sm:p-10 space-y-6"
            >
              <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#3B155F]/10">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
                    Connect With Your Chosen Rehabilitation Facility
                  </h2>
                  <p className="text-sm text-[#665B73] mt-1">
                    Confidential coordination with dignity—for yourself or a loved one.
                  </p>
                </div>
                <ShieldCheck className="w-5 h-5 text-[#256358] shrink-0" aria-hidden="true" />
              </div>

              <div className="hidden" aria-hidden="true">
                <label htmlFor="rehab-website-url">Website</label>
                <input
                  id="rehab-website-url"
                  type="text"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="rehab-facility-select"
                  className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                >
                  Preferred Facility
                </label>
                <select
                  id="rehab-facility-select"
                  value={chosenFacilityId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setChosenFacilityId(id);
                    const found = facilities.find((f) => f.id === id);
                    if (found) {
                      setChosenFacilityName(found.name);
                      setPreferredCounty(found.countyRegion);
                      setSupportType(found.focusType);
                    } else {
                      setChosenFacilityName('Nearest Verified Partner Facility');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                >
                  <option value="nearest-match">
                    Recommend Nearest Available Partner Facility
                  </option>
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.townArea}, {f.countyRegion})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="rehab-applicant"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    Your Name
                  </label>
                  <input
                    id="rehab-applicant"
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="First name or initials"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rehab-relationship"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    Who Needs Support?
                  </label>
                  <select
                    id="rehab-relationship"
                    value={relationship}
                    onChange={(e) =>
                      setRelationship(e.target.value as RehabReferralRequest['relationship'])
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="rehab-contact"
                    className="block text-xs font-semibold uppercase tracking-wide text-[#3E3349] mb-1.5"
                  >
                    Phone or Email <span className="text-[#C2593F]">*</span>
                  </label>
                  <input
                    id="rehab-contact"
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+254... or email"
                    className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                  {errors.contact && (
                    <p className="mt-1 text-xs text-red-700" role="alert">
                      {errors.contact}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="rehab-county"
                    className="block text-xs font-semibold uppercase tracking-wide text-[#3E3349] mb-1.5"
                  >
                    County / Town <span className="text-[#C2593F]">*</span>
                  </label>
                  <input
                    id="rehab-county"
                    type="text"
                    required
                    value={preferredCounty}
                    onChange={(e) => setPreferredCounty(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                  {errors.preferredCounty && (
                    <p className="mt-1 text-xs text-red-700" role="alert">
                      {errors.preferredCounty}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="rehab-focus"
                    className="block text-xs font-semibold uppercase tracking-wide text-[#3E3349] mb-1.5"
                  >
                    Support Focus
                  </label>
                  <select
                    id="rehab-focus"
                    value={supportType}
                    onChange={(e) =>
                      setSupportType(e.target.value as RehabFacility['focusType'])
                    }
                    className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  >
                    {FOCUS_FILTERS.filter((f) => f !== 'All').map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="rehab-notes"
                  className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                >
                  Brief Overview of Needs &amp; Preferred Timing{' '}
                  <span className="text-[#C2593F]">*</span>
                </label>
                <textarea
                  id="rehab-notes"
                  rows={4}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share whether outpatient counselling or residential admission is preferred, any financial assistance inquiry, or family guidance needs."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
                {errors.notes && (
                  <p className="mt-1 text-xs text-red-700" role="alert">
                    {errors.notes}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-start gap-3">
                  <input
                    id="rehab-consent"
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#256358] rounded cursor-pointer"
                  />
                  <label
                    htmlFor="rehab-consent"
                    className="text-xs sm:text-sm text-[#3E3349] leading-relaxed cursor-pointer"
                  >
                    I consent to HIS AND HERS coordinating privately with my selected rehabilitation
                    facility under our{' '}
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
                {submitting ? 'Sending Referral...' : 'Request Confidential Facility Connection'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
