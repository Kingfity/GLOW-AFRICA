import { useMemo, useState } from 'react';
import {
  CheckSquare,
  ClipboardList,
  Coffee,
  EyeOff,
  MapPin,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { ALL_KENYA_COUNTIES, KENYA_REGION_NAMES, findKenyaCounty } from '../utils/kenyaCounties';

interface SafetyPlanState {
  safeWord: string;
  trustedPersonName: string;
  trustedPersonPhone: string;
  safeExitTime: string;
  childrenPlanNote: string;
  emergencyMeetingPoint: string;
}

const INITIAL_SAFETY_PLAN: SafetyPlanState = {
  safeWord: '',
  trustedPersonName: '',
  trustedPersonPhone: '',
  safeExitTime: '',
  childrenPlanNote: '',
  emergencyMeetingPoint: '',
};

interface ChecklistItem {
  id: string;
  category: 'Documents' | 'Emergency Bag' | 'Digital Safety';
  label: string;
}

const GO_BAG_ITEMS: ChecklistItem[] = [
  { id: 'doc-id', category: 'Documents', label: 'National ID card, passport, or refugee slip' },
  { id: 'doc-kids', category: 'Documents', label: 'Children’s birth certificates, clinic cards & school letters' },
  { id: 'doc-health', category: 'Documents', label: 'SHA / medical cards, chronic prescriptions, or clinic notes' },
  { id: 'bag-cash', category: 'Emergency Bag', label: 'Hidden emergency cash, spare SIM card, or M-Pesa PIN sheet' },
  { id: 'bag-keys', category: 'Emergency Bag', label: 'Spare house/gate keys & 2 days of warm clothing for you & kids' },
  { id: 'bag-comfort', category: 'Emergency Bag', label: 'Small comfort blanket or familiar toy for each child' },
  { id: 'dig-location', category: 'Digital Safety', label: 'Turn off shared phone location / Find My Device before leaving' },
  { id: 'dig-history', category: 'Digital Safety', label: 'Use private/incognito window or clear browser history after planning' },
];

export function GbvSafePage() {
  const { path, navigate } = useRouter();
  const normalized = path === '/gbv' ? '/gbv' : path.replace(/\/+$/, '');

  // Strict browser-memory-only UI state (ZERO cookies, ZERO storage, ZERO network calls)
  const [bannerClosed, setBannerClosed] = useState(false);
  const [coverScreenActive, setCoverScreenActive] = useState(false);
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlanState>(INITIAL_SAFETY_PLAN);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [selectedCounty, setSelectedCounty] = useState('Nairobi');
  const [regionFilter, setRegionFilter] = useState<string>('All');

  const countyDetails = useMemo(() => findKenyaCounty(selectedCounty), [selectedCounty]);
  const countyChoices = useMemo(() => {
    if (regionFilter === 'All') return ALL_KENYA_COUNTIES;
    return ALL_KENYA_COUNTIES.filter((c) => c.region === regionFilter);
  }, [regionFilter]);

  const handleLeaveThisSite = () => {
    window.open('https://www.google.com', '_blank', 'noopener,noreferrer');
    try {
      window.close();
    } catch {
      // Fallback when script-close is restricted by browser
    }
    window.location.replace('https://www.google.com');
  };

  const toggleChecklistItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const wipeScreenMemory = () => {
    setSafetyPlan(INITIAL_SAFETY_PLAN);
    setCheckedIds([]);
  };

  const completedCount = checkedIds.length;
  const checklistPct = Math.round((completedCount / GO_BAG_ITEMS.length) * 100);

  return (
    <div className="bg-[#FAF7F2] text-[#1A1224]">
      {/* MANDATORY TRIGGER WARNING BANNER AT VERY TOP OF EVERY /gbv/ PAGE */}
      {!bannerClosed && (
        <div
          role="region"
          aria-label="Trigger warning notice"
          className="bg-[#2C1042] text-[#FAF7F2] border-b border-[#D4AF37]/40 px-4 sm:px-8 py-3"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              This page discusses gender-based violence. If you're not ready, you can close this
              tab. You are safe.
            </p>
            <button
              type="button"
              onClick={() => setBannerClosed(true)}
              className="self-start sm:self-center px-3.5 py-1.5 text-xs font-semibold rounded-md bg-white/15 hover:bg-white/25 text-[#FAF7F2] transition-colors shrink-0"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Discreet Zero-Tracking Header ("Hidden in Plain Sight" Family Wellness framing) */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-[#256358]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/gbv')}
              className="text-left inline-flex items-center gap-2 font-serif text-lg sm:text-xl font-semibold text-[#1D4E46]"
            >
              <Coffee className="w-5 h-5 text-[#256358]" aria-hidden="true" />
              <span>HIS AND HERS · Family Wellness &amp; Quiet Corner</span>
            </button>
            <span className="hidden md:inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-[#EDF6F3] text-[#256358]">
              Private Memory Mode
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 ml-auto">
            <button
              type="button"
              onClick={() => setCoverScreenActive((prev) => !prev)}
              aria-pressed={coverScreenActive}
              title="Instant calm cover screen if someone walks nearby"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border border-[#256358]/30 bg-[#EDF6F3] text-[#1D4E46] hover:bg-[#DCEEE8] transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{coverScreenActive ? 'Return to Planner' : 'Camouflage: Tea Notes'}</span>
            </button>

            <button
              type="button"
              onClick={wipeScreenMemory}
              title="Clear all notes from this screen immediately"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border border-[#3B155F]/20 text-[#3B155F] hover:bg-[#F3EEF8] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Clear Notes</span>
            </button>

            <button
              type="button"
              onClick={handleLeaveThisSite}
              aria-label="Leave this site immediately and open Google"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-md bg-[#111111] text-[#F8DF8C] hover:bg-black border-2 border-[#D4AF37] shadow-md transition-colors whitespace-nowrap"
            >
              <span>Leave this site</span>
              <span aria-hidden="true">🚪</span>
            </button>
          </div>
        </div>

        {/* Sub-page Navigation inside Isolated Quiet Space */}
        {!coverScreenActive && (
          <nav
            aria-label="Quiet wellness tools navigation"
            className="max-w-7xl mx-auto px-4 sm:px-8 pb-2.5 flex items-center gap-2 overflow-x-auto text-xs font-semibold"
          >
            {[
              { label: 'Calm Overview', href: '/gbv' },
              { label: 'Personal Plan (Local)', href: '/gbv/safety-plan' },
              { label: 'Essential Bag Checklist', href: '/gbv/checklist' },
              { label: '47-County Support Desks', href: '/gbv/authorities' },
            ].map((tab) => {
              const active = normalized === tab.href;
              return (
                <button
                  key={tab.href}
                  type="button"
                  onClick={() => navigate(tab.href)}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#256358] text-[#FAF7F2]'
                      : 'bg-white text-[#3E3349] border border-[#256358]/15 hover:bg-[#EDF6F3]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="ml-auto px-3 py-1.5 rounded-md text-[#665B73] hover:text-[#1E0B2B] whitespace-nowrap"
            >
              Back to Main Site →
            </button>
          </nav>
        )}
      </header>

      {coverScreenActive ? (
        <section className="py-14 sm:py-20 bg-[#FAF7F2]">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-8">
            <div className="bg-white border border-[#256358]/15 rounded-2xl p-6 sm:p-10 space-y-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                Kitchen &amp; Courtyard Notes · Kenyan Herbal Tea Recipes
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1D4E46]">
                Warm Kenyan Spiced Masala Chai &amp; Fresh Mint Infusions
              </h1>
              <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                A gentle kitchen note on simmering loose highland black tea with crushed green
                cardamom pods, fresh ginger root, cinnamon bark, and warm milk for quiet family
                afternoons.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#FAF7F2] rounded-xl p-5 border border-[#256358]/12 space-y-2">
                  <h2 className="font-serif text-xl font-semibold text-[#1E0B2B]">Ingredients</h2>
                  <ul className="text-sm text-[#3E3349] space-y-1">
                    <li>• 2 cups water + 2 cups whole milk</li>
                    <li>• 3 teaspoons Kenyan highland loose tea</li>
                    <li>• 4 crushed cardamom pods &amp; fresh ginger</li>
                    <li>• Pinch of cinnamon &amp; honey to taste</li>
                  </ul>
                </div>
                <div className="bg-[#FAF7F2] rounded-xl p-5 border border-[#256358]/12 space-y-2">
                  <h2 className="font-serif text-xl font-semibold text-[#1E0B2B]">Garden Care</h2>
                  <p className="text-sm text-[#3E3349] leading-relaxed">
                    Mint and rosemary thrive best in partial morning sun near kitchen steps, watered
                    lightly every second morning while pruning top leaves to keep stems bushy.
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCoverScreenActive(false)}
                  className="text-xs font-semibold text-[#256358] underline"
                >
                  Return to quiet planning tools
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Discreet Botanical Hero Section — Calm Colors, Hidden in Plain Sight */}
          <section className="bg-gradient-to-br from-[#256358] via-[#1D4E46] to-[#2C1042] text-[#FAF7F2] py-12 sm:py-16 border-b border-[#D4AF37]/30">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#F3D79B]">
                  Family Wellness Corner · Private Memory Tools · Kenya 47 Counties
                </p>
                <h1 className="font-serif text-3xl sm:text-5xl font-semibold leading-tight">
                  Quiet Steps &amp; Private Planning at Your Own Pace
                </h1>
                <p className="text-sm sm:text-base text-[#FAF7F2]/90 leading-relaxed max-w-2xl">
                  Everything you write inside this quiet corner stays strictly inside your browser
                  memory—zero cookies, zero analytics, and zero server logs. If someone walks near
                  your screen, click <strong>Camouflage: Tea Notes</strong> or{' '}
                  <strong>Leave this site 🚪</strong> anytime.
                </p>
              </div>

              <div className="lg:col-span-4 bg-black/25 border border-[#D4AF37]/40 rounded-xl p-5 space-y-2.5 text-xs sm:text-sm">
                <p className="font-semibold text-[#F3D79B] inline-flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                  Kenya Direct Care Numbers (24/7 Toll-Free)
                </p>
                <p>
                  <strong>1195</strong> — National Care &amp; Support Line
                </p>
                <p>
                  <strong>116</strong> — Childline Kenya Support
                </p>
                <p>
                  <strong>999 / 112</strong> — Emergency Response Dispatch
                </p>
              </div>
            </div>
          </section>

      {/* Interactive Browser-Memory-Only Tools Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-12">
          {/* 1. In-Memory Personal Safety Plan Builder */}
          {(normalized === '/gbv' || normalized === '/gbv/safety-plan') && (
            <div className="bg-white border border-[#3B155F]/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3B155F]/10">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#256358]">
                    Interactive Tool 01 · Runs 100% in Browser Memory (Zero Network Requests)
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
                    Your Quiet Exit &amp; Safety Plan
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSafetyPlan(INITIAL_SAFETY_PLAN)}
                  className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#C2593F] border border-[#C2593F]/30 rounded-md hover:bg-[#FDF6EE]"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Clear Plan From Memory
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="gbv-safe-word"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    1. Code Word With a Trusted Neighbour or Relative
                  </label>
                  <input
                    id="gbv-safe-word"
                    type="text"
                    value={safetyPlan.safeWord}
                    onChange={(e) => setSafetyPlan({ ...safetyPlan, safeWord: e.target.value })}
                    placeholder="e.g. 'Bring the green umbrella'"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="gbv-exit-window"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    2. Safest Hour / Time Window to Leave
                  </label>
                  <input
                    id="gbv-exit-window"
                    type="text"
                    value={safetyPlan.safeExitTime}
                    onChange={(e) => setSafetyPlan({ ...safetyPlan, safeExitTime: e.target.value })}
                    placeholder="e.g. Weekday morning at 9:15 AM"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="gbv-trusted-name"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    3. Safe Person / Sister / Friend Name
                  </label>
                  <input
                    id="gbv-trusted-name"
                    type="text"
                    value={safetyPlan.trustedPersonName}
                    onChange={(e) =>
                      setSafetyPlan({ ...safetyPlan, trustedPersonName: e.target.value })
                    }
                    placeholder="Someone who will keep quiet & hold a spare bag"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="gbv-trusted-phone"
                    className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                  >
                    4. Memorized Safe Phone Number
                  </label>
                  <input
                    id="gbv-trusted-phone"
                    type="text"
                    value={safetyPlan.trustedPersonPhone}
                    onChange={(e) =>
                      setSafetyPlan({ ...safetyPlan, trustedPersonPhone: e.target.value })
                    }
                    placeholder="Write in memory or memorize before closing tab"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="gbv-meeting-point"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      5. Safe Meeting Point Outside Home
                    </label>
                    <input
                      id="gbv-meeting-point"
                      type="text"
                      value={safetyPlan.emergencyMeetingPoint}
                      onChange={(e) =>
                        setSafetyPlan({ ...safetyPlan, emergencyMeetingPoint: e.target.value })
                      }
                      placeholder="e.g. Main chief’s camp gate, clinic lobby, or church office"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="gbv-kids-note"
                      className="block text-sm font-medium text-[#1E0B2B] mb-1.5"
                    >
                      6. Children’s Safe Signal
                    </label>
                    <input
                      id="gbv-kids-note"
                      type="text"
                      value={safetyPlan.childrenPlanNote}
                      onChange={(e) =>
                        setSafetyPlan({ ...safetyPlan, childrenPlanNote: e.target.value })
                      }
                      placeholder="Teach children which trusted neighbour door to knock on"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {(safetyPlan.safeWord ||
                safetyPlan.trustedPersonName ||
                safetyPlan.emergencyMeetingPoint) && (
                <div className="bg-[#EDF6F3] border border-[#256358]/25 rounded-xl p-5 text-sm space-y-1.5">
                  <p className="font-semibold text-[#256358]">
                    Your Memory-Only Plan Preview (Not Saved Anywhere Online):
                  </p>
                  <p className="text-[#1E0B2B]">
                    <strong>Code Word:</strong> {safetyPlan.safeWord || '—'} ·{' '}
                    <strong>Safe Window:</strong> {safetyPlan.safeExitTime || '—'} ·{' '}
                    <strong>Meeting Point:</strong> {safetyPlan.emergencyMeetingPoint || '—'}
                  </p>
                  <p className="text-[#3E3349]">
                    <strong>Trusted Contact:</strong> {safetyPlan.trustedPersonName || '—'}{' '}
                    {safetyPlan.trustedPersonPhone ? `(${safetyPlan.trustedPersonPhone})` : ''}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 2. In-Memory Go-Bag & Digital Safety Checklist */}
          {(normalized === '/gbv' || normalized === '/gbv/checklist') && (
            <div className="bg-white border border-[#3B155F]/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3B155F]/10">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#C2593F] inline-flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" aria-hidden="true" />
                    Interactive Tool 02 · Client-Only Memory Checklist
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
                    What to Pack If You Have to Leave Fast
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#256358] tabular-nums">
                    {completedCount}/{GO_BAG_ITEMS.length} ready ({checklistPct}%)
                  </span>
                  {completedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setCheckedIds([])}
                      className="text-xs font-semibold text-[#665B73] hover:text-[#1E0B2B] underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="h-2.5 w-full rounded-full bg-[#F1ECE2] overflow-hidden">
                <div
                  className="h-full bg-[#256358] transition-all duration-300"
                  style={{ width: `${checklistPct}%` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {GO_BAG_ITEMS.map((item) => {
                  const checked = checkedIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                        checked
                          ? 'bg-[#EDF6F3] border-[#256358]/40'
                          : 'bg-[#FAF7F2] border-[#3B155F]/12 hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="w-4 h-4 mt-0.5 accent-[#256358] shrink-0"
                      />
                      <span className="space-y-0.5">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#7A5A10]">
                          {item.category}
                        </span>
                        <span
                          className={`block text-sm ${
                            checked ? 'line-through text-[#256358] font-medium' : 'text-[#1E0B2B]'
                          }`}
                        >
                          {item.label}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. All 47 Kenyan Counties Local Authority & GBV Desk Lookup (Local Array Only) */}
          {(normalized === '/gbv' || normalized === '/gbv/authorities') && (
            <div className="bg-white border border-[#3B155F]/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#3B155F]/10">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#3B155F] inline-flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5" aria-hidden="true" />
                    Interactive Tool 03 · 47 Counties Local Support Desks
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
                    Police, Children’s Officer &amp; Hospital Care Desk in Your County
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  <label className="text-xs font-semibold text-[#1E0B2B] flex items-center gap-2">
                    <span>Region:</span>
                    <select
                      aria-label="Filter county authorities by region"
                      value={regionFilter}
                      onChange={(e) => {
                        const nextReg = e.target.value;
                        setRegionFilter(nextReg);
                        const firstMatch =
                          nextReg === 'All'
                            ? ALL_KENYA_COUNTIES[46]
                            : ALL_KENYA_COUNTIES.find((c) => c.region === nextReg);
                        if (firstMatch) setSelectedCounty(firstMatch.name);
                      }}
                      className="px-3 py-2 text-xs font-medium bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      <option value="All">All 8 Regions (47 Counties)</option>
                      {KENYA_REGION_NAMES.map((reg) => (
                        <option key={reg} value={reg}>
                          {reg}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-xs font-semibold text-[#1E0B2B] flex items-center gap-2">
                    <span>County:</span>
                    <select
                      aria-label="Select Kenyan county authority desk"
                      value={selectedCounty}
                      onChange={(e) => setSelectedCounty(e.target.value)}
                      className="px-3 py-2 text-xs font-medium bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                    >
                      {countyChoices.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.code} · {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-[#FDF4EB] border border-[#C2593F]/25 rounded-xl p-5 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#C2593F] inline-flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                    Police / OCS Response
                  </p>
                  <p className="font-serif text-xl font-semibold text-[#1E0B2B]">
                    {countyDetails.emergencyPolice}
                  </p>
                  <a
                    href="tel:999"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B155F] underline"
                  >
                    Call 999 Directly
                  </a>
                </div>

                <div className="bg-[#EDF6F3] border border-[#256358]/25 rounded-xl p-5 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#256358] inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    Hospital Support Desk ({countyDetails.name})
                  </p>
                  <p className="font-serif text-xl font-semibold text-[#1E0B2B]">
                    {countyDetails.gbvDesk}
                  </p>
                  <a
                    href="tel:1195"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#256358] underline"
                  >
                    Call 1195 Toll-Free
                  </a>
                </div>

                <div className="bg-[#F3EEF8] border border-[#3B155F]/25 rounded-xl p-5 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#3B155F] inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    Child Protection Officer
                  </p>
                  <p className="font-serif text-xl font-semibold text-[#1E0B2B]">
                    {countyDetails.childProtectionDesk}
                  </p>
                  <a
                    href="tel:116"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B155F] underline"
                  >
                    Call 116 Childline
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      </>
      )}
    </div>
  );
}
