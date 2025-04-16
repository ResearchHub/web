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
      return await ApiClient.post<WithdrawalResponse>(`${this.WITHDRAWAL_PATH}/`, withdrawalData);
    } catch (error: unknown) {
      // Handle API errors with proper error message extraction
      if (
        error instanceof Response ||
        (typeof error === 'object' && error !== null && 'status' in error)
      ) {
        try {
          // Try to read the response as text first
          const responseText = await (error as Response).text();

          // If it's valid JSON, parse it
          try {
            const data = JSON.parse(responseText);
            const errorMessage = data.detail || data.message || data.error || JSON.stringify(data);
            throw new Error(errorMessage);
          } catch (jsonError) {
            // Not JSON, use the text directly as the error message
            throw new Error(responseText);
          }
        } catch (responseError) {
          // If we can't read the response, use the original error
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Failed to process withdrawal');
        }
      } else if (error instanceof Error) {
        throw error;
      }

      throw new Error('Unknown error during withdrawal');
    }
  }
}
