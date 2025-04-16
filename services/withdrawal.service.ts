import { ApiClient } from './client';
import { ApiError } from './types';

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
      if (error instanceof ApiError) {
        throw new Error(error.message);
      } else if (error instanceof Error) {
        throw error;
      }

      throw new Error('Unknown error during withdrawal');
    }
  }
}
