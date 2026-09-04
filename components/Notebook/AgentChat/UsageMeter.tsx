'use client';

import { Button } from '@/components/ui/Button';
import { formatUsageReset, type ResearchAiUsageBudget } from '@/types/researchAiUsage';

const dollars = (value: string) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 4,
  }).format(Number(value));

export function UsageMeter({
  budget,
  failed,
  onRefresh,
}: {
  readonly budget: ResearchAiUsageBudget | null;
  readonly failed: boolean;
  readonly onRefresh: () => void;
}) {
  const daily = budget?.daily_budget == null ? null : Number(budget.daily_budget);
  const remaining = budget?.remaining == null ? null : Number(budget.remaining);
  const percent =
    daily != null && remaining != null && daily > 0
      ? Math.max(0, Math.min(100, (remaining / daily) * 100))
      : 0;
  return (
    <div className="border-t border-gray-100 px-3 py-2 text-[11px] text-gray-500">
      {budget ? (
        <>
          <div className="flex flex-wrap justify-between gap-x-2 gap-y-1">
            <span>
              {budget.remaining == null
                ? 'No daily spending limit'
                : `${dollars(budget.remaining)} of ${dollars(budget.daily_budget ?? '0')} remaining`}
            </span>
            <span>
              {budget.turn_cap == null
                ? `${budget.turns_used} model calls today`
                : `${budget.turns_used} / ${budget.turn_cap} model calls`}
            </span>
          </div>
          {daily != null && (
            <div
              role="meter"
              aria-label="Daily AI budget remaining"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-valuetext={`${dollars(budget.remaining ?? '0')} remaining`}
              className="my-1.5 h-1 rounded-full bg-gray-100"
            >
              <div
                className="h-full rounded-full bg-primary-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          )}
          <p>Resets {formatUsageReset(budget.resets_at)}</p>
        </>
      ) : (
        !failed && <p>Loading AI usage…</p>
      )}
      {failed && (
        <div className="flex items-center justify-between gap-2">
          <span>{budget ? 'Usage may be out of date.' : 'Couldn’t load AI usage.'}</span>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
