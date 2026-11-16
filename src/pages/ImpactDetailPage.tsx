import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { SafeImage } from '../components/SafeImage';

export function ImpactDetailPage({ slug }: { slug: string }) {
  const { data, loading } = useSiteData();
  const project = data?.impactProjects.find((p) => p.slug === slug || p.id === slug);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20">
        <div className="h-80 bg-white border border-[#3B155F]/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-24 text-center space-y-5">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
          Initiative Not Found
        </h1>
        <p className="text-base text-[#3E3349]">
          This impact record could not be located or may have been updated.
        </p>
        <AppLink
          href="/impact"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] rounded-md"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Our Impact
        </AppLink>
      </div>
    );
  }

  return (
    <article className="bg-[#FAF7F2]">
      {/* Breadcrumb & Title */}
      <section className="bg-[#1E0B2B] text-[#FAF7F2] py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-6">
          <AppLink
            href="/impact"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#E5CA7B] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            All Impact Initiatives
          </AppLink>
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              {project.category} · {project.dateLabel} · {project.locationLabel}
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl font-semibold leading-tight">
              {project.title}
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/85 leading-relaxed max-w-3xl">
              {project.summary}
            </p>
          </div>
        </div>
      </section>

      {/* Main Documentation Body */}
      <section className="py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-12">
          <div className="aspect-[16/10] rounded-lg overflow-hidden border border-[#3B155F]/15 bg-white">
            <SafeImage
              src={project.imageUrl}
              alt={project.imageAlt}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white border border-[#3B155F]/12 rounded-lg p-6 sm:p-10">
            <div className="space-y-2.5">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">What Was Done</h2>
              <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                {project.whatWasDone}
              </p>
            </div>
            <div className="space-y-2.5">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">Why It Mattered</h2>
              <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                {project.whyItMattered}
              </p>
            </div>
            <div className="space-y-2.5 pt-6 border-t border-[#3B155F]/10">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">Who It Served</h2>
              <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                {project.whoItServed}
              </p>
            </div>
            <div className="space-y-2.5 pt-6 border-t border-[#3B155F]/10">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                What HIS AND HERS Hoped to Achieve
              </h2>
              <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                {project.whatGlowHopedToAchieve}
              </p>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">Documented Story</h2>
            <p className="text-base text-[#3E3349] leading-relaxed">{project.documentedStory}</p>
          </div>

          <div className="pt-8 border-t border-[#3B155F]/15 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#3E3349]">
              Would you like to organize a group or corporate visit to a partner children’s home?
            </p>
            <AppLink
              href="/home-visits"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md transition-colors"
            >
              Visit a Children’s Home
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </AppLink>
          </div>
        </div>
      </section>
    </article>
  );
}
