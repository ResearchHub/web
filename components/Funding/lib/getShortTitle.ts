export function getShortTitle(shortTitle: string, title: string): string {
  if (shortTitle) return shortTitle;
  return title.replace(/^Request for Proposals\s*[-–—:]\s*/i, '');
}
