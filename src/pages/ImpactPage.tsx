import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { SafeImage } from '../components/SafeImage';
import { StoryVideoAnimator } from '../components/StoryVideoAnimator';
import { TransparentImpactDashboard } from '../components/TransparentImpactDashboard';
import { filterImpactProjects } from '../utils/validation';

const CATEGORIES = [
  'All',
  'Community Outreach',
  'Acts of Compassion',
  'Support for Vulnerable Communities',
  'Community Engagement',
];

export function ImpactPage() {
  const { data, loading } = useSiteData();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const projects = filterImpactProjects(data?.impactProjects || [], selectedCategory);

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#1E0B2B] via-[#3B155F] to-[#256358] text-[#FAF7F2] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Our Impact Since 2025
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              Compassion Expressed Through Presence and Open Accountability
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/85 leading-relaxed">
              From Ruiru ward walks, elder blankets, and Ruiru Boys solidarity to children’s home
              CSR partnerships, mental health circles, and trauma recovery care—our community work
              since 2025 is tracked transparently across our regional care hubs.
            </p>
          </div>
        </div>
      </section>

      {/* Transparent Financial Ledger, Regional Care Map & 2025-2026 Field Tour */}
      <TransparentImpactDashboard />

      {/* Filter & Impact Gallery */}
      <section className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
          {/* Interactive Filter Controls */}
          <div
            role="tablist"
            aria-label="Filter impact initiatives by category"
            className="flex flex-wrap items-center gap-2 border-b border-[#3B155F]/12 pb-5"
          >
            {CATEGORIES.map((category) => {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-96 bg-white/70 border border-[#3B155F]/10 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white border border-[#3B155F]/12 rounded-lg p-12 text-center space-y-3">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                No Initiatives Listed in This Category Yet
              </h2>
              <p className="text-sm text-[#665B73]">
                Select another category or check back as new outreach stories are documented.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#3B155F] border border-[#3B155F]/25 rounded-md hover:bg-[#F3EEF8]"
              >
                Show All Initiatives
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {projects.map((project) => (
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
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#665B73]">
                        <span className="font-semibold text-[#7A5A10]">{project.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{project.dateLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.locationLabel}</span>
                      </div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B] leading-snug">
                        <AppLink
                          href={`/impact/${project.slug}`}
                          className="hover:text-[#3B155F] transition-colors"
                        >
                          {project.title}
                        </AppLink>
                      </h2>
                      <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                        {project.summary}
                      </p>
                    </div>
                    <div>
                      <AppLink
                        href={`/impact/${project.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B155F] hover:text-[#7A5A10]"
                      >
                        Read Documented Story
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

      {/* Community Story Photo-to-Video Keepsake Studio */}
      <section className="py-12 sm:py-16 bg-[#F4EFE6] border-t border-[#3B155F]/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <StoryVideoAnimator />
        </div>
      </section>
    </div>
  );
}
