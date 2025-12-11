import { ApiClient } from '@/services/client';

export async function connectOrcidAccount(): Promise<void> {
  const { auth_url } = await ApiClient.post<{ auth_url: string }>('/api/orcid/connect/');
  window.location.href = auth_url;
}

interface ApiOrcidCallbackResponse {
  readonly success: boolean;
  readonly author_id?: number;
}

export interface OrcidCallbackResponse {
  readonly success: boolean;
  readonly authorId?: number;
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

export async function syncOrcidAuthorship(): Promise<void> {
  await ApiClient.post('/api/orcid/fetch/');
}
