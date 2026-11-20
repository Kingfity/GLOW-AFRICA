import {
  ArrowRight,
  Calendar,
  HeartHandshake,
  MapPin,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { SafeImage } from '../components/SafeImage';
import { BrandMark } from '../components/Navbar';
import { CareCompassSection } from '../components/CareCompassSection';
import { CareVillageBuilder } from '../components/CareVillageBuilder';
import { openEmergencyAlertModal } from '../components/EmergencyAuthorityAlert';
import { LivingPortfolioSection } from '../components/LivingPortfolioSection';
import { ScrollReveal } from '../components/ScrollReveal';
import { TransparentImpactDashboard } from '../components/TransparentImpactDashboard';
import { VideoShowcaseSection } from '../components/VideoShowcaseSection';
import { formatEventDate } from '../utils/validation';

const CARE_PATHWAYS = [
  {
    index: '01.',
    accent: 'text-[#C2593F]',
    borderColor: '#C2593F',
    title: 'Children’s Homes & Schools for Differently Abled',
    description:
      'Visit children’s homes across Kenya and inclusive schools for blind, deaf, developmental, and physically differently abled learners—plus corporate and NGO onboarding.',
    linkLabel: 'Explore Homes & Special Schools',
    linkHref: '/home-visits',
  },
  {
    index: '02.',
    accent: 'text-[#7A5A10]',
    borderColor: '#D4AF37',
    title: 'Special Needs Kids & Families (Single & Two-Parent)',
    description:
      'Speak directly with our Mother & Guardian Care Lead for monthly respite hours, maize flour & hygiene bundles, NCPWD/EARS guidance, and inclusive family circles.',
    linkLabel: 'Open Special Needs Families Hub',
    linkHref: '/special-needs-families',
  },
  {
    index: '03.',
    accent: 'text-[#256358]',
    borderColor: '#256358',
    title: 'Mental Health, Trauma & Stress Healing',
    description:
      'Interactive 4-4-6 nervous-system grounding plans, trauma and caregiver burnout relief, confidential callbacks, and direct Kenyan crisis support.',
    linkLabel: 'Open Mental Health & Trauma Wing',
    linkHref: '/mental-health',
  },
  {
    index: '04.',
    accent: 'text-[#256358]',
    borderColor: '#1D4E46',
    title: 'Rehabilitation Centres Near You',
    description:
      'Connect loved ones navigating addiction, trauma, or youth crisis with verified rehabilitation facilities across 47 counties sorted by proximity.',
    linkLabel: 'Find Nearby Rehabilitation',
    linkHref: '/rehabilitation',
  },
  {
    index: '05.',
    accent: 'text-[#3B155F]',
    borderColor: '#3B155F',
    title: 'Talk to a Counsellor & Lighten Your Burden',
    description:
      'A stigma-free mental health and listening space where you can speak with a counsellor, process grief or burnout, or share anonymously in confidence.',
    linkLabel: 'Speak With a Counsellor',
    linkHref: '/counselling',
  },
  {
    index: '06.',
    accent: 'text-[#7A5A10]',
    borderColor: '#B85D19',
    title: 'Find My Home · Safe Refuge',
    description:
      'Discreet, private family-shelter coordination and child safeguarding support whenever home no longer feels safe.',
    linkLabel: 'Open Safe Refuge',
    linkHref: '/find-my-home',
  },
  {
    index: '07.',
    accent: 'text-[#3B155F]',
    borderColor: '#59217C',
    title: 'Interdenominational Prayer & Worship',
    description:
      'Rooted in Nancy Kariuki and the GLOW Prayer Movement heritage, we gather across backgrounds to uphold one another in confidential prayer.',
    linkLabel: 'Visit Prayer & Worship',
    linkHref: '/prayer-worship',
  },
  {
    index: '08.',
    accent: 'text-[#256358]',
    borderColor: '#7A5A10',
    title: 'Accountability & 82/12/6 Open Books',
    description:
      'We keep the books open—inspect our 82% programmes / 12% admin / 6% fundraising breakdown, Follow a Dollar journal, and downloadable reports.',
    linkLabel: 'Inspect Open Books',
    linkHref: '/accountability',
  },
];

export function HomePage() {
  const { data } = useSiteData();
  const settings = data?.settings;
  const activeAnnouncement = data?.announcements?.[0];
  const featuredImpact = (data?.impactProjects || []).slice(0, 3);
  const upcomingEvents = (data?.events || []).slice(0, 3);

  return (
    <div>
      {/* 1. Lifelike Documentary Photography Hero */}
      <section className="relative bg-[#160822] text-[#FAF7F2] overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage
            src="/src/assets/images/community_circle_hero_1795102206455.jpg"
            alt="Kenyan community neighbours packing kikapu baskets of fresh sukuma wiki and maize flour together on a warm sunny veranda"
            className="w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#160822]/80 sm:bg-transparent sm:bg-gradient-to-r sm:from-[#160822]/94 sm:via-[#3B155F]/82 sm:to-[#C2593F]/45"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <BrandMark light size="md" />
              <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#F3D79B]">
                His &amp; Hers Circle of Hope · Ruiru, Kiambu County · Est. 2025
              </p>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[58px] font-semibold leading-[1.08] tracking-tight text-[#FAF7F2]">
              {settings?.heroHeadline || 'Bringing Neighbours Together Long After an Outreach Day Ends.'}
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-[#FAF7F2]/90 max-w-xl">
              {settings?.heroSubheadline ||
                'Born in 2025 in Ruiru out of Christian faith and neighbourly compassion—so an elder living alone knows whom to call, parents of children with special needs walk alongside sisters who listen, trauma and stress are met with warmth, and no household carries hardship unseen.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <AppLink
                href="/home-visits"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#160822] bg-[#D4AF37] hover:bg-[#E5CA7B] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                Visit a Children’s Home
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </AppLink>
              <AppLink
                href="/special-needs-families"
                className="inline-flex items-center justify-center px-5 py-3.5 text-sm font-semibold text-[#FAF7F2] bg-[#256358] hover:bg-[#1D4E46] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                Special Needs Families
              </AppLink>
              <button
                type="button"
                onClick={() => openEmergencyAlertModal()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs sm:text-sm font-semibold text-[#FAF7F2] bg-[#C2593F] hover:bg-[#A64831] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 shadow-sm"
              >
                <ShieldAlert className="w-4 h-4 text-[#F3D79B]" aria-hidden="true" />
                Emergency Authority Alert
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Active Announcement Notice (CMS-driven) */}
      {activeAnnouncement && (
        <section
          aria-label="Community announcement"
          className="bg-gradient-to-r from-[#FDF6EE] via-[#FAF7F2] to-[#EAF6F2] border-b border-[#C2593F]/20"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:pr-72 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <p className="text-[#1E0B2B]">
              <span className="font-semibold text-[#C2593F]">{activeAnnouncement.title}:</span>{' '}
              {activeAnnouncement.message}
            </p>
            {activeAnnouncement.linkPath && activeAnnouncement.linkLabel && (
              <AppLink
                href={activeAnnouncement.linkPath}
                className="inline-flex items-center gap-1.5 font-semibold text-[#3B155F] hover:text-[#C2593F] whitespace-nowrap shrink-0"
              >
                {activeAnnouncement.linkLabel}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </AppLink>
            )}
          </div>
        </section>
      )}

      {/* Interactive Care Family Compass */}
      <CareCompassSection />

      {/* 2. Welcome & Care Family Home Identity */}
      <section className="py-16 sm:py-24 bg-[#FDF4EB]">
        <ScrollReveal className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
                Ruiru Origin Story (2025 – Present) · Connected Care
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold leading-tight text-[#1E0B2B]">
                {settings?.welcomeHeadline ||
                  'When One Door Has Spare Unga and Next Door Wonders What to Cook'}
              </h2>
              <p className="text-base leading-relaxed text-[#3E3349]">
                {settings?.welcomeBody ||
                  'In 2025 in Ruiru, Kiambu County, Christian faith moved us to build a steady circle people could rely on long after an outreach day ended—walking four Ruiru wards with conveners Nancy Kariuki and the GLOW Prayer Movement to share elder blankets, staples at Ruiru Boys, quiet listening tea tables, safe refuge, and Christmas of Hope.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-6">
                <AppLink
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B155F] hover:text-[#C2593F] border-b border-[#C2593F] pb-1 transition-colors"
                >
                  Read Our Ruiru Origin Story
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </AppLink>
                <AppLink
                  href="/leadership"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#256358] hover:text-[#1E0B2B] border-b border-[#256358] pb-1 transition-colors"
                >
                  Administrators &amp; Help Desk
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </AppLink>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[320px] rounded-xl overflow-hidden border border-[#C2593F]/25 shadow-sm">
                <SafeImage
                  src="/src/assets/images/ruiru_elder_outreach_1795094869017.jpg"
                  alt="Kenyan community neighbour handing warm woollen blankets and bags of maize flour and sugar to a smiling elder in Ruiru"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 3. Six Care Family Pathways */}
      <section className="py-16 sm:py-24 bg-white border-y border-[#3B155F]/10">
        <ScrollReveal className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl space-y-3 mb-12">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
              How Our Care Family Connects You
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              One Community Hub for Children, Parents, Healing &amp; Refuge
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              Choose the pathway that fits what you or your organisation needs today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {CARE_PATHWAYS.map((item) => (
              <div
                key={item.index}
                style={{ borderTopColor: item.borderColor }}
                className="pt-6 border-t-2 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <p className={`text-xs font-semibold tracking-wider tabular-nums ${item.accent}`}>
                    {item.index}
                  </p>
                  <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">{item.title}</h3>
                  <p className="text-sm text-[#3E3349] leading-relaxed">{item.description}</p>
                </div>
                <div className="pt-2">
                  <AppLink
                    href={item.linkHref}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B155F] hover:text-[#C2593F]"
                  >
                    {item.linkLabel}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </AppLink>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* 4. Interactive Video Stories in Motion */}
      <VideoShowcaseSection />

      {/* 4b. Realistic Photo & Lifelike Artwork Portfolio + Interactive Colour Grading */}
      <LivingPortfolioSection />

      {/* 4c. Gamified Care Family Village Scene Builder + Real-Time Supporter Stream */}
      <CareVillageBuilder compact />

      {/* 5. Mental Health, Trauma & Nearby Rehabilitation Spotlight */}
      <section className="py-16 sm:py-24 bg-[#256358] text-[#FAF7F2]">
        <ScrollReveal className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="h-full min-h-[300px] rounded-xl overflow-hidden border border-white/20">
                <SafeImage
                  src="/src/assets/images/trauma_calm_listening_1795094868840.jpg"
                  alt="Calm sunlit listening room with two Kenyan neighbours sitting quietly over tea"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#F3D79B]">
                Trauma Healing, Mental Health &amp; Rehabilitation Bridges
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight text-[#FAF7F2]">
                Mental Health, Trauma &amp; Stress Support Alongside Rehabilitation Closer to Home
              </h2>
              <p className="text-base leading-relaxed text-[#FAF7F2]/90">
                Explore nervous-system 4-4-6 grounding tools, trauma and caregiver burnout recovery,
                and warm listening rooms where someone genuinely asks, “And how are you doing?”—or
                locate nearby rehabilitation facilities across Kenya’s 47 counties.
              </p>
              <blockquote className="py-4 border-y border-white/15 font-serif italic text-xl text-[#F3D79B]">
                “
                {settings?.prayerInvitation ||
                  'Whether you come because you could use a hand or because you have one to offer, karibu sana. There is room for you in our circle.'}
                ”
              </blockquote>
              <div className="flex flex-wrap gap-4 pt-1">
                <AppLink
                  href="/mental-health"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#160822] bg-[#D4AF37] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  Mental Health &amp; Trauma Wing
                </AppLink>
                <AppLink
                  href="/rehabilitation"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#FAF7F2] border border-white/35 hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
                >
                  Rehabilitation Near Me
                </AppLink>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 5b. Live Transparent Impact Dashboard & Kenya Care Network Map */}
      <TransparentImpactDashboard compact />

      {/* 6. Community Impact & Featured Outreach Since 2025 */}
      <section className="py-16 sm:py-24 bg-[#FAF7F2]">
        <ScrollReveal className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
                Community Impact Since 2025
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Touching Lives Across Homes &amp; Neighbourhoods
              </h2>
              <p className="text-base text-[#3E3349] leading-relaxed">
                Explore documented initiatives across Ruiru ward walks, elder blankets, Ruiru Boys
                solidarity, children’s home visits, and quiet tea listening circles.
              </p>
            </div>
            <AppLink
              href="/impact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B155F] hover:text-[#C2593F] whitespace-nowrap shrink-0"
            >
              Explore All Impact Stories
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </AppLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredImpact.map((project) => (
              <article
                key={project.id}
                className="bg-white border border-[#3B155F]/12 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#F3EEF8]">
                  <SafeImage
                    src={project.imageUrl}
                    alt={project.imageAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-[#665B73]">
                      <span className="font-medium text-[#C2593F]">{project.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{project.dateLabel}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B] leading-snug">
                      <AppLink
                        href={`/impact/${project.slug}`}
                        className="hover:text-[#3B155F] transition-colors"
                      >
                        {project.title}
                      </AppLink>
                    </h3>
                    <p className="text-sm text-[#3E3349] leading-relaxed">{project.summary}</p>
                  </div>
                  <div className="pt-2">
                    <AppLink
                      href={`/impact/${project.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B155F] hover:text-[#C2593F]"
                    >
                      Read Initiative Story
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </AppLink>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* 6b. November 28 Thanksgiving Feast & Early Christmas Relief Token Initiative */}
      <section
        aria-label="November 28 Thanksgiving Feast and Early Christmas Relief Initiative"
        className="py-16 sm:py-20 bg-gradient-to-br from-[#FDF6EE] via-[#FAF7F2] to-[#FDF0D5] border-t border-[#D4AF37]/30"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
              November 28 National Initiative · All 47 Counties
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B] leading-tight">
              Thanksgiving Feast &amp; Early Christmas Relief Bundles (Nov 28)
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              On November 28 and into our Christmas of Hope elders celebration, His &amp; Hers
              Circle of Hope hosts warm community tables to share meals, hear elders’ stories, and
              pack take-home food staples and blankets to cushion hard times.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <AppLink
                href="/events/november-28-thanksgiving-feast-and-early-christmas-relief"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#C2593F] text-white hover:bg-[#A64831] rounded-md transition-colors"
              >
                RSVP or Sponsor Nov 28 &amp; Christmas of Hope
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </AppLink>
              <AppLink
                href="/accountability"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#256358] border border-[#256358]/30 bg-white hover:bg-[#EDF6F3] rounded-md transition-colors"
              >
                See Our 82/12/6 Open Books
              </AppLink>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-md">
              <SafeImage
                src="/src/assets/images/thanksgiving_christmas_feast_1794910602331.jpg"
                alt="Kenyan neighbours gathering outdoors for the November 28 Thanksgiving Feast and Christmas of Hope with shared meals and neatly wrapped relief bundles"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Upcoming Gatherings & Events */}
      <section className="py-16 sm:py-24 bg-[#F3EEF8]/65 border-y border-[#3B155F]/10">
        <ScrollReveal className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
                Children’s Home Visits, Quiet Tea Circles &amp; Elder Tables
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Upcoming Community Events &amp; Action Days
              </h2>
            </div>
            <AppLink
              href="/events"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B155F] hover:text-[#C2593F] whitespace-nowrap shrink-0"
            >
              View Helping Hand Calendar
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </AppLink>
          </div>

          <div className="divide-y divide-[#3B155F]/12 bg-white border border-[#3B155F]/12 rounded-xl">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#665B73]">
                    <span className="font-semibold text-[#C2593F]">{evt.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-[#3B155F]" aria-hidden="true" />
                      {formatEventDate(evt.dateISO)} ({evt.timeLabel})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#3B155F]" aria-hidden="true" />
                      {evt.venue}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                    <AppLink
                      href={`/events/${evt.slug}`}
                      className="hover:text-[#3B155F] transition-colors"
                    >
                      {evt.title}
                    </AppLink>
                  </h3>
                  <p className="text-sm text-[#3E3349] leading-relaxed">{evt.summary}</p>
                </div>
                <div className="shrink-0">
                  <AppLink
                    href={`/events/${evt.slug}`}
                    className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#3B155F] border border-[#3B155F]/25 rounded-md hover:bg-[#F3EEF8] transition-colors whitespace-nowrap"
                  >
                    Event Details &amp; RSVP
                  </AppLink>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* 8. Corporate CSR / Children's Home Partner & Prayer Invitation */}
      <section className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#FDF6EE] border border-[#C2593F]/20 rounded-xl p-8 sm:p-10 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
                  Corporates, NGOs &amp; Visiting Teams
                </p>
                <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
                  Take Your Team to a Children’s Home or Onboard as a Partner
                </h2>
                <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                  Book a structured corporate CSR day or group mentorship visit to a verified
                  children’s home—or onboard your organisation to collaborate across our network.
                </p>
              </div>
              <div>
                <AppLink
                  href="/home-visits"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#C2593F] hover:bg-[#A64831] rounded-md transition-colors whitespace-nowrap"
                >
                  Children’s Homes &amp; Onboarding
                </AppLink>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#3B155F] to-[#1E0B2B] text-[#FAF7F2] rounded-xl p-8 sm:p-10 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B] inline-flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4" aria-hidden="true" />
                  Safe Refuge, Prayer &amp; Volunteering
                </p>
                <h2 className="font-serif text-3xl font-semibold text-[#FAF7F2]">
                  Need Safe Shelter, Prayer, or Ready to Volunteer?
                </h2>
                <p className="text-sm sm:text-base text-[#FAF7F2]/85 leading-relaxed">
                  Access calm, confidential family-protection pathways whenever home feels unsafe,
                  share a private prayer need, or join our community volunteer family across Kenya.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <AppLink
                  href="/find-my-home"
                  className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-[#160822] bg-[#D4AF37] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap"
                >
                  Find My Home
                </AppLink>
                <AppLink
                  href="/prayer-worship"
                  className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-[#FAF7F2] border border-white/30 hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
                >
                  Request Prayer
                </AppLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
