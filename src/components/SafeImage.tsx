import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
}

export function SafeImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  aspectClass = '',
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#2C1042] text-[#E5CA7B] px-6 text-center ${aspectClass} ${className}`}
      >
        <ImageIcon className="w-7 h-7 mb-2 opacity-80" aria-hidden="true" />
        <span className="text-xs font-medium tracking-wide text-[#FAF7F2]/85 max-w-xs">
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
      className={className}
    />
  );
}
