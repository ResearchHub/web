import { ApiClient } from './client';

export class DepositService {
  private static readonly BASE_PATH = '/api/deposit/start_deposit_rsc';

  static async saveDeposit(depositData: {
    amount: number;
    transaction_hash: string;
    from_address: string;
    network: string;
  }): Promise<void> {
    try {
      await ApiClient.post<void>(`${this.BASE_PATH}/`, depositData);
    } catch (error: any) {
      throw new Error(`Failed to save deposit: ${error.message}`);
    }
  }
}
