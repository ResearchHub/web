'use client';

import { Children, type FC, type ReactNode } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';

export interface TotalsStat {
  label: string;
  value: string;
  /** The same amount in the other currency, under the value. */
  secondary?: string | null;
  /** A word on what the number means, on hover over the label. */
  tooltip?: ReactNode;
}

interface FundingTotalsCardProps {
  /** The one number the card is about, largest and first. */
  headline: TotalsStat & { tone?: 'primary' | 'emerald' };
  /** The pair that breaks it down, side by side under it. */
  stats: readonly TotalsStat[];
  /** Rows under the numbers: who is behind them. */
  children?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

const LABEL = 'text-[11px] font-semibold uppercase leading-none tracking-wider text-gray-500';

/**
 * A column's worth of totals: one headline amount, the pair that makes it
 * up, and whatever rows belong under them. Funds given and Funds received
 * each fill it with their own numbers so the two rails read the same.
 */
export const FundingTotalsCard: FC<FundingTotalsCardProps> = ({
  headline,
  stats,
  children,
  isLoading = false,
  className,
}) => {
  // A row that has nothing to count renders as false; no rows, no section.
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <section
      aria-label="Totals"
      aria-busy={isLoading}
      className={cn('rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm', className)}
    >
      <div className="flex flex-col gap-1.5">
        <StatLabel stat={headline} />
        {isLoading ? (
          <div className="mt-1 h-8 w-32 animate-pulse rounded bg-gray-100" />
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span
              className={cn(
                'font-mono text-[28px] font-semibold leading-none tracking-tight',
                headline.tone === 'emerald' ? 'text-emerald-600' : 'text-primary-600'
              )}
            >
              {headline.value}
            </span>
            {headline.secondary && (
              <span className="text-xs text-gray-500">{headline.secondary}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex min-w-0 flex-col gap-1.5">
            <StatLabel stat={stat} />
            {isLoading ? (
              <div className="h-5 w-16 animate-pulse rounded bg-gray-100" />
            ) : (
              <div className="flex flex-col">
                <span className="truncate font-mono text-base font-semibold leading-none text-gray-900">
                  {stat.value}
                </span>
                {stat.secondary && (
                  <span className="mt-1 truncate text-[11px] text-gray-500">{stat.secondary}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {rows.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4">{rows}</div>
      )}
    </section>
  );
};

const StatLabel: FC<{ stat: TotalsStat }> = ({ stat }) =>
  stat.tooltip ? (
    <Tooltip
      content={stat.tooltip}
      position="top"
      width="w-64"
      className="bg-gray-900 text-white border-gray-900 text-left"
      wrapperClassName="w-fit"
    >
      <span className={cn(LABEL, 'cursor-help')}>{stat.label}</span>
    </Tooltip>
  ) : (
    <span className={LABEL}>{stat.label}</span>
  );

/** Shared dark-tooltip body — title + paragraph, matches FundingCreditsTooltip style. */
export const TotalsTooltip: FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="text-left">
    <div className="mb-1 text-sm font-bold text-white">{title}</div>
    <p className="text-xs leading-snug text-gray-300">{body}</p>
  </div>
);

interface TotalsRowProps {
  /** What the row counts: "12 scientists". */
  label: ReactNode;
  onShowAll: () => void;
  children: ReactNode;
}

/** A row of faces or chips with its count, opening the full list. */
export const TotalsRow: FC<TotalsRowProps> = ({ label, onShowAll, children }) => (
  <button
    type="button"
    onClick={onShowAll}
    className="group flex min-h-8 w-full items-center gap-2.5 text-left"
  >
    <span className="flex min-w-0 shrink-0 items-center">{children}</span>
    <span className="min-w-0 flex-1 truncate text-sm text-gray-700 group-hover:text-gray-900">
      {label}
    </span>
  </button>
);
