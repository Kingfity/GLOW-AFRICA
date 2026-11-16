import { useState } from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { AppLink } from '../context/RouterContext';

interface StoryReel {
  id: string;
  title: string;
  subtitle: string;
  videoSrc: string;
  posterSrc: string;
  durationLabel: string;
  ctaLabel: string;
  ctaHref: string;
}

const STORY_REELS: StoryReel[] = [
  {
    id: 'homes',
    title: 'Children’s Homes & Corporate CSR Visits',
    subtitle:
      'See how companies, fellowships, and individual teams partner with verified children’s homes through reading circles, mentorship, and practical care packs.',
    videoSrc: '/videos/childrens_home_visits_reel.mp4',
    posterSrc: '/src/assets/images/children_home_visit_joy_1794828208960.jpg',
    durationLabel: '0:07 Story Reel',
    ctaLabel: 'Plan a Children’s Home Visit',
    ctaHref: '/home-visits',
  },
  {
    id: 'rehab',
    title: 'Mental Health & Rehabilitation Pathways',
    subtitle:
      'Discover calm counselling rooms and partner restoration centres across regions—helping families connect with care closer to home.',
    videoSrc: '/videos/healing_and_recovery_reel.mp4',
    posterSrc: '/src/assets/images/rehab_recovery_garden_1794828209576.jpg',
    durationLabel: '0:07 Story Reel',
    ctaLabel: 'Find Nearby Rehab & Counselling',
    ctaHref: '/rehabilitation',
  },
  {
    id: 'asd',
    title: 'ASD Parents, Kids & Safe Family Homes',
    subtitle:
      'Practical visual routines, sensory-kind spaces, and safe refuge coordination built around warmth, dignity, and everyday family peace.',
    videoSrc: '/videos/asd_and_family_home_reel.mp4',
    posterSrc: '/src/assets/images/asd_parent_child_care_1794828209127.jpg',
    durationLabel: '0:07 Story Reel',
    ctaLabel: 'Explore ASD Family Tips',
    ctaHref: '/asd-support',
  },
];

export function VideoShowcaseSection() {
  const [selectedId, setSelectedId] = useState<string>('homes');
  const active = STORY_REELS.find((r) => r.id === selectedId) || STORY_REELS[0];

  return (
    <section
      aria-label="Community stories in motion"
      className="py-16 sm:py-24 bg-[#FDF6EE] border-y border-[#C2593F]/15"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
              Life in Community · Video Reels
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              See the Care Family Home in Motion
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              Watch brief visual glimpses of our children’s home visits, counselling &amp;
              rehabilitation partnerships, and autism family care spaces.
            </p>
          </div>
          <p className="text-xs text-[#665B73] tabular-nums inline-flex items-center gap-1.5">
            <PlayCircle className="w-4 h-4 text-[#C2593F]" aria-hidden="true" />
            Select a reel to play
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Active HTML5 Video Player */}
          <div className="lg:col-span-7 bg-[#160822] rounded-xl overflow-hidden border border-[#3B155F]/20 flex flex-col">
            <div className="aspect-video bg-black relative">
              <video
                key={active.id}
                controls
                playsInline
                muted
                preload="metadata"
                poster={active.posterSrc}
                aria-label={active.title}
                className="w-full h-full object-cover"
              >
                <source src={active.videoSrc} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E0B2B] text-[#FAF7F2]">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#E5CA7B] tabular-nums">
                  {active.durationLabel}
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#FAF7F2]">
                  {active.title}
                </h3>
              </div>
              <AppLink
                href={active.ctaHref}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-[#D4AF37] text-[#160822] hover:bg-[#E5CA7B] rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                {active.ctaLabel}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </AppLink>
            </div>
          </div>

          {/* Reel Selector List */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {STORY_REELS.map((reel, index) => {
              const isSelected = reel.id === active.id;
              return (
                <button
                  key={reel.id}
                  type="button"
                  onClick={() => setSelectedId(reel.id)}
                  aria-pressed={isSelected}
                  className={`text-left p-5 sm:p-6 rounded-xl border transition-colors flex-1 flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-white border-[#C2593F] shadow-sm'
                      : 'bg-white/75 border-[#3B155F]/12 hover:bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className={`font-semibold tabular-nums ${
                          isSelected ? 'text-[#C2593F]' : 'text-[#7A5A10]'
                        }`}
                      >
                        0{index + 1}. {reel.durationLabel}
                      </span>
                      <span className="text-[#665B73]">
                        {isSelected ? 'Selected' : 'Watch Reel'}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                      {reel.title}
                    </h3>
                    <p className="text-sm text-[#3E3349] leading-relaxed">{reel.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
