'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Coins, Heart } from 'lucide-react';
import { cn } from '@/utils/styles';

/** Where each rising heart starts, its size, color and timing, and how far it drifts. */
const HEARTS = [
  { left: 8, size: 10, delay: 0, duration: 2.6, drift: 8, color: 'text-rose-300' },
  { left: 18, size: 14, delay: 1.2, duration: 3, drift: -6, color: 'text-rose-400' },
  { left: 29, size: 9, delay: 0.6, duration: 2.4, drift: 5, color: 'text-pink-300' },
  { left: 68, size: 12, delay: 1.8, duration: 2.8, drift: -8, color: 'text-pink-400' },
  { left: 79, size: 9, delay: 0.3, duration: 2.5, drift: 6, color: 'text-rose-300' },
  { left: 89, size: 13, delay: 1.5, duration: 3.1, drift: -5, color: 'text-rose-400' },
];

/**
 * The card behind the pool's info button: hearts rising past a coin that
 * pulses, over whatever explains the pool. Without motion it is a still coin.
 */
export function FundingPoolTip({ children }: { children: ReactNode }) {
  return (
    <div className="text-left">
      <div
        aria-hidden="true"
        className="relative h-20 overflow-hidden bg-gradient-to-b from-emerald-50 to-white"
      >
        {HEARTS.map((heart, i) => (
          <Heart
            key={i}
            className={cn(
              'absolute bottom-0 animate-heart-rise fill-current motion-reduce:hidden',
              heart.color
            )}
            style={
              {
                left: `${heart.left}%`,
                width: heart.size,
                height: heart.size,
                animationDelay: `${heart.delay}s`,
                animationDuration: `${heart.duration}s`,
                '--drift': `${heart.drift}px`,
              } as CSSProperties
            }
          />
        ))}
        <span className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute inset-0 animate-radiate rounded-full bg-emerald-200/70 motion-reduce:hidden" />
          <span className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.5)] ring-1 ring-emerald-100">
            <Coins className="h-5 w-5 text-green-600" />
          </span>
        </span>
      </div>
      <div className="px-4 pb-3.5 pt-1">{children}</div>
    </div>
  );
}
