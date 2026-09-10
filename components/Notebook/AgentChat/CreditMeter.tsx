'use client';

import type { ResearchAIState } from '@/store/researchAI';
import { formatBudgetReset, formatCredits, isBudgetExhausted } from '@/types/researchAI';

export function CreditMeter({
  budget,
  budgetStatus,
  limitResetAt,
  onRefresh,
}: Pick<ResearchAIState, 'budget' | 'budgetStatus' | 'limitResetAt'> & { onRefresh: () => void }) {
  if (budget?.tier === 'blocked') {
    return (
      <output className="mt-2 block text-xs text-gray-600">
        Research AI is unavailable for this account.
      </output>
    );
  }
  if (!budget) {
    return (
      <output className="mt-2 block text-xs text-gray-500">
        {budgetStatus === 'loading' ? 'Loading AI credits…' : 'Couldn’t load AI credits.'}
        {budgetStatus === 'unavailable' && (
          <button type="button" onClick={onRefresh} className="ml-2 underline">
            Retry
          </button>
        )}
      </output>
    );
  }
  const exhausted = isBudgetExhausted(budget) || limitResetAt !== null;
  const { remaining, daily_limit: limit } = budget.credits;
  const reset = formatBudgetReset(budget.resets_at);
  let balanceLabel = 'Credits unavailable';
  if (limit === null) {
    balanceLabel = 'Unlimited credits';
  } else if (remaining !== null) {
    balanceLabel = `${formatCredits(remaining)} credits remaining`;
  }
  return (
    <div className="mt-2 space-y-1 text-[11px] text-gray-500">
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
        <span
          title={limit === null ? 'No daily credit limit' : `${formatCredits(limit)} daily credits`}
        >
          {balanceLabel}
        </span>
        <time dateTime={budget.resets_at} title={new Date(budget.resets_at).toLocaleString()}>
          Resets at {reset}
        </time>
      </div>
      {exhausted && (
        <output className="block text-amber-700">
          Daily AI usage limit reached. Available again at {reset}.
        </output>
      )}
      {budgetStatus === 'unavailable' && (
        <p>
          Credits may be out of date.{' '}
          <button type="button" onClick={onRefresh} className="underline">
            Refresh
          </button>
        </p>
      )}
    </div>
  );
}
