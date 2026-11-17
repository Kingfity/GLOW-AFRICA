import { useMemo, useState } from 'react';
import { ArrowRight, Building2, Calendar, MapPin, Search, X } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { SafeImage } from '../components/SafeImage';
import { HELPING_HAND_EVENT_CATEGORIES } from '../shared/types';
import { filterAndSortEvents, formatEventDate, isUpcomingEvent } from '../utils/validation';

const EVENT_CATEGORIES: Array<'All' | (typeof HELPING_HAND_EVENT_CATEGORIES)[number]> = [
  'All',
  ...HELPING_HAND_EVENT_CATEGORIES,
];

export function EventsPage() {
  const { data, loading } = useSiteData();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const allEvents = data?.events || [];
  const events = useMemo(
    () => filterAndSortEvents(allEvents, selectedCategory, searchQuery),
    [allEvents, selectedCategory, searchQuery]
  );

  const upcomingCount = useMemo(
    () => allEvents.filter((e) => isUpcomingEvent(e.dateISO)).length,
    [allEvents]
  );

  const hasActiveFilter = selectedCategory !== 'All' || searchQuery.trim().length > 0;

  return (
    <div>
      {/* Helping Hand CBO Hero */}
      <section className="bg-gradient-to-br from-[#1E0B2B] via-[#2C1042] to-[#3B155F] text-[#FAF7F2] py-16 sm:py-24 border-b border-[#D4AF37]/25">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8 space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#F3D79B]">
              HIS AND HERS · Helping Hand Community Calendar
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              Community Action Days, Support Circles &amp; Family Gatherings
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/88 leading-relaxed max-w-2xl">
              Lend a helping hand across our partner children’s homes, sensory-friendly ASD parent
              mornings, mental health listening circles, and neighbourhood outreach drives. Every
              gathering is open to caring individuals, families, and partner teams.
            </p>
            <div className="pt-1 flex flex-wrap gap-3">
              <a
                href="#helping-hand-events"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap"
              >
                Browse Community Calendar
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <AppLink
                href="/home-visits"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#FAF7F2] border border-white/35 hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
              >
                <Building2 className="w-4 h-4 text-[#F3D79B]" aria-hidden="true" />
                Book a Custom Team / CSR Visit
              </AppLink>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/8 border border-white/15 rounded-xl p-5 sm:p-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F3D79B]">
              How Participation Works
            </p>
            <p className="text-sm text-[#FAF7F2]/90 leading-relaxed">
              Reserve your spot online for any open calendar date below—or schedule a tailored
              corporate, school, or friend-group visit directly on our Children’s Homes page.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Metric Strip */}
      <section className="bg-white border-b border-[#3B155F]/12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#3B155F]/12">
          <div className="py-5 sm:pr-6">
            <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B] tabular-nums">
              {allEvents.length} Active Calendar Events
            </p>
            <p className="text-xs text-[#665B73] mt-0.5 tabular-nums">
              {upcomingCount} upcoming community action &amp; care dates open for RSVP
            </p>
          </div>
          <div className="py-5 sm:px-6">
            <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#256358] tabular-nums">
              5 Helping-Hand Focus Areas
            </p>
            <p className="text-xs text-[#665B73] mt-0.5">
              Children’s homes, mental health, ASD families, outreach &amp; safe refuge
            </p>
          </div>
          <div className="py-5 sm:pl-6">
            <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#C2593F]">
              Free Community Entry
            </p>
            <p className="text-xs text-[#665B73] mt-0.5">
              Pre-briefed safeguarding orientation provided for all visiting groups
            </p>
          </div>
        </div>
      </section>

      {/* Featured November 28 Thanksgiving Feast & Early Christmas Relief Spotlight */}
      <section className="bg-gradient-to-r from-[#FDF6EE] via-[#FAF7F2] to-[#EAF6F2] border-b border-[#D4AF37]/30 py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 aspect-[16/10] rounded-xl overflow-hidden border border-[#D4AF37]/45 shadow-sm">
            <SafeImage
              src="/src/assets/images/thanksgiving_christmas_feast_1794910602331.jpg"
              alt="Families sharing warm food and early Christmas relief parcels at the November 28 Thanksgiving Feast"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C2593F]">
              November 28 Special National Drive · All 47 Counties
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
              Thanksgiving Feast &amp; Early Christmas Relief Bundles
            </h2>
            <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
              Join us on November 28 to prepare warm shared meals and hand out small bundles of
              practical relief tokens—cushioning families across Kenya ahead of the festive season.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <AppLink
                href="/events/november-28-thanksgiving-feast-and-early-christmas-relief"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#C2593F] text-white hover:bg-[#A64831] rounded-md transition-colors"
              >
                RSVP for November 28 Feast
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </AppLink>
            </div>
          </div>
        </div>
      </section>

      {/* Events Calendar & Filter Controls */}
      <section id="helping-hand-events" className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
          {/* Category Tabs + Search Filter */}
          <div className="space-y-4 border-b border-[#3B155F]/12 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs sm:text-sm font-medium text-[#3E3349] tabular-nums">
                Showing {events.length} of {allEvents.length} community event
                {allEvents.length === 1 ? '' : 's'}
                {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                {searchQuery.trim() ? ` matching “${searchQuery.trim()}”` : ''}
              </p>

              <div className="flex items-center gap-2 w-full sm:w-80">
                <div className="relative flex-1">
                  <Search
                    className="w-4 h-4 text-[#665B73] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <label htmlFor="events-search-input" className="sr-only">
                    Search community events by title, venue, or keyword
                  </label>
                  <input
                    id="events-search-input"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title, area, or focus..."
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-[#3B155F]/20 rounded-md focus-visible:outline-2 focus-visible:outline-[#3B155F]"
                  />
                </div>
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    aria-label="Clear event filters"
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[#C2593F] bg-white border border-[#C2593F]/25 rounded-md hover:bg-[#FDF6EE] whitespace-nowrap"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div
              role="tablist"
              aria-label="Filter community events by focus area"
              className="flex flex-wrap items-center gap-2"
            >
              {EVENT_CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#3B155F] text-white border-[#3B155F]'
                        : 'bg-white text-[#3E3349] border-[#3B155F]/15 hover:bg-[#F3EEF8]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-44 bg-white border border-[#3B155F]/10 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white border border-[#3B155F]/12 rounded-xl p-12 text-center space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                No Community Events Match Your Filter
              </h2>
              <p className="text-sm text-[#665B73] max-w-md mx-auto">
                Clear the search filter to browse all scheduled Helping Hand action days, or book a
                custom date for your group to visit a Children’s Home.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#3B155F] border border-[#3B155F]/25 rounded-md hover:bg-[#F3EEF8]"
                >
                  Show All Events
                </button>
                <AppLink
                  href="/home-visits"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#FAF7F2] bg-[#C2593F] hover:bg-[#A64831] rounded-md"
                >
                  Schedule Custom Visit
                </AppLink>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {events.map((evt) => {
                const upcoming = isUpcomingEvent(evt.dateISO);
                return (
                  <article
                    key={evt.id}
                    className="bg-white border border-[#3B155F]/12 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
                  >
                    <div className="lg:col-span-4 aspect-[4/3] lg:aspect-auto bg-[#F3EEF8]">
                      <SafeImage
                        src={evt.imageUrl}
                        alt={evt.imageAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#665B73]">
                          <span className="font-semibold text-[#C2593F]">{evt.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1.5 tabular-nums">
                            <Calendar className="w-3.5 h-3.5 text-[#3B155F]" aria-hidden="true" />
                            {formatEventDate(evt.dateISO)} · {evt.timeLabel}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className={upcoming ? 'text-[#256358] font-medium' : 'text-[#665B73]'}>
                            {upcoming ? 'Upcoming' : 'Past Event'}
                          </span>
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
                          <AppLink
                            href={`/events/${evt.slug}`}
                            className="hover:text-[#3B155F] transition-colors"
                          >
                            {evt.title}
                          </AppLink>
                        </h2>
                        <p className="text-sm text-[#665B73] inline-flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#3B155F] shrink-0" aria-hidden="true" />
                          <span>{evt.venue}</span>
                        </p>
                        <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                          {evt.summary}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#3B155F]/10">
                        <span className="text-xs text-[#665B73]">
                          {evt.registrationOpen
                            ? 'Open RSVP available online'
                            : 'Open drop-in attendance (no RSVP needed)'}
                        </span>
                        <AppLink
                          href={`/events/${evt.slug}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md transition-colors whitespace-nowrap"
                        >
                          View Details &amp; RSVP
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </AppLink>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Custom Corporate CSR / Group Visit Bridge */}
          <div className="bg-[#FDF6EE] border border-[#C2593F]/22 rounded-xl p-6 sm:p-9 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#C2593F]">
                Custom Group Dates · Corporate CSR &amp; Schools
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
                Need a Dedicated Date for Your Workplace, Fellowship, or Friend Group?
              </h2>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                Alongside our public Helping Hand calendar above, your team can pick any partner
                Children’s Home, calculate care kits, and reserve a private guided visit date.
              </p>
            </div>
            <AppLink
              href="/home-visits"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#C2593F] hover:bg-[#A64831] rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              Organise a Children’s Home Visit
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </AppLink>
          </div>
        </div>
      </section>
    </div>
  );
}
