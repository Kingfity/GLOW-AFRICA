import { useEffect, useState } from 'react';
import { useColourMood } from '../context/ColourMoodContext';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  disableMoodGrade?: boolean;
}

export function SafeImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  aspectClass = '',
  disableMoodGrade = false,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const { activeGrade, gradingEnabled } = useColourMood();

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#2C1042] via-[#3B155F] to-[#8C5B0A] text-[#E5CA7B] px-6 text-center ${aspectClass} ${className}`}
      >
        <svg
          width="54"
          height="54"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className="mb-2 opacity-90"
        >
          <path
            d="M10 31L32 13L54 31"
            stroke="#E5CA7B"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 50V30H47V50H17Z"
            fill="rgba(250, 247, 242, 0.08)"
            stroke="#FAF7F2"
            strokeWidth="1.6"
          />
          <circle cx="32" cy="36" r="6" fill="#F3A683" fillOpacity="0.8" />
        </svg>
        <span className="text-xs font-medium tracking-wide text-[#FAF7F2]/90 max-w-xs">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={
        !disableMoodGrade && gradingEnabled
          ? { filter: activeGrade.cssFilter, transition: 'filter 280ms ease' }
          : { transition: 'filter 280ms ease' }
      }
      className={className}
    />
  );
}
