import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Printer, RotateCcw, SunMedium } from 'lucide-react';
import {
  addCustomRoutineStep,
  getAsdRoutinePreset,
  toggleRoutineStep,
  type AsdRoutineStep,
  type RoutineMode,
} from '../utils/careTools';

const MODE_LABELS: Array<{ id: RoutineMode; label: string }> = [
  { id: 'morning', label: 'Morning Start' },
  { id: 'after-school', label: 'After School Transition' },
  { id: 'bedtime', label: 'Bedtime Wind-Down' },
];

const CARD_PALETTES = [
  { idle: 'bg-[#FFF5EC] border-[#E8B288] hover:border-[#C2593F]', accent: 'text-[#C2593F]' },
  { idle: 'bg-[#EAF6F2] border-[#9FD0C3] hover:border-[#256358]', accent: 'text-[#256358]' },
  { idle: 'bg-[#EEF3FB] border-[#A7BCE4] hover:border-[#355796]', accent: 'text-[#355796]' },
  { idle: 'bg-[#F4EEFA] border-[#C5B0DF] hover:border-[#3B155F]', accent: 'text-[#3B155F]' },
];

export function AsdRoutineBuilder() {
  const [mode, setMode] = useState<RoutineMode>('morning');
  const [steps, setSteps] = useState<AsdRoutineStep[]>(() => getAsdRoutinePreset('morning'));
  const [customTitle, setCustomTitle] = useState('');

  const switchMode = (nextMode: RoutineMode) => {
    setMode(nextMode);
    setSteps(getAsdRoutinePreset(nextMode));
  };

  const handleToggle = (id: string) => {
    setSteps((prev) => toggleRoutineStep(prev, id));
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTitle.trim().length < 2) return;
    setSteps((prev) => addCustomRoutineStep(prev, customTitle));
    setCustomTitle('');
  };

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <section
      aria-label="Interactive ASD Visual Routine Builder"
      className="py-16 sm:py-20 bg-gradient-to-b from-white via-[#FBFDFC] to-[#F4FAF8] border-b border-[#256358]/15"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F] inline-flex items-center gap-1.5">
              <SunMedium className="w-3.5 h-3.5" aria-hidden="true" />
              Interactive Parent &amp; Child Tool
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
              Visual Daily Routine &amp; Calm Card Builder
            </h2>
            <p className="text-sm sm:text-base text-[#3E3349] leading-relaxed">
              Predictable colour-coded steps lower sensory surprise. Pick a time of day, tap cards
              together as your child completes them, add your family’s own comfort step, or print a
              calm wall chart.
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
              Print Visual Sheet
            </button>
          </div>
        </div>

        {/* Time-of-day selector + live completion counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Select routine time of day"
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
            {completedCount} of {steps.length} gentle steps checked off
          </p>
        </div>

        {/* Colourful visual routine cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  {step.done ? 'Completed calmly' : 'Tap when ready'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add custom comfort step */}
        <form
          onSubmit={handleAddStep}
          className="flex flex-col sm:flex-row gap-3 pt-2 max-w-2xl print:hidden"
        >
          <label htmlFor="asd-custom-step" className="sr-only">
            Add your child’s comfort or routine step
          </label>
          <input
            id="asd-custom-step"
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Add a custom comforting step (e.g. Hug blue teddy or 5 mins on swing)"
            maxLength={70}
            className="flex-1 px-4 py-2.5 text-sm bg-white border border-[#256358]/25 rounded-md"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-[#C2593F] hover:bg-[#A64831] rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Family Step
          </button>
        </form>
      </div>
    </section>
  );
}
