import { ApiClient } from './client';

export interface WithdrawalRequest {
  amount: number;
  to_address: string;
}

export interface WithdrawalResponse {
  transaction_hash: string;
  amount: number;
  to_address: string;
}

export class WithdrawalService {
  private static readonly WITHDRAWAL_PATH = '/api/web3';

  /**
   * Initiates a withdrawal of RSC to the specified wallet address
   * @param withdrawalData - The withdrawal data containing amount and destination address
   * @returns Promise with the withdrawal response containing transaction hash
   * @throws Error when the API request fails
   */
  static async withdrawRSC(withdrawalData: WithdrawalRequest): Promise<WithdrawalResponse> {
    try {
      return await ApiClient.post<WithdrawalResponse>(
        `${this.WITHDRAWAL_PATH}/withdraw_rsc/`,
        withdrawalData
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to withdraw RSC: ${error.message}`);
      }
      throw new Error('Failed to withdraw RSC: Unknown error');
    }
  }
}
