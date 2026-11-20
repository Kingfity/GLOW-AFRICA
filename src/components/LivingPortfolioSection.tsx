import { useEffect, useMemo, useState } from 'react';
import { Eye, Palette, SlidersHorizontal, X } from 'lucide-react';
import { useColourMood } from '../context/ColourMoodContext';
import { useSiteData } from '../context/SiteDataContext';
import { SafeImage } from './SafeImage';
import {
  buildPortfolioItemsFromSiteData,
  filterPortfolioItems,
  type PortfolioKind,
  type PortfolioVisualItem,
} from '../utils/careTools';

export function LivingPortfolioSection() {
  const { data } = useSiteData();
  const { gradeId, setGradeId, gradingEnabled, setGradingEnabled, activeGrade, presets } =
    useColourMood();
  const [kindFilter, setKindFilter] = useState<PortfolioKind>('All');
  const [selectedItem, setSelectedItem] = useState<PortfolioVisualItem | null>(null);

  const allItems = useMemo(
    () => buildPortfolioItemsFromSiteData(data?.impactProjects || [], data?.events || []),
    [data?.impactProjects, data?.events]
  );

  const kindFilters = useMemo<PortfolioKind[]>(() => {
    const hasUploads = allItems.some((item) => item.kind === 'Community Upload');
    return hasUploads
      ? ['All', 'Documentary Photo', 'Community Upload']
      : ['All', 'Documentary Photo'];
  }, [allItems]);

  const visibleItems = useMemo(
    () => filterPortfolioItems(allItems, kindFilter),
    [allItems, kindFilter]
  );

  useEffect(() => {
    if (!selectedItem) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedItem]);

  return (
    <section
      id="living-portfolio"
      aria-label="Community Visual Portfolio and Interactive Colour Grading"
      className="py-16 sm:py-24 bg-[#FAF7F2] border-b border-[#3B155F]/10"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
        {/* Header & Communicative Colour Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
              Curated Visual Portfolio · Growing With Community Moments
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Documentary Community Photography &amp; Colour That Communicates
            </h2>
            <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
              Explore lifelike 35mm documentary photography across Ruiru, children’s homes, special
              needs mothers’ circles, and listening rooms—alongside uploaded community photos from
              our Admin Portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setGradingEnabled(!gradingEnabled)}
              aria-pressed={gradingEnabled}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap ${
                gradingEnabled
                  ? 'bg-[#3B155F] border-[#3B155F] text-[#FAF7F2]'
                  : 'bg-white border-[#3B155F]/25 text-[#1E0B2B] hover:bg-[#F3EEF8]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E5CA7B]" aria-hidden="true" />
              {gradingEnabled ? 'Colour Grading: On' : 'Original Unfiltered View'}
            </button>
          </div>
        </div>

        {/* Interactive Colour Mood Bar */}
        <div className="bg-white border border-[#3B155F]/12 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#3B155F]">
              <Palette className="w-4 h-4 text-[#C2593F]" aria-hidden="true" />
              Interactive Site Colour Atmosphere
            </div>
            <p className="text-xs text-[#3E3349]">
              <span className="font-semibold text-[#1E0B2B]">{activeGrade.emotionLabel}:</span>{' '}
              {activeGrade.meaning}
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Choose communicative colour grading preset"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {presets.map((preset) => {
              const isSelected = gradeId === preset.id && gradingEnabled;
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setGradeId(preset.id);
                    setGradingEnabled(true);
                  }}
                  className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-[#FAF7F2] border-[#3B155F] shadow-sm'
                      : 'bg-white border-[#3B155F]/12 hover:border-[#C2593F]/45'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="w-8 h-8 rounded-md shrink-0 border border-black/10"
                    style={{
                      background: `linear-gradient(135deg, ${preset.swatchHex} 0%, ${preset.secondaryHex} 100%)`,
                    }}
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-[#1E0B2B] truncate">
                      {preset.label}
                    </span>
                    <span className="block text-[11px] text-[#665B73] truncate">
                      {preset.emotionLabel}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Portfolio Kind Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Filter visual portfolio by type"
            className="inline-flex flex-wrap gap-1.5 p-1 bg-white border border-[#3B155F]/15 rounded-lg self-start"
          >
            {kindFilters.map((kind) => {
              const active = kindFilter === kind;
              return (
                <button
                  key={kind}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setKindFilter(kind)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    active ? 'bg-[#3B155F] text-[#FAF7F2]' : 'text-[#3E3349] hover:text-[#1E0B2B]'
                  }`}
                >
                  {kind}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[#665B73] tabular-nums">
            Showing {visibleItems.length} curated frame{visibleItems.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Portfolio Grid */}
        <div
          key={kindFilter}
          className="tab-panel-smooth grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-[#3B155F]/12 rounded-xl overflow-hidden flex flex-col group"
            >
              <button
                type="button"
                onClick={() => setSelectedItem(item)}
                aria-label={`Inspect ${item.title} in colour studio lightbox`}
                className="relative aspect-[4/3] w-full overflow-hidden bg-[#1E0B2B] text-left focus-visible:outline-2"
              >
                <SafeImage
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                {gradingEnabled && (
                  <div
                    aria-hidden="true"
                    style={{ backgroundColor: activeGrade.overlayTint }}
                    className="absolute inset-0 pointer-events-none transition-colors duration-300"
                  />
                )}
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#160822]/80 text-[#FAF7F2] text-[11px] font-medium backdrop-blur-xs">
                  <Eye className="w-3 h-3 text-[#E5CA7B]" aria-hidden="true" />
                  Inspect &amp; Grade
                </span>
              </button>

              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-[#665B73]">
                    <span className="font-semibold text-[#C2593F]">{item.kind}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.location}</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#1E0B2B] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3E3349] leading-relaxed">
                    {item.caption}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#3B155F]/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGradeId(item.recommendedGrade);
                      setGradingEnabled(true);
                    }}
                    className="text-xs font-semibold text-[#3B155F] hover:text-[#C2593F] transition-colors"
                  >
                    {gradingEnabled && gradeId === item.recommendedGrade
                      ? 'Active Mood Applied'
                      : 'Apply Recommended Mood'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="text-xs font-semibold text-[#256358] hover:text-[#1E0B2B] transition-colors"
                  >
                    Open Full View
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Portfolio Inspection */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          className="fixed inset-0 z-50 bg-[#160822]/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black aspect-[16/10] overflow-hidden">
              <SafeImage
                src={selectedItem.src}
                alt={selectedItem.alt}
                className="w-full h-full object-contain"
              />
              {gradingEnabled && (
                <div
                  aria-hidden="true"
                  style={{ backgroundColor: activeGrade.overlayTint }}
                  className="absolute inset-0 pointer-events-none"
                />
              )}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close lightbox view"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#160822]/80 text-[#FAF7F2] hover:bg-[#C2593F] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[#C2593F]">
                    {selectedItem.kind} · {selectedItem.location}
                  </p>
                  <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                    {selectedItem.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setGradingEnabled(!gradingEnabled)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#3B155F] text-[#FAF7F2] rounded-md self-start sm:self-auto whitespace-nowrap"
                >
                  {gradingEnabled ? `Grade: ${activeGrade.label}` : 'Original Unfiltered'}
                </button>
              </div>
              <p className="text-sm text-[#3E3349] leading-relaxed">{selectedItem.caption}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setGradeId(p.id);
                      setGradingEnabled(true);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                      gradeId === p.id && gradingEnabled
                        ? 'bg-[#256358] border-[#256358] text-white'
                        : 'bg-white border-[#3B155F]/15 text-[#1E0B2B] hover:bg-[#F3EEF8]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
