import { ArrowRight, Calendar, HeartHandshake, MapPin } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { SafeImage } from '../components/SafeImage';
import { formatEventDate } from '../utils/validation';

const GUIDING_VALUES = [
  {
    index: '01.',
    title: 'Rooted in Prayer',
    description:
      'Prayer is not an opening formality; it is our foundation. We gather across traditions to seek God sincerely for families, communities, and renewal.',
  },
  {
    index: '02.',
    title: 'Open to Every Background',
    description:
      'As an interdenominational movement, no one needs a specific denominational label to belong. Every person is welcomed with warmth and grace.',
  },
  {
    index: '03.',
    title: 'Faith Expressed Through Compassion',
    description:
      'Since 2024, our devotion has moved beyond sanctuary walls into courtyards and homes—expressing God’s love through tangible care and presence.',
  },
  {
    index: '04.',
    title: 'Dignity & Togetherness',
    description:
      'Whether sharing food parcels or listening around a table, we serve alongside neighbours rather than from a distance—honouring the dignity of every life.',
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
      {/* 1. Full-Width Atmospheric Hero */}
      <section className="relative bg-[#160822] text-[#FAF7F2] overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage
            src="/src/assets/images/hero_worship_community_1794821886213.jpg"
            alt="Diverse congregation gathered in heartfelt prayer and worship at GLOW Church Africa"
            className="w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#160822]/78 sm:bg-transparent sm:bg-gradient-to-r sm:from-[#160822]/92 sm:via-[#160822]/78 sm:to-[#160822]/40"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl space-y-6">
            <p className="text-xs sm:text-sm font-medium tracking-wider uppercase text-[#E5CA7B]">
              Interdenominational Prayer &amp; Worship Movement · Since 2024
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[58px] font-semibold leading-[1.08] tracking-tight text-[#FAF7F2]">
              {settings?.heroHeadline || 'More Than a Place to Gather. A Place to Belong.'}
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-[#FAF7F2]/90 max-w-xl">
              {settings?.heroSubheadline ||
                "Rooted in prayer, united in worship and driven by compassion. At GLOW Church Africa, we believe God's love is best demonstrated not only through what we profess, but also through how we serve, care and show up for one another."}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <AppLink
                href="/get-involved"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#160822] bg-[#D4AF37] hover:bg-[#E5CA7B] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                Find Your Place
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </AppLink>
              <AppLink
                href="/about"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-[#FAF7F2] border border-[#FAF7F2]/40 hover:bg-white/10 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                Explore Our Mission
              </AppLink>
            </div>
          </div>
        </div>
      </section>

      {/* Active Announcement Notice (CMS-driven) */}
      {activeAnnouncement && (
        <section
          aria-label="Community announcement"
          className="bg-[#F3EEF8] border-b border-[#3B155F]/12"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
            <p className="text-[#1E0B2B]">
              <span className="font-semibold text-[#3B155F]">{activeAnnouncement.title}:</span>{' '}
              {activeAnnouncement.message}
            </p>
            {activeAnnouncement.linkPath && activeAnnouncement.linkLabel && (
              <AppLink
                href={activeAnnouncement.linkPath}
                className="inline-flex items-center gap-1.5 font-semibold text-[#3B155F] hover:text-[#7A5A10] whitespace-nowrap shrink-0"
              >
                {activeAnnouncement.linkLabel}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </AppLink>
            )}
          </div>
        </section>
      )}

      {/* 2. Welcome & Interdenominational Identity */}
      <section className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
                Where Every Heart Finds a Place
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold leading-tight text-[#1E0B2B]">
                {settings?.welcomeHeadline ||
                  'A Prayer Movement & Worship Community Across Denominational Lines'}
              </h2>
              <p className="text-base leading-relaxed text-[#3E3349]">
                {settings?.welcomeBody ||
                  'GLOW Church Africa is an interdenominational prayer and worship movement. More than a conventional church institution, we are a welcoming sanctuary where people from every background, tradition, and walk of life can seek God in prayer, experience genuine fellowship, and join hands in practical compassion.'}
              </p>
              <p className="text-base leading-relaxed text-[#3E3349]">
                Faith is never meant to stay behind closed doors. From our earliest gatherings in
                2024, worship and community care have belonged together—creating refuge for those
                carrying quiet burdens and mobilising ordinary people to love their neighbours well.
              </p>
              <div className="pt-2">
                <AppLink
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B155F] hover:text-[#7A5A10] border-b border-[#B88F28] pb-1 transition-colors"
                >
                  Read Our Full Story
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </AppLink>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[320px] rounded-lg overflow-hidden border border-[#3B155F]/12">
                <SafeImage
                  src="/src/assets/images/prayer_fellowship_circle_1794821886765.jpg"
                  alt="Small interdenominational prayer circle holding hands in warm fellowship"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Prayer & Worship Anchor Band */}
      <section className="py-16 sm:py-24 bg-[#1E0B2B] text-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="h-full min-h-[300px] rounded-lg overflow-hidden border border-white/15">
                <SafeImage
                  src="/src/assets/images/worship_gathering_sanctuary_1794821887938.jpg"
                  alt="Serene evening worship sanctuary lit by candlelight at dusk"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
                United in Prayer · Connected Through Love
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight text-[#FAF7F2]">
                The Spiritual Heart of GLOW
              </h2>
              <p className="text-base leading-relaxed text-[#FAF7F2]/85">
                Our worship gatherings and corporate prayer watches are unhurried spaces where
                seekers, families, and believers from across denominations gather without barrier or
                pretence. Here we intercede for one another, worship in truth, and find renewed
                strength.
              </p>
              <blockquote className="py-4 border-y border-white/15 font-serif italic text-xl text-[#E5CA7B]">
                “
                {settings?.prayerInvitation ||
                  'Whatever season of life you find yourself in, you do not have to carry everything alone. We would be honoured to stand with you in prayer.'}
                ”
              </blockquote>
              <div className="flex flex-wrap gap-4 pt-1">
                <AppLink
                  href="/prayer-worship"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#1E0B2B] bg-[#D4AF37] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap"
                >
                  Submit a Prayer Request
                </AppLink>
                <AppLink
                  href="/events"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#FAF7F2] border border-white/30 hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
                >
                  Join a Prayer Gathering
                </AppLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Mission & Guiding Values */}
      <section className="py-16 sm:py-24 bg-white border-y border-[#3B155F]/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl space-y-3 mb-12">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
              Mission &amp; Guiding Values
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Faith Beyond Words. Love in Action.
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              Four commitments shape how we gather, pray, and walk alongside our neighbours across
              communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {GUIDING_VALUES.map((item) => (
              <div
                key={item.index}
                className="pt-6 border-t border-[#3B155F]/15 space-y-2.5"
              >
                <p className="text-xs font-semibold tracking-wider text-[#7A5A10] tabular-nums">
                  {item.index}
                </p>
                <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">{item.title}</h3>
                <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Community Impact & Featured Outreach Since 2024 */}
      <section className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
                Community Impact Since 2024
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Compassion That Reaches Communities
              </h2>
              <p className="text-base text-[#3E3349] leading-relaxed">
                Charitable care and neighbourhood solidarity sit at the centre of GLOW’s identity.
                Explore documented initiatives where faith has taken practical form.
              </p>
            </div>
            <AppLink
              href="/impact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B155F] hover:text-[#7A5A10] whitespace-nowrap shrink-0"
            >
              Explore All Impact Stories
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </AppLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredImpact.map((project) => (
              <article
                key={project.id}
                className="bg-white border border-[#3B155F]/12 rounded-lg overflow-hidden flex flex-col"
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
                      <span className="font-medium text-[#7A5A10]">{project.category}</span>
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
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B155F] hover:text-[#7A5A10]"
                    >
                      Read Initiative Story
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </AppLink>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Upcoming Gatherings & Events */}
      <section className="py-16 sm:py-24 bg-[#F3EEF8]/65 border-y border-[#3B155F]/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
                Gatherings &amp; Outreach Calendar
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Upcoming Gatherings &amp; Events
              </h2>
            </div>
            <AppLink
              href="/events"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B155F] hover:text-[#7A5A10] whitespace-nowrap shrink-0"
            >
              View Full Schedule
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </AppLink>
          </div>

          <div className="divide-y divide-[#3B155F]/12 bg-white border border-[#3B155F]/12 rounded-lg">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#665B73]">
                    <span className="font-semibold text-[#7A5A10]">{evt.category}</span>
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
                    Gathering Details
                  </AppLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Prayer & Participation Invitation */}
      <section className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-[#3B155F]/15 rounded-lg p-8 sm:p-10 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
                  Confidential Prayer Support
                </p>
                <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
                  Need Someone to Pray With You?
                </h2>
                <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                  Share a prayer request privately—with your name or completely anonymously. Our
                  intercessory team honours every request with reverence and confidentiality.
                </p>
              </div>
              <div>
                <AppLink
                  href="/prayer-worship"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md transition-colors whitespace-nowrap"
                >
                  Send a Prayer Request
                </AppLink>
              </div>
            </div>

            <div className="bg-[#3B155F] text-[#FAF7F2] rounded-lg p-8 sm:p-10 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B] inline-flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4" aria-hidden="true" />
                  Serve &amp; Partner
                </p>
                <h2 className="font-serif text-3xl font-semibold text-[#FAF7F2]">
                  Become Part of the Mission
                </h2>
                <p className="text-sm sm:text-base text-[#FAF7F2]/85 leading-relaxed">
                  Join our intercession watches, volunteer during monthly community outreaches, or
                  explore partnership to help care for families across our communities.
                </p>
              </div>
              <div>
                <AppLink
                  href="/get-involved"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#160822] bg-[#D4AF37] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap"
                >
                  Volunteer &amp; Partner
                </AppLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
