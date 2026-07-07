export function stripUsdSuffix(value: string): string {
  if (value.includes('$') && value.endsWith(' USD')) {
    return value.slice(0, -4);
  }

  return value;
}

export function stripResearchHubPrefix(value: string): string {
  return value.replace(/^ResearchHub\s+/i, '');
}
