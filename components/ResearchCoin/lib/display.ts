export function stripUsdSuffix(value: string): string {
  if (value.includes('$') && value.endsWith(' USD')) {
    return value.slice(0, -4);
  }

  return value;
}
