import { useEffect, useRef, useState } from 'react';
import { Feather, Pause, Play, RotateCcw, Volume2, VolumeX, Wind } from 'lucide-react';
import { getBreathPhaseAtSecond } from '../utils/careTools';

function playSoftBreathChime(freq: number) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.95);
    window.setTimeout(() => {
      void ctx.close().catch(() => {});
    }, 1100);
  } catch {
    // Ignore autoplay or WebAudio restrictions
  }
}

export function CalmBreathWidget() {
  const [running, setRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [privateNote, setPrivateNote] = useState('');
  const [releasedMessage, setReleasedMessage] = useState(false);
  const lastPhaseRef = useRef<string>('');

  useEffect(() => {
    if (!running) {
      lastPhaseRef.current = '';
      return;
    }
    const timer = window.setInterval(() => {
      setElapsed((prev) => (prev >= 59 ? 0 : prev + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const cycle = getBreathPhaseAtSecond(elapsed);

  useEffect(() => {
    if (!running || !soundEnabled) return;
    if (lastPhaseRef.current !== cycle.phase) {
      lastPhaseRef.current = cycle.phase;
      const freq =
        cycle.phase === 'Inhale Slowly' ? 392 : cycle.phase === 'Hold Gently' ? 440 : 329.63;
      playSoftBreathChime(freq);
    }
  }, [running, soundEnabled, cycle.phase]);

  const handleReleaseWeight = () => {
    if (!privateNote.trim()) return;
    setPrivateNote('');
    setReleasedMessage(true);
    if (soundEnabled) playSoftBreathChime(523.25);
  };

  return (
    <section
      aria-label="Calm Breathing and Private Burden Release"
      className="py-12 sm:py-16 bg-gradient-to-r from-[#F4EEFA] via-[#FDF4EA] to-[#EBF6F2] border-b border-[#3B155F]/12"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: 60-Second Guided Grounding Breath with Chime Sound */}
        <div className="lg:col-span-6 bg-white border border-[#3B155F]/16 rounded-xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#256358] inline-flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5" aria-hidden="true" />
                Immediate Grounding · 4–4–6 Rhythm
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
                Pause for a 60-Second Calm Breath
              </h2>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                Before typing or calling, give your shoulders and heart one slow minute to settle.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? 'Mute calm breathing chime' : 'Enable calm breathing chime'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors shrink-0 ${
                soundEnabled
                  ? 'bg-[#EAF6F2] border-[#256358]/30 text-[#256358]'
                  : 'bg-[#FAF7F2] border-[#3B155F]/15 text-[#665B73]'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{soundEnabled ? 'Chime On' : 'Muted'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <div
                style={{
                  transform: `scale(${running ? cycle.scale : 1})`,
                  transition: 'transform 900ms ease-in-out',
                }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3B155F]/18 via-[#D4AF37]/25 to-[#256358]/20 border border-[#3B155F]/35 flex items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3B155F] to-[#256358] text-[#FAF7F2] flex items-center justify-center text-sm font-semibold tabular-nums shadow-sm">
                  {running ? `${cycle.phaseRemainingSeconds}s` : '4·4·6'}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <p
                role="status"
                aria-live="polite"
                className="font-serif text-2xl font-semibold text-[#3B155F]"
              >
                {running ? cycle.phase : 'Ready When You Are'}
              </p>
              <p className="text-xs text-[#665B73] tabular-nums">
                {running
                  ? `Follow the circle: ${cycle.phase.toLowerCase()} (${elapsed}s / 60s)`
                  : 'Inhale 4s · Hold 4s · Exhale 6s'}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => setRunning((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md transition-colors whitespace-nowrap"
                >
                  {running ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      Pause Breath
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      Start Calm Breath
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRunning(false);
                    setElapsed(0);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#3B155F] border border-[#3B155F]/20 rounded-md hover:bg-[#F3EEF8] transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Strictly Local Burden Release Space */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#FFF6EE] to-[#FDECE0] border border-[#C2593F]/25 rounded-xl p-6 sm:p-8 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F] inline-flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5" aria-hidden="true" />
              Private Local Release · Never Stored
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E0B2B]">
              Write What Feels Heavy &amp; Let It Go
            </h2>
            <p className="text-sm text-[#3E3349] leading-relaxed">
              Sometimes naming a fear or grief in words helps lighten the weight. Anything typed in
              this box stays strictly in your browser and clears permanently when released—if you
              want a counsellor to reply, use the confidential form below.
            </p>
          </div>

          <div className="space-y-3">
            <label htmlFor="local-burden-release" className="sr-only">
              Write what is weighing on your mind to release privately
            </label>
            <textarea
              id="local-burden-release"
              rows={3}
              value={privateNote}
              onChange={(e) => {
                setPrivateNote(e.target.value);
                if (releasedMessage) setReleasedMessage(false);
              }}
              placeholder="Write freely what is weighing on your heart right now..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#C2593F]/25 rounded-md leading-relaxed"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReleaseWeight}
                disabled={!privateNote.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#FAF7F2] bg-[#C2593F] hover:bg-[#A64831] disabled:opacity-50 rounded-md transition-colors whitespace-nowrap"
              >
                Release This Weight Gently
              </button>
              {releasedMessage && (
                <p role="status" className="text-xs font-medium text-[#256358]">
                  Cleared privately. Take another deep breath—help is right below whenever needed.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
