import { ApiClient } from '@/services/client';

type ConnectResult = { success: true; authUrl: string } | { success: false; error: string };

export async function connectOrcidAccount(returnUrl: string): Promise<ConnectResult> {
  try {
    const response = await ApiClient.post<{ auth_url: string }>('/api/orcid/connect/', {
      return_url: returnUrl,
    });

    if (!response.auth_url) {
      return { success: false, error: 'Unable to connect to ORCID.' };
    }

    return { success: true, authUrl: response.auth_url };
  } catch {
    return { success: false, error: 'Unable to connect to ORCID.' };
  }
}

export async function syncOrcidAuthorship(): Promise<void> {
  await ApiClient.post('/api/orcid/fetch/');
}
