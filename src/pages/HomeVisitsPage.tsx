import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  HeartHandshake,
  Mail,
  MapPin,
  PhoneCall,
  Search,
  Users,
} from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import { VisitKitEstimator } from '../components/VisitKitEstimator';
import { useSiteData } from '../context/SiteDataContext';
import type { ChildrensHome, HomeVisitBooking, PartnerOrganization } from '../shared/types';
import { searchKenyaCounties } from '../utils/kenyaCounties';
import { validateHomeVisitBooking, validatePartnerOnboarding } from '../utils/validation';

const ORGANIZER_TYPES: HomeVisitBooking['organizerType'][] = [
  'Individual Visitor',
  'Friend / Family Group',
  'Corporate CSR Team',
  'Faith / Fellowship Group',
  'School / Youth Team',
];

const VISIT_PURPOSES = [
  'Corporate CSR Volunteering Day',
  'Mentorship, Reading & Play',
  'Food, Clothing & School Supplies Delivery',
  'Skill Building & Facility Care',
  'Youth Career & Creative Arts Workshop',
];

const TIME_WINDOWS = [
  'Morning (09:30 – 12:30)',
  'Midday (12:30 – 15:00)',
  'Full Day CSR Programme (09:30 – 15:30)',
];

const PARTNER_TYPES: PartnerOrganization['partnerType'][] = [
  'Corporate CSR Partner',
  'Registered Children’s Home',
  'NGO / Community Organization',
  'Rehabilitation Facility',
  'Donor / Sponsor Network',
];

export function HomeVisitsPage() {
  const { data } = useSiteData();
  const homes = data?.childrensHomes || [];

  const [typeFilter, setTypeFilter] = useState<
    'All' | 'Children’s Home' | 'School for Differently Abled'
  >('All');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('county') || '';
  });
  const [formMode, setFormMode] = useState<'visit' | 'partner'>('visit');
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  // Visit Booking State
  const [organizerType, setOrganizerType] =
    useState<HomeVisitBooking['organizerType']>('Corporate CSR Team');
  const [selectedHomeId, setSelectedHomeId] = useState<string>('any-partner-home');
  const [selectedHomeName, setSelectedHomeName] = useState<string>(
    'Matched Partner Children’s Home or Special School'
  );
  const [coordinatorName, setCoordinatorName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [groupSize, setGroupSize] = useState(8);
  const [estimatedChildren, setEstimatedChildren] = useState(45);
  const [focusArea, setFocusArea] = useState(VISIT_PURPOSES[0]);
  const [preferredDate, setPreferredDate] = useState('2026-12-05');
  const [preferredTimeWindow, setPreferredTimeWindow] = useState(TIME_WINDOWS[0]);
  const [locationArea, setLocationArea] = useState('Nairobi');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  // Partner Organization Onboarding State
  const [orgName, setOrgName] = useState('');
  const [partnerType, setPartnerType] =
    useState<PartnerOrganization['partnerType']>('Corporate CSR Partner');
  const [contactPerson, setContactPerson] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [regionArea, setRegionArea] = useState('');
  const [collaborationFocus, setCollaborationFocus] = useState('');
  const [websiteOrProfile, setWebsiteOrProfile] = useState('');
  const [partnerHoneypot, setPartnerHoneypot] = useState('');
  const [partnerErrors, setPartnerErrors] = useState<Record<string, string>>({});
  const [partnerSubmitError, setPartnerSubmitError] = useState<string | null>(null);
  const [partnerSubmitting, setPartnerSubmitting] = useState(false);
  const [partnerConfirmation, setPartnerConfirmation] = useState<string | null>(null);

  const regions = useMemo(() => {
    const preferredOrder = [
      'Nairobi',
      'Central',
      'Coast',
      'Rift Valley',
      'Nyanza',
      'Western',
      'Eastern',
      'North Eastern',
    ];
    const discovered = new Set(homes.map((h) => h.regionGroup || h.countyRegion));
    const ordered = preferredOrder.filter((r) => discovered.has(r));
    for (const r of discovered) {
      if (!ordered.includes(r)) ordered.push(r);
    }
    return ['All', ...ordered];
  }, [homes]);

  const counts = useMemo(() => {
    const childrensHomeCount = homes.filter(
      (h) => (h.institutionType || 'Children’s Home') === 'Children’s Home'
    ).length;
    const schoolCount = homes.filter(
      (h) => h.institutionType === 'School for Differently Abled'
    ).length;
    return {
      all: homes.length,
      childrensHomes: childrensHomeCount,
      schools: schoolCount,
    };
  }, [homes]);

  const filteredHomes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return homes.filter((h) => {
      const kind = h.institutionType || 'Children’s Home';
      if (typeFilter !== 'All' && kind !== typeFilter) return false;
      const group = h.regionGroup || h.countyRegion;
      if (regionFilter !== 'All' && group !== regionFilter) return false;
      if (!q) return true;
      return (
        h.name.toLowerCase().includes(q) ||
        h.countyRegion.toLowerCase().includes(q) ||
        h.townArea.toLowerCase().includes(q) ||
        (h.specialization || '').toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q) ||
        h.currentNeeds.some((n) => n.toLowerCase().includes(q))
      );
    });
  }, [homes, typeFilter, regionFilter, searchQuery]);

  const matchedCountyHub = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;
    const results = searchKenyaCounties(q);
    return results.length > 0 && results.length <= 4 ? results[0] : null;
  }, [searchQuery]);

  const selectHomeForVisit = (home: ChildrensHome) => {
    setSelectedHomeId(home.id);
    setSelectedHomeName(home.name);
    setLocationArea(`${home.townArea}, ${home.countyRegion}`);
    setFormMode('visit');
    setConfirmation(null);
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateHomeVisitBooking({
      organizerType,
      selectedHomeId,
      selectedHomeName,
      coordinatorName,
      groupName,
      email,
      phone,
      groupSize,
      focusArea,
      preferredDate,
      preferredTimeWindow,
      locationArea,
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
      const res = await fetch('/api/home-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizerType,
          selectedHomeId,
          selectedHomeName,
          coordinatorName,
          groupName,
          email,
          phone,
          groupSize,
          focusArea,
          preferredDate,
          preferredTimeWindow,
          locationArea,
          notes,
          website_url: honeypot,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.errors) setErrors(result.errors);
        setSubmitError(result.error || 'Could not log visit request. Please try again.');
        return;
      }
      setConfirmation(
        result.message ||
          `Your visit request for ${selectedHomeName} has been received by our coordination team.`
      );
      setCoordinatorName('');
      setGroupName('');
      setEmail('');
      setPhone('');
      setNotes('');
    } catch {
      setSubmitError('Network error while submitting your children’s home visit booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerSubmitError(null);

    const validation = validatePartnerOnboarding({
      organizationName: orgName,
      partnerType,
      contactPerson,
      email: partnerEmail,
      phone: partnerPhone,
      regionArea,
      collaborationFocus,
      websiteOrProfile,
      website_url: partnerHoneypot,
    });
    if (!validation.valid) {
      setPartnerErrors(validation.errors);
      return;
    }

    setPartnerErrors({});
    setPartnerSubmitting(true);
    try {
      const res = await fetch('/api/partner-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: orgName,
          partnerType,
          contactPerson,
          email: partnerEmail,
          phone: partnerPhone,
          regionArea,
          collaborationFocus,
          websiteOrProfile,
          website_url: partnerHoneypot,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.errors) setPartnerErrors(result.errors);
        setPartnerSubmitError(result.error || 'Could not submit partner onboarding.');
        return;
      }
      setPartnerConfirmation(
        result.message || 'Your organisation has been submitted for partner onboarding.'
      );
      setOrgName('');
      setContactPerson('');
      setPartnerEmail('');
      setPartnerPhone('');
      setRegionArea('');
      setCollaborationFocus('');
      setWebsiteOrProfile('');
    } catch {
      setPartnerSubmitError('Network error while submitting partner onboarding.');
    } finally {
      setPartnerSubmitting(false);
    }
  };

  return (
    <div>
      {/* Sharp, Edgy & Warm Editorial Hero */}
      <section className="bg-[#160822] text-[#FAF7F2] py-16 sm:py-24 border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#F3A683]">
              National Directory · Kenya First · Expanding East &amp; Central Africa
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-semibold leading-[1.08]">
              Children’s Homes &amp; Schools for the Differently Abled
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/85 leading-relaxed">
              Explore children’s homes across every region of Kenya—and partner schools serving
              neurodiverse, blind, deaf, and physically differently abled learners. Plan structured
              CSR visits, supply deliveries, and inclusive community mentorship with care.
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              <button
                type="button"
                onClick={() => {
                  setFormMode('visit');
                  workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap"
              >
                Book a Children’s Home Visit
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormMode('partner');
                  workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#FAF7F2] border border-[#F3A683]/50 hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
              >
                <Building2 className="w-4 h-4 text-[#F3A683]" aria-hidden="true" />
                Onboard Your Organisation
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <figure className="rounded-xl overflow-hidden border border-white/15 bg-[#160822] shadow-xl">
              <SafeImage
                src="/src/assets/images/doc_childrens_home_csr_1794832339445.jpg"
                alt="Kenyan volunteers and children reading storybooks on woven mats beneath sunny courtyard acacia trees"
                className="w-full aspect-[4/3] object-cover"
              />
              <figcaption className="px-5 py-3.5 bg-[#1E0B2B] flex items-center justify-between text-xs text-[#FAF7F2]/85 border-t border-white/10">
                <span>Partner Children’s Homes &amp; Inclusive Schools (47 Counties)</span>
                <span className="text-[#E5CA7B]">Safeguarded Visits</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* National Children's Homes & Schools for Differently Abled Directory */}
      <section className="py-16 sm:py-20 bg-[#FDF6EE] border-b border-[#C2593F]/15">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
                All-Kenya Network · Children’s Homes &amp; Special Needs Schools
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Choose Any Children’s Home or Inclusive School Across Kenya
              </h2>
              <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                Search beyond a shortlist—filter by children’s homes or schools for blind, deaf,
                physically differently abled, and neurodiverse learners across Kenya’s regions and
                all 47 counties.
              </p>
            </div>

            {/* Search Box */}
            <div className="w-full lg:w-80 relative">
              <Search
                className="w-4 h-4 text-[#665B73] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, county, Braille, Deaf, Inclusive..."
                aria-label="Search children's homes and schools for differently abled learners"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#3B155F]/20 rounded-lg text-[#1E0B2B] placeholder:text-[#665B73]"
              />
            </div>
          </div>

          {/* Filter Toolbar: Institution Type + Region */}
          <div className="bg-white border border-[#3B155F]/12 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="Filter by centre type"
                className="flex flex-wrap gap-1.5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={typeFilter === 'All'}
                  onClick={() => setTypeFilter('All')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    typeFilter === 'All'
                      ? 'bg-[#3B155F] text-[#FAF7F2]'
                      : 'bg-[#FAF7F2] text-[#3E3349] hover:text-[#1E0B2B]'
                  }`}
                >
                  All Centres ({counts.all})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={typeFilter === 'Children’s Home'}
                  onClick={() => setTypeFilter('Children’s Home')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    typeFilter === 'Children’s Home'
                      ? 'bg-[#C2593F] text-white'
                      : 'bg-[#FAF7F2] text-[#3E3349] hover:text-[#1E0B2B]'
                  }`}
                >
                  Children’s Homes ({counts.childrensHomes})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={typeFilter === 'School for Differently Abled'}
                  onClick={() => setTypeFilter('School for Differently Abled')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                    typeFilter === 'School for Differently Abled'
                      ? 'bg-[#256358] text-white'
                      : 'bg-[#FAF7F2] text-[#3E3349] hover:text-[#1E0B2B]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
                  Schools for Differently Abled ({counts.schools})
                </button>
              </div>

              <p className="text-xs font-medium text-[#665B73] tabular-nums">
                Showing {filteredHomes.length} of {homes.length} Children’s Homes &amp; Inclusive
                Schools Across Kenya
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#3B155F]/10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#665B73] mr-1">
                Region:
              </span>
              {regions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setRegionFilter(region)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    regionFilter === region
                      ? 'bg-[#3B155F] text-[#FAF7F2]'
                      : 'bg-[#FAF7F2] text-[#3E3349] hover:text-[#1E0B2B]'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {matchedCountyHub && (
            <div className="bg-white border-2 border-[#D4AF37]/50 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5A10]">
                  County {matchedCountyHub.code} · {matchedCountyHub.name} Guardian &amp; Placement Desk
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1E0B2B]">
                  {matchedCountyHub.facilityHubName}
                </h3>
                <p className="text-xs sm:text-sm text-[#3E3349]">
                  <strong>Address:</strong> {matchedCountyHub.physicalAddress} ·{' '}
                  <strong>Programmes:</strong> {matchedCountyHub.partnerProgrammes}
                </p>
                <div className="flex flex-wrap gap-4 pt-1 text-xs font-semibold">
                  <a
                    href={`tel:${matchedCountyHub.facilityPhone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1 text-[#256358] hover:underline tabular-nums"
                  >
                    <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                    {matchedCountyHub.facilityPhone}
                  </a>
                  <a
                    href={`mailto:${matchedCountyHub.facilityEmail}`}
                    className="inline-flex items-center gap-1 text-[#3B155F] hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                    {matchedCountyHub.facilityEmail}
                  </a>
                </div>
              </div>
              <a
                href={matchedCountyHub.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-[#3B155F] text-[#FAF7F2] hover:bg-[#2C1042] rounded-md whitespace-nowrap shrink-0"
              >
                Open County Webpage
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          )}

          {filteredHomes.length === 0 ? (
            <div className="bg-white border border-[#3B155F]/12 rounded-xl p-10 text-center space-y-3">
              <p className="font-serif text-xl font-semibold text-[#1E0B2B]">
                No centres matched “{searchQuery || regionFilter}”.
              </p>
              <p className="text-sm text-[#3E3349]">
                Clear filters to view all {homes.length} Children’s Homes and Schools for the
                Differently Abled across Kenya.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('All');
                  setRegionFilter('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#3B155F] text-[#FAF7F2] rounded-md"
              >
                Show All {homes.length} Centres
              </button>
            </div>
          ) : (
            <div
              key={`${typeFilter}-${regionFilter}-${searchQuery}`}
              className="tab-panel-smooth grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {filteredHomes.map((home) => {
                const isSchool = home.institutionType === 'School for Differently Abled';
                return (
                  <article
                    key={home.id}
                    className="bg-white border border-[#3B155F]/12 rounded-xl overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[16/9] bg-[#F3EEF8] overflow-hidden relative">
                      <SafeImage
                        src={home.imageUrl}
                        alt={home.imageAlt}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold rounded-md shadow-sm ${
                          isSchool
                            ? 'bg-[#256358] text-white'
                            : 'bg-[#3B155F] text-[#FAF7F2]'
                        }`}
                      >
                        {isSchool ? 'School for Differently Abled' : 'Children’s Home'}
                      </span>
                    </div>
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#665B73]">
                          <span className="font-semibold text-[#C2593F] inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                            {home.townArea}, {home.countyRegion}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{home.childrenAgeRange}</span>
                          {home.acceptsCorporateTeams && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#256358] font-medium">CSR Ready</span>
                            </>
                          )}
                        </div>
                        <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                          {home.name}
                        </h3>
                        {home.specialization && (
                          <p className="text-xs font-semibold text-[#256358]">
                            Focus: {home.specialization}
                          </p>
                        )}
                        <p className="text-sm text-[#3E3349] leading-relaxed">{home.description}</p>
                        <div className="pt-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5A10] mb-1.5">
                            Priority Support &amp; Learning Needs
                          </p>
                          <p className="text-xs sm:text-sm text-[#3E3349]">
                            {home.currentNeeds.join(' · ')}
                          </p>
                        </div>

                        {(home.physicalAddress || home.contactPhone || home.contactEmail) && (
                          <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#3B155F]/10 space-y-1.5 text-xs text-[#3E3349]">
                            {home.physicalAddress && (
                              <p>
                                <strong className="text-[#1E0B2B]">Address:</strong>{' '}
                                {home.physicalAddress}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                              {home.contactPhone && (
                                <a
                                  href={`tel:${home.contactPhone.replace(/\s+/g, '')}`}
                                  className="inline-flex items-center gap-1 text-[#256358] hover:underline tabular-nums"
                                >
                                  <PhoneCall className="w-3 h-3" aria-hidden="true" />
                                  {home.contactPhone}
                                </a>
                              )}
                              {home.contactEmail && (
                                <a
                                  href={`mailto:${home.contactEmail}`}
                                  className="inline-flex items-center gap-1 text-[#3B155F] hover:underline"
                                >
                                  <Mail className="w-3 h-3" aria-hidden="true" />
                                  {home.contactEmail}
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#3B155F]/10">
                        {home.websiteUrl ? (
                          <a
                            href={home.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#256358] hover:underline"
                          >
                            Facility Webpage
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="text-xs text-[#665B73]">
                            Safeguarding briefed before arrival
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => selectHomeForVisit(home)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-[#3B155F] text-[#FAF7F2] hover:bg-[#2C1042] rounded-md transition-colors whitespace-nowrap shrink-0"
                        >
                          Visit / Support Here
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Booking & Organisation Onboarding Workspace */}
      <section ref={workspaceRef} className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: Standards & Mode Selector */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
                Two Ways to Cooperate
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Corporate Teams, Groups &amp; Partner Organisations
              </h2>
              <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                Switch between scheduling a visit to a children’s home or onboarding your company,
                fellowship, NGO, or children’s home into our cooperative network.
              </p>
            </div>

            <div className="space-y-4 pt-2 border-t border-[#3B155F]/12">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-[#C2593F] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                    For Corporates &amp; Visiting Groups
                  </h3>
                  <p className="text-sm text-[#3E3349] mt-1 leading-relaxed">
                    We handle matching with verified children’s homes, pre-visit safeguarding
                    briefing, exact item wishlists, and hosted arrival coordination.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <HeartHandshake
                  className="w-5 h-5 text-[#3B155F] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                    For NGOs, Children’s Homes &amp; Sponsors
                  </h3>
                  <p className="text-sm text-[#3E3349] mt-1 leading-relaxed">
                    Onboard your children’s home to receive vetted corporate/group support, or partner
                    as an organisation co-delivering medical camps, mentorship, and supplies.
                  </p>
                </div>
              </div>
            </div>

            <VisitKitEstimator
              groupSize={groupSize}
              childrenCount={estimatedChildren}
              onGroupSizeChange={setGroupSize}
              onChildrenCountChange={setEstimatedChildren}
              onApplyToNotes={(summary) => {
                setFormMode('visit');
                setConfirmation(null);
                setNotes((prev) => (prev.trim() ? `${prev.trim()}\n\n${summary}` : summary));
              }}
            />
          </div>

          {/* Right Side: Interactive Tabbed Workspace */}
          <div className="lg:col-span-7 space-y-5">
            <div
              role="tablist"
              aria-label="Children's Home Visit or Partner Onboarding"
              className="grid grid-cols-2 p-1 bg-[#EAE3F2] rounded-lg"
            >
              <button
                type="button"
                role="tab"
                aria-selected={formMode === 'visit'}
                onClick={() => setFormMode('visit')}
                className={`py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                  formMode === 'visit'
                    ? 'bg-[#3B155F] text-[#FAF7F2] shadow-sm'
                    : 'text-[#3E3349] hover:text-[#1E0B2B]'
                }`}
              >
                Book Children’s Home Visit
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={formMode === 'partner'}
                onClick={() => setFormMode('partner')}
                className={`py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                  formMode === 'partner'
                    ? 'bg-[#3B155F] text-[#FAF7F2] shadow-sm'
                    : 'text-[#3E3349] hover:text-[#1E0B2B]'
                }`}
              >
                Onboard Partner Organisation
              </button>
            </div>

            <div key={formMode} className="tab-panel-smooth">
            {formMode === 'visit' ? (
              confirmation ? (
                <div
                  role="status"
                  className="bg-white border border-[#3B155F]/15 rounded-xl p-8 sm:p-10 space-y-5"
                >
                  <div className="flex items-start gap-3.5">
                    <CheckCircle2
                      className="w-6 h-6 text-[#256358] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                        Children’s Home Visit Request Received
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
                    Book Another Children’s Home Visit
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleVisitSubmit}
                  noValidate
                  className="bg-white border border-[#3B155F]/15 rounded-xl p-6 sm:p-10 space-y-5"
                >
                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#3B155F]/10">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                        Schedule a Children’s Home Visit
                      </h3>
                      <p className="text-sm text-[#665B73] mt-1">
                        For corporate CSR teams, individuals, schools, and community groups.
                      </p>
                    </div>
                    <CalendarCheck2
                      className="w-5 h-5 text-[#C2593F] shrink-0"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="visit-website-url">Website</label>
                    <input
                      id="visit-website-url"
                      type="text"
                      tabIndex={-1}
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="visit-target-home"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Target Children’s Home or Differently Abled School
                    </label>
                    <select
                      id="visit-target-home"
                      value={selectedHomeId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedHomeId(val);
                        const match = homes.find((h) => h.id === val);
                        if (match) {
                          setSelectedHomeName(match.name);
                          setLocationArea(`${match.townArea}, ${match.countyRegion}`);
                        } else {
                          setSelectedHomeName(
                            'Matched Partner Children’s Home or Special School'
                          );
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      <option value="any-partner-home">
                        Recommend Highest-Need Children’s Home or Special School
                      </option>
                      {homes.map((home) => (
                        <option key={home.id} value={home.id}>
                          {home.name} ({home.institutionType === 'School for Differently Abled' ? 'Special School' : 'Children’s Home'}) — {home.countyRegion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="visit-org-type"
                        className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                      >
                        Visiting As
                      </label>
                      <select
                        id="visit-org-type"
                        value={organizerType}
                        onChange={(e) =>
                          setOrganizerType(e.target.value as HomeVisitBooking['organizerType'])
                        }
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                      >
                        {ORGANIZER_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="visit-size"
                        className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                      >
                        Team / Visitor Count
                      </label>
                      <input
                        id="visit-size"
                        type="number"
                        min={1}
                        max={200}
                        value={groupSize}
                        onChange={(e) => setGroupSize(Number(e.target.value) || 1)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="visit-coord"
                        className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                      >
                        Coordinator / Your Name <span className="text-[#C2593F]">*</span>
                      </label>
                      <input
                        id="visit-coord"
                        type="text"
                        required
                        value={coordinatorName}
                        onChange={(e) => setCoordinatorName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                      />
                      {errors.coordinatorName && (
                        <p className="mt-1 text-xs text-red-700" role="alert">
                          {errors.coordinatorName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="visit-group-name"
                        className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                      >
                        Company / Group Name{' '}
                        <span className="text-[#665B73] font-normal">(If group/CSR)</span>
                      </label>
                      <input
                        id="visit-group-name"
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="e.g. Horizon Logistics CSR Team"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="visit-email"
                        className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                      >
                        Email Address <span className="text-[#C2593F]">*</span>
                      </label>
                      <input
                        id="visit-email"
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
                    <div>
                      <label
                        htmlFor="visit-phone"
                        className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                      >
                        Phone / WhatsApp
                      </label>
                      <input
                        id="visit-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="visit-focus"
                        className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                      >
                        Planned Visit Activity
                      </label>
                      <select
                        id="visit-focus"
                        value={focusArea}
                        onChange={(e) => setFocusArea(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                      >
                        {VISIT_PURPOSES.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="visit-location"
                        className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                      >
                        Preferred County / Town <span className="text-[#C2593F]">*</span>
                      </label>
                      <input
                        id="visit-location"
                        type="text"
                        required
                        value={locationArea}
                        onChange={(e) => setLocationArea(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                      />
                      {errors.locationArea && (
                        <p className="mt-1 text-xs text-red-700" role="alert">
                          {errors.locationArea}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="visit-date"
                        className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                      >
                        Preferred Date <span className="text-[#C2593F]">*</span>
                      </label>
                      <input
                        id="visit-date"
                        type="date"
                        required
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md tabular-nums"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="visit-window"
                        className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                      >
                        Preferred Time Window
                      </label>
                      <select
                        id="visit-window"
                        value={preferredTimeWindow}
                        onChange={(e) => setPreferredTimeWindow(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                      >
                        {TIME_WINDOWS.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="visit-notes"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Supplies, CSR Goals, or Questions
                    </label>
                    <textarea
                      id="visit-notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Share items you plan to donate, mentorship activities, or corporate logistics needs."
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
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] disabled:opacity-60 rounded-md transition-colors"
                  >
                    {submitting ? 'Logging Visit Request...' : 'Submit Children’s Home Visit'}
                  </button>
                </form>
              )
            ) : partnerConfirmation ? (
              <div
                role="status"
                className="bg-white border border-[#3B155F]/15 rounded-xl p-8 sm:p-10 space-y-5"
              >
                <div className="flex items-start gap-3.5">
                  <CheckCircle2
                    className="w-6 h-6 text-[#256358] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                      Organisation Onboarding Logged
                    </h3>
                    <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                      {partnerConfirmation}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPartnerConfirmation(null)}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#3B155F] border border-[#3B155F]/25 rounded-md hover:bg-[#F3EEF8]"
                >
                  Onboard Another Organisation
                </button>
              </div>
            ) : (
              <form
                onSubmit={handlePartnerSubmit}
                noValidate
                className="bg-white border border-[#3B155F]/15 rounded-xl p-6 sm:p-10 space-y-5"
              >
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#3B155F]/10">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                      Partner Organisation Onboarding
                    </h3>
                    <p className="text-sm text-[#665B73] mt-1">
                      For Corporates, Registered Children’s Homes, NGOs, and Rehabilitation Centres.
                    </p>
                  </div>
                  <Building2 className="w-5 h-5 text-[#C2593F] shrink-0" aria-hidden="true" />
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="partner-website-url">Website</label>
                  <input
                    id="partner-website-url"
                    type="text"
                    tabIndex={-1}
                    value={partnerHoneypot}
                    onChange={(e) => setPartnerHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="partner-org-name"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Organisation / Home Name <span className="text-[#C2593F]">*</span>
                    </label>
                    <input
                      id="partner-org-name"
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                    {partnerErrors.organizationName && (
                      <p className="mt-1 text-xs text-red-700" role="alert">
                        {partnerErrors.organizationName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="partner-type"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Organisation Type
                    </label>
                    <select
                      id="partner-type"
                      value={partnerType}
                      onChange={(e) =>
                        setPartnerType(e.target.value as PartnerOrganization['partnerType'])
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      {PARTNER_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="partner-contact-person"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Liaison Contact Person <span className="text-[#C2593F]">*</span>
                    </label>
                    <input
                      id="partner-contact-person"
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                    {partnerErrors.contactPerson && (
                      <p className="mt-1 text-xs text-red-700" role="alert">
                        {partnerErrors.contactPerson}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="partner-email"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Official Email <span className="text-[#C2593F]">*</span>
                    </label>
                    <input
                      id="partner-email"
                      type="email"
                      required
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                    {partnerErrors.email && (
                      <p className="mt-1 text-xs text-red-700" role="alert">
                        {partnerErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="partner-phone"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      Phone Number
                    </label>
                    <input
                      id="partner-phone"
                      type="tel"
                      value={partnerPhone}
                      onChange={(e) => setPartnerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="partner-region"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      County / Operating Region <span className="text-[#C2593F]">*</span>
                    </label>
                    <input
                      id="partner-region"
                      type="text"
                      required
                      value={regionArea}
                      onChange={(e) => setRegionArea(e.target.value)}
                      placeholder="e.g. Nairobi, Kiambu, Nakuru"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                    {partnerErrors.regionArea && (
                      <p className="mt-1 text-xs text-red-700" role="alert">
                        {partnerErrors.regionArea}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="partner-website"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    Website or Registration Reference{' '}
                    <span className="text-[#665B73] font-normal">(Optional)</span>
                  </label>
                  <input
                    id="partner-website"
                    type="text"
                    value={websiteOrProfile}
                    onChange={(e) => setWebsiteOrProfile(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                </div>

                <div>
                  <label
                    htmlFor="partner-focus"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    How Would Your Organisation Like to Cooperate?{' '}
                    <span className="text-[#C2593F]">*</span>
                  </label>
                  <textarea
                    id="partner-focus"
                    rows={4}
                    required
                    value={collaborationFocus}
                    onChange={(e) => setCollaborationFocus(e.target.value)}
                    placeholder="e.g. Hosting corporate volunteering teams at children’s homes, onboarding our registered children’s home, co-funding nutrition packs, or offering medical/rehab beds."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                  {partnerErrors.collaborationFocus && (
                    <p className="mt-1 text-xs text-red-700" role="alert">
                      {partnerErrors.collaborationFocus}
                    </p>
                  )}
                </div>

                {partnerSubmitError && (
                  <p role="alert" className="text-xs text-red-700 bg-red-50 p-3 rounded-md">
                    {partnerSubmitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={partnerSubmitting}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#C2593F] hover:bg-[#A64831] disabled:opacity-60 rounded-md transition-colors"
                >
                  {partnerSubmitting ? 'Submitting Onboarding...' : 'Submit Organisation Onboarding'}
                </button>
              </form>
            )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
