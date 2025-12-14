'use server';

import { ApiClient } from '@/services/client';
import { ID } from '@/types/root';
import { redirect } from 'next/navigation';

export async function connectOrcidAccount(): Promise<void> {
  try {
    const { auth_url } = await ApiClient.post<{ auth_url: string }>('/api/orcid/connect/');

    if (!auth_url) {
      throw new Error('Could not connect to ORCID. Please try again.');
    }
    redirect(auth_url);
  } catch (error) {
    throw error;
  }
}

interface ApiOrcidCallbackResponse {
  readonly success: boolean;
  readonly author_id?: ID;
}

export interface OrcidCallbackResponse {
  readonly success: boolean;
  readonly authorId?: ID;
}

const transformOrcidCallbackResponse = (raw: ApiOrcidCallbackResponse): OrcidCallbackResponse => ({
  success: raw.success,
  authorId: raw.author_id,
});

export async function processOrcidCallback(
  code: string,
  state: string
): Promise<OrcidCallbackResponse> {
  const response = await ApiClient.post<ApiOrcidCallbackResponse>('/api/orcid/callback/', {
    code,
    state,
  });
  return transformOrcidCallbackResponse(response);
}
