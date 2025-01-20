import { ApiClient } from './client';
import type {
  TransactionAPIResponse,
  UserBalanceResponse,
  TransactionAPIRequest,
} from './types/transaction.dto';

export class TransactionService {
  private static readonly BASE_PATH = '/api/transactions';
  private static readonly WITHDRAWAL_PATH = '/api/withdrawal';

  /**
   * Fetches transactions for the current user
   */
  static async getTransactions(page: number = 1): Promise<{
    results: TransactionAPIRequest[];
    next: string | null;
  }> {
    const response = await ApiClient.get<TransactionAPIResponse>(`${this.BASE_PATH}/?page=${page}`);

    if (!response?.results) {
      throw new Error('Invalid response format');
    }

    return {
      results: response.results,
      next: response.next,
    };
  }

  /**
   * Fetches the user's balance
   */
  static async getUserBalance(): Promise<number> {
    const response = await ApiClient.get<UserBalanceResponse>(`${this.WITHDRAWAL_PATH}/`);
    return response.user.balance;
  }

  static async exportTransactionsCSV() {
    return ApiClient.getBlob(`${this.BASE_PATH}/turbotax_csv_export/`);
  }
}
