import { ApiClient } from '@/services/client';

/**
 * Initiates the connection process to Endaoment by obtaining an authorization URL.
 * The client should redirect the user to this URL to complete the connection.
 *
 * @param returnUrl The URL to which Endaoment should redirect after authorization.
 * @returns The authorization URL.
 * @throws ApiError if the request fails.
 */
export async function connectEndaomentAccount(returnUrl: string): Promise<string> {
  const response = await ApiClient.post<{ auth_url: string }>('/api/endaoment/connect/', {
    return_url: returnUrl,
  });

  return response.auth_url;
}

interface EndaomentStatus {
  connected: boolean;
  endaomentUserId: string | null;
}

/**
 * Provides the connection status of the Endaoment account.
 *
 * @returns The connection status and Endaoment user ID if connected.
 */
export async function getEndaomentStatus(): Promise<EndaomentStatus> {
  const response = await ApiClient.get<{ connected: boolean; endaoment_user_id: string | null }>(
    '/api/endaoment/status/'
  );
  return {
    connected: response.connected,
    endaomentUserId: response.endaoment_user_id,
  };
}

export interface EndaomentFund {
  id: string;
  name: string;
  type: string;
  description: string;
  usdcBalance: string;
}

/**
 * Fetches the user's Endaoment funds (DAFs).
 */
export async function getEndaomentFunds(): Promise<EndaomentFund[]> {
  return ApiClient.get<EndaomentFund[]>('/api/endaoment/funds/');
}
