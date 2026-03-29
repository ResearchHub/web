const STORAGE_KEY = 'expert_finder_outreach_reply_to';

export function readOutreachReplyToFromStorage(): string {
  if (typeof window === 'undefined') return '';
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return typeof v === 'string' ? v : '';
  } catch {
    return '';
  }
}

export function writeOutreachReplyToToStorage(value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore quota / private mode
  }
}
