import { useState } from 'react';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { SafeImage } from '../components/SafeImage';
import { filterAndSortEvents, formatEventDate } from '../utils/validation';

const EVENT_CATEGORIES = [
  'All',
  'Worship Gathering',
  'Prayer Meeting',
  'Community Outreach',
  'Special Service',
  'Conference',
];

export function EventsPage() {
  const { data, loading } = useSiteData();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const events = filterAndSortEvents(data?.events || [], selectedCategory);

  return (
    <div>
      {/* Header */}
      <section className="bg-[#1E0B2B] text-[#FAF7F2] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Events &amp; Gatherings
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              Gather With Us in Worship, Prayer &amp; Service
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/85 leading-relaxed">
              Explore upcoming worship gatherings, midweek prayer watches, special services, and
              neighbourhood outreach days. Visitors from every background are warmly welcome.
            </p>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
          {/* Category Filter */}
          <div
            role="tablist"
            aria-label="Filter gatherings by category"
            className="flex flex-wrap items-center gap-2 border-b border-[#3B155F]/12 pb-5"
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
                  className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#3B155F] text-[#FAF7F2]'
                      : 'bg-white text-[#3E3349] border border-[#3B155F]/15 hover:bg-[#F3EEF8]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-44 bg-white border border-[#3B155F]/10 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white border border-[#3B155F]/12 rounded-lg p-12 text-center space-y-3">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                No Gatherings Scheduled Under This Category
              </h2>
              <p className="text-sm text-[#665B73]">
                View all upcoming gatherings or check back shortly for updated dates.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#3B155F] border border-[#3B155F]/25 rounded-md hover:bg-[#F3EEF8]"
              >
                Show All Gatherings
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {events.map((evt) => (
                <article
                  key={evt.id}
                  className="bg-white border border-[#3B155F]/12 rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12"
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
                        <span className="font-semibold text-[#7A5A10]">{evt.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1.5 tabular-nums">
                          <Calendar className="w-3.5 h-3.5 text-[#3B155F]" aria-hidden="true" />
                          {formatEventDate(evt.dateISO)} · {evt.timeLabel}
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
                          ? 'Open registration available'
                          : 'Open walk-in attendance'}
                      </span>
                      <AppLink
                        href={`/events/${evt.slug}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md transition-colors whitespace-nowrap"
                      >
                        View Details &amp; Register
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </AppLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
