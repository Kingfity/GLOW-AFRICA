import {
  ArrowRight,
  Clock,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { SafeImage } from '../components/SafeImage';
import type { AdministratorDeskProfile } from '../shared/types';

const FALLBACK_CONVENERS: AdministratorDeskProfile[] = [
  {
    id: 'adm-nancy',
    deskCode: 'CONV-01',
    fullName: 'Nancy Kariuki',
    roleTitle: 'Lead Convener · Est. 2025',
    department: 'Founding Conveners · Ruiru Circle',
    status: 'Active',
    email: 'care@hisandhers.org',
    phone: '+254 700 000 000',
    whatsapp: '+254 700 000 000',
    officeHours: 'Mon – Sat · 08:30 – 17:30 EAT',
    wardLocation: 'Ruiru Wards · Kiambu County',
    focusSummary:
      'Guiding His & Hers Circle of Hope from its 2025 neighbourhood beginnings in Ruiru—ensuring older neighbours living alone know whom to call and families receive practical care.',
    routingHref: '/about',
    routingLabel: 'Read Ruiru Origin Story',
    accentHex: '#C2593F',
  },
  {
    id: 'adm-glow',
    deskCode: 'CONV-02',
    fullName: 'GLOW Prayer Movement & Well-Wishers',
    roleTitle: 'Intercessory & Community Partner',
    department: 'Ruiru Ward Prayer & Solidarity',
    status: 'Active',
    email: 'prayer@hisandhers.org',
    phone: '+254 700 000 000',
    officeHours: 'Wed & Sat Prayer Walks · Ruiru',
    wardLocation: 'Four Ruiru Wards · Kiambu County',
    focusSummary:
      'Walking four Ruiru wards together to pray with neighbours, gather blankets for elders, share food and encouragement at Ruiru Boys student homes, and prepare Christmas of Hope.',
    routingHref: '/prayer-worship',
    routingLabel: 'Prayer & Worship Gatherings',
    accentHex: '#3B155F',
  },
];

const FALLBACK_DESKS: AdministratorDeskProfile[] = [
  {
    id: 'adm-desk-1',
    deskCode: 'DESK-01',
    fullName: 'Administrator Profile Pending',
    roleTitle: 'Programmes & Ruiru Ward Outreach Lead',
    department: 'Outreach & Home Visits Desk',
    status: 'Awaiting Staff Particulars',
    email: 'care@hisandhers.org',
    phone: '+254 700 000 000',
    officeHours: 'Mon – Sat · 09:00 – 17:00 EAT',
    wardLocation: 'Ruiru, Kiambu & All 47 Counties',
    focusSummary:
      'Four-ward neighbour care in Ruiru, elders home checks, blankets & maize flour drives, and children’s home CSR coordination.',
    routingHref: '/home-visits',
    routingLabel: 'Children’s Homes & Community Visits',
    accentHex: '#C2593F',
  },
  {
    id: 'adm-desk-2',
    deskCode: 'DESK-02',
    fullName: 'Administrator Profile Pending',
    roleTitle: 'Mental Health, Trauma & Stress Healing Desk',
    department: 'Restorative Wellbeing & Trauma Support',
    status: 'Awaiting Staff Particulars',
    email: 'care@hisandhers.org',
    phone: '+254 700 000 000',
    officeHours: 'Daily Trauma & Stress Check-In Windows',
    wardLocation: 'Ruiru Care Room & Phone Bridge',
    focusSummary:
      'Trauma grounding routines, stress, grief, panic & sleep recovery check-ins, caregiver burnout care, and confidential listening callbacks.',
    routingHref: '/mental-health',
    routingLabel: 'Mental Health & Trauma Support',
    accentHex: '#256358',
  },
  {
    id: 'adm-desk-3',
    deskCode: 'DESK-03',
    fullName: 'Administrator Profile Pending',
    roleTitle: 'Christmas of Hope & Elders Logistics Desk',
    department: 'Seasonal Tables & Student Solidarity',
    status: 'Awaiting Staff Particulars',
    email: 'care@hisandhers.org',
    phone: '+254 700 000 000',
    officeHours: 'Tue – Sat · 09:00 – 16:30 EAT',
    wardLocation: 'Ruiru Boys Solidarity & 47-County Hubs',
    focusSummary:
      'Student home solidarity at Ruiru Boys, Nov 28 feast tables, and elder food parcels packed to carry home.',
    routingHref: '/events',
    routingLabel: 'View Upcoming Gatherings',
    accentHex: '#7A5A10',
  },
  {
    id: 'adm-desk-4',
    deskCode: 'DESK-04',
    fullName: 'Administrator Profile Pending',
    roleTitle: 'Safeguarding & Open Books Stewardship Lead',
    department: 'Protection & Accountability',
    status: 'Awaiting Staff Particulars',
    email: 'care@hisandhers.org',
    phone: '+254 700 000 000',
    officeHours: '24/7 Priority Family Routing',
    wardLocation: 'National 47-County Coordination',
    focusSummary:
      'Find My Home safe-refuge confidentiality, 82/12/6 open-books review & partner vetting across Kenya.',
    routingHref: '/accountability',
    routingLabel: 'Open Books & Accountability',
    accentHex: '#3B155F',
  },
  {
    id: 'adm-desk-5',
    deskCode: 'DESK-05',
    fullName: 'Administrator Profile Pending',
    roleTitle: 'Special Needs Kids & Mothers Care Lead',
    department: 'Special Needs Families & Mothers Circle',
    status: 'Awaiting Staff Particulars',
    email: 'care@hisandhers.org',
    phone: '+254 700 000 000',
    officeHours: 'Mon – Sat · 08:30 – 17:00 EAT',
    wardLocation: 'Ruiru, Kiambu & All 47 Counties',
    focusSummary:
      'Direct companion support for single mothers, sole guardians, and two-parent families raising children with disabilities—coordinating respite, therapy/school links, and practical home relief.',
    routingHref: '/special-needs-families',
    routingLabel: 'Special Needs Kids & Families',
    accentHex: '#C2593F',
  },
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

export function LeadershipHelpPage() {
  const { data } = useSiteData();
  const settings = data?.settings;
  const email = settings?.contactEmail || 'care@hisandhers.org';
  const phone = settings?.contactPhone || '+254 700 000 000';

  const allProfiles = data?.administrators?.length
    ? data.administrators
    : [...FALLBACK_CONVENERS, ...FALLBACK_DESKS];

  const conveners = allProfiles.filter(
    (p) => p.id === 'adm-nancy' || p.id === 'adm-glow' || p.department.toLowerCase().includes('convener') || p.department.toLowerCase().includes('prayer')
  );
  const helpDesks = allProfiles.filter((p) => !conveners.some((c) => c.id === p.id));

  return (
    <div>
      {/* Warm Royal Plum Header */}
      <section className="bg-gradient-to-br from-[#1E0B2B] via-[#3B155F] to-[#256358] text-[#FAF7F2] py-16 sm:py-24 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              His &amp; Hers Circle of Hope · Stewardship &amp; Care Desks
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              Our Conveners, Administrators &amp; Helping Hand Desk
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/88 leading-relaxed">
              Every outreach meal, elder blanket delivery, and listening referral is stewarded by
              real neighbours who care deeply. Meet the conveners anchoring our walk in Ruiru and
              reach the right help desk whenever you need a hand or wish to offer one.
            </p>
          </div>
        </div>
      </section>

      {/* Founding Conveners Spotlight */}
      <section className="py-16 sm:py-20 bg-[#FAF7F2] border-b border-[#3B155F]/12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
              Convening Circle · Ruiru, Kiambu County
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Rooted in Prayer, Walking Ward to Ward
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {conveners.map((person) => (
              <article
                key={person.id}
                className="bg-white border border-[#D4AF37]/45 rounded-2xl p-7 sm:p-9 flex flex-col justify-between gap-5 shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {person.photoUrl ? (
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-[#D4AF37]/60 shrink-0">
                          <SafeImage
                            src={person.photoUrl}
                            alt={person.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg font-bold text-white shrink-0"
                          style={{ backgroundColor: person.accentHex || '#3B155F' }}
                        >
                          {getInitials(person.fullName)}
                        </div>
                      )}
                      <div>
                        <span
                          className="text-xs font-semibold uppercase tracking-wider block"
                          style={{ color: person.accentHex || '#7A5A10' }}
                        >
                          {person.roleTitle}
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
                          {person.fullName}
                        </h3>
                      </div>
                    </div>
                    {person.id === 'adm-nancy' ? (
                      <HeartHandshake className="w-5 h-5 text-[#C2593F] shrink-0" aria-hidden="true" />
                    ) : (
                      <Users className="w-5 h-5 text-[#256358] shrink-0" aria-hidden="true" />
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                    {person.focusSummary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#3B155F]/10 space-y-2 text-xs text-[#665B73]">
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {person.wardLocation && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C2593F]" aria-hidden="true" />
                        {person.wardLocation}
                      </span>
                    )}
                    {person.officeHours && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#3B155F]" aria-hidden="true" />
                        {person.officeHours}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 font-semibold">
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`tel:${person.phone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1 text-[#256358] hover:underline tabular-nums"
                      >
                        <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                        {person.phone}
                      </a>
                      <a
                        href={`mailto:${person.email}`}
                        className="inline-flex items-center gap-1 text-[#3B155F] hover:underline"
                      >
                        <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                        {person.email}
                      </a>
                    </div>
                    <AppLink
                      href={person.routingHref}
                      className="inline-flex items-center gap-1 text-[#C2593F] hover:underline"
                    >
                      {person.routingLabel}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </AppLink>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Structured Administrator & Help Desk Directory */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#3B155F]/12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#256358]">
                Administrators &amp; Care Coordinators
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Active Administrative &amp; Help Desks
              </h2>
              <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                Each administrator profile below updates dynamically via our Stewardship Console as
                confirmed coordinator portraits and direct ward lines arrive. Every desk connects
                directly to our circle via{' '}
                <a href={`mailto:${email}`} className="underline font-semibold text-[#3B155F]">
                  {email}
                </a>
                .
              </p>
            </div>
            <AppLink
              href="/admin"
              className="text-xs font-semibold text-[#3B155F] border border-[#3B155F]/20 px-3.5 py-2 rounded-md hover:bg-[#F3EEF8] self-start lg:self-auto whitespace-nowrap"
            >
              Manage Staff Particulars in Admin →
            </AppLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpDesks.map((slot, idx) => {
              const isAwaiting = slot.status === 'Awaiting Staff Particulars';
              const waClean = (slot.whatsapp || '').replace(/[^\d]/g, '');
              return (
                <div
                  key={slot.id}
                  className="bg-[#FAF7F2] border border-[#3B155F]/15 rounded-xl p-6 sm:p-7 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span
                        className="font-semibold uppercase tracking-wider"
                        style={{ color: slot.accentHex || '#3B155F' }}
                      >
                        Desk 0{idx + 1} · {slot.department}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-semibold ${
                          isAwaiting
                            ? 'bg-[#FDF6E2] text-[#7A5A10]'
                            : 'bg-[#EDF6F3] text-[#256358]'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                        {slot.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      {slot.photoUrl ? (
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-[#3B155F]/20 shrink-0">
                          <SafeImage
                            src={slot.photoUrl}
                            alt={slot.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-base font-bold text-white shrink-0"
                          style={{ backgroundColor: slot.accentHex || '#3B155F' }}
                        >
                          {isAwaiting ? `D${idx + 1}` : getInitials(slot.fullName)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B] leading-snug">
                          {slot.roleTitle}
                        </h3>
                        <p className="text-xs font-medium text-[#665B73]">
                          Coordinator: <strong className="text-[#1E0B2B]">{slot.fullName}</strong>
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-[#3E3349] leading-relaxed">{slot.focusSummary}</p>

                    <div className="p-3 rounded-lg bg-white border border-[#3B155F]/10 space-y-1.5 text-xs text-[#3E3349]">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {slot.wardLocation && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#C2593F]" aria-hidden="true" />
                            {slot.wardLocation}
                          </span>
                        )}
                        {slot.officeHours && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#3B155F]" aria-hidden="true" />
                            {slot.officeHours}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 font-semibold pt-0.5">
                        <a
                          href={`tel:${slot.phone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1 text-[#256358] hover:underline tabular-nums"
                        >
                          <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                          {slot.phone}
                        </a>
                        {waClean && (
                          <a
                            href={`https://wa.me/${waClean}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#256358] hover:underline"
                          >
                            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            WhatsApp Desk
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#3B155F]/10 flex flex-wrap items-center justify-between gap-3">
                    <AppLink
                      href={slot.routingHref}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B155F] hover:text-[#C2593F]"
                    >
                      {slot.routingLabel}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </AppLink>
                    <a
                      href={`mailto:${slot.email}?subject=${encodeURIComponent(`Attn: ${slot.roleTitle}`)}`}
                      className="text-xs font-semibold text-[#256358] underline"
                    >
                      Email Desk
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Need Help Reaching an Administrator? */}
      <section className="py-16 sm:py-20 bg-[#FDF6EE]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
              Karibu Sana · Immediate Help &amp; Coordination
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Need Help Reaching an Administrator or Offering Support?
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              Whether you are an elder living alone, a parent carrying a quiet burden, or a
              neighbour ready to share blankets, unga, or time—our coordinators answer every note
              personally.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <AppLink
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#3B155F] text-[#FAF7F2] hover:bg-[#2C1042] rounded-md transition-colors"
              >
                Send a Message to Administration
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </AppLink>
              <AppLink
                href="/find-my-home"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#1E0B2B] bg-white border border-[#3B155F]/20 hover:bg-[#F3EEF8] rounded-md transition-colors"
              >
                Urgent Safe Refuge Desk
              </AppLink>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-[#D4AF37]/45 rounded-2xl p-7 space-y-4">
            <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
              Direct Circle Contact Channels
            </h3>
            <ul className="space-y-3 text-sm text-[#3E3349]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C2593F] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  {settings?.primaryLocationLabel ||
                    'His & Hers Circle of Hope · Ruiru, Kiambu County'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#3B155F] shrink-0 mt-0.5" aria-hidden="true" />
                <a href={`mailto:${email}`} className="underline text-[#3B155F] font-medium">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 tabular-nums">
                <PhoneCall className="w-4 h-4 text-[#256358] shrink-0 mt-0.5" aria-hidden="true" />
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="font-medium text-[#256358]">
                  {phone}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
