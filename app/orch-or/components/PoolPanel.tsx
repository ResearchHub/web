import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';
import {
  ORCH_OR_RFP,
  deadlineLabel,
  formatUsd,
  formatUsdShort,
  poolTotalUsd,
} from '../data/mockRfp';
import { FunderMark } from './FunderMark';
import { AddToPoolButton } from './OrchActions';

/** The community's share stays visible on the bar however small it is. */
const visiblePercent = (p: number) => (p > 0 ? Math.max(p, 1.5) : 0);

function poolFacts() {
  const rfp = ORCH_OR_RFP;
  const { pool, funder } = rfp;
  const total = poolTotalUsd(rfp);
  const communityPct = total > 0 ? (pool.othersUsd / total) * 100 : 0;
  const backersLabel = `${pool.backerCount} ${pool.backerCount === 1 ? 'backer' : 'backers'}`;
  return { rfp, pool, funder, total, communityPct, backersLabel };
}

/** The pool's split: the funder in blue, everyone else in pink. */
function PoolBar({ className }: { className?: string }) {
  const { pool, funder, communityPct, backersLabel } = poolFacts();
  const shown = visiblePercent(communityPct);
  return (
    <div
      role="img"
      aria-label={`${Math.round(100 - communityPct)}% from ${funder.name}, ${Math.round(communityPct)}% from ${backersLabel}`}
      className={cn('flex h-2.5 gap-[3px] overflow-hidden rounded-full', className)}
    >
      <span
        className="h-full rounded-l-full bg-[var(--o-gold)]"
        style={{ width: `${100 - shown}%` }}
        title={`${funder.name}: ${formatUsd(pool.funderCommitmentUsd)}`}
      />
      {shown > 0 ? (
        <span
          className="h-full rounded-r-full bg-[var(--o-ice)]"
          style={{ width: `${shown}%` }}
          title={`${backersLabel}: ${formatUsd(pool.othersUsd)}`}
        />
      ) : (
        <span className="h-full flex-1 rounded-r-full bg-[rgb(var(--o-text-rgb)/0.1)]" />
      )}
    </div>
  );
}

/** The top backers' faces, overlapping. */
function BackerFaces({ size }: { size: number }) {
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

const swatch = (on: boolean, color: string) =>
  cn('h-2.5 w-2.5 shrink-0 rounded-[3px]', on ? color : 'bg-[rgb(var(--o-text-rgb)/0.15)]');

/**
 * The pool in the hero, under the calls to action: the total, the split bar,
 * and who is in it (the foundation, and the backers' faces), then the
 * deadline and the proposal count.
 */
export function HeroPool({ proposals }: { proposals: number }) {
  const { rfp, pool, funder, total, backersLabel } = poolFacts();
  return (
    <div className="o-rise mt-8 max-w-[460px]">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="o-serif text-[30px] leading-none tabular-nums">{formatUsd(total)}</span>
        <span className="text-[14px] text-[var(--o-mute)]">funding pool</span>
      </p>
      <PoolBar className="mt-3 h-2" />
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13.5px] text-[var(--o-soft)]">
        <span className="flex min-w-0 items-center gap-2">
          <span aria-hidden className={swatch(true, 'bg-[var(--o-gold)]')} />
          <FunderMark size={22} />
          <span className="truncate">{funder.name}</span>
          <span className="tabular-nums text-[var(--o-text)]">
            {formatUsdShort(pool.funderCommitmentUsd)}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className={swatch(pool.othersUsd > 0, 'bg-[var(--o-ice)]')} />
          <BackerFaces size={22} />
          {pool.backerCount > 0 ? (
            <>
              {backersLabel}
              <span className="tabular-nums text-[var(--o-text)]">
                {formatUsdShort(pool.othersUsd)}
              </span>
            </>
          ) : (
            'Be the first backer'
          )}
        </span>
      </div>
      <p className="mt-4 text-[13px] text-[var(--o-mute)]">
        {deadlineLabel(rfp)}
        <span className="mx-2 opacity-50">·</span>
        {proposals === 0 ? 'No proposals yet' : `${proposals} proposals`}
      </p>
    </div>
  );
}

/**
 * The funding pool as the RFP page's pool card shows it, in the page's own
 * type: the total, a bar split between the funder (blue) and everyone else
 * (pink), a legend with the backers' faces, what a pool is, and the top
 * backers by amount. The figures come from `data/mockRfp.ts` (mock backers
 * for now); live, they are the grant's `fundingPool`.
 */
export function PoolPanel() {
  const { rfp, pool, funder, total, backersLabel } = poolFacts();
  const more = pool.backerCount - pool.backers.length;

  return (
    <aside className="content-md:col-span-5" aria-label="Funding pool">
      <p className="text-[14px] text-[var(--o-mute)]">Funding pool</p>
      <p className="o-serif mt-1 text-[56px] leading-none tabular-nums">{formatUsd(total)}</p>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-[var(--o-soft)]">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--o-open)]" />
        {deadlineLabel(rfp)}
        <span className="whitespace-nowrap">
          <span className="mr-2 opacity-50">·</span>
          Awards {rfp.awardRangeLabel}
        </span>
      </p>

      {/* Who put the money in: the funder's share and the community's. */}
      <PoolBar className="mt-7" />

      <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 text-[15px]">
        <div className="contents">
          <span aria-hidden className="h-2.5 w-2.5 rounded-[3px] bg-[var(--o-gold)]" />
          <dt className="flex min-w-0 items-center gap-2.5">
            <FunderMark size={26} />
            <span className="truncate">{funder.name}</span>
          </dt>
          <dd className="tabular-nums">{formatUsd(pool.funderCommitmentUsd)}</dd>
        </div>
        <div className="contents">
          <span
            aria-hidden
            className={
              pool.othersUsd > 0
                ? 'h-2.5 w-2.5 rounded-[3px] bg-[var(--o-ice)]'
                : 'h-2.5 w-2.5 rounded-[3px] bg-[rgb(var(--o-text-rgb)/0.15)]'
            }
          />
          <dt className="flex min-w-0 items-center gap-2.5">
            <BackerFaces size={26} />
            <span className="truncate">
              {pool.backerCount > 0 ? backersLabel : 'Be the first backer'}
            </span>
          </dt>
          <dd className="tabular-nums text-[var(--o-soft)]">
            {pool.othersUsd > 0 ? formatUsd(pool.othersUsd) : '—'}
          </dd>
        </div>
      </dl>

      <p className="mt-5 text-[13.5px] leading-relaxed text-[var(--o-mute)]">
        One pool, many backers. The {funder.name.replace(/^The /, '')} put up the first{' '}
        {formatUsd(pool.funderCommitmentUsd)}; anyone can add to it, and every dollar funds the
        proposals the foundation picks.
        {pool.distributedUsd > 0 && ` ${formatUsd(pool.distributedUsd)} allocated so far.`}
      </p>

      {pool.backers.length > 0 && (
        <div className="o-rule mt-7 border-t pt-5">
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

      <div className="mt-8">
        <AddToPoolButton className="w-full" />
      </div>
      <p className="mt-3 text-[12.5px] text-[var(--o-mute)]">{pool.taxDeductibleNote}</p>
    </aside>
  );
}
