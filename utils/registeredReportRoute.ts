export function buildRegisteredReportUrl(reportId: string | number, slug?: string | null): string {
  return slug ? `/report/${reportId}/${slug}` : `/report/${reportId}`;
}
