import { useRef, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  HeartHandshake,
  MapPin,
  Pause,
  Play,
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
      'Visit children’s homes across Kenya and inclusive schools for blind, deaf, autistic, and physically differently abled learners—plus corporate and NGO onboarding.',
    linkLabel: 'Explore Homes & Special Schools',
    linkHref: '/home-visits',
  },
  {
    index: '02.',
    accent: 'text-[#256358]',
    borderColor: '#256358',
    title: 'Rehabilitation Centres Near You',
    description:
      'Connect loved ones navigating addiction, trauma, or youth crisis with verified rehabilitation facilities sorted by proximity and chosen care format.',
    linkLabel: 'Find Nearby Rehabilitation',
    linkHref: '/rehabilitation',
  },
  {
    index: '03.',
    accent: 'text-[#256358]',
    borderColor: '#D4AF37',
    title: 'ASD Parents & Kids Care Hub',
    description:
      'Simple, welcoming daily living points, sensory corner setups, visual routine guides, and parent mentors for families raising autistic children.',
    linkLabel: 'Open ASD Family Tips',
    linkHref: '/asd-support',
  },
  {
    index: '04.',
    accent: 'text-[#3B155F]',
    borderColor: '#3B155F',
    title: 'Talk to a Counsellor & Lighten Your Burden',
    description:
      'A stigma-free mental health and listening space where you can speak with a counsellor, process grief or burnout, or share anonymously in confidence.',
    linkLabel: 'Speak With a Counsellor',
    linkHref: '/counselling',
  },
  {
    index: '05.',
    accent: 'text-[#7A5A10]',
    borderColor: '#B85D19',
    title: 'Find My Home · Calm Refuge',
    description:
      'Discreet, private family-shelter coordination and child safeguarding support whenever home no longer feels safe.',
    linkLabel: 'Open Calm Refuge',
    linkHref: '/find-my-home',
  },
  {
    index: '06.',
    accent: 'text-[#3B155F]',
    borderColor: '#59217C',
    title: 'Interdenominational Prayer & Worship',
    description:
      'Rooted in our prayer movement heritage, we gather across backgrounds to seek God together and uphold one another in confidential prayer.',
    linkLabel: 'Visit Prayer & Worship',
    linkHref: '/prayer-worship',
  },
];

export function HomePage() {
  const { data } = useSiteData();
  const settings = data?.settings;
  const activeAnnouncement = data?.announcements?.[0];
  const featuredImpact = (data?.impactProjects || []).slice(0, 3);
  const upcomingEvents = (data?.events || []).slice(0, 3);

  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [heroMotionPaused, setHeroMotionPaused] = useState(false);

  const toggleHeroMotion = () => {
    const video = heroVideoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => {});
      setHeroMotionPaused(false);
    } else {
      video.pause();
      setHeroMotionPaused(true);
    }
  };

  return (
    <div>
      {/* 1. Immersive Video-Background Hero */}
      <section className="relative bg-[#160822] text-[#FAF7F2] overflow-hidden">
        <div className="absolute inset-0">
          <video
            ref={heroVideoRef}
            autoPlay
            muted
            loop
            playsInline
            poster="/src/assets/images/hero_worship_community_1794821886213.jpg"
            className="w-full h-full object-cover object-center"
            aria-hidden="true"
          >
            <source src="/videos/childrens_home_visits_reel.mp4" type="video/mp4" />
          </video>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#160822]/80 sm:bg-transparent sm:bg-gradient-to-r sm:from-[#160822]/94 sm:via-[#3B155F]/80 sm:to-[#C2593F]/45"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <BrandMark light size="md" />
              <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#F3D79B]">
                HIS AND HERS · Kenya Care Family Hub · Expanding East &amp; Central Africa · Est. 2025
              </p>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[58px] font-semibold leading-[1.08] tracking-tight text-[#FAF7F2]">
              {settings?.heroHeadline || 'A Care Family Home That Connects Everyone to Hope.'}
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-[#FAF7F2]/90 max-w-xl">
              {settings?.heroSubheadline ||
                'HIS AND HERS is a vibrant community-based organization rooted in prayer, mental wellbeing, safe refuge, children’s home partnerships, rehabilitation support, and autism family care—uniting individuals, families, and organisations to touch lives together.'}
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
                href="/counselling"
                className="inline-flex items-center justify-center px-5 py-3.5 text-sm font-semibold text-[#FAF7F2] bg-[#256358] hover:bg-[#1D4E46] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                Talk to a Counsellor
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

          {/* Ambient Video Motion Accessibility Toggle */}
          <button
            type="button"
            onClick={toggleHeroMotion}
            aria-pressed={heroMotionPaused}
            className="mt-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/35 hover:bg-black/55 border border-white/20 text-[11px] font-medium text-[#FAF7F2]/90 transition-colors"
          >
            {heroMotionPaused ? (
              <>
                <Play className="w-3 h-3 text-[#E5CA7B]" aria-hidden="true" />
                Play Background Motion
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-[#E5CA7B]" aria-hidden="true" />
                Pause Background Motion
              </>
            )}
          </button>
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
                Connected Care · Children’s Homes, Families &amp; Partners
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold leading-tight text-[#1E0B2B]">
                {settings?.welcomeHeadline ||
                  'Where Individuals, Families & Partner Organisations Build Stronger Homes'}
              </h2>
              <p className="text-base leading-relaxed text-[#3E3349]">
                {settings?.welcomeBody ||
                  'Like a true care family home, HIS AND HERS connects people directly to what they need: corporate and group visits to verified children’s homes, mental health counselling to lighten heavy burdens, nearby rehabilitation centres for families in recovery, safe refuge from abuse, and practical ASD guidance for parents and kids.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-6">
                <AppLink
                  href="/home-visits"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B155F] hover:text-[#C2593F] border-b border-[#C2593F] pb-1 transition-colors"
                >
                  Partner or Visit a Children’s Home
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </AppLink>
                <AppLink
                  href="/rehabilitation"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#256358] hover:text-[#1E0B2B] border-b border-[#256358] pb-1 transition-colors"
                >
                  Find Rehabilitation Near You
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </AppLink>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[320px] rounded-xl overflow-hidden border border-[#C2593F]/25 shadow-sm">
                <SafeImage
                  src="/src/assets/images/doc_childrens_home_csr_1794832339445.jpg"
                  alt="Volunteers and children sharing books and fresh mango beneath sunlit acacia trees"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
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

      {/* 5. ASD Family Care & Rehabilitation Spotlight */}
      <section className="py-16 sm:py-24 bg-[#256358] text-[#FAF7F2]">
        <ScrollReveal className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="h-full min-h-[300px] rounded-xl overflow-hidden border border-white/20">
                <SafeImage
                  src="/src/assets/images/doc_asd_family_moment_1794832339166.jpg"
                  alt="Smiling mother and autistic son gently arranging wooden sensory blocks on a woven mat"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#F3D79B]">
                ASD Parents &amp; Nearby Rehabilitation Care
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight text-[#FAF7F2]">
                Practical Tips for ASD Families &amp; Rehabilitation Closer to Home
              </h2>
              <p className="text-base leading-relaxed text-[#FAF7F2]/90">
                Explore friendly visual routine tips, sensory-calm corner ideas, and meltdown
                support written for parents and kids on the autism spectrum—or search nearby
                rehabilitation facilities sorted by distance to support family restoration.
              </p>
              <blockquote className="py-4 border-y border-white/15 font-serif italic text-xl text-[#F3D79B]">
                “
                {settings?.prayerInvitation ||
                  'Whatever season your family or heart is walking through, you do not have to navigate it alone.'}
                ”
              </blockquote>
              <div className="flex flex-wrap gap-4 pt-1">
                <AppLink
                  href="/asd-support"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#160822] bg-[#D4AF37] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  ASD Parents &amp; Kids Hub
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
                Explore documented initiatives across children’s home visits, ASD parent mornings,
                and community healing circles.
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
              On November 28, HIS AND HERS hosts warm community tables to feed families together and
              distribute small bundles of practical relief tokens—helping households cushion hard
              economic times with food staples, children’s essentials, and early Christmas warmth.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <AppLink
                href="/events/november-28-thanksgiving-feast-and-early-christmas-relief"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#C2593F] text-white hover:bg-[#A64831] rounded-md transition-colors"
              >
                RSVP or Sponsor Nov 28 Bundles
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
                alt="Kenyan neighbours gathering outdoors for the November 28 Thanksgiving Feast with shared meals and neatly wrapped relief bundles"
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
                Children’s Home Visits, ASD Mornings &amp; Helping Hand Days
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
