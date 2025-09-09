import { ApiClient } from './client';

interface OrcidCheckResponse {
  authenticated: boolean;
  orcid_id: string | null;
  needs_reauth: boolean;
  error: string | null;
}

interface OrcidAuthUrlResponse {
  auth_url: string;
  user_id: number;
}

/** Returns detailed ORCID authentication status from backend. */
export async function checkOrcidAuth(): Promise<boolean> {
  try {
    const res = await ApiClient.get<OrcidCheckResponse>('/api/orcid/check');
    return res.authenticated && !res.needs_reauth;
  } catch (error) {
    console.error('Failed to check ORCID auth status:', error);
    return false;
  }
}

/** Trigger manual ORCID sync for the current user. */
export async function triggerOrcidSync(): Promise<void> {
  await ApiClient.post('/api/orcid/sync');
}

/**
 * Redirect to ORCID authorization using backend-generated auth URL.
 *
 * This function:
 * 1. Calls the backend to generate a properly configured ORCID auth URL
 * 2. Redirects the user to that URL
 * 3. ORCID will redirect directly to the backend callback
 * 4. Backend handles token exchange and user sync automatically
 *
 * @param returnTo Optional URL to redirect to after successful authentication
 */
export async function redirectToOrcidLogin(returnTo?: string): Promise<void> {
  try {
    // Build query parameters for the auth URL request
    const params = new URLSearchParams();
    if (returnTo) {
      params.append('return_to', returnTo);
    } else if (typeof window !== 'undefined') {
      params.append('return_to', window.location.href);
    }

    // Get the auth URL from the backend
    const endpoint = `/api/orcid/auth-url${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await ApiClient.get<OrcidAuthUrlResponse>(endpoint);

    // Redirect to the ORCID authorization URL
    if (typeof window !== 'undefined') {
      window.location.href = response.auth_url;
    }
  } catch (error) {
    console.error('Failed to initiate ORCID login:', error);
    throw new Error('Failed to start ORCID authentication process');
  }
}
