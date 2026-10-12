'use client';

import { FC } from 'react';
import Image from 'next/image';
import { Logo } from '@/components/ui/Logo';

interface WorkCoverArtProps {
  imageUrl?: string;
  title: string;
  /** Stand in for a missing image with the publisher's logo. */
  brand?: 'researchhub';
  /** Render a gradient placeholder when no image is available. */
  showPlaceholder?: boolean;
  sizes?: string;
}

/**
 * The art behind a work card: the cover image, or a stand-in when there is none.
 * Fills its positioned parent; the parent owns the size and the corners.
 */
export const WorkCoverArt: FC<WorkCoverArtProps> = ({
  imageUrl,
  title,
  brand,
  showPlaceholder = true,
  sizes = '(max-width: 640px) 100vw, 600px',
}) => {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes={sizes}
      />
    );
  }

  if (brand === 'researchhub') {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center pb-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(57,113,255,0.45) 0%, transparent 60%), ' +
            'linear-gradient(135deg, #0b1530 0%, #12224a 55%, #16305f 100%)',
        }}
      >
        <Logo variant="white" size={26} className="opacity-95" />
      </div>
    );
  }

  if (showPlaceholder) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 25% 35%, rgba(251,146,60,0.55) 0%, transparent 50%), ' +
            'radial-gradient(ellipse at 55% 55%, rgba(59,130,246,0.45) 0%, transparent 45%), ' +
            'radial-gradient(ellipse at 80% 20%, rgba(244,63,94,0.35) 0%, transparent 40%), ' +
            'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      />
    );
  }

  return <div className="absolute inset-0 bg-gray-800" />;
};
