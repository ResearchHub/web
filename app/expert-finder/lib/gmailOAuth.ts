import type { MailboxConnectConfig } from '@/types/expertFinder';

export const GMAIL_OAUTH_STATE_KEY = 'ef_gmail_oauth_state';
export const GMAIL_OAUTH_REDIRECT_URI_KEY = 'ef_gmail_oauth_redirect_uri';
export const EXPERT_FINDER_SETTINGS_PATH = '/expert-finder/settings';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export function defaultGmailRedirectUri(): string {
  if (typeof window === 'undefined') return EXPERT_FINDER_SETTINGS_PATH;
  return `${window.location.origin}${EXPERT_FINDER_SETTINGS_PATH}`;
}

export function generateOAuthState(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function storeGmailOAuthSession(state: string, redirectUri: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(GMAIL_OAUTH_STATE_KEY, state);
    window.sessionStorage.setItem(GMAIL_OAUTH_REDIRECT_URI_KEY, redirectUri);
  } catch {
    // ignore quota / private mode
  }
}

export function peekGmailOAuthState(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(GMAIL_OAUTH_STATE_KEY);
  } catch {
    return null;
  }
}

export function peekGmailOAuthRedirectUri(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(GMAIL_OAUTH_REDIRECT_URI_KEY);
  } catch {
    return null;
  }
}

export function clearGmailOAuthSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(GMAIL_OAUTH_STATE_KEY);
    window.sessionStorage.removeItem(GMAIL_OAUTH_REDIRECT_URI_KEY);
  } catch {
    // ignore
  }
}

export function buildGoogleAuthUrl(config: MailboxConnectConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}
