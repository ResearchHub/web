import { ApiClient } from './client';

export interface DepositRequest {
  amount: number;
  transaction_hash: string;
  from_address: string;
  network: string;
}

export class DepositService {
  private static readonly BASE_PATH = '/api/deposit/start_deposit_rsc';

  /**
   * Saves a deposit transaction to the backend
   * @param depositData - The deposit transaction data
   * @throws Error when the API request fails
   */
  static async saveDeposit(depositData: DepositRequest): Promise<void> {
    try {
      await ApiClient.post<void>(`${this.BASE_PATH}/`, depositData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to save deposit: ${error.message}`);
      }
      throw new Error('Failed to save deposit: Unknown error');
    }
  }
}
