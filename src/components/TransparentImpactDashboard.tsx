import { useMemo, useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, HeartPulse, MapPin, ShieldCheck } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import {
  buildRegionalCareSummary,
  computeVillageProgress,
  TRANSPARENT_STEWARDSHIP_ALLOCATIONS,
} from '../utils/careTools';

export function TransparentImpactDashboard({ compact = false }: { compact?: boolean }) {
  const { data } = useSiteData();
  const homes = data?.childrensHomes || [];
  const facilities = data?.rehabFacilities || [];
  const events = data?.events || [];
  const projects = data?.impactProjects || [];
  const contributions = data?.villageContributions || [];

  const regionalSummaries = useMemo(
    () =>
      buildRegionalCareSummary({
        childrensHomes: homes,
        rehabFacilities: facilities,
        events,
        contributions,
      }),
    [homes, facilities, events, contributions]
  );

  const villageProgress = useMemo(() => computeVillageProgress(contributions), [contributions]);

  const [selectedCounty, setSelectedCounty] = useState<string>('Nairobi');
  const [activeTourIndex, setActiveTourIndex] = useState(0);
  const [selectedAllocationId, setSelectedAllocationId] = useState<string>('homes');

  const activeRegion =
    regionalSummaries.find((r) => r.county === selectedCounty) || regionalSummaries[0];
  const activeAllocation =
    TRANSPARENT_STEWARDSHIP_ALLOCATIONS.find((a) => a.id === activeTourIndex.toString()) ||
    TRANSPARENT_STEWARDSHIP_ALLOCATIONS.find((a) => a.id === selectedAllocationId) ||
    TRANSPARENT_STEWARDSHIP_ALLOCATIONS[0];
  const activeProject = projects[activeTourIndex] || projects[0];

  return (
    <section
      aria-label="Transparent impact and regional care map"
      className="py-16 sm:py-24 bg-[#1E0B2B] text-[#FAF7F2] border-y border-[#D4AF37]/25"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-12">
        {/* Heading & GiveDirectly-style Direct Live Numbers */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Transparent Impact Since 2025 · Open Stewardship
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#FAF7F2]">
              Live Regional Footprint &amp; Verified Care Accountability
            </h2>
            <p className="text-sm sm:text-base text-[#FAF7F2]/85 leading-relaxed">
              Every partnered children’s home, rehabilitation liaison, safe refuge response, and
              community contribution is tracked openly across our 5 regional care hubs so families
              and partners know exactly how resources serve people.
            </p>
          </div>
          {compact && (
            <AppLink
              href="/impact"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              Open Full Impact Ledger
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </AppLink>
          )}
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
              Rehab &amp; Recovery Partners
            </p>
            <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#FAF7F2] tabular-nums">
              {facilities.length}
            </p>
            <p className="text-xs text-[#FAF7F2]/75">Connected across 5 Kenyan counties</p>
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
              Direct-to-Mission Ratio
            </p>
            <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#FAF7F2] tabular-nums">
              94%
            </p>
            <p className="text-xs text-[#FAF7F2]/75">Allocated straight to families, homes &amp; care</p>
          </div>
        </div>

        {/* Two-Column Interactive Regional Care Map + Stewardship Financial Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Interactive Kenya Care Network Map (Surfers Against Sewage / GiveDirectly fusion) */}
          <div className="lg:col-span-7 bg-[#140620] border border-white/15 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#84B5A9]">
                  Interactive Regional Care Coverage Map
                </p>
                <h3 className="font-serif text-2xl font-semibold text-[#FAF7F2] mt-1">
                  Select a County Hub to Inspect Live Reach
                </h3>
              </div>
              <span className="text-xs text-[#E5CA7B] font-medium">
                {regionalSummaries.length} Active Hubs (Est. 2025)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Interactive Regional Vector Map */}
              <div className="md:col-span-6 bg-[#1F0C32] border border-white/10 rounded-xl p-4">
                <svg
                  viewBox="0 0 420 360"
                  role="img"
                  aria-label="Interactive regional map of HIS AND HERS Care Network Hubs in Kenya"
                  className="w-full h-auto"
                >
                  {/* Stylized Kenya Territory Contour */}
                  <path
                    d="M148 32 L255 24 L318 68 L374 176 L352 292 L292 332 L212 292 L126 244 L80 176 L96 102 Z"
                    fill="#2D1547"
                    stroke="#D4AF37"
                    strokeWidth="2"
                    strokeOpacity="0.55"
                  />
                  {/* Connecting Care Corridor Lines */}
                  <path
                    d="M98 162 L168 158 L215 178 L222 204 L332 286"
                    fill="none"
                    stroke="#84B5A9"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    strokeOpacity="0.65"
                  />

                  {regionalSummaries.map((node) => {
                    const isSelected = node.county === activeRegion?.county;
                    const labelX = node.county === 'Nairobi' ? node.mapX + 12 : node.mapX;
                    const labelY = node.county === 'Nairobi' ? node.mapY + 23 : node.mapY - 14;
                    return (
                      <g
                        key={node.county}
                        role="button"
                        tabIndex={0}
                        aria-label={`Inspect ${node.county} Care Hub`}
                        onClick={() => setSelectedCounty(node.county)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedCounty(node.county);
                          }
                        }}
                        className="cursor-pointer focus:outline-none"
                      >
                        {isSelected && (
                          <circle
                            cx={node.mapX}
                            cy={node.mapY}
                            r="20"
                            fill="#D4AF37"
                            fillOpacity="0.28"
                          />
                        )}
                        <circle
                          cx={node.mapX}
                          cy={node.mapY}
                          r={isSelected ? '11' : '8'}
                          fill={isSelected ? '#D4AF37' : '#C2593F'}
                          stroke="#FAF7F2"
                          strokeWidth="2"
                        />
                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor={node.county === 'Nairobi' ? 'start' : 'middle'}
                          fill={isSelected ? '#F8DF8C' : '#FAF7F2'}
                          fontSize="12"
                          fontWeight={isSelected ? '700' : '500'}
                        >
                          {node.county}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Selected County Details Card */}
              {activeRegion && (
                <div className="md:col-span-6 space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {regionalSummaries.map((reg) => (
                      <button
                        key={reg.county}
                        type="button"
                        onClick={() => setSelectedCounty(reg.county)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          reg.county === activeRegion.county
                            ? 'bg-[#D4AF37] text-[#160822]'
                            : 'bg-white/10 text-[#FAF7F2] hover:bg-white/20'
                        }`}
                      >
                        {reg.county}
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#25103C] border border-white/15 rounded-xl p-5 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-[#84B5A9] inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        {activeRegion.county} County Hub
                      </p>
                      <h4 className="font-serif text-xl font-semibold text-[#FAF7F2] mt-1">
                        {activeRegion.hubSubtitle}
                      </h4>
                      <p className="text-xs text-[#FAF7F2]/80 mt-1.5 leading-relaxed">
                        {activeRegion.highlightNote}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[#FAF7F2]/65 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#F3A683]" aria-hidden="true" />
                          Children’s Homes
                        </span>
                        <p className="text-lg font-semibold text-[#FAF7F2] tabular-nums">
                          {activeRegion.homesCount} verified
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[#FAF7F2]/65 flex items-center gap-1">
                          <HeartPulse className="w-3.5 h-3.5 text-[#84B5A9]" aria-hidden="true" />
                          Rehab Centres
                        </span>
                        <p className="text-lg font-semibold text-[#FAF7F2] tabular-nums">
                          {activeRegion.rehabCount} partner(s)
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[#FAF7F2]/65">Safe Refuge Desk</span>
                        <p className="font-semibold text-[#84B5A9] inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          Active Coverage
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[#FAF7F2]/65">Regional Pledges</span>
                        <p className="font-semibold text-[#E5CA7B] tabular-nums">
                          KES {activeRegion.pledgesKes.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-1 text-xs">
                      <AppLink
                        href="/home-visits"
                        className="font-semibold text-[#F3D79B] hover:underline underline-offset-4"
                      >
                        Visit Homes →
                      </AppLink>
                      <AppLink
                        href="/rehabilitation"
                        className="font-semibold text-[#84B5A9] hover:underline underline-offset-4"
                      >
                        Find Rehab →
                      </AppLink>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: 100% Stewardship Breakdown (GiveDirectly Transparency Standard) */}
          <div className="lg:col-span-5 bg-[#FAF7F2] text-[#1E0B2B] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                Stewardship Financial Ledger
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
                Where Every Contribution Goes
              </h3>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                Select any programme pillar below to inspect how community support is distributed
                across children’s homes, mental health, safe refuge, and ASD care.
              </p>
            </div>

            {/* Segmented Horizontal Allocation Bar */}
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

        {/* Waves-for-Water Inspired Documented Project Tour (Full view) */}
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
