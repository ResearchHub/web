/** User-wide Research AI allowances. Decimal strings are never dollar amounts. */
export interface ResearchAIBudget {
  tier: 'default' | 'invited' | 'privileged' | 'blocked';
  credits: {
    daily_limit: string | null;
    used: string;
    remaining: string | null;
  };
  turns_used: number;
  turn_cap: number | null;
  resets_at: string;
}

export function isResearchAIBudget(value: unknown): value is ResearchAIBudget {
  if (!value || typeof value !== 'object') return false;
  const budget = value as ResearchAIBudget;
  const decimal = (v: unknown) => typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v);
  return (
    ['default', 'invited', 'privileged', 'blocked'].includes(budget.tier) &&
    budget.credits != null &&
    (budget.credits.daily_limit === null || decimal(budget.credits.daily_limit)) &&
    decimal(budget.credits.used) &&
    (budget.credits.remaining === null || decimal(budget.credits.remaining)) &&
    Number.isInteger(budget.turns_used) &&
    (budget.turn_cap === null || Number.isInteger(budget.turn_cap)) &&
    typeof budget.resets_at === 'string' &&
    Number.isFinite(Date.parse(budget.resets_at))
  );
}

export function isBudgetExhausted(budget: ResearchAIBudget | null): boolean {
  if (!budget) return false;
  return (
    (budget.credits.daily_limit !== null &&
      budget.credits.remaining !== null &&
      Number(budget.credits.remaining) <= 0) ||
    (budget.turn_cap !== null && budget.turns_used >= budget.turn_cap)
  );
}

export function canSelectAIModel(tier: ResearchAIBudget['tier'] | undefined): boolean {
  return tier === 'invited' || tier === 'privileged';
}

/** Keep the API's fractional precision, including balances smaller than 0.01. */
export function formatCredits(value: string): string {
  return value.includes('.') ? value.replace(/0+$/, '').replace(/\.$/, '') : value;
}

export function formatBudgetReset(resetsAt: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(
    new Date(resetsAt)
  );
}
