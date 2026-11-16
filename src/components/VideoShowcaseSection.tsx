import { useState } from 'react';
import { ArrowRight, PlayCircle, Volume2 } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { CommunityVideoPlayer, type VideoSceneChapter } from './CommunityVideoPlayer';

interface StoryReel {
  id: string;
  title: string;
  subtitle: string;
  videoSrc: string;
  posterSrc: string;
  durationLabel: string;
  soundMoodLabel: string;
  chapters: VideoSceneChapter[];
  ctaLabel: string;
  ctaHref: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}

const STORY_REELS: StoryReel[] = [
  {
    id: 'homes',
    title: 'Children’s Homes & Corporate CSR Visits',
    subtitle:
      'See how companies, fellowships, and individual teams partner with verified children’s homes through reading circles, mentorship, and practical care packs.',
    videoSrc: '/videos/childrens_home_visits_reel.mp4',
    posterSrc: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
    durationLabel: '0:10 Reel · Acoustic Kalimba Audio',
    soundMoodLabel: 'Kalimba & Acoustic Chord',
    chapters: [
      { timeSeconds: 0, label: '01 · Reading Circle' },
      { timeSeconds: 3.6, label: '02 · Youth Mentors' },
      { timeSeconds: 7.0, label: '03 · Fresh Harvest' },
    ],
    ctaLabel: 'Plan a Children’s Home Visit',
    ctaHref: '/home-visits',
    accentBg: 'bg-[#FFF5EC]',
    accentBorder: 'border-[#C2593F]',
    accentText: 'text-[#C2593F]',
  },
  {
    id: 'rehab',
    title: 'Mental Health & Rehabilitation Pathways',
    subtitle:
      'Discover calm counselling rooms and partner restoration centres across regions—helping families connect with care closer to home.',
    videoSrc: '/videos/healing_and_recovery_reel.mp4',
    posterSrc: '/src/assets/images/doc_rehab_recovery_garden_1794832339842.jpg',
    durationLabel: '0:10 Reel · Serene Harp Audio',
    soundMoodLabel: 'Serene Harp & Pad',
    chapters: [
      { timeSeconds: 0, label: '01 · Garden Talk' },
      { timeSeconds: 3.6, label: '02 · Quiet Room' },
      { timeSeconds: 7.0, label: '03 · Safe Haven' },
    ],
    ctaLabel: 'Find Nearby Rehab & Counselling',
    ctaHref: '/rehabilitation',
    accentBg: 'bg-[#EAF6F2]',
    accentBorder: 'border-[#256358]',
    accentText: 'text-[#256358]',
  },
  {
    id: 'asd',
    title: 'ASD Parents, Kids & Safe Family Homes',
    subtitle:
      'Practical visual routines, sensory-kind spaces, and lifelike family care built around warmth, dignity, and everyday family peace.',
    videoSrc: '/videos/asd_and_family_home_reel.mp4',
    posterSrc: '/src/assets/images/doc_asd_family_moment_1794832339166.jpg',
    durationLabel: '0:10 Reel · Gentle Marimba Audio',
    soundMoodLabel: 'Warm Marimba Lullaby',
    chapters: [
      { timeSeconds: 0, label: '01 · Sensory Play' },
      { timeSeconds: 3.6, label: '02 · Family Home' },
      { timeSeconds: 7.0, label: '03 · Prayer Circle' },
    ],
    ctaLabel: 'Explore ASD Family Tips',
    ctaHref: '/asd-support',
    accentBg: 'bg-[#F4EEFA]',
    accentBorder: 'border-[#3B155F]',
    accentText: 'text-[#3B155F]',
  },
];

export function VideoShowcaseSection() {
  const [selectedId, setSelectedId] = useState<string>('homes');
  const [playSignal, setPlaySignal] = useState(0);
  const active = STORY_REELS.find((r) => r.id === selectedId) || STORY_REELS[0];

  const handleSelectAndPlay = (id: string) => {
    setSelectedId(id);
    setPlaySignal((prev) => prev + 1);
  };

  return (
    <section
      aria-label="Community stories in motion"
      className="py-16 sm:py-24 bg-gradient-to-br from-[#FDF6EE] via-[#FAF7F2] to-[#F3EEF8] border-y border-[#C2593F]/15"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
              Life in Community · Multi-Scene Video Reels With Sound
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              See the Care Family Home in Motion
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              Watch realistic multi-scene stories of our children’s home visits, counselling &amp;
              rehabilitation gardens, and ASD family care—complete with custom warm soundtracks and
              interactive scene chapters.
            </p>
          </div>
          <p className="text-xs text-[#256358] font-semibold tabular-nums inline-flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-[#C2593F]" aria-hidden="true" />
            Click any reel or press Play to listen
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Active Interactive Video Player with Sound */}
          <div className="lg:col-span-7 bg-[#160822] rounded-xl overflow-hidden border border-[#3B155F]/20 flex flex-col">
            <CommunityVideoPlayer
              videoSrc={active.videoSrc}
              posterSrc={active.posterSrc}
              ariaLabel={active.title}
              soundMoodLabel={active.soundMoodLabel}
              chapters={active.chapters}
              autoPlaySignal={playSignal}
            />
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1E0B2B] via-[#2C1042] to-[#3B155F] text-[#FAF7F2]">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#E5CA7B] tabular-nums inline-flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
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
                  onClick={() => handleSelectAndPlay(reel.id)}
                  aria-pressed={isSelected}
                  className={`text-left p-5 sm:p-6 rounded-xl border transition-all flex-1 flex flex-col justify-between gap-2 ${
                    isSelected
                      ? `${reel.accentBg} ${reel.accentBorder} shadow-sm`
                      : 'bg-white/85 border-[#3B155F]/12 hover:bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className={`font-semibold tabular-nums ${
                          isSelected ? reel.accentText : 'text-[#7A5A10]'
                        }`}
                      >
                        0{index + 1}. {reel.durationLabel}
                      </span>
                      <span className={isSelected ? reel.accentText : 'text-[#665B73]'}>
                        {isSelected ? 'Selected · Sound Ready' : 'Play With Sound'}
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
