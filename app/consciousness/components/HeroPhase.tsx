'use client';

import { useState } from 'react';
import { cn } from '@/utils/styles';
import {
  ORCH_OR_RFP,
  deadlinePhrase,
  formatDate,
  formatUsd,
  formatUsdShort,
  poolPercent,
} from '../data/mockRfp';
import { BackerFaces, PoolBar } from './PoolPanel';

type Phase = 1 | 2;

/** The step dot: Phase 1's radiates (it is under way), Phase 2's is hollow. */
function Dot({ live }: { live: boolean }) {
  if (!live) {
    return (
      <span
        aria-hidden
        className="h-2.5 w-2.5 shrink-0 rounded-full ring-[1.5px] ring-inset ring-[color:var(--o-mute)]"
      />
    );
  }
  return (
    <span aria-hidden className="relative flex h-2.5 w-2.5 shrink-0">
      <span className="o-live-ring absolute inset-0 rounded-full bg-[var(--o-gold)]" />
      <span className="relative h-2.5 w-2.5 rounded-full bg-[var(--o-gold)]" />
    </span>
  );
}

function PhaseTab({
  n,
  label,
  selected,
  onSelect,
}: {
  n: Phase;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`hero-phase-tab-${n}`}
      aria-selected={selected}
      aria-controls={`hero-phase-panel-${n}`}
      onClick={onSelect}
      className={cn(
        'relative z-10 flex items-center gap-2.5 rounded-full px-3 py-1.5 text-left transition-colors',
        selected
          ? 'bg-[var(--o-ink)] ring-1 ring-[color:var(--o-line-2)]'
          : 'hover:bg-[rgb(var(--o-text-rgb)/0.05)]'
      )}
    >
      <Dot live={n === 1} />
      <span className="leading-tight">
        <span
          className={cn(
            'block text-[12px] font-semibold uppercase tracking-[0.12em]',
            n === 1 ? 'text-[var(--o-text)]' : 'text-[var(--o-mute)]'
          )}
        >
          Phase {n}
        </span>
        <span
          className={cn(
            'block text-[12.5px]',
            n === 1 ? 'text-[var(--o-soft)]' : 'text-[var(--o-mute)]'
          )}
        >
          {label}
        </span>
      </span>
    </button>
  );
}

/**
 * The phase card in the hero, under the calls to action. Two tabs laid out
 * like a two-step timeline: Phase 1 (raising now, a radiating dot) is open;
 * Phase 2 (coming up) is greyed out but can be opened to see what it is.
 * `daysLeft` comes from the server so the count matches on hydration.
 */
export function HeroPhase({ daysLeft }: { daysLeft: number }) {
  const [phase, setPhase] = useState<Phase>(1);
  const rfp = ORCH_OR_RFP;
  const { pool } = rfp;
  const backers = `${pool.backerCount} ${pool.backerCount === 1 ? 'backer' : 'backers'}`;

  return (
    <div className="o-rise mt-8 max-w-[480px] rounded-[16px] bg-[rgb(var(--o-ink-rgb)/0.78)] p-2 ring-1 ring-[color:var(--o-line-2)] backdrop-blur-md">
      <div role="tablist" aria-label="Phases" className="relative flex items-center gap-2">
        <PhaseTab n={1} label="Raising now" selected={phase === 1} onSelect={() => setPhase(1)} />
        {/* The timeline between the two steps. */}
        <span aria-hidden className="h-px min-w-6 flex-1 bg-[var(--o-line-2)]" />
        <PhaseTab n={2} label="Coming up" selected={phase === 2} onSelect={() => setPhase(2)} />
      </div>

      <div className="px-3 pb-3 pt-4">
        {phase === 1 ? (
          <div role="tabpanel" id="hero-phase-panel-1" aria-labelledby="hero-phase-tab-1">
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="o-serif text-[28px] leading-none tabular-nums">
                {formatUsd(pool.raisedUsd)}
              </span>
              <span className="text-[14px] text-[var(--o-soft)]">
                raised toward {formatUsdShort(pool.goalUsd)} by {formatDate(pool.goalBy)}
              </span>
            </p>
            <PoolBar className="mt-3 h-2" />
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-[13.5px] text-[var(--o-soft)]">
              <BackerFaces size={22} />
              {pool.backerCount > 0 ? backers : 'Be the first backer'}
              <span className="opacity-50">·</span>
              <span className="tabular-nums">{Math.round(poolPercent(rfp))}%</span>
              <span className="opacity-50">·</span>
              <span className="tabular-nums">
                {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
              </span>
            </div>
          </div>
        ) : (
          <div role="tabpanel" id="hero-phase-panel-2" aria-labelledby="hero-phase-tab-2">
            <p className="o-serif text-[22px] leading-tight">Pick proposals, run the experiments</p>
            <p className="mt-2 text-[14px] leading-[1.55] text-[var(--o-soft)]">
              Reviewers score the proposals in the open. The pool funds the strongest, and the
              results are published.
            </p>
            <p className="mt-3 text-[13px] text-[var(--o-mute)]">
              Proposals {deadlinePhrase(rfp)}
              <span className="mx-2 opacity-50">·</span>
              Awards {rfp.awardRangeLabel}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
