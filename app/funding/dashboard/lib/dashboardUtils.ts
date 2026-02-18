export function parseUserId(param: string | null): number | undefined {
  if (!param) return undefined;
  const parsed = Number(param);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function formatMonthForChart(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return new Date(+year, +month - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}
