export function parseUserId(param: string | null): number | undefined {
  if (!param) return undefined;
  const parsed = Number(param);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return new Date(+year, +month - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}
