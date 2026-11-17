'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/utils/styles';
import {
  ORCH_OR_RFP,
  deadlineLabel,
  formatDateShort,
  formatUsd,
  formatUsdShort,
} from '../data/mockRfp';
import { AddToPoolButton, SubmitProposalButton } from './OrchActions';
import { BackerFaces, PoolBar } from './PoolPanel';

/**
 * Both actions and the pool's progress, pinned to the bottom of the screen
 * for the whole page. It steps aside while a section with its own pair of
 * buttons (marked `data-orch-cta`) is on screen, so there is never a second
 * copy in view. A floating bar on wide screens, a full-width bar on phones.
 */
export function ActionDock() {
  const rfp = ORCH_OR_RFP;
  const [ctaInView, setCtaInView] = useState(true);

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('[data-orch-cta]'));
    if (targets.length === 0) {
      setCtaInView(false);
      return;
    }
    const inView = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inView.add(e.target);
          else inView.delete(e.target);
        }
        setCtaInView(inView.size > 0);
      },
      { threshold: 0.4 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const { pool } = rfp;

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
      <div className="pointer-events-auto hidden w-full max-w-[860px] items-center gap-4 rounded-full border border-[color:var(--o-line)] bg-[rgb(var(--o-ink-2-rgb)/0.88)] py-2 pl-2 pr-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl tablet:flex">
        <span className="pl-2">
          <BackerFaces size={30} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] leading-tight text-[var(--o-soft)]">
            <span className="text-[var(--o-text)]">{formatUsd(pool.raisedUsd)}</span> raised of{' '}
            {formatUsdShort(pool.goalUsd)}
            <span className="mx-2 opacity-50">·</span>
            {pool.backerCount} backers
            <span className="hidden content-md:inline">
              <span className="mx-2 opacity-50">·</span>
              {rfp.status === 'OPEN' && rfp.deadline
                ? `Until ${formatDateShort(rfp.deadline)}`
                : deadlineLabel(rfp)}
            </span>
          </p>
          <PoolBar className="mt-1.5 h-1 max-w-[260px]" />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <SubmitProposalButton size="sm" />
          <AddToPoolButton size="sm" />
        </div>
      </div>

      {/* Phones: a full-width bar. */}
      <div className="pointer-events-auto w-full border-t border-[color:var(--o-line)] bg-[rgb(var(--o-ink-2-rgb)/0.94)] px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl tablet:hidden">
        <p className="mb-2 flex items-center justify-between text-[12px] text-[var(--o-mute)]">
          <span>
            <span className="tabular-nums text-[var(--o-text)]">
              {formatUsdShort(pool.raisedUsd)}
            </span>{' '}
            raised of {formatUsdShort(pool.goalUsd)} · {pool.backerCount} backers
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--o-open)]" />
            {rfp.status === 'OPEN' && rfp.deadline
              ? `Until ${formatDateShort(rfp.deadline)}`
              : deadlineLabel(rfp)}
          </span>
        </p>
        <div className="flex gap-2">
          <AddToPoolButton size="md" className="flex-[3] px-3" />
          <SubmitProposalButton size="md" className="flex-[2] px-3" label="Propose" />
        </div>
      </div>
    </div>
  );
}
