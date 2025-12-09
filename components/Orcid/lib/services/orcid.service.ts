import { ApiClient } from '@/services/client';

export async function connectOrcidAccount(returnUrl = window.location.href): Promise<void> {
  const { auth_url } = await ApiClient.post<any>('/api/orcid/connect', { return_to: returnUrl });
  window.location.href = auth_url;
}
