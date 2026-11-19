'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/utils/styles';
import { formatDateShort, formatUsd, formatUsdShort, type RfpView } from '../data/rfp';
import { AddToPoolButton, SubmitProposalButton } from './OrchActions';
import { BackerFaces, PoolBar } from './PoolPanel';

/**
 * Both actions and the pool's progress, pinned to the bottom of the screen.
 * It shows as soon as the hero's buttons (marked `data-orch-hero-cta`) scroll
 * off screen and stays for the rest of the page. A floating bar on wide
 * screens, a full-width bar on phones.
 */
export function ActionDock({ rfp }: { rfp: RfpView }) {
  const [ctaInView, setCtaInView] = useState(true);

  useEffect(() => {
    const hero = document.querySelector('[data-orch-hero-cta]');
    if (!hero) {
      setCtaInView(false);
      return;
    }
    const io = new IntersectionObserver(([e]) => setCtaInView(e.isIntersecting), {
      threshold: 0,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const pool = rfp;

  return (
    <div
      className={cn(
        'pointer-events-none sticky bottom-0 z-40 flex justify-center transition-[transform,opacity] duration-500 ease-out tablet:bottom-5 tablet:px-6',
        ctaInView ? 'translate-y-[130%] opacity-0' : 'translate-y-0 opacity-100'
      )}
      aria-hidden={ctaInView}
      inert={ctaInView}
    >
      {/* Wide screens: a floating bar. */}
      <div className="pointer-events-auto hidden w-full max-w-[920px] items-center gap-4 rounded-full border border-[color:rgb(var(--o-gold-rgb)/0.3)] bg-[rgb(var(--o-ink2-rgb)/0.96)] py-2.5 pl-2.5 pr-2.5 shadow-[0_18px_50px_-14px_rgb(var(--o-text-rgb)/0.45),0_0_0_4px_rgb(var(--o-gold-rgb)/0.06)] backdrop-blur-xl tablet:flex">
        <span className="pl-2">
          <BackerFaces rfp={rfp} size={30} max={4} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] leading-tight text-[var(--o-soft)]">
            <span className="font-semibold tabular-nums text-[var(--o-text)]">
              {formatUsd(pool.raisedUsd)}
            </span>{' '}
            raised toward {formatUsdShort(pool.goalUsd)}
            <span className="mx-2 opacity-50">·</span>
            Phase 1 ends {formatDateShort(pool.goalBy)}
          </p>
          <PoolBar rfp={rfp} className="mt-2 h-1.5 max-w-[300px]" />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <SubmitProposalButton size="sm" className="h-11 px-5" />
          <AddToPoolButton size="md" />
        </div>
      </div>

      {/* Phones: a full-width bar. */}
      <div className="pointer-events-auto w-full border-t border-[color:rgb(var(--o-gold-rgb)/0.3)] bg-[rgb(var(--o-ink2-rgb)/0.97)] px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-12px_32px_-12px_rgb(var(--o-text-rgb)/0.3)] backdrop-blur-xl tablet:hidden">
        <p className="mb-2 flex items-center justify-between text-[12px] text-[var(--o-mute)]">
          <span>
            <span className="font-semibold tabular-nums text-[var(--o-text)]">
              {formatUsdShort(pool.raisedUsd)}
            </span>{' '}
            raised toward {formatUsdShort(pool.goalUsd)}
          </span>
          <span>Phase 1 ends {formatDateShort(pool.goalBy)}</span>
        </p>
        <PoolBar rfp={rfp} className="mb-2.5 h-1" />
        <div className="flex gap-2">
          <AddToPoolButton size="md" className="flex-[3] px-3" />
          <SubmitProposalButton size="md" className="flex-[2] px-3" label="Propose" />
        </div>
      </div>
    </div>
  );
}
