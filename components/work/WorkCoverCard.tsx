'use client';

import Image from 'next/image';
import { cn } from '@/utils/styles';

interface WorkCoverCardProps {
  title: string;
  /** The small line over the title, e.g. "RFP · ResearchHub Foundation". */
  eyebrow?: string;
  imageUrl?: string;
  className?: string;
}

/**
 * A work's cover, small: its image with the title on a frosted bar, at the
 * top of the panels that act on it (fund, apply). Without an image the bar
 * sits on navy.
 */
export function WorkCoverCard({ title, eyebrow, imageUrl, className }: WorkCoverCardProps) {
  return (
    <div
      className={cn(
        'relative isolate h-[150px] overflow-hidden rounded-xl bg-[#0b1530]',
        className
      )}
    >
      {imageUrl && <Image src={imageUrl} alt="" fill className="object-cover" sizes="400px" />}
      <div className="absolute inset-x-0 bottom-0 border-t border-white/5 bg-black/50 px-3 pb-2.5 pt-2 backdrop-blur-xl backdrop-saturate-150">
        {eyebrow && (
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-white/80">
            {eyebrow}
          </p>
        )}
        {/* Never cut off: a long title grows the bar up over the image. */}
        <p className="mt-0.5 break-words text-[15px] font-extrabold leading-5 tracking-tight text-white">
          {title}
        </p>
      </div>
    </div>
  );
}
