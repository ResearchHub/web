import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';
import {
  ORCH_OR_RFP,
  deadlinePhrase,
  formatDate,
  formatUsd,
  formatUsdShort,
  poolPercent,
} from '../data/mockRfp';
import { AddToPoolButton } from './OrchActions';

function poolFacts() {
  const rfp = ORCH_OR_RFP;
  const { pool } = rfp;
  const pct = poolPercent(rfp);
  const backersLabel = `${pool.backerCount} ${pool.backerCount === 1 ? 'backer' : 'backers'}`;
  return { rfp, pool, pct, backersLabel };
}

/** Progress toward the goal; a sliver always shows once anyone has given. */
export function PoolBar({ className }: { className?: string }) {
  const { pool, pct } = poolFacts();
  const shown = pct > 0 ? Math.max(pct, 1.5) : 0;
  return (
    <div
      role="img"
      aria-label={`${formatUsd(pool.raisedUsd)} raised of a ${formatUsd(pool.goalUsd)} goal`}
      className={cn(
        'h-2.5 overflow-hidden rounded-full bg-[rgb(var(--o-text-rgb)/0.1)]',
        className
      )}
    >
      <span
        className="block h-full rounded-full bg-[var(--o-gold)]"
        style={{ width: `${shown}%` }}
      />
    </div>
  );
}

/** The top backers' faces, overlapping. */
export function BackerFaces({ size }: { size: number }) {
  const { pool } = poolFacts();
  if (pool.backers.length === 0) return null;
  return (
    <span className="flex shrink-0 -space-x-2">
      {pool.backers.slice(0, 4).map((b) => (
        <span key={b.name} className="rounded-full ring-2 ring-[var(--o-ink)]">
          <Avatar src={b.avatarUrl} alt={b.name} size={size} disableTooltip />
        </span>
      ))}
    </span>
  );
}

/**
 * The pool in the hero, under the calls to action: raised against the goal,
 * the backers' faces, then the deadline and the proposal count.
 */
export function HeroPool({ proposals }: { proposals: number }) {
  const { rfp, pool, pct, backersLabel } = poolFacts();
  return (
    <div className="o-rise mt-8 max-w-[460px]">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="o-serif text-[30px] leading-none tabular-nums">
          {formatUsd(pool.raisedUsd)}
        </span>
        <span className="text-[14px] text-[var(--o-mute)]">
          raised toward {formatUsdShort(pool.goalUsd)} by {formatDate(pool.goalBy)}
        </span>
      </p>
      <PoolBar className="mt-3 h-2" />
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-[13.5px] text-[var(--o-soft)]">
        <BackerFaces size={22} />
        {pool.backerCount > 0 ? backersLabel : 'Be the first backer'}
        <span className="opacity-50">·</span>
        <span className="tabular-nums">{Math.round(pct)}% of Goal 1</span>
      </p>
      <p className="mt-4 text-[13px] text-[var(--o-mute)]">
        Proposals {deadlinePhrase(rfp)}
        <span className="mx-2 opacity-50">·</span>
        {proposals === 0 ? 'No proposals yet' : `${proposals} proposals`}
        <span className="mx-2 opacity-50">·</span>
        <a
          href="#how-it-works"
          className="underline decoration-[color:var(--o-line-2)] underline-offset-4 hover:text-[var(--o-text)] hover:decoration-current"
        >
          How it works
        </a>
      </p>
    </div>
  );
}

/**
 * The funding pool beside the proposals: raised against the goal, what the
 * pool pays for, the top backers, and the button to add to it. The figures
 * come from `data/mockRfp.ts` (mock backers for now); live, they are the
 * grant's `fundingPool`.
 */
export function PoolPanel() {
  const { rfp, pool, pct, backersLabel } = poolFacts();
  const more = pool.backerCount - pool.backers.length;

  return (
    <aside className="content-md:col-span-5" aria-label="Funding pool">
      <p className="text-[14px] text-[var(--o-mute)]">Funding pool</p>
      <p className="o-serif mt-1 text-[56px] leading-none tabular-nums">
        {formatUsd(pool.raisedUsd)}
      </p>
      <p className="mt-2 text-[15px] text-[var(--o-soft)]">
        raised toward our {formatUsd(pool.goalUsd)} goal for {formatDate(pool.goalBy)}
      </p>

      <PoolBar className="mt-6" />
      <p className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[14px] text-[var(--o-soft)]">
        <span className="flex items-center gap-2.5">
          <BackerFaces size={26} />
          {pool.backerCount > 0 ? backersLabel : 'Be the first backer'}
        </span>
        <span className="tabular-nums text-[var(--o-mute)]">{Math.round(pct)}%</span>
      </p>

      <p className="mt-5 text-[13.5px] leading-relaxed text-[var(--o-mute)]">
        One pool, many backers. Every dollar goes to the experiments and theory funded under this
        call, whichever answer they favour.
        {pool.distributedUsd > 0 && ` ${formatUsd(pool.distributedUsd)} allocated so far.`}
      </p>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-[var(--o-mute)]">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--o-open)]" />
        Proposals {deadlinePhrase(rfp)}
        <span className="whitespace-nowrap">
          <span className="mr-2 opacity-50">·</span>
          Awards {rfp.awardRangeLabel}
        </span>
      </p>

      <div className="mt-7">
        <AddToPoolButton size="lg" className="w-full" />
      </div>
      <p className="mt-3 text-[12.5px] text-[var(--o-mute)]">{pool.taxDeductibleNote}</p>

      {pool.backers.length > 0 && (
        <div className="o-rule mt-8 border-t pt-5">
          <p className="text-[13px] text-[var(--o-mute)]">Top backers</p>
          <ul className="mt-3 space-y-3">
            {pool.backers.map((b) => (
              <li key={b.name} className="flex items-center gap-3 text-[15px]">
                <Avatar src={b.avatarUrl} alt={b.name} size={30} disableTooltip />
                <span className="min-w-0 flex-1 truncate">{b.name}</span>
                <span className="tabular-nums text-[var(--o-soft)]">{formatUsd(b.amountUsd)}</span>
              </li>
            ))}
          </ul>
          {more > 0 && (
            <p className="mt-3 text-[13.5px] text-[var(--o-mute)]">
              and {more} more {more === 1 ? 'backer' : 'backers'}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
