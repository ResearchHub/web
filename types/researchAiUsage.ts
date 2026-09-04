/** Dollar values stay in their wire format; null means unlimited. */
export interface ResearchAiUsageBudget {
  tier: string;
  daily_budget: string | null;
  spent_today: string;
  remaining: string | null;
  turns_used: number;
  turn_cap: number | null;
  resets_at: string;
}

export const AI_BUSY_MESSAGE = 'Another AI request is still running. Try again when it finishes.';

export function formatUsageReset(resetsAt: string): string {
  const date = new Date(resetsAt);
  if (!Number.isFinite(date.getTime())) return 'the next daily reset';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

export function usageLimitMessage(budget: ResearchAiUsageBudget | null): string {
  return budget
    ? `Daily AI usage limit reached. Access resets ${formatUsageReset(budget.resets_at)}.`
    : 'Daily AI usage limit reached. Check the usage meter for the reset time.';
}

/** An expired snapshot must not keep the composer locked after the reset. */
export function isUsageExhausted(budget: ResearchAiUsageBudget | null, now = Date.now()): boolean {
  if (!budget || new Date(budget.resets_at).getTime() <= now) return false;
  return (
    (budget.remaining != null && Number(budget.remaining) <= 0) ||
    (budget.turn_cap != null && budget.turns_used >= budget.turn_cap)
  );
}
