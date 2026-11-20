import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  HeartPulse,
  Mail,
  MapPin,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import {
  computeVillageProgress,
  TRANSPARENT_STEWARDSHIP_ALLOCATIONS,
} from '../utils/careTools';
import {
  ALL_KENYA_COUNTIES,
  KENYA_REGION_NAMES,
  findKenyaCounty,
  searchKenyaCounties,
} from '../utils/kenyaCounties';
import { openEmergencyAlertModal } from './EmergencyAuthorityAlert';

export function TransparentImpactDashboard({ compact = false }: { compact?: boolean }) {
  const { data } = useSiteData();
  const homes = data?.childrensHomes || [];
  const facilities = data?.rehabFacilities || [];
  const events = data?.events || [];
  const projects = data?.impactProjects || [];
  const contributions = data?.villageContributions || [];

  const villageProgress = useMemo(() => computeVillageProgress(contributions), [contributions]);

  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [countySearch, setCountySearch] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('Nairobi');
  const [activeTourIndex, setActiveTourIndex] = useState(0);
  const [selectedAllocationId, setSelectedAllocationId] = useState<string>('homes');

  const visibleCounties = useMemo(() => {
    const base = countySearch.trim()
      ? searchKenyaCounties(countySearch)
      : selectedRegion === 'All'
      ? ALL_KENYA_COUNTIES
      : ALL_KENYA_COUNTIES.filter((c) => c.region === selectedRegion);
    return base.length ? base : ALL_KENYA_COUNTIES;
  }, [selectedRegion, countySearch]);

  const activeCounty = useMemo(() => findKenyaCounty(selectedCounty), [selectedCounty]);

  const matchingHomes = useMemo(
    () =>
      homes.filter(
        (h) => h.countyRegion.toLowerCase() === activeCounty.name.toLowerCase()
      ),
    [homes, activeCounty.name]
  );

  const matchingFacilities = useMemo(
    () =>
      facilities.filter(
        (f) => f.countyRegion.toLowerCase() === activeCounty.name.toLowerCase()
      ),
    [facilities, activeCounty.name]
  );

  const countyHomesCount = matchingHomes.length;
  const countyRehabCount = matchingFacilities.length;

  const countyPledgesKes = useMemo(
    () =>
      contributions
        .filter((c) => c.region.toLowerCase() === activeCounty.name.toLowerCase())
        .reduce((sum, item) => sum + item.amountKes, 0),
    [contributions, activeCounty.name]
  );

  const countyEventsCount = useMemo(
    () =>
      events.filter((e) =>
        `${e.venue} ${e.title}`.toLowerCase().includes(activeCounty.name.toLowerCase())
      ).length,
    [events, activeCounty.name]
  );

  const activeAllocation =
    TRANSPARENT_STEWARDSHIP_ALLOCATIONS.find((a) => a.id === selectedAllocationId) ||
    TRANSPARENT_STEWARDSHIP_ALLOCATIONS[0];
  const activeProject = projects[activeTourIndex] || projects[0];

  return (
    <section
      aria-label="Transparent impact and 47-county care map"
      className="py-16 sm:py-24 bg-[#1E0B2B] text-[#FAF7F2] border-y border-[#D4AF37]/25"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-12">
        {/* Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Transparent Impact Since 2025 · All 47 Counties of Kenya
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#FAF7F2]">
              Live 47-County Footprint &amp; Verified Care Accountability
            </h2>
            <p className="text-sm sm:text-base text-[#FAF7F2]/85 leading-relaxed">
              Every partnered children’s home, rehabilitation liaison, safe refuge desk, November 28
              relief bundle hub, and regional emergency authority link is mapped openly across all
              47 Kenyan counties so families anywhere in the republic receive help faster.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <AppLink
              href="/accountability"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap"
            >
              Open Financial Books
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </AppLink>
            {compact && (
              <AppLink
                href="/impact"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#FAF7F2] border border-[#F3D79B]/45 hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
              >
                Full Impact Ledger
              </AppLink>
            )}
          </div>
        </div>

        {/* 4 Live Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#2B1045] border border-[#D4AF37]/30 rounded-xl p-5 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#E5CA7B]">
              Verified Partner Homes
            </p>
            <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#FAF7F2] tabular-nums">
              {homes.length}
            </p>
            <p className="text-xs text-[#FAF7F2]/75">Open for corporate &amp; group CSR visits</p>
          </div>
          <div className="bg-[#2B1045] border border-[#84B5A9]/30 rounded-xl p-5 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#84B5A9]">
              National Facility Coverage
            </p>
            <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#FAF7F2] tabular-nums">
              47 Counties
            </p>
            <p className="text-xs text-[#FAF7F2]/75">
              {facilities.length} anchor hubs + 47 county authority &amp; referral desks
            </p>
          </div>
          <div className="bg-[#2B1045] border border-[#F3A683]/30 rounded-xl p-5 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#F3A683]">
              Village Care Pledged
            </p>
            <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#FAF7F2] tabular-nums">
              KES {villageProgress.totalKes.toLocaleString()}
            </p>
            <p className="text-xs text-[#FAF7F2]/75">
              {villageProgress.pledgeCount} documented community pledges
            </p>
          </div>
          <div className="bg-[#2B1045] border border-white/15 rounded-xl p-5 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#F3D79B]">
              Programmes / Admin / Fund
            </p>
            <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#FAF7F2] tabular-nums">
              82 / 12 / 6
            </p>
            <p className="text-xs text-[#FAF7F2]/75">82% direct programmes across our open ledger</p>
          </div>
        </div>

        {/* Two-Column Interactive 47-County Care Network Map + Stewardship Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 bg-[#140620] border border-white/15 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#84B5A9]">
                  Interactive 47-County Care Coverage Map
                </p>
                <h3 className="font-serif text-2xl font-semibold text-[#FAF7F2] mt-1">
                  Inspect Local Partners, Rehab &amp; Authorities in All 47 Counties
                </h3>
              </div>
              <span className="text-xs text-[#E5CA7B] font-semibold tabular-nums">
                47 / 47 Kenyan Counties Active
              </span>
            </div>

            {/* Region Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedRegion('All')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  selectedRegion === 'All'
                    ? 'bg-[#D4AF37] text-[#160822]'
                    : 'bg-white/10 text-[#FAF7F2] hover:bg-white/20'
                }`}
              >
                All 47
              </button>
              {KENYA_REGION_NAMES.map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => {
                    setSelectedRegion(reg);
                    const first = ALL_KENYA_COUNTIES.find((c) => c.region === reg);
                    if (first) setSelectedCounty(first.name);
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedRegion === reg
                      ? 'bg-[#D4AF37] text-[#160822]'
                      : 'bg-white/10 text-[#FAF7F2] hover:bg-white/20'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Interactive 47-Pin Kenya SVG Map */}
              <div className="md:col-span-6 bg-[#1F0C32] border border-white/10 rounded-xl p-4 space-y-3">
                <svg
                  viewBox="0 0 420 360"
                  role="img"
                  aria-label="Interactive 47 Counties Map of His & Hers Circle of Hope Network in Kenya"
                  className="w-full h-auto"
                >
                  <path
                    d="M148 32 L255 24 L318 68 L374 176 L352 292 L292 332 L212 292 L126 244 L80 176 L96 102 Z"
                    fill="#2D1547"
                    stroke="#D4AF37"
                    strokeWidth="2"
                    strokeOpacity="0.6"
                  />
                  {visibleCounties.map((node) => {
                    const isSelected = node.name === activeCounty.name;
                    return (
                      <g
                        key={node.code}
                        role="button"
                        tabIndex={0}
                        aria-label={`Inspect ${node.name} County`}
                        onClick={() => setSelectedCounty(node.name)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedCounty(node.name);
                          }
                        }}
                        className="cursor-pointer focus:outline-none"
                      >
                        {isSelected && (
                          <circle
                            cx={node.mapX}
                            cy={node.mapY}
                            r="15"
                            fill="#D4AF37"
                            fillOpacity="0.32"
                          />
                        )}
                        <circle
                          cx={node.mapX}
                          cy={node.mapY}
                          r={isSelected ? '7.5' : '4'}
                          fill={isSelected ? '#D4AF37' : '#84B5A9'}
                          stroke="#140620"
                          strokeWidth="1.2"
                        />
                      </g>
                    );
                  })}
                </svg>

                <div className="flex flex-col gap-2">
                  <label htmlFor="map-county-search" className="sr-only">
                    Search any of the 47 counties
                  </label>
                  <input
                    id="map-county-search"
                    type="search"
                    value={countySearch}
                    onChange={(e) => setCountySearch(e.target.value)}
                    placeholder="Type any of 47 counties or towns..."
                    className="w-full px-3 py-1.5 text-xs bg-[#140620] border border-white/20 rounded-md text-[#FAF7F2] placeholder:text-[#FAF7F2]/50"
                  />
                  <select
                    aria-label="Choose any of the 47 Kenyan counties"
                    value={activeCounty.name}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium bg-[#140620] border border-[#D4AF37]/40 rounded-md text-[#FAF7F2]"
                  >
                    {visibleCounties.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.code} · {c.name} ({c.capitalTown})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected County Details Card */}
              <div className="md:col-span-6 space-y-4">
                <div className="bg-[#25103C] border border-white/15 rounded-xl p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-[#84B5A9] inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      County {activeCounty.code} · {activeCounty.name} ({activeCounty.region})
                    </p>
                    <h4 className="font-serif text-xl font-semibold text-[#FAF7F2] mt-1">
                      HQ Town: {activeCounty.capitalTown}
                    </h4>
                    <p className="text-xs text-[#FAF7F2]/85 mt-1.5 leading-relaxed">
                      {activeCounty.partnerProgrammes}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[#FAF7F2]/65 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#F3A683]" aria-hidden="true" />
                        Host Homes &amp; Relay
                      </span>
                      <p className="text-sm font-semibold text-[#FAF7F2] tabular-nums">
                        {countyHomesCount > 0 ? `${countyHomesCount} local hub(s)` : 'Liaison active'}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[#FAF7F2]/65 flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-[#84B5A9]" aria-hidden="true" />
                        Recovery &amp; Rehab
                      </span>
                      <p className="text-sm font-semibold text-[#FAF7F2] tabular-nums">
                        {countyRehabCount > 0 ? `${countyRehabCount} centre(s)` : '47-county desk'}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[#FAF7F2]/65">Safe Police / Child Desk</span>
                      <p className="font-semibold text-[#84B5A9] inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        999 · 116 · 1195
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[#FAF7F2]/65">County Activity</span>
                      <p className="font-semibold text-[#E5CA7B] tabular-nums">
                        {countyPledgesKes > 0
                          ? `KES ${countyPledgesKes.toLocaleString()}`
                          : `${countyEventsCount} active event(s)`}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#1C0A2E] border border-[#D4AF37]/30 text-xs space-y-2 text-[#FAF7F2]/90">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E5CA7B]">
                          County Facility &amp; Guardian Desk
                        </p>
                        <p className="font-semibold text-[#FAF7F2] text-sm mt-0.5">
                          {activeCounty.facilityHubName}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#FAF7F2]/80 leading-relaxed">
                      <strong>Address:</strong> {activeCounty.physicalAddress}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] pt-0.5">
                      <a
                        href={`tel:${activeCounty.facilityPhone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1 font-semibold text-[#84B5A9] hover:text-[#FAF7F2] tabular-nums"
                      >
                        <PhoneCall className="w-3 h-3" aria-hidden="true" />
                        {activeCounty.facilityPhone}
                      </a>
                      <a
                        href={`mailto:${activeCounty.facilityEmail}`}
                        className="inline-flex items-center gap-1 font-semibold text-[#F3D79B] hover:text-[#FAF7F2]"
                      >
                        <Mail className="w-3 h-3" aria-hidden="true" />
                        {activeCounty.facilityEmail}
                      </a>
                    </div>
                    <div className="pt-1">
                      <a
                        href={activeCounty.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] font-semibold text-[11px] transition-colors"
                      >
                        Open Facility / County Webpage
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  {(matchingHomes.length > 0 || matchingFacilities.length > 0) && (
                    <div className="p-3 rounded-lg bg-[#140620]/80 border border-white/10 text-[11px] space-y-1.5 text-[#FAF7F2]/85">
                      <p className="font-semibold text-[#84B5A9] uppercase tracking-wider">
                        Verified Partner Facilities in {activeCounty.name}
                      </p>
                      {[...matchingHomes.slice(0, 2), ...matchingFacilities.slice(0, 2)].map(
                        (item) => (
                          <div
                            key={item.id}
                            className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/8 first:border-t-0 first:pt-0"
                          >
                            <span className="font-medium text-[#FAF7F2]">{item.name}</span>
                            <div className="flex items-center gap-2">
                              {item.contactPhone && (
                                <a
                                  href={`tel:${item.contactPhone.replace(/\s+/g, '')}`}
                                  className="text-[#84B5A9] hover:underline tabular-nums"
                                >
                                  {item.contactPhone}
                                </a>
                              )}
                              {item.websiteUrl && (
                                <a
                                  href={item.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#E5CA7B] hover:underline inline-flex items-center gap-0.5"
                                >
                                  Site <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-[#140620] border border-white/10 text-[11px] space-y-1 text-[#FAF7F2]/85">
                    <p>
                      <strong className="text-[#F3D79B]">Police OCS:</strong>{' '}
                      {activeCounty.emergencyPolice}
                    </p>
                    <p>
                      <strong className="text-[#84B5A9]">Children Officer:</strong>{' '}
                      {activeCounty.childProtectionDesk}
                    </p>
                    <p>
                      <strong className="text-[#F3A683]">GBV Unit:</strong> {activeCounty.gbvDesk}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => openEmergencyAlertModal(activeCounty.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#C2593F] hover:bg-[#A64831] text-white font-semibold transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                      Alert {activeCounty.name} Authorities
                    </button>
                    <div className="flex items-center gap-3">
                      <AppLink
                        href={`/home-visits?county=${encodeURIComponent(activeCounty.name)}`}
                        className="font-semibold text-[#F3D79B] hover:underline underline-offset-4"
                      >
                        Homes →
                      </AppLink>
                      <AppLink
                        href={`/rehabilitation?county=${encodeURIComponent(activeCounty.name)}`}
                        className="font-semibold text-[#84B5A9] hover:underline underline-offset-4"
                      >
                        Find Rehab →
                      </AppLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: 100% Stewardship Breakdown */}
          <div className="lg:col-span-5 bg-[#FAF7F2] text-[#1E0B2B] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                Stewardship Financial Ledger
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
                Where Every Contribution Goes
              </h3>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                Select any programme pillar below or visit our{' '}
                <AppLink href="/accountability" className="font-semibold text-[#256358] underline">
                  open books Accountability page
                </AppLink>{' '}
                to download full filings.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-4 w-full rounded-full overflow-hidden flex border border-[#3B155F]/15">
                {TRANSPARENT_STEWARDSHIP_ALLOCATIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`${item.label}: ${item.percent}%`}
                    onClick={() => setSelectedAllocationId(item.id)}
                    style={{ width: `${item.percent}%`, backgroundColor: item.colorHex }}
                    className={`h-full transition-opacity ${
                      selectedAllocationId === item.id ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>

              <div className="space-y-2">
                {TRANSPARENT_STEWARDSHIP_ALLOCATIONS.map((item) => {
                  const selected = item.id === activeAllocation.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedAllocationId(item.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg border transition-colors flex items-center justify-between gap-3 ${
                        selected
                          ? 'bg-white border-[#3B155F]/35 shadow-sm'
                          : 'bg-transparent border-transparent hover:bg-white/70'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2.5 text-sm font-medium text-[#1E0B2B]">
                        <span
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: item.colorHex }}
                        />
                        {item.label}
                      </span>
                      <span className="font-semibold text-sm text-[#3B155F] tabular-nums">
                        {item.percent}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#EAF6F2] border border-[#256358]/20 rounded-xl p-4 text-xs text-[#1E0B2B] space-y-1">
              <p className="font-semibold text-[#256358] inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                {activeAllocation.label} ({activeAllocation.percent}%)
              </p>
              <p className="text-[#3E3349] leading-relaxed">{activeAllocation.detail}</p>
            </div>
          </div>
        </div>

        {/* Documented Project Tour (Full view) */}
        {!compact && projects.length > 0 && (
          <div className="bg-[#2B1045] border border-white/15 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#F3D79B]">
                  2025 – 2026 Project Field Tour
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#FAF7F2] mt-1">
                  Follow Our Outreach Milestones Step by Step
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {projects.slice(0, 4).map((proj, idx) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => setActiveTourIndex(idx)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors tabular-nums ${
                      idx === activeTourIndex
                        ? 'bg-[#D4AF37] text-[#160822]'
                        : 'bg-white/10 text-[#FAF7F2] hover:bg-white/20'
                    }`}
                  >
                    Stop 0{idx + 1} · {proj.dateLabel}
                  </button>
                ))}
              </div>
            </div>

            {activeProject && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2 border-t border-white/10">
                <div className="md:col-span-5 aspect-[16/10] rounded-xl overflow-hidden border border-white/15">
                  <img
                    src={activeProject.imageUrl}
                    alt={activeProject.imageAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:col-span-7 space-y-3">
                  <p className="text-xs font-semibold text-[#84B5A9] uppercase tracking-wider">
                    {activeProject.category} · {activeProject.locationLabel}
                  </p>
                  <h4 className="font-serif text-2xl sm:text-3xl font-semibold text-[#FAF7F2]">
                    {activeProject.title}
                  </h4>
                  <p className="text-sm text-[#FAF7F2]/85 leading-relaxed">
                    {activeProject.whatWasDone}
                  </p>
                  <p className="text-xs text-[#F3D79B]">
                    <strong>People Served:</strong> {activeProject.whoItServed}
                  </p>
                  <AppLink
                    href={`/impact/${activeProject.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E5CA7B] hover:underline underline-offset-4 pt-1"
                  >
                    Read Complete Initiative Story
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </AppLink>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
