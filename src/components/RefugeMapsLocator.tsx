import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMapView,
  Pin,
  useAdvancedMarkerRef,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  AlertTriangle,
  ExternalLink,
  LocateFixed,
  Mail,
  MapPin,
  Navigation,
  PhoneCall,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { ALL_KENYA_COUNTIES, KENYA_REGION_NAMES, findKenyaCounty } from '../utils/kenyaCounties';

interface RefugePinEntry {
  id: string;
  county: string;
  region: string;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  address: string;
  policeLine: string;
  gbvDesk: string;
  childDesk: string;
  phone: string;
  email: string;
  websiteUrl: string;
  distanceKm?: number;
}

interface MapsGroundingChunk {
  title: string;
  uri: string;
  placeId?: string;
  snippets: string[];
}

const REFUGE_PRESETS = [
  'GVRC Gender-Based Violence Recovery Centre or safe refuge shelter',
  'Women rescue home or safe house near me',
  'Police Gender Desk and Children Protection Office',
  '24-hour public hospital post-rape care and trauma clinic',
];

function computeDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function MapViewportController({
  center,
  zoom,
}: {
  center: { lat: number; lng: number } | null;
  zoom: number;
}) {
  const map = useMap();
  const lastPanRef = useRef<string>('');

  useEffect(() => {
    if (!map || !center) return;
    const key = `${center.lat.toFixed(5)},${center.lng.toFixed(5)},${zoom}`;
    if (lastPanRef.current === key) return;
    lastPanRef.current = key;
    map.panTo(center);
    map.setZoom(zoom);
  }, [map, center, zoom]);

  return null;
}

function RefugeMarkerWithInfo({
  pin,
  isOpen,
  onSelect,
  onClose,
  onPrefillForm,
}: {
  pin: RefugePinEntry;
  isOpen: boolean;
  onSelect: () => void;
  onClose: () => void;
  onPrefillForm?: (countyName: string, hubName: string) => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: pin.lat, lng: pin.lng }}
        onClick={onSelect}
        title={pin.title}
      >
        <Pin background="#7B2E3C" glyphColor="#FAF7F2" borderColor="#1E0B2B" />
      </AdvancedMarker>
      {isOpen && marker && (
        <InfoWindow anchor={marker} onCloseClick={onClose}>
          <div className="max-w-[280px] p-1 space-y-2 text-[#1A1224]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7B2E3C]">
              {pin.county} County · Safe Refuge &amp; Protection Hub
            </p>
            <h4 className="font-serif text-base font-semibold text-[#1E0B2B] leading-snug">
              {pin.title}
            </h4>
            <p className="text-xs text-[#3E3349]">
              <strong>Location:</strong> {pin.address}
            </p>
            {typeof pin.distanceKm === 'number' && (
              <p className="text-[11px] font-semibold text-[#256358] tabular-nums">
                Approx. {pin.distanceKm} km from your live position
              </p>
            )}
            <div className="text-[11px] text-[#3E3349] space-y-0.5 bg-[#FAF7F2] p-2 rounded border border-[#3B155F]/10">
              <p>
                <strong>GBV Desk:</strong> {pin.gbvDesk}
              </p>
              <p>
                <strong>Child Protection:</strong> {pin.childDesk}
              </p>
              <p>
                <strong>Police Command:</strong> {pin.policeLine}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-1 text-xs font-semibold">
              <a
                href={`tel:${pin.phone.replace(/\s+/g, '')}`}
                className="text-[#256358] hover:underline"
              >
                {pin.phone}
              </a>
              <a
                href={pin.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3B155F] hover:underline inline-flex items-center gap-1"
              >
                County Desk
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {onPrefillForm && (
              <button
                type="button"
                onClick={() => onPrefillForm(pin.county, pin.title)}
                className="w-full mt-1 px-3 py-1.5 text-xs font-semibold bg-[#3B155F] text-[#FAF7F2] hover:bg-[#2C1042] rounded"
              >
                Request Refuge Near {pin.county}
              </button>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function UserLocationMarker({ coords }: { coords: { lat: number; lng: number } }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={coords}
        onClick={() => setOpen((prev) => !prev)}
        title="Your Current Live Position"
      >
        <Pin background="#D4AF37" glyphColor="#160822" borderColor="#160822" />
      </AdvancedMarker>
      {open && marker && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <div className="p-1 text-xs text-[#1E0B2B] space-y-1">
            <p className="font-bold text-[#7A5A10]">Your Live Position</p>
            <p className="tabular-nums text-[#3E3349]">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
            <p className="text-[11px] text-[#3E3349]">
              Showing nearest verified places of refuge around you.
            </p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function RefugeMapsLocator({
  onSelectRefugeCounty,
}: {
  onSelectRefugeCounty?: (countyName: string, hubName: string) => void;
}) {
  const [mapsApiKey, setMapsApiKey] = useState<string>(
    () => import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [configLoaded, setConfigLoaded] = useState<boolean>(
    Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
  );
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [openPinId, setOpenPinId] = useState<string | null>(null);

  // Continuous browser geolocation permission & coordinates state
  const [permissionState, setPermissionState] = useState<
    'requesting' | 'granted' | 'prompt' | 'denied' | 'unsupported'
  >('requesting');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [focusTarget, setFocusTarget] = useState<{
    center: { lat: number; lng: number };
    zoom: number;
  } | null>(null);

  // Grounded live place search state (scoped strictly to places of refuge)
  const [placeQuery, setPlaceQuery] = useState<string>(REFUGE_PRESETS[0]);
  const [placeCounty, setPlaceCounty] = useState<string>('Kiambu');
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [placeError, setPlaceError] = useState('');
  const [placeAnswer, setPlaceAnswer] = useState('');
  const [mapsChunks, setMapsChunks] = useState<MapsGroundingChunk[]>([]);

  const nearestCounty = useMemo(() => {
    if (!userCoords) return null;
    let best = ALL_KENYA_COUNTIES[0];
    let bestDist = Infinity;
    for (const c of ALL_KENYA_COUNTIES) {
      const d = computeDistanceKm(userCoords.lat, userCoords.lng, c.lat, c.lng);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    return { county: best, distanceKm: bestDist };
  }, [userCoords]);

  useEffect(() => {
    if (nearestCounty) {
      setPlaceCounty(nearestCounty.county.name);
    }
  }, [nearestCounty]);

  const requestLocationAccess = useCallback(
    (onSuccess?: (coords: { lat: number; lng: number }) => void) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setPermissionState('unsupported');
        setLocationError('Your browser does not support GPS location access. Select your county manually.');
        return;
      }

      setPermissionState((prev) => (prev === 'granted' ? 'granted' : 'requesting'));
      setLocationError('');

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          setPermissionState('granted');
          setLocationError('');
          setFocusTarget({ center: coords, zoom: 12 });
          if (onSuccess) onSuccess(coords);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setPermissionState('denied');
            setLocationError(
              'Location permission is currently blocked. Enable Location in your browser site settings so Google Maps can locate the nearest place of refuge.'
            );
          } else {
            setPermissionState('prompt');
            setLocationError(
              'Could not lock onto GPS signal right now. Click Allow / Retry Location Access to try again.'
            );
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    },
    []
  );

  // Load Google Maps key if not bundled at build time
  useEffect(() => {
    if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) return;
    let active = true;
    fetch('/api/public-config')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!active) return;
        if (json?.mapsApiKey) {
          setMapsApiKey(String(json.mapsApiKey));
        }
        setConfigLoaded(true);
      })
      .catch(() => {
        if (active) setConfigLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Immediately prompt for browser geolocation on opening Place of Refuge locator & watch permission changes
  useEffect(() => {
    let active = true;
    let watchId: number | null = null;
    let permObj: PermissionStatus | null = null;

    requestLocationAccess();

    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          if (!active) return;
          permObj = status;
          if (status.state === 'granted' && navigator.geolocation) {
            setPermissionState('granted');
            watchId = navigator.geolocation.watchPosition(
              (pos) => {
                if (!active) return;
                setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              },
              () => {
                // Keep manual retry available
              },
              { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 }
            );
          } else if (status.state === 'denied') {
            setPermissionState('denied');
          } else {
            setPermissionState('prompt');
            setLocationError('');
          }

          status.onchange = () => {
            if (!active) return;
            if (status.state === 'granted') {
              requestLocationAccess();
            } else if (status.state === 'denied') {
              setPermissionState('denied');
            } else {
              setPermissionState('prompt');
              setLocationError('');
            }
          };
        })
        .catch(() => {
          // Browsers without Permissions API already ran getCurrentPosition above
        });
    }

    return () => {
      active = false;
      if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (permObj) {
        permObj.onchange = null;
      }
    };
  }, [requestLocationAccess]);

  const pins = useMemo<RefugePinEntry[]>(() => {
    const entries: RefugePinEntry[] = ALL_KENYA_COUNTIES.filter(
      (c) => regionFilter === 'All' || c.region === regionFilter
    ).map((c) => ({
      id: `refuge-${c.code}`,
      county: c.name,
      region: c.region,
      title: `${c.name} Safe Refuge & Protection Hub`,
      subtitle: c.gbvDesk,
      lat: c.lat,
      lng: c.lng,
      address: c.physicalAddress,
      policeLine: c.emergencyPolice,
      gbvDesk: c.gbvDesk,
      childDesk: c.childProtectionDesk,
      phone: c.facilityPhone,
      email: c.facilityEmail,
      websiteUrl: c.websiteUrl,
      distanceKm: userCoords ? computeDistanceKm(userCoords.lat, userCoords.lng, c.lat, c.lng) : undefined,
    }));

    if (userCoords) {
      entries.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }
    return entries;
  }, [regionFilter, userCoords]);

  const activePin = useMemo(
    () => pins.find((p) => p.id === openPinId) || null,
    [pins, openPinId]
  );

  const executeGroundedRefugeSearch = async (coordsToUse?: { lat: number; lng: number } | null) => {
    setPlaceError('');
    setSearchingPlaces(true);
    try {
      const res = await fetch('/api/grounded-care-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'places',
          intent: 'refuge',
          query: placeQuery,
          county: placeCounty,
          lat: coordsToUse?.lat,
          lng: coordsToUse?.lng,
        }),
      });
      const json = await res.json();
      if (res.status === 429 && json?.status === 'RESOURCE_EXHAUSTED') {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      if (!res.ok) {
        setPlaceError(json.error || 'Could not query Google Maps places of refuge right now.');
        return;
      }
      setPlaceAnswer(json.answer || '');
      setMapsChunks(Array.isArray(json.mapsChunks) ? json.mapsChunks : []);
    } catch {
      setPlaceError('Connection error while locating nearby places of refuge.');
    } finally {
      setSearchingPlaces(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCoords && navigator.geolocation) {
      // Always ask for location permission when locating places of refuge
      requestLocationAccess((freshCoords) => {
        void executeGroundedRefugeSearch(freshCoords);
      });
      // Also execute search in parallel if permission was blocked so survivor isn't left stranded
      if (permissionState === 'denied') {
        void executeGroundedRefugeSearch(null);
      }
      return;
    }
    void executeGroundedRefugeSearch(userCoords);
  };

  const handleCountyJump = (countyName: string) => {
    const info = findKenyaCounty(countyName);
    setPlaceCounty(info.name);
    setOpenPinId(`refuge-${info.code}`);
    setFocusTarget({ center: { lat: info.lat, lng: info.lng }, zoom: 11 });
  };

  return (
    <div className="space-y-5">
      {/* Always-On Geolocation Permission Status Bar */}
      <div
        role="status"
        className={`rounded-xl border p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          permissionState === 'granted' && userCoords
            ? 'bg-[#EDF6F3] border-[#256358]/30 text-[#1D4E46]'
            : permissionState === 'denied'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-[#F3EEF8] border-[#3B155F]/25 text-[#1E0B2B]'
        }`}
      >
        <div className="flex items-start gap-3">
          {permissionState === 'denied' ? (
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <Navigation className="w-5 h-5 text-[#3B155F] shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="space-y-1 text-xs sm:text-sm">
            {permissionState === 'granted' && userCoords ? (
              <>
                <p className="font-semibold">
                  Location Access Active · Nearest Safe Refuge Hub:{' '}
                  {nearestCounty?.county.name} County (~{nearestCounty?.distanceKm} km away)
                </p>
                <p className="text-xs opacity-90 tabular-nums">
                  GPS locked ({userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}). Google Maps
                  is centered near you to locate the closest verified places of refuge.
                </p>
              </>
            ) : permissionState === 'denied' ? (
              <>
                <p className="font-semibold">Location Permission Required for Live Refuge Mapping</p>
                <p className="text-xs opacity-90">
                  {locationError ||
                    'Open your browser site permissions (lock icon next to URL), allow Location, and click Retry Location Permission.'}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">
                  Requesting Location Permission to Locate Nearby Places of Refuge
                </p>
                <p className="text-xs opacity-90">
                  {locationError ||
                    'Please select "Allow" on your browser’s location prompt so Google Maps can immediately guide you to the closest safe refuge shelter, GVRC clinic, or police gender desk.'}
                </p>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => requestLocationAccess()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-[#3B155F] text-[#FAF7F2] hover:bg-[#2C1042] rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          <LocateFixed className="w-4 h-4" aria-hidden="true" />
          {permissionState === 'granted' && userCoords
            ? 'Refresh My Location'
            : permissionState === 'denied'
              ? 'Retry Location Permission'
              : 'Allow Location Access'}
        </button>
      </div>

      {/* Filter & Quick County Selector */}
      <div className="bg-white rounded-xl border border-[#3B155F]/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-[#3E3349] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#7B2E3C] shrink-0" aria-hidden="true" />
          <span>
            Showing <strong>{pins.length}</strong> verified Kenyan Safe Refuge, GVRC &amp; Child
            Protection hubs {userCoords ? '(sorted nearest to you)' : 'across 47 counties'}.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label htmlFor="refuge-region-filter" className="text-xs font-semibold text-[#1E0B2B]">
            Region:
          </label>
          <select
            id="refuge-region-filter"
            value={regionFilter}
            onChange={(e) => {
              setRegionFilter(e.target.value);
              setOpenPinId(null);
            }}
            className="px-3 py-1.5 text-xs font-medium bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1E0B2B]"
          >
            <option value="All">All 8 Kenya Regions</option>
            {KENYA_REGION_NAMES.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map + Live Place of Refuge Discovery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-3">
          {mapsApiKey ? (
            <div className="relative h-[460px] w-full rounded-xl overflow-hidden border border-[#3B155F]/20 bg-[#E7E3DA] shadow-sm">
              <APIProvider apiKey={mapsApiKey} libraries={['marker']} language="en" region="KE">
                <GoogleMapView
                  mapId="DEMO_MAP_ID"
                  defaultCenter={userCoords || { lat: -1.2864, lng: 36.8172 }}
                  defaultZoom={userCoords ? 12 : 7}
                  gestureHandling="greedy"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                >
                  <MapViewportController
                    center={focusTarget?.center || null}
                    zoom={focusTarget?.zoom || 12}
                  />
                  {userCoords && <UserLocationMarker coords={userCoords} />}
                  {pins.map((pin) => (
                    <RefugeMarkerWithInfo
                      key={pin.id}
                      pin={pin}
                      isOpen={openPinId === pin.id}
                      onSelect={() => setOpenPinId(pin.id)}
                      onClose={() => setOpenPinId(null)}
                      onPrefillForm={onSelectRefugeCounty}
                    />
                  ))}
                </GoogleMapView>
              </APIProvider>
            </div>
          ) : (
            <div className="rounded-xl border border-[#D4AF37]/45 bg-[#FDF6EE] p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5A10]">
                    {configLoaded
                      ? 'Verified 47-County Safe Refuge Directory'
                      : 'Loading Place of Refuge Map...'}
                  </p>
                  <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                    Select Any Safe Refuge Hub {userCoords ? '(Nearest First)' : ''}
                  </h3>
                </div>
                <MapPin className="w-5 h-5 text-[#7B2E3C] shrink-0" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                {pins.slice(0, 16).map((pin) => {
                  const selected = openPinId === pin.id;
                  return (
                    <button
                      key={pin.id}
                      type="button"
                      onClick={() => setOpenPinId(pin.id)}
                      className={`text-left p-3.5 rounded-lg border transition-colors ${
                        selected
                          ? 'bg-[#3B155F] text-[#FAF7F2] border-[#3B155F]'
                          : 'bg-white text-[#1E0B2B] border-[#3B155F]/15 hover:border-[#7B2E3C]/45'
                      }`}
                    >
                      <p
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          selected ? 'text-[#F5D67B]' : 'text-[#7B2E3C]'
                        }`}
                      >
                        {pin.county}
                        {typeof pin.distanceKm === 'number' ? ` · ~${pin.distanceKm} km` : ''}
                      </p>
                      <p className="font-serif text-base font-semibold mt-0.5 leading-snug">
                        {pin.title}
                      </p>
                      <p
                        className={`text-xs mt-1 truncate ${
                          selected ? 'text-[#FAF7F2]/80' : 'text-[#3E3349]'
                        }`}
                      >
                        {pin.gbvDesk}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activePin && (
            <div className="p-4 bg-white rounded-xl border-2 border-[#7B2E3C]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7B2E3C]">
                  Selected Refuge Hub · {activePin.county} County
                  {typeof activePin.distanceKm === 'number' ? ` (~${activePin.distanceKm} km)` : ''}
                </p>
                <h4 className="font-serif text-lg font-semibold text-[#1E0B2B]">{activePin.title}</h4>
                <p className="text-xs text-[#3E3349]">
                  {activePin.address} · <strong>GBV:</strong> {activePin.gbvDesk}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <a
                  href={`mailto:${activePin.email}`}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold border border-[#3B155F]/20 text-[#3B155F] rounded-md hover:bg-[#F3EEF8]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </a>
                <a
                  href={`tel:${activePin.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-[#7B2E3C] text-white rounded-md hover:bg-[#61232E]"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Call Desk
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Live Google Maps Refuge Finder */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#3B155F]/15 p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7B2E3C]">
              Google Maps · Places of Refuge Only
            </p>
            <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
              Locate Closest Safe Shelter, GVRC or Protection Desk
            </h3>
            <p className="text-xs text-[#3E3349] leading-relaxed">
              Google Maps here is used strictly to help you locate immediate safe places of refuge
              around your live coordinates or selected county.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {REFUGE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setPlaceQuery(preset)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors ${
                  placeQuery === preset
                    ? 'bg-[#7B2E3C] text-white border-[#7B2E3C]'
                    : 'bg-[#FAF7F2] text-[#3E3349] border-[#3B155F]/15 hover:border-[#7B2E3C]/40'
                }`}
              >
                {preset.split(' or ')[0]}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <select
                aria-label="Select Kenyan county for refuge search"
                value={placeCounty}
                onChange={(e) => handleCountyJump(e.target.value)}
                className="px-3 py-2 text-xs bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1E0B2B]"
              >
                {ALL_KENYA_COUNTIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name} County
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => requestLocationAccess()}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#EDF6F3] text-[#256358] border border-[#256358]/25 rounded-md hover:bg-[#DDEEE8]"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                {userCoords ? 'GPS Active (Tap to Refresh)' : 'Request GPS Access'}
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#665B73] absolute left-3 top-3" />
              <input
                type="text"
                value={placeQuery}
                onChange={(e) => setPlaceQuery(e.target.value)}
                placeholder="e.g. GVRC clinic, women shelter, police gender desk..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md text-[#1E0B2B]"
              />
            </div>

            <button
              type="submit"
              disabled={searchingPlaces}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-[#7B2E3C] text-[#FAF7F2] hover:bg-[#61232E] disabled:opacity-60 rounded-md transition-colors"
            >
              {searchingPlaces ? 'Locating Nearby Refuge on Google Maps...' : 'Locate Nearest Place of Refuge'}
            </button>
          </form>

          {placeError && (
            <p role="alert" className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-md">
              {placeError}
            </p>
          )}

          {placeAnswer && (
            <div className="space-y-3 pt-2 border-t border-[#3B155F]/10 max-h-[260px] overflow-y-auto pr-1">
              <div className="text-xs text-[#3E3349] leading-relaxed whitespace-pre-line">
                {placeAnswer}
              </div>
              {mapsChunks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7A5A10]">
                    Verified Safe Refuge Locations on Google Maps:
                  </p>
                  <ul className="space-y-2">
                    {mapsChunks.map((chunk, idx) => (
                      <li
                        key={`${chunk.title}-${idx}`}
                        className="p-2.5 rounded-md bg-[#FAF7F2] border border-[#3B155F]/12 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#1E0B2B]">{chunk.title}</span>
                          {chunk.uri && (
                            <a
                              href={chunk.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#256358] font-semibold hover:underline shrink-0"
                            >
                              Directions
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {chunk.snippets.map((snippet, sIdx) => (
                          <p key={sIdx} className="text-[11px] text-[#665B73] italic">
                            “{snippet}”
                          </p>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
