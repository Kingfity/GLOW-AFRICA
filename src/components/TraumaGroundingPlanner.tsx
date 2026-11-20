import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Printer, RotateCcw, SunMedium } from 'lucide-react';
import {
  addCustomAnchorStep,
  getTraumaAnchorPreset,
  toggleAnchorStep,
  type AnchorMode,
  type TraumaAnchorStep,
} from '../utils/careTools';

const MODE_LABELS: Array<{ id: AnchorMode; label: string }> = [
  { id: 'morning-steady', label: 'Morning Nervous System Steady' },
  { id: 'panic-reset', label: 'Acute Stress & Panic Reset' },
  { id: 'evening-unload', label: 'Trauma Memory & Sleep Unload' },
];

const CARD_PALETTES = [
  { idle: 'bg-[#FFF5EC] border-[#E8B288] hover:border-[#C2593F]', accent: 'text-[#C2593F]' },
  { idle: 'bg-[#EAF6F2] border-[#9FD0C3] hover:border-[#256358]', accent: 'text-[#256358]' },
  { idle: 'bg-[#EEF3FB] border-[#A7BCE4] hover:border-[#355796]', accent: 'text-[#355796]' },
  { idle: 'bg-[#F4EEFA] border-[#C5B0DF] hover:border-[#3B155F]', accent: 'text-[#3B155F]' },
];

export function TraumaGroundingPlanner() {
  const [mode, setMode] = useState<AnchorMode>('morning-steady');
  const [steps, setSteps] = useState<TraumaAnchorStep[]>(() =>
    getTraumaAnchorPreset('morning-steady')
  );
  const [customTitle, setCustomTitle] = useState('');

  const switchMode = (nextMode: AnchorMode) => {
    setMode(nextMode);
    setSteps(getTraumaAnchorPreset(nextMode));
  };

  const handleToggle = (id: string) => {
    setSteps((prev) => toggleAnchorStep(prev, id));
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTitle.trim().length < 2) return;
    setSteps((prev) => addCustomAnchorStep(prev, customTitle));
    setCustomTitle('');
  };

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <section
      aria-label="Trauma, Stress and Emotional Grounding Planner"
      className="py-16 sm:py-20 bg-gradient-to-b from-white via-[#FBFDFC] to-[#F4FAF8] border-b border-[#256358]/15"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F] inline-flex items-center gap-1.5">
              <SunMedium className="w-3.5 h-3.5" aria-hidden="true" />
              Somatic &amp; Trauma-Informed Grounding Plan
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Trauma, Stress &amp; Emotional Grounding Planner
            </h2>
            <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
              When trauma flashbacks, panic attacks, caregiver burnout, or sleepless stress overwhelm
              your nervous system, predictable 4-4-6 grounding steps help steady the body. Pick your
              moment below or print a copy for home.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => switchMode(mode)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#3E3349] border border-[#3B155F]/20 rounded-md hover:bg-[#FAF7F2] transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset Steps
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#256358] hover:bg-[#1C4D44] rounded-md transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              Print Grounding Sheet
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Select quiet daily rhythm moment"
            className="inline-flex flex-wrap gap-1.5 p-1 bg-[#E7F3EF] border border-[#256358]/20 rounded-lg self-start"
          >
            {MODE_LABELS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mode === tab.id}
                onClick={() => switchMode(tab.id)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                  mode === tab.id
                    ? 'bg-[#256358] text-white'
                    : 'text-[#256358] hover:bg-white/75'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <p className="text-xs sm:text-sm font-semibold text-[#256358] tabular-nums">
            {completedCount} of {steps.length} gentle pauses practised today
          </p>
        </div>

        <div
          key={mode}
          className="tab-panel-smooth grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {steps.map((step, index) => {
            const palette = CARD_PALETTES[index % CARD_PALETTES.length];
            return (
              <button
                key={step.id}
                type="button"
                aria-pressed={step.done}
                onClick={() => handleToggle(step.id)}
                className={`text-left rounded-xl p-5 border transition-all duration-150 flex flex-col justify-between gap-4 ${
                  step.done
                    ? 'bg-[#256358] border-[#256358] text-white shadow-sm'
                    : `${palette.idle} text-[#1E0B2B]`
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider tabular-nums ${
                        step.done ? 'text-[#E5CA7B]' : palette.accent
                      }`}
                    >
                      {step.timeHint}
                    </span>
                    {step.done ? (
                      <CheckCircle2 className="w-5 h-5 text-[#E5CA7B] shrink-0" aria-hidden="true" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#665B73]/60 shrink-0" aria-hidden="true" />
                    )}
                  </div>
                  <h3
                    className={`font-serif text-xl font-semibold leading-snug ${
                      step.done ? 'line-through text-white/90' : 'text-[#1E0B2B]'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      step.done ? 'text-white/85' : 'text-[#3E3349]'
                    }`}
                  >
                    {step.gentleCue}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    step.done ? 'text-[#F3D79B]' : palette.accent
                  }`}
                >
                  {step.done ? 'Practised calmly' : 'Tap when ready'}
                </span>
              </button>
            );
          })}
        </div>

        <form
          onSubmit={handleAddStep}
          className="flex flex-col sm:flex-row gap-3 pt-2 max-w-2xl print:hidden"
        >
          <label htmlFor="mh-custom-anchor" className="sr-only">
            Add your own quiet pause or tea-time anchor step
          </label>
          <input
            id="mh-custom-anchor"
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Add a personal rhythm (e.g. Tea on veranda or 10 mins quiet prayer)"
            maxLength={70}
            className="flex-1 px-4 py-2.5 text-sm bg-white border border-[#256358]/25 rounded-md"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-[#C2593F] hover:bg-[#A64831] rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add My Rhythm
          </button>
        </form>
      </div>
    </section>
  );
}
