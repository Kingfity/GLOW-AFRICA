import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, PhoneCall, ShieldAlert, Siren, X } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import {
  ALL_KENYA_COUNTIES,
  findKenyaCounty,
  validateEmergencyAuthorityAlert,
} from '../utils/kenyaCounties';

export function openEmergencyAlertModal(county?: string) {
  window.dispatchEvent(new CustomEvent('open-emergency-alert', { detail: { county } }));
}

const EMERGENCY_TYPES = [
  'Immediate Gender-Based Violence Danger',
  'Child Abuse / Child at Risk',
  'Medical / Crisis Rescue Needed',
  'Urgent Shelter & Police Escort Needed',
];

export function EmergencyAuthorityAlert() {
  const { path } = useRouter();
  const isIsolated = path.startsWith('/gbv') || path.startsWith('/recovery');

  const [isOpen, setIsOpen] = useState(false);
  const [county, setCounty] = useState('Nairobi');
  const [emergencyType, setEmergencyType] = useState(EMERGENCY_TYPES[0]);
  const [authorityTarget, setAuthorityTarget] = useState('Area Police / OCS (999 / 112)');
  const [locationLandmark, setLocationLandmark] = useState('');
  const [callerAlias, setCallerAlias] = useState('');
  const [safeContact, setSafeContact] = useState('');
  const [peopleAffected, setPeopleAffected] = useState(1);
  const [details, setDetails] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [dispatchedMessage, setDispatchedMessage] = useState<string | null>(null);

  const selectedCountyInfo = findKenyaCounty(county);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const custom = e as CustomEvent<{ county?: string }>;
      if (custom.detail?.county) {
        setCounty(custom.detail.county);
      }
      setIsOpen(true);
    };
    window.addEventListener('open-emergency-alert', onOpen);
    return () => window.removeEventListener('open-emergency-alert', onOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateEmergencyAuthorityAlert({
      county,
      emergencyType,
      authorityTarget,
      locationLandmark,
      callerAlias,
      safeContact,
      peopleAffected,
      details,
    });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});

    // Respect zero-network isolation if triggered inside /gbv or /recovery
    if (isIsolated) {
      setDispatchedMessage(
        `Prepared local emergency details for ${selectedCountyInfo.name} County. Tap the direct emergency lines below to reach ${selectedCountyInfo.emergencyPolice}, Childline 116, or GBV Desk 1195 immediately—nothing was sent over the network.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/emergency-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          county,
          emergencyType,
          authorityTarget,
          locationLandmark,
          callerAlias,
          safeContact,
          peopleAffected,
          details,
          website_url: honeypot,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.errors) setErrors(result.errors);
        setDispatchedMessage(
          `Dispatch connection interrupted — please call ${selectedCountyInfo.emergencyPolice} (999 / 112) or 1195 immediately.`
        );
        return;
      }
      setDispatchedMessage(
        result.message ||
          `Area alert logged for ${selectedCountyInfo.name} County. Please also dial 999 / 112 or 1195 if in immediate danger.`
      );
      setLocationLandmark('');
      setDetails('');
    } catch {
      setDispatchedMessage(
        `Network unreachable — please tap 999 / 112 or 1195 below to alert authorities in ${selectedCountyInfo.name} immediately.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-alert-heading"
      className="fixed inset-0 z-50 bg-[#160822]/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-[#FAF7F2] border-2 border-[#B91C1C]/45 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#7B1E26] text-[#FAF7F2] px-6 py-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FDE68A] inline-flex items-center gap-1.5">
              <Siren className="w-4 h-4" aria-hidden="true" />
              47-County Emergency Authority Alert
            </p>
            <h2 id="emergency-alert-heading" className="font-serif text-2xl sm:text-3xl font-semibold">
              Alert Relevant Local Authorities Now
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close emergency alert panel"
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Immediate Direct Emergency Hotlines */}
        <div className="bg-[#FFF5F5] border-b border-[#B91C1C]/20 px-6 py-4 flex flex-wrap items-center gap-2.5">
          <a
            href="tel:999"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold"
          >
            <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
            Police Rescue: 999 / 112
          </a>
          <a
            href="tel:1195"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3B155F] hover:bg-[#2C1042] text-white text-xs font-bold"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#FDE68A]" aria-hidden="true" />
            National GBV Helpline: 1195
          </a>
          <a
            href="tel:116"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#256358] hover:bg-[#1C4D44] text-white text-xs font-bold"
          >
            Childline Kenya: 116
          </a>
        </div>

        <div className="p-6 space-y-5">
          {/* County Selected Local Authorities Directory Card */}
          <div className="bg-white border border-[#3B155F]/15 rounded-xl p-4 text-xs text-[#3E3349] space-y-1.5">
            <p className="font-semibold text-[#1E0B2B] text-sm">
              Selected Area Coverage: {selectedCountyInfo.name} County ({selectedCountyInfo.region} Region)
            </p>
            <p>
              <strong className="text-[#991B1B]">Police Dispatch:</strong> {selectedCountyInfo.emergencyPolice}
            </p>
            <p>
              <strong className="text-[#256358]">Children’s Protection Office:</strong>{' '}
              {selectedCountyInfo.childProtectionDesk}
            </p>
            <p>
              <strong className="text-[#3B155F]">GBV Gender Desk:</strong> {selectedCountyInfo.gbvDesk}
            </p>
          </div>

          {dispatchedMessage ? (
            <div role="status" className="bg-[#EAF6F2] border border-[#256358]/30 rounded-xl p-5 space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#256358] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-serif text-xl font-semibold text-[#1E0B2B]">
                    Authority Dispatch Summary Ready
                  </p>
                  <p className="text-sm text-[#3E3349] leading-relaxed">{dispatchedMessage}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDispatchedMessage(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-[#256358]/30 text-[#256358]"
                >
                  Send Another Area Alert
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#256358] text-white"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDispatch} noValidate className="space-y-4">
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emg-county" className="block text-xs font-semibold text-[#1E0B2B] mb-1">
                    County (All 47 Counties) *
                  </label>
                  <select
                    id="emg-county"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#3B155F]/20 rounded-lg"
                  >
                    {ALL_KENYA_COUNTIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.code} · {c.name} ({c.capitalTown})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="emg-authority" className="block text-xs font-semibold text-[#1E0B2B] mb-1">
                    Relevant Authority to Alert
                  </label>
                  <select
                    id="emg-authority"
                    value={authorityTarget}
                    onChange={(e) => setAuthorityTarget(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#3B155F]/20 rounded-lg"
                  >
                    <option value={selectedCountyInfo.emergencyPolice}>
                      Local Police / OCS ({selectedCountyInfo.emergencyPolice})
                    </option>
                    <option value={selectedCountyInfo.childProtectionDesk}>
                      Children’s Protection Officer ({selectedCountyInfo.childProtectionDesk})
                    </option>
                    <option value={selectedCountyInfo.gbvDesk}>
                      County GBV Response Desk ({selectedCountyInfo.gbvDesk})
                    </option>
                    <option value="County Emergency Ambulance & Red Cross">
                      Emergency Medical / Ambulance &amp; Red Cross
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emg-type" className="block text-xs font-semibold text-[#1E0B2B] mb-1">
                    Emergency Type
                  </label>
                  <select
                    id="emg-type"
                    value={emergencyType}
                    onChange={(e) => setEmergencyType(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#3B155F]/20 rounded-lg"
                  >
                    {EMERGENCY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="emg-people" className="block text-xs font-semibold text-[#1E0B2B] mb-1">
                    People Needing Help
                  </label>
                  <input
                    id="emg-people"
                    type="number"
                    min={1}
                    max={30}
                    value={peopleAffected}
                    onChange={(e) => setPeopleAffected(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#3B155F]/20 rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emg-landmark" className="block text-xs font-semibold text-[#1E0B2B] mb-1">
                    Exact Town / Estate / Nearest Landmark *
                  </label>
                  <input
                    id="emg-landmark"
                    type="text"
                    required
                    value={locationLandmark}
                    onChange={(e) => setLocationLandmark(e.target.value)}
                    placeholder="e.g. Near Kitengela Stage / Estate gate"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#3B155F]/20 rounded-lg"
                  />
                  {errors.locationLandmark && (
                    <p className="mt-1 text-xs text-red-700" role="alert">
                      {errors.locationLandmark}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="emg-contact" className="block text-xs font-semibold text-[#1E0B2B] mb-1">
                    Safe Callback Number or Trusted Contact *
                  </label>
                  <input
                    id="emg-contact"
                    type="text"
                    required
                    value={safeContact}
                    onChange={(e) => setSafeContact(e.target.value)}
                    placeholder="+254 7... or safe neighbour number"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#3B155F]/20 rounded-lg"
                  />
                  {errors.safeContact && (
                    <p className="mt-1 text-xs text-red-700" role="alert">
                      {errors.safeContact}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emg-alias" className="block text-xs font-semibold text-[#1E0B2B] mb-1">
                    Name or Safe Code Word (Optional)
                  </label>
                  <input
                    id="emg-alias"
                    type="text"
                    value={callerAlias}
                    onChange={(e) => setCallerAlias(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#3B155F]/20 rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="emg-details" className="block text-xs font-semibold text-[#1E0B2B] mb-1">
                    Brief Safety Situation
                  </label>
                  <input
                    id="emg-details"
                    type="text"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="e.g. Gate locked, 2 children inside, SMS only"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#3B155F]/20 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] disabled:opacity-60 text-white transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-[#FDE68A]" aria-hidden="true" />
                {submitting ? 'Alerting Authorities...' : `Dispatch Alert for ${selectedCountyInfo.name} County`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
