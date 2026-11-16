import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useColourMood } from '../context/ColourMoodContext';

export interface VideoSceneChapter {
  timeSeconds: number;
  label: string;
}

interface CommunityVideoPlayerProps {
  videoSrc: string;
  posterSrc: string;
  ariaLabel: string;
  soundMoodLabel: string;
  chapters?: VideoSceneChapter[];
  autoPlaySignal?: number;
}

const DEFAULT_CHAPTERS: VideoSceneChapter[] = [
  { timeSeconds: 0, label: '01 · Arrival' },
  { timeSeconds: 3.6, label: '02 · Community' },
  { timeSeconds: 7.0, label: '03 · Care & Hope' },
];

export function CommunityVideoPlayer({
  videoSrc,
  posterSrc,
  ariaLabel,
  soundMoodLabel,
  chapters = DEFAULT_CHAPTERS,
  autoPlaySignal = 0,
}: CommunityVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { activeGrade, gradingEnabled } = useColourMood();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;
    }
  }, [videoSrc]);

  useEffect(() => {
    if (!autoPlaySignal || !videoRef.current) return;
    videoRef.current.muted = false;
    videoRef.current.volume = volume;
    setIsMuted(false);
    void videoRef.current.play().catch(() => {});
  }, [autoPlaySignal, volume]);

  const togglePlayWithSound = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = isMuted;
      video.volume = volume;
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (video) {
      video.muted = nextMuted;
      if (!nextMuted && video.volume === 0) {
        video.volume = 0.85;
        setVolume(0.85);
      }
    }
  };

  const handleVolumeChange = (nextVol: number) => {
    setVolume(nextVol);
    const shouldMute = nextVol === 0;
    setIsMuted(shouldMute);
    if (videoRef.current) {
      videoRef.current.volume = nextVol;
      videoRef.current.muted = shouldMute;
    }
  };

  const jumpToChapter = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = seconds;
    video.muted = isMuted;
    video.volume = volume;
    void video.play().catch(() => {});
  };

  const activeChapterIdx = chapters.reduce((acc, ch, idx) => {
    return currentTime >= ch.timeSeconds - 0.15 ? idx : acc;
  }, 0);

  return (
    <div className="bg-[#160822] flex flex-col">
      <div className="aspect-video bg-black relative group overflow-hidden">
        <video
          ref={videoRef}
          key={videoSrc}
          controls
          playsInline
          preload="metadata"
          poster={posterSrc}
          aria-label={ariaLabel}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          style={
            gradingEnabled
              ? { filter: activeGrade.cssFilter, transition: 'filter 280ms ease' }
              : { transition: 'filter 280ms ease' }
          }
          className="w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support video playback.
        </video>

        {gradingEnabled && (
          <div
            aria-hidden="true"
            style={{ backgroundColor: activeGrade.overlayTint }}
            className="absolute inset-0 pointer-events-none transition-colors duration-300"
          />
        )}

        {!isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#160822]/70 via-[#160822]/25 to-transparent flex items-center justify-center pointer-events-none">
            <button
              type="button"
              onClick={togglePlayWithSound}
              className="pointer-events-auto inline-flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-[#160822] bg-[#D4AF37] hover:bg-[#E5CA7B] rounded-full shadow-lg transition-transform hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              Play Reel With Sound
            </button>
          </div>
        )}
      </div>

      {/* Interactive Sound, Audio Bar & Scene Chapter Toolbar */}
      <div className="px-4 py-3 bg-[#1A0A26] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#FAF7F2]">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={togglePlayWithSound}
            aria-label={isPlaying ? 'Pause story reel' : 'Play story reel with sound'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#3B155F] hover:bg-[#4C1D7A] text-[#FAF7F2] font-semibold transition-colors whitespace-nowrap"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#E5CA7B]" aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#E5CA7B]" aria-hidden="true" />
                Play
              </>
            )}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={!isMuted}
            aria-label={isMuted ? 'Unmute reel soundtrack' : 'Mute reel soundtrack'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold border transition-colors whitespace-nowrap ${
              !isMuted
                ? 'bg-[#256358] border-[#84B5A9]/40 text-white'
                : 'bg-white/5 border-white/20 text-[#FAF7F2]/80'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#F3D79B]" aria-hidden="true" />
            )}
            <span>{isMuted ? 'Muted' : 'Sound On'}</span>
          </button>

          <label className="hidden sm:inline-flex items-center gap-2 text-[#FAF7F2]/80">
            <span className="sr-only">Sound volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              aria-label="Adjust video sound volume"
              className="w-16 accent-[#D4AF37] cursor-pointer"
            />
          </label>

          {/* Animated playback sound spectrum bars (only active while playing unmuted) */}
          <div
            aria-hidden="true"
            className="hidden md:inline-flex items-end gap-0.5 h-4 px-1"
            title={soundMoodLabel}
          >
            {[0.45, 0.85, 0.6, 1, 0.5].map((h, i) => (
              <span
                key={i}
                style={{
                  height: isPlaying && !isMuted ? `${Math.round(h * 14)}px` : '4px',
                  transition: 'height 200ms ease',
                }}
                className={`w-0.5 rounded-full ${
                  isPlaying && !isMuted ? 'bg-[#E5CA7B] animate-pulse' : 'bg-white/25'
                }`}
              />
            ))}
          </div>
          <span className="hidden xl:inline text-[11px] text-[#E5CA7B]/90">{soundMoodLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Video scene chapters">
          {chapters.map((ch, idx) => (
            <button
              key={ch.label}
              type="button"
              onClick={() => jumpToChapter(ch.timeSeconds)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                idx === activeChapterIdx && isPlaying
                  ? 'bg-[#D4AF37] text-[#160822]'
                  : 'bg-white/8 text-[#FAF7F2]/80 hover:bg-white/15'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
