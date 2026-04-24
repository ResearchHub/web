export function formatMonthForChart(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return new Date(+year, +month - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}
