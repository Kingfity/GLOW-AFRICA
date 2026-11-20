import { useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { SafeImage } from './SafeImage';

interface FieldStory {
  id: string;
  tag: string;
  title: string;
  location: string;
  readTime: string;
  photoSrc: string;
  photoAlt: string;
  excerpt: string;
  fullNote: string;
  ctaLabel: string;
  ctaHref: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}

const WRITTEN_FIELD_STORIES: FieldStory[] = [
  {
    id: 'homes',
    tag: '01 · Children’s Homes & Inclusive Schools',
    title: 'Children’s Homes & Corporate CSR Mentorship Visits',
    location: 'Kiambu, Nairobi & 47-County Partner Homes',
    readTime: '3 min written story',
    photoSrc: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
    photoAlt:
      'Kenyan volunteers and smiling children reading storybooks on woven mats beneath courtyard trees',
    excerpt:
      'How companies, fellowships, and neighbour groups sit beside house mothers for unhurried reading circles, mentorship, and practical staples.',
    fullNote:
      'Instead of brief drop-off visits that leave house mothers with unsorted bags, His & Hers Circle of Hope pairs visiting individuals, schools, and corporate teams with each partner home’s exact priority list—whether maize flour, Braille paper, shoes, or quiet tutoring hours under courtyard shade.',
    ctaLabel: 'Plan a Children’s Home Visit',
    ctaHref: '/home-visits',
    accentBg: 'bg-[#FFF5EC]',
    accentBorder: 'border-[#C2593F]',
    accentText: 'text-[#C2593F]',
  },
  {
    id: 'special-needs',
    tag: '02 · Special Needs Kids, Mothers & Guardians',
    title: 'Standing Directly With Mothers & Sole Guardians',
    location: 'Ruiru, Thika & All 47 Counties',
    readTime: '3 min written story',
    photoSrc: '/src/assets/images/special_needs_mother_care_1795102206738.jpg',
    photoAlt:
      'Kenyan mother sitting warmly beside her smiling young child in wooden therapy seating with sensory blocks',
    excerpt:
      'Talking directly with single mothers, sole fathers, and two-parent families raising differently abled children—with respite care, care kits, and school bridges.',
    fullNote:
      'Single mothers and primary guardians carrying every physiotherapy clinic queue, sleepless night, and transport fare often never hear anyone ask how they themselves are coping. Our Special Needs Families wing connects guardians straight to sister-to-sister check-ins, unga and diaper relief bundles, respite hours, and county EARS inclusive schools.',
    ctaLabel: 'Open Special Needs Families Hub',
    ctaHref: '/special-needs-families',
    accentBg: 'bg-[#FDF6E2]',
    accentBorder: 'border-[#D4AF37]',
    accentText: 'text-[#7A5A10]',
  },
  {
    id: 'trauma-healing',
    tag: '03 · Mental Health, Trauma & Stress Healing',
    title: 'Mental Health, Trauma & Stress Listening Rooms',
    location: 'Ruiru & Karen Confidential Listening Rooms',
    readTime: '3 min written story',
    photoSrc: '/src/assets/images/trauma_calm_listening_1795094868840.jpg',
    photoAlt:
      'Two Kenyan adults sitting calmly across a wooden table over warm tea in a quiet sunlit room',
    excerpt:
      'Trauma-informed listening, 4-4-6 nervous-system grounding plans, and stigma-free conversations for adults, youth, and exhausted caregivers.',
    fullNote:
      'Chronic anxiety, shock from past violence or loss, and heavy sleeplessness stay hidden behind polite smiles. Our trauma and mental health desk offers practical grounding tools alongside private tea-table conversations and trained Kenyan helpline pathways.',
    ctaLabel: 'Open Mental Health & Trauma Desk',
    ctaHref: '/mental-health',
    accentBg: 'bg-[#EAF6F2]',
    accentBorder: 'border-[#256358]',
    accentText: 'text-[#256358]',
  },
  {
    id: 'ruiru-circle',
    tag: '04 · Ruiru Roots & Mothers Support Circles',
    title: 'Neighbour-to-Neighbour Bread, Blankets & Recovery Care',
    location: 'Four Ruiru Wards & Regional Bridges (Est. 2025)',
    readTime: '3 min written story',
    photoSrc: '/src/assets/images/mothers_support_circle_1795102208113.jpg',
    photoAlt:
      'Three Kenyan mothers and guardians speaking empathetically around a garden tea table beneath shade trees',
    excerpt:
      'Walking four Ruiru wards since 2025 with Nancy Kariuki and the GLOW Prayer Movement—blankets for elders, unga for Ruiru Boys, and Nov 28 Christmas of Hope.',
    fullNote:
      'In Ruiru, our Christian faith moved us to ensure an elder living alone knows whom to call and a family battling substance recovery or grief meets steady friends after outreach day ends. Every story here is shared in writing to honour privacy and unhurried reflection.',
    ctaLabel: 'Read Our Ruiru Origin Story',
    ctaHref: '/about',
    accentBg: 'bg-[#F4EEFA]',
    accentBorder: 'border-[#3B155F]',
    accentText: 'text-[#3B155F]',
  },
];

export function VideoShowcaseSection() {
  const [selectedId, setSelectedId] = useState<string>('homes');
  const active =
    WRITTEN_FIELD_STORIES.find((r) => r.id === selectedId) || WRITTEN_FIELD_STORIES[0];

  return (
    <section
      aria-label="Community stories from the field"
      className="py-16 sm:py-24 bg-gradient-to-br from-[#FDF6EE] via-[#FAF7F2] to-[#F3EEF8] border-y border-[#C2593F]/15"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
              Stories From Our Circle · Written Field Notes
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Read How Care Unfolds Across Every Pathway
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              Quietly explore written field stories from our children’s home visits, special needs
              mothers’ circles, trauma &amp; mental health listening rooms, and Ruiru ward walks.
            </p>
          </div>
          <p className="text-xs text-[#256358] font-semibold inline-flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#C2593F]" aria-hidden="true" />
            Written documentary stories · Select any chapter to read
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Active Written Story Card with Smooth Transition */}
          <div
            key={active.id}
            className="tab-panel-smooth lg:col-span-7 bg-white rounded-xl overflow-hidden border border-[#3B155F]/15 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/10] bg-[#160822] overflow-hidden">
                <SafeImage
                  src={active.photoSrc}
                  alt={active.photoAlt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#665B73]">
                  <span className="font-semibold text-[#C2593F]">{active.tag}</span>
                  <span>
                    {active.location} · {active.readTime}
                  </span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B] leading-snug">
                  {active.title}
                </h3>
                <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
                  {active.fullNote}
                </p>
              </div>
            </div>

            <div className="px-6 sm:px-8 pb-6 pt-3 border-t border-[#3B155F]/10 flex flex-wrap items-center justify-between gap-4 bg-[#FAF7F2]">
              <span className="text-xs font-medium text-[#665B73]">
                His &amp; Hers Circle of Hope · Field Journal
              </span>
              <AppLink
                href={active.ctaHref}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold bg-[#3B155F] text-[#FAF7F2] hover:bg-[#2C1042] rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                {active.ctaLabel}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </AppLink>
            </div>
          </div>

          {/* Story Chapter Selector List */}
          <div
            role="tablist"
            aria-label="Select a written community story"
            className="lg:col-span-5 flex flex-col justify-between gap-3.5"
          >
            {WRITTEN_FIELD_STORIES.map((story) => {
              const isSelected = story.id === active.id;
              return (
                <button
                  key={story.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedId(story.id)}
                  className={`text-left p-5 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? `${story.accentBg} ${story.accentBorder} shadow-sm`
                      : 'bg-white/90 border-[#3B155F]/12 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                    <span className={isSelected ? story.accentText : 'text-[#7A5A10]'}>
                      {story.tag}
                    </span>
                    <span className="text-[#665B73]">{story.readTime}</span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#1E0B2B]">
                    {story.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3E3349] leading-relaxed">
                    {story.excerpt}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
