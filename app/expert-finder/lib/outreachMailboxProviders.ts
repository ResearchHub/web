const PROVIDER_CODE_LABELS: Record<string, string> = {
  '1': 'Custom IMAP/SMTP',
  '2': 'Google',
  '3': 'Microsoft',
  '4': 'AWS',
  '8': 'AirMail',
  '11': 'Airmail Instant',
};

/** Map a mailbox Instantly `providerCode` to a short display label. */
export function getOutreachMailboxProviderLabel(
  providerCode: string | number | null | undefined
): string {
  const code = String(providerCode ?? '').trim();
  if (!code) return '';
  return PROVIDER_CODE_LABELS[code] ?? '';
}
