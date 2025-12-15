'use server';

import { ApiClient } from '@/services/client';
import { redirect } from 'next/navigation';

export async function connectOrcidAccount(returnUrl: string): Promise<void> {
  const { auth_url } = await ApiClient.post<{ auth_url: string }>('/api/orcid/connect/', {
    return_url: returnUrl,
  });

  if (!auth_url) {
    throw new Error('Could not connect to ORCID');
  }

  redirect(auth_url);
}
