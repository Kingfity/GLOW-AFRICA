import React, { useMemo, useState } from 'react';
import { CheckCircle2, HeartHandshake, MapPin, Sparkles } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import type { VillageTierId } from '../shared/types';
import {
  computeVillageProgress,
  validateVillageContribution,
  VILLAGE_FUNDING_GOAL_KES,
  VILLAGE_SCENE_TIERS,
} from '../utils/careTools';
import { ALL_47_COUNTY_NAMES } from '../utils/kenyaCounties';

const REGIONS = ALL_47_COUNTY_NAMES;

export function CareVillageBuilder({ compact = false }: { compact?: boolean }) {
  const { data, refresh } = useSiteData();
  const contributions = data?.villageContributions || [];

  const [selectedTierId, setSelectedTierId] = useState<VillageTierId>('books');
  const [units, setUnits] = useState(1);
  const [contributorName, setContributorName] = useState('');
  const [region, setRegion] = useState('Nairobi');
  const [encouragementNote, setEncouragementNote] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const progress = useMemo(() => computeVillageProgress(contributions), [contributions]);
  const selectedTier =
    VILLAGE_SCENE_TIERS.find((t) => t.id === selectedTierId) || VILLAGE_SCENE_TIERS[0];

  const isLayerActive = (tierId: VillageTierId) =>
    selectedTierId === tierId || progress.unlockedTierIds.includes(tierId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setConfirmation(null);

    const validation = validateVillageContribution({
      contributorName,
      region,
      tierId: selectedTierId,
      units,
      encouragementNote,
    });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributorName,
          region,
          tierId: selectedTierId,
          units,
          encouragementNote,
          website_url: honeypot,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.errors) setErrors(result.errors);
        setSubmitError(result.error || 'Could not record pledge right now.');
        return;
      }
      setConfirmation(
        result.message || 'Thank you! Your contribution just illuminated the Care Family Village.'
      );
      setContributorName('');
      setEncouragementNote('');
      setUnits(1);
      await refresh();
    } catch {
      setSubmitError('Network error submitting pledge. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="care-village-builder"
      aria-label="Build the HIS AND HERS Care Family Village"
      className="py-16 sm:py-24 bg-gradient-to-br from-[#F7F1FC] via-[#FDF7F0] to-[#EEF7F4] border-y border-[#3B155F]/12"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F] inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" aria-hidden="true" />
              Interactive Care Scene Builder &amp; Live Supporter Feed
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Build Our Care Family Village Together
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              Every contribution lights up another living space in our Care Family Sanctuary—from
              children’s home library gazebos and ASD calm pavilions to safe refuge emergency care.
              Select a kit below to preview it inside the courtyard scene and pledge alongside real
              community supporters.
            </p>
          </div>

          <div className="bg-white border border-[#D4AF37]/40 rounded-xl px-5 py-4 min-w-[260px] space-y-2 shadow-sm">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#7A5A10]">
                Community Care Pledged
              </span>
              <span className="text-xs font-semibold text-[#256358] tabular-nums">
                {progress.goalPercent}% of Goal
              </span>
            </div>
            <p className="font-serif text-2xl font-semibold text-[#1E0B2B] tabular-nums">
              KES {progress.totalKes.toLocaleString()}{' '}
              <span className="text-sm font-sans font-normal text-[#665B73]">
                / {VILLAGE_FUNDING_GOAL_KES.toLocaleString()}
              </span>
            </p>
            <div className="h-2.5 w-full bg-[#3B155F]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C2593F] via-[#D4AF37] to-[#256358] transition-all duration-500"
                style={{ width: `${Math.max(8, progress.goalPercent)}%` }}
              />
            </div>
            <p className="text-xs text-[#665B73] tabular-nums">
              {progress.pledgeCount} documented community pledges active across all 47 Kenyan counties
            </p>
          </div>
        </div>

        {/* Main Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Courtyard SVG Scene + Tier Selector */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-[#1E0B2B] rounded-2xl overflow-hidden border border-[#D4AF37]/35 shadow-md">
              {/* Illustrated Care Family Sanctuary Scene */}
              <div className="relative">
                <svg
                  viewBox="0 0 720 380"
                  role="img"
                  aria-label="Interactive HIS AND HERS Care Family Village Sanctuary Scene"
                  className="w-full h-auto block"
                >
                  <defs>
                    <linearGradient id="villageSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E0B2B" />
                      <stop offset="52%" stopColor="#4A1E6B" />
                      <stop offset="100%" stopColor="#D67C56" />
                    </linearGradient>
                    <linearGradient id="villageGround" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#256358" />
                      <stop offset="55%" stopColor="#357A6C" />
                      <stop offset="100%" stopColor="#21534B" />
                    </linearGradient>
                    <radialGradient id="beaconGlow" cx="50%" cy="40%" r="50%">
                      <stop offset="0%" stopColor="#F8DF8C" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Sky & Golden Dusk Sun */}
                  <rect width="720" height="380" fill="url(#villageSky)" />
                  <circle cx="565" cy="84" r="44" fill="#F3D79B" fillOpacity="0.25" />
                  <circle cx="565" cy="84" r="26" fill="#F8DF8C" fillOpacity="0.82" />

                  {/* Distant Rolling Kenyan Hills */}
                  <path
                    d="M0 245 Q170 190 360 228 T720 220 L720 380 L0 380 Z"
                    fill="#2D1640"
                    fillOpacity="0.65"
                  />
                  {/* Courtyard Lawn */}
                  <path
                    d="M0 265 Q240 245 480 265 T720 262 L720 380 L0 380 Z"
                    fill="url(#villageGround)"
                  />
                  {/* Sunlit Pathway */}
                  <path
                    d="M275 380 Q330 320 360 282 L385 282 Q415 320 455 380 Z"
                    fill="#F2E2C4"
                    fillOpacity="0.85"
                  />

                  {/* 1. ROYAL HEARTH SANCTUARY BEACON (refuge) */}
                  <g
                    style={{
                      opacity: isLayerActive('refuge') ? 1 : 0.42,
                      transition: 'opacity 450ms ease',
                    }}
                  >
                    {isLayerActive('refuge') && (
                      <circle cx="360" cy="175" r="95" fill="url(#beaconGlow)" />
                    )}
                    {/* Royal Sanctuary House */}
                    <rect x="285" y="182" width="150" height="100" rx="6" fill="#FAF3E6" />
                    <polygon points="270,188 360,118 450,188" fill="#3B155F" stroke="#D4AF37" strokeWidth="3" />
                    {/* Crown finial on roof */}
                    <path
                      d="M342 122 L348 106 L360 115 L372 106 L378 122 Z"
                      fill="#D4AF37"
                      stroke="#7A5A10"
                      strokeWidth="1.5"
                    />
                    {/* Warm Glowing Sanctuary Doorway */}
                    <path
                      d="M340 282 V232 C340 220 380 220 380 232 V282 Z"
                      fill={isLayerActive('refuge') ? '#D4AF37' : '#8A7A68'}
                    />
                    <rect x="302" y="210" width="24" height="26" rx="4" fill="#F5D67B" />
                    <rect x="394" y="210" width="24" height="26" rx="4" fill="#F5D67B" />
                    {/* Family silhouette at doorway */}
                    <circle cx="353" cy="252" r="5" fill="#3B155F" />
                    <circle cx="367" cy="252" r="5" fill="#C2593F" />
                    <circle cx="360" cy="260" r="4" fill="#1E0B2B" />
                  </g>

                  {/* 2. COURTYARD LIBRARY GAZEBO (books) */}
                  <g
                    style={{
                      opacity: isLayerActive('books') ? 1 : 0.3,
                      transform: selectedTierId === 'books' ? 'translateY(-4px)' : 'translateY(0)',
                      transition: 'opacity 350ms ease, transform 350ms ease',
                    }}
                  >
                    <rect x="74" y="220" width="110" height="68" rx="5" fill="#FFF7EB" />
                    <polygon points="62,224 129,180 196,224" fill="#C2593F" stroke="#F3D79B" strokeWidth="2" />
                    <rect x="92" y="236" width="74" height="32" rx="3" fill="#D4AF37" fillOpacity="0.85" />
                    <line x1="115" y1="236" x2="115" y2="268" stroke="#3B155F" strokeWidth="2" />
                    <line x1="142" y1="236" x2="142" y2="268" stroke="#3B155F" strokeWidth="2" />
                    <text x="129" y="304" textAnchor="middle" fill="#FAF7F2" fontSize="11" fontWeight="600">
                      Library Gazebo ({progress.countsByTier.books})
                    </text>
                  </g>

                  {/* 3. ASD QUIET EUCALYPTUS PAVILION (sensory) */}
                  <g
                    style={{
                      opacity: isLayerActive('sensory') ? 1 : 0.3,
                      transform: selectedTierId === 'sensory' ? 'translateY(-4px)' : 'translateY(0)',
                      transition: 'opacity 350ms ease, transform 350ms ease',
                    }}
                  >
                    {/* Canopy Acacia / Eucalyptus tree */}
                    <rect x="592" y="185" width="14" height="86" fill="#5A3928" />
                    <ellipse cx="598" cy="176" rx="58" ry="30" fill="#256358" stroke="#84B5A9" strokeWidth="2" />
                    {/* Sensory Dome Pavilion */}
                    <path d="M510 278 C514 226 588 226 592 278 Z" fill="#EAF6F2" stroke="#256358" strokeWidth="2.5" />
                    <circle cx="551" cy="258" r="10" fill="#84B5A9" />
                    <text x="556" y="302" textAnchor="middle" fill="#FAF7F2" fontSize="11" fontWeight="600">
                      ASD Sensory Calm ({progress.countsByTier.sensory})
                    </text>
                  </g>

                  {/* 4. SHARED HARVEST PANTRY TABLE (pantry) */}
                  <g
                    style={{
                      opacity: isLayerActive('pantry') ? 1 : 0.3,
                      transform: selectedTierId === 'pantry' ? 'translateY(-3px)' : 'translateY(0)',
                      transition: 'opacity 350ms ease, transform 350ms ease',
                    }}
                  >
                    <rect x="172" y="318" width="96" height="12" rx="4" fill="#9E5634" />
                    <rect x="184" y="330" width="8" height="22" fill="#733920" />
                    <rect x="248" y="330" width="8" height="22" fill="#733920" />
                    {/* Fruit & produce baskets */}
                    <circle cx="198" cy="312" r="9" fill="#E68A3C" />
                    <circle cx="220" cy="310" r="10" fill="#C2593F" />
                    <circle cx="242" cy="312" r="9" fill="#5EA46F" />
                    <text x="220" y="368" textAnchor="middle" fill="#FAF7F2" fontSize="11" fontWeight="600">
                      Harvest Table ({progress.countsByTier.pantry})
                    </text>
                  </g>

                  {/* 5. LISTENING GARDEN LANTERNS (counselling) */}
                  <g
                    style={{
                      opacity: isLayerActive('counselling') ? 1 : 0.25,
                      transition: 'opacity 350ms ease',
                    }}
                  >
                    <path d="M180 185 Q275 152 360 150 T520 185" stroke="#E5CA7B" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
                    {[210, 260, 455, 502].map((lx, i) => (
                      <g key={lx}>
                        <circle cx={lx} cy={i === 1 || i === 2 ? 157 : 172} r="10" fill="#F8DF8C" fillOpacity="0.35" />
                        <circle cx={lx} cy={i === 1 || i === 2 ? 157 : 172} r="5.5" fill="#F8DF8C" />
                      </g>
                    ))}
                  </g>

                  {/* 6. UNITY PLAY & MENTORSHIP COURT (mentorship) */}
                  <g
                    style={{
                      opacity: isLayerActive('mentorship') ? 1 : 0.3,
                      transform: selectedTierId === 'mentorship' ? 'translateY(-3px)' : 'translateY(0)',
                      transition: 'opacity 350ms ease, transform 350ms ease',
                    }}
                  >
                    <ellipse cx="520" cy="336" rx="76" ry="22" fill="#F3D79B" fillOpacity="0.88" stroke="#C2593F" strokeWidth="2" />
                    <circle cx="492" cy="334" r="6" fill="#3B155F" />
                    <circle cx="520" cy="330" r="7" fill="#C2593F" />
                    <circle cx="546" cy="335" r="6" fill="#256358" />
                    <text x="520" y="370" textAnchor="middle" fill="#FAF7F2" fontSize="11" fontWeight="600">
                      Mentorship Court ({progress.countsByTier.mentorship})
                    </text>
                  </g>
                </svg>

                {/* Live Highlight Pill Inside SVG Container */}
                <div className="bg-[#160822] px-5 py-3.5 border-t border-[#D4AF37]/25 flex flex-wrap items-center justify-between gap-3 text-xs text-[#FAF7F2]">
                  <div>
                    <span className="font-semibold text-[#F3D79B]">
                      Illuminating: {selectedTier.sceneElementName}
                    </span>{' '}
                    <span className="text-[#FAF7F2]/80">— {selectedTier.beneficiaryImpact}</span>
                  </div>
                  <span className="font-semibold text-[#84B5A9] tabular-nums">
                    {progress.unlockedTierIds.length}/6 Sanctuary Spaces Active
                  </span>
                </div>
              </div>
            </div>

            {/* Tier Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {VILLAGE_SCENE_TIERS.map((tier) => {
                const active = tier.id === selectedTierId;
                const count = progress.countsByTier[tier.id] || 0;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTierId(tier.id)}
                    aria-pressed={active}
                    className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                      active
                        ? 'bg-[#3B155F] text-[#FAF7F2] border-[#D4AF37] shadow-sm'
                        : 'bg-white text-[#1E0B2B] border-[#3B155F]/15 hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: tier.accentHex }}
                      />
                      <span
                        className={`text-[11px] font-semibold tabular-nums ${
                          active ? 'text-[#E5CA7B]' : 'text-[#665B73]'
                        }`}
                      >
                        {count} active
                      </span>
                    </div>
                    <div>
                      <p className="font-serif text-base font-semibold leading-snug">{tier.label}</p>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          active ? 'text-[#FAF7F2]/80' : 'text-[#665B73]'
                        }`}
                      >
                        KES {tier.unitAmountKes.toLocaleString()} · {tier.missionFocus}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Pledge Form + Live Kiva-style Real-Time Care Updates */}
          <div className="lg:col-span-5 space-y-6">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white border border-[#3B155F]/15 rounded-2xl p-6 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#3B155F]/10">
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                    Light Up: {selectedTier.sceneElementName}
                  </h3>
                  <p className="text-xs text-[#665B73] mt-0.5">
                    Selected Kit: <strong className="text-[#C2593F]">{selectedTier.label}</strong> ·{' '}
                    KES {(selectedTier.unitAmountKes * units).toLocaleString()}
                  </p>
                </div>
                <HeartHandshake className="w-5 h-5 text-[#C2593F] shrink-0" aria-hidden="true" />
              </div>

              <div className="hidden" aria-hidden="true">
                <label htmlFor="vc-website-url">Website</label>
                <input
                  id="vc-website-url"
                  type="text"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="vc-name"
                    className="block text-xs font-semibold uppercase tracking-wide text-[#3E3349] mb-1"
                  >
                    Your Name / Org <span className="text-[#C2593F]">*</span>
                  </label>
                  <input
                    id="vc-name"
                    type="text"
                    required
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    placeholder="e.g. Amina & Friends"
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                  {errors.contributorName && (
                    <p className="mt-1 text-xs text-red-700" role="alert">
                      {errors.contributorName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="vc-region"
                    className="block text-xs font-semibold uppercase tracking-wide text-[#3E3349] mb-1"
                  >
                    Target Hub County
                  </label>
                  <select
                    id="vc-region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5 items-end">
                <div>
                  <label
                    htmlFor="vc-units"
                    className="block text-xs font-semibold uppercase tracking-wide text-[#3E3349] mb-1"
                  >
                    Kit Units
                  </label>
                  <input
                    id="vc-units"
                    type="number"
                    min={1}
                    max={20}
                    value={units}
                    onChange={(e) => setUnits(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md tabular-nums"
                  />
                </div>
                <div className="col-span-2 bg-[#FDF6EE] border border-[#C2593F]/20 rounded-md px-3.5 py-2 text-xs text-[#3E3349]">
                  Total Community Care Value:{' '}
                  <strong className="text-[#1E0B2B] tabular-nums">
                    KES {(selectedTier.unitAmountKes * units).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div>
                <label
                  htmlFor="vc-note"
                  className="block text-xs font-semibold uppercase tracking-wide text-[#3E3349] mb-1"
                >
                  Encouragement Note for the Family Wall <span className="text-[#C2593F]">*</span>
                </label>
                <textarea
                  id="vc-note"
                  rows={2}
                  required
                  value={encouragementNote}
                  onChange={(e) => setEncouragementNote(e.target.value)}
                  placeholder="Share a brief blessing or note of encouragement..."
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
                {errors.encouragementNote && (
                  <p className="mt-1 text-xs text-red-700" role="alert">
                    {errors.encouragementNote}
                  </p>
                )}
              </div>

              {submitError && (
                <p role="alert" className="text-xs text-red-700 bg-red-50 p-2.5 rounded-md">
                  {submitError}
                </p>
              )}

              {confirmation && (
                <div
                  role="status"
                  className="text-xs text-[#256358] bg-[#EAF6F2] border border-[#256358]/25 p-3 rounded-md flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{confirmation}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#160822] bg-[#D4AF37] hover:bg-[#E5CA7B] disabled:opacity-60 rounded-md transition-colors"
              >
                {submitting ? 'Adding to Village...' : `Add ${selectedTier.label} to Care Scene`}
              </button>
            </form>

            {/* Real-Time Kiva-Style Community Support Stream */}
            <div className="bg-white border border-[#3B155F]/15 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-[#3B155F]/10 pb-3">
                <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                  Live Care Family Support Feed
                </h3>
                <span className="text-[11px] font-semibold text-[#256358] uppercase tracking-wide">
                  Real-Time Updates
                </span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {contributions.slice(0, compact ? 4 : 8).map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#3B155F]/10 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#1E0B2B]">{entry.contributorName}</span>
                      <span className="font-semibold text-[#C2593F] tabular-nums">
                        KES {entry.amountKes.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#256358] font-medium flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span>
                        {entry.tierLabel} ({entry.units}x) · {entry.region} Hub
                      </span>
                    </p>
                    <p className="text-xs text-[#3E3349] italic">“{entry.encouragementNote}”</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
