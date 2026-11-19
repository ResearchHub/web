import type { ReactNode } from 'react';
import { CircleCheck } from 'lucide-react';
import { BackerFaces } from './Pool';
import {
  CAMPAIGN,
  formatDate,
  formatUsd,
  formatUsdShort,
  poolPercent,
  type RfpView,
} from '../data/rfp';

/**
 * Everything under the hero's paragraph, in one card, as on /consciousness:
 * the amount raised, one track in two parts, the backers and proposals, the
 * hero's buttons (`children`) and a footer line. Phase 1 (raising the pool)
 * fills as money comes in; Phase 2 (the audits) waits, hatched.
 */
export function HeroCard({ rfp, children }: { rfp: RfpView; children: ReactNode }) {
  const pct = poolPercent(rfp);
  return (
    <div className="a-rise mt-7 max-w-[540px] overflow-hidden rounded-[10px] border border-[color:var(--a-ink)] bg-[rgb(253_252_248/0.9)] shadow-[0_24px_60px_-38px_rgb(var(--a-ink-rgb)/0.55)] backdrop-blur-md">
      <div className="p-5 tablet:p-6">
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="a-serif text-[32px] leading-none tabular-nums">
            {formatUsd(rfp.raisedUsd)}
          </span>
          <span className="text-[14px] text-[var(--a-soft)]">
            raised toward {formatUsdShort(rfp.goalUsd)} by {formatDate(rfp.goalBy)}
          </span>
        </p>
        <div
          role="img"
          aria-label={`Phase 1 of 2: ${Math.round(pct)}% of ${formatUsd(rfp.goalUsd)} raised. Phase 2, the audits, follows.`}
          className="mt-4 flex gap-1.5"
        >
          <div className="h-2 flex-[3] overflow-hidden rounded-[2px] bg-[rgb(var(--a-ink-rgb)/0.1)]">
            <span
              className="block h-full bg-[var(--a-red)]"
              style={{ width: `${pct > 0 ? Math.max(pct, 1.5) : 0}%` }}
            />
          </div>
          <div className="h-2 flex-[2] rounded-[2px] bg-[repeating-linear-gradient(135deg,rgb(var(--a-ink-rgb)/0.16)_0_3px,transparent_3px_7px)]" />
        </div>
        {/* Each label stays on one line; on the narrowest phones the second
            drops below the first rather than breaking. */}
        <div className="mt-2.5 flex flex-wrap gap-x-1.5 gap-y-1 whitespace-nowrap text-[12.5px] font-semibold leading-snug">
          <p className="flex flex-[3] items-center gap-1.5 text-[var(--a-ink)] tablet:gap-2">
            <span aria-hidden className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="a-live-ring absolute inset-0 rounded-full bg-[var(--a-red)]" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-[var(--a-red)]" />
            </span>
            Phase 1 - Raising
          </p>
          <p className="flex flex-[2] items-center gap-1.5 text-[var(--a-mute)] tablet:gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-[1.5px] ring-inset ring-current"
            />
            Phase 2 - Audits
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-[13.5px] text-[var(--a-soft)]">
          <BackerFaces rfp={rfp} size={22} />
          <span className="tabular-nums">
            {rfp.backerCount > 0
              ? `${rfp.backerCount} ${rfp.backerCount === 1 ? 'backer' : 'backers'}`
              : 'Be the first backer'}
          </span>
          <span aria-hidden className="opacity-50">
            ·
          </span>
          <span className="tabular-nums">
            {rfp.proposalCount > 0
              ? `${rfp.proposalCount} ${rfp.proposalCount === 1 ? 'proposal' : 'proposals'}`
              : 'No proposals yet'}
          </span>
        </div>
        {children}
      </div>
      <p className="flex items-center gap-2 border-t border-[color:var(--a-line)] bg-[rgb(var(--a-ink-rgb)/0.035)] px-5 py-3 text-[12.5px] leading-snug text-[var(--a-soft)] tablet:px-6">
        <CircleCheck aria-hidden className="h-4 w-4 shrink-0 text-[var(--a-red)]" strokeWidth={2} />
        {CAMPAIGN.taxDeductibleLine ?? 'The pool pays only for audits funded under this call'}
      </p>
    </div>
  );
}
