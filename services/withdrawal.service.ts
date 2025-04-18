import { ApiClient } from './client';

export interface WithdrawalRequest {
  to_address: string;
  agreed_to_terms: boolean;
  amount: string;
  transaction_fee: string;
  network: 'ETHEREUM' | 'BASE';
}

export interface WithdrawalResponse {
  transaction_hash: string;
  amount: number;
  to_address: string;
}

export class WithdrawalService {
  private static readonly WITHDRAWAL_PATH = '/api/withdrawal';

  /**
   * Initiates a withdrawal of RSC to the specified wallet address
   * @param withdrawalData - The withdrawal data containing amount and destination address
   * @returns Promise with the withdrawal response containing transaction hash
   * @throws Error when the API request fails with the exact error message from the API
   */
  static async withdrawRSC(withdrawalData: WithdrawalRequest): Promise<WithdrawalResponse> {
    try {
      console.log('[WithdrawalService] Starting withdrawal request:', withdrawalData);
      const token = ApiClient.getGlobalAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Token ${token}`;
      } else {
        console.warn('[WithdrawalService] No auth token available for withdrawal request');
      }

      console.log(
        '[WithdrawalService] Request URL:',
        `${process.env.NEXT_PUBLIC_API_URL}${this.WITHDRAWAL_PATH}/`
      );
      console.log('[WithdrawalService] Request headers:', headers);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${this.WITHDRAWAL_PATH}/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(withdrawalData),
        mode: 'cors',
        cache: 'no-cache',
      });

      console.log('[WithdrawalService] Response status:', response.status);
      console.log(
        '[WithdrawalService] Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        console.log('[WithdrawalService] Error response content-type:', contentType);

        if (contentType?.includes('application/json')) {
          console.log('[WithdrawalService] Processing JSON error response');
          const errorData = await response.json();
          console.log('[WithdrawalService] JSON error data:', errorData);
          const errorMessage = errorData.message || errorData.detail || 'Request failed';
          console.log('[WithdrawalService] Throwing error with message:', errorMessage);
          throw new Error(errorMessage);
        } else {
          console.log('[WithdrawalService] Processing text error response');
          const errorText = await response.text();
          console.log('[WithdrawalService] Raw error text:', errorText);
          console.log(
            '[WithdrawalService] Throwing error with message:',
            errorText || 'Request failed'
          );
          throw new Error(errorText || 'Request failed');
        }
      }

      const responseData = await response.json();
      console.log('[WithdrawalService] Success response data:', responseData);
      return responseData;
    } catch (error: unknown) {
      console.error('[WithdrawalService] Error caught in withdrawal service:', error);
      if (error instanceof Error) {
        console.log('[WithdrawalService] Error is Error type with message:', error.message);
        throw error;
      }
      console.log('[WithdrawalService] Error is not Error type, throwing generic error');
      throw new Error('Unknown error during withdrawal');
    }
  }
}
