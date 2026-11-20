export interface PeerAudioSpeakerProfile {
  speakerId: string;
  genderHint: 'male' | 'female';
  rate: number;
  pitch: number;
  droneRoots: [number, number, number];
}

export const PEER_AUDIO_PROFILES: Record<string, PeerAudioSpeakerProfile> = {
  'story-david': {
    speakerId: 'story-david',
    genderHint: 'male',
    rate: 0.91,
    pitch: 0.88,
    droneRoots: [196.0, 246.94, 293.66], // Warm G major acoustic pad
  },
  'story-grace': {
    speakerId: 'story-grace',
    genderHint: 'female',
    rate: 0.9,
    pitch: 1.03,
    droneRoots: [220.0, 261.63, 329.63], // Soft A minor / C warm pad
  },
  'story-hassan': {
    speakerId: 'story-hassan',
    genderHint: 'male',
    rate: 0.92,
    pitch: 0.93,
    droneRoots: [174.61, 220.0, 261.63], // Gentle F major coastal warmth
  },
};

/**
 * Splits a peer story transcript into natural conversational breath phrases
 * so browser speech synthesis pauses gently like a human storyteller.
 */
export function splitHumanPhrases(transcript: string): string[] {
  return transcript
    .split(/(?<=[.!?—])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pickNaturalVoice(
  voices: SpeechSynthesisVoice[],
  genderHint: 'male' | 'female'
): SpeechSynthesisVoice | undefined {
  if (!voices.length) return undefined;
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const pool = english.length ? english : voices;

  const preferredKeywords =
    genderHint === 'female'
      ? ['kenya', 'nigeria', 'south africa', 'natural', 'samantha', 'serena', 'kate', 'libby', 'sonia', 'female', 'uk english female']
      : ['kenya', 'nigeria', 'south africa', 'natural', 'daniel', 'ryan', 'oliver', 'george', 'arthur', 'male', 'uk english male'];

  for (const kw of preferredKeywords) {
    const found = pool.find((v) => v.name.toLowerCase().includes(kw) || v.lang.toLowerCase().includes(kw));
    if (found) return found;
  }

  return pool[0];
}

export interface PeerStoryPlayerCallbacks {
  onPhraseChange: (phraseIndex: number) => void;
  onProgress: (percent: number) => void;
  onEnd: () => void;
}

/**
 * Plays a client-side zero-network spoken peer story combining natural breath-paused
 * voice narration with a barely-audible warm acoustic chord pad underneath.
 */
export class HumanPeerAudioController {
  private audioCtx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private oscs: OscillatorNode[] = [];
  private pauseTimer: ReturnType<typeof setTimeout> | null = null;
  private fallbackTimer: ReturnType<typeof setInterval> | null = null;
  private stopped = false;

  start(storyId: string, transcript: string, callbacks: PeerStoryPlayerCallbacks) {
    this.stop();
    this.stopped = false;

    const profile = PEER_AUDIO_PROFILES[storyId] || PEER_AUDIO_PROFILES['story-david'];
    const phrases = splitHumanPhrases(transcript);

    this.startWarmAcousticBed(profile.droneRoots);

    const hasSpeech =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined';

    if (!hasSpeech || phrases.length === 0) {
      this.runFallbackTimedCaptions(phrases, callbacks);
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore browser quirks
    }

    const voices = window.speechSynthesis.getVoices?.() || [];
    const chosenVoice = pickNaturalVoice(voices, profile.genderHint);

    let index = 0;
    const speakNext = () => {
      if (this.stopped) return;
      if (index >= phrases.length) {
        callbacks.onProgress(100);
        this.fadeOutAcousticBed();
        callbacks.onEnd();
        return;
      }

      const phrase = phrases[index];
      callbacks.onPhraseChange(index);
      callbacks.onProgress(Math.round(((index + 0.3) / phrases.length) * 100));

      const utterance = new SpeechSynthesisUtterance(phrase);
      if (chosenVoice) utterance.voice = chosenVoice;
      utterance.lang = chosenVoice?.lang || 'en-GB';
      // Slight human cadence variation across phrases
      utterance.rate = profile.rate + ((index % 2 === 0 ? -0.015 : 0.015));
      utterance.pitch = profile.pitch;
      utterance.volume = 0.96;

      let settled = false;
      const advanceAfterBreath = () => {
        if (settled || this.stopped) return;
        settled = true;
        index += 1;
        this.pauseTimer = setTimeout(speakNext, 420);
      };

      utterance.onend = advanceAfterBreath;
      utterance.onerror = () => {
        if (!settled && !this.stopped) {
          settled = true;
          this.runFallbackTimedCaptions(phrases.slice(index), callbacks, index, phrases.length);
        }
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        this.runFallbackTimedCaptions(phrases, callbacks);
      }
    };

    speakNext();
  }

  private runFallbackTimedCaptions(
    remaining: string[],
    callbacks: PeerStoryPlayerCallbacks,
    startOffset = 0,
    totalCount = remaining.length
  ) {
    if (this.fallbackTimer) clearInterval(this.fallbackTimer);
    let step = 0;
    const total = Math.max(1, totalCount);
    if (remaining.length === 0) {
      callbacks.onEnd();
      return;
    }

    callbacks.onPhraseChange(startOffset);
    callbacks.onProgress(Math.round(((startOffset + 1) / total) * 100));

    this.fallbackTimer = setInterval(() => {
      if (this.stopped) return;
      step += 1;
      const globalIdx = startOffset + step;
      if (globalIdx >= total) {
        if (this.fallbackTimer) clearInterval(this.fallbackTimer);
        this.fadeOutAcousticBed();
        callbacks.onProgress(100);
        callbacks.onEnd();
        return;
      }
      callbacks.onPhraseChange(globalIdx);
      callbacks.onProgress(Math.round(((globalIdx + 1) / total) * 100));
    }, 3600);
  }

  private startWarmAcousticBed(roots: [number, number, number]) {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 540;

      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.032, ctx.currentTime + 1.4);

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      const oscs = roots.map((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const subGain = ctx.createGain();
        subGain.gain.value = idx === 0 ? 0.5 : 0.25;
        osc.connect(subGain);
        subGain.connect(filter);
        osc.start();
        return osc;
      });

      this.audioCtx = ctx;
      this.droneGain = masterGain;
      this.oscs = oscs;
    } catch {
      // Safe fallback when Web Audio is unavailable
    }
  }

  private fadeOutAcousticBed() {
    if (!this.audioCtx || !this.droneGain) return;
    const ctx = this.audioCtx;
    const gain = this.droneGain;
    try {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      setTimeout(() => {
        this.oscs.forEach((o) => {
          try {
            o.stop();
          } catch {
            // ignore
          }
        });
        void ctx.close().catch(() => {});
        this.audioCtx = null;
        this.droneGain = null;
        this.oscs = [];
      }, 650);
    } catch {
      // ignore
    }
  }

  stop() {
    this.stopped = true;
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.fadeOutAcousticBed();
  }
}
