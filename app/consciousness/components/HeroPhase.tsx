import { formatDate, formatUsd, formatUsdShort, poolPercent, type RfpView } from '../data/rfp';

/**
 * The phases in the hero, under the calls to action: the amount raised, then
 * one track in two parts. Phase 1 (raising the pool, a radiating dot) fills
 * as money comes in; Phase 2 (the experiments, a hollow dot) waits, hatched.
 * Picked from the hero mocks as B (Kobe, 2026-11-17). `daysLeft` comes from
 * the server.
 */
export function HeroPhase({ rfp, daysLeft }: { rfp: RfpView; daysLeft: number }) {
  const pool = rfp;
  const pct = poolPercent(rfp);
  return (
    <div className="o-rise mt-9 max-w-[480px]">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="o-serif text-[28px] leading-none tabular-nums">
          {formatUsd(pool.raisedUsd)}
        </span>
        <span className="text-[14px] text-[var(--o-soft)]">
          raised toward {formatUsdShort(pool.goalUsd)} by {formatDate(pool.goalBy)}
        </span>
      </p>
      <div
        role="img"
        aria-label={`Phase 1 of 2: ${Math.round(pct)}% of ${formatUsd(pool.goalUsd)} raised. Phase 2, the experiments, follows.`}
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
      <div className="mt-2.5 flex gap-1.5 text-[12.5px] leading-snug">
        <p className="flex flex-[3] items-start gap-2">
          <span aria-hidden className="relative mt-[3px] flex h-2.5 w-2.5 shrink-0">
            <span className="o-live-ring absolute inset-0 rounded-full bg-[var(--o-gold)]" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-[var(--o-gold)]" />
          </span>
          <span>
            <span className="font-semibold text-[var(--o-text)]">Phase 1 · Raise the pool</span>
            <span className="block text-[var(--o-mute)]">
              {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
            </span>
          </span>
        </p>
        <p className="flex flex-[2] items-start gap-2 text-[var(--o-mute)]">
          <span
            aria-hidden
            className="mt-[3px] h-2.5 w-2.5 shrink-0 rounded-full ring-[1.5px] ring-inset ring-[color:var(--o-mute)]"
          />
          <span>
            <span className="font-semibold">
              Phase 2<span className="hidden tablet:inline"> · Experiments</span>
            </span>
            <span className="block">
              <span className="tablet:hidden">Experiments · 2027</span>
              <span className="hidden tablet:inline">From 2027</span>
            </span>
          </span>
        </p>
      </div>
    </div>
  );
}
