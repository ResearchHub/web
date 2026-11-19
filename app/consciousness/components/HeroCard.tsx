import type { ReactNode } from 'react';
import { BadgeCheck } from 'lucide-react';
import { BackerFaces } from './PoolPanel';
import {
  CAMPAIGN,
  formatDate,
  formatUsd,
  formatUsdShort,
  poolPercent,
  type RfpView,
} from '../data/rfp';

/**
 * Everything under the hero's paragraph, in one card (Kobe, 2026-11-18): the
 * amount raised, one track in two parts, the backers, the hero's buttons
 * (`children`) and the tax line as a footer. Phase 1 (raising the pool, a
 * radiating dot) fills as money comes in; Phase 2 (the experiments, a hollow
 * dot) waits, hatched.
 */
export function HeroCard({ rfp, children }: { rfp: RfpView; children: ReactNode }) {
  const pct = poolPercent(rfp);
  return (
    <div className="o-rise mt-7 max-w-[540px] overflow-hidden rounded-[20px] border border-[color:var(--o-line-2)] bg-[rgb(var(--o-ink-rgb)/0.78)] shadow-[0_20px_50px_-34px_rgb(var(--o-text-rgb)/0.45)] backdrop-blur-md">
      <div className="p-5 tablet:p-6">
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="o-serif text-[30px] leading-none tabular-nums">
            {formatUsd(rfp.raisedUsd)}
          </span>
          <span className="text-[14px] text-[var(--o-soft)]">
            raised toward {formatUsdShort(rfp.goalUsd)} by {formatDate(rfp.goalBy)}
          </span>
        </p>
        <div
          role="img"
          aria-label={`Phase 1 of 2: ${Math.round(pct)}% of ${formatUsd(rfp.goalUsd)} raised. Phase 2, the experiments, follows.`}
          className="mt-4 flex gap-1.5"
        >
          <div className="h-2 flex-[3] overflow-hidden rounded-l-full bg-[rgb(var(--o-text-rgb)/0.1)]">
            <span
              className="block h-full rounded-full bg-[var(--o-gold)]"
              style={{ width: `${pct > 0 ? Math.max(pct, 1.5) : 0}%` }}
            />
          </div>
          <div className="h-2 flex-[2] rounded-r-full bg-[repeating-linear-gradient(135deg,rgb(var(--o-text-rgb)/0.12)_0_4px,transparent_4px_8px)]" />
        </div>
        {/* Each label stays on one line; on the narrowest phones the second
            drops below the first rather than breaking. */}
        <div className="mt-2.5 flex flex-wrap gap-x-1.5 gap-y-1 whitespace-nowrap text-[12.5px] font-semibold leading-snug">
          <p className="flex flex-[3] items-center gap-1.5 text-[var(--o-text)] tablet:gap-2">
            <span aria-hidden className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="o-live-ring absolute inset-0 rounded-full bg-[var(--o-gold)]" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-[var(--o-gold)]" />
            </span>
            Phase 1 - Raising
          </p>
          <p className="flex flex-[2] items-center gap-1.5 text-[var(--o-mute)] tablet:gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-[1.5px] ring-inset ring-current"
            />
            Phase 2 - Experiments
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-[13.5px] text-[var(--o-soft)]">
          <BackerFaces rfp={rfp} size={22} />
          {/* One unit, so it drops below a long row of faces in one piece. */}
          <span className="flex items-center gap-x-2 whitespace-nowrap tabular-nums">
            <span>
              {rfp.backerCount > 0
                ? `${rfp.backerCount} ${rfp.backerCount === 1 ? 'backer' : 'backers'}`
                : 'Be the first backer'}
            </span>
            <span aria-hidden className="opacity-50">
              ·
            </span>
            <span>
              {rfp.proposalCount > 0
                ? `${rfp.proposalCount} ${rfp.proposalCount === 1 ? 'proposal' : 'proposals'}`
                : 'No proposals yet'}
            </span>
          </span>
        </div>
        {children}
      </div>
      <p className="flex items-center gap-2 border-t border-[color:var(--o-line)] bg-[rgb(var(--o-gold-rgb)/0.08)] px-5 py-3 text-[12.5px] leading-snug text-[var(--o-soft)] tablet:px-6">
        <BadgeCheck aria-hidden className="h-4 w-4 shrink-0 text-[var(--o-gold)]" strokeWidth={2} />
        {CAMPAIGN.taxDeductibleLine}
      </p>
    </div>
  );
}
