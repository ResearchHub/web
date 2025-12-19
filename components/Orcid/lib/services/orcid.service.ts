'use server';

import { ApiClient } from '@/services/client';
import { redirect } from 'next/navigation';

export async function connectOrcidAccount(returnUrl: string): Promise<void> {
  let authUrl: string;

  try {
    const response = await ApiClient.post<{ auth_url: string }>('/api/orcid/connect/', {
      return_url: returnUrl,
    });
    authUrl = response.auth_url;
  } catch {
    throw new Error('Unable to connect to ORCID.');
  }

  if (!authUrl) {
    throw new Error('Unable to connect to ORCID.');
  }

  redirect(authUrl);
}
