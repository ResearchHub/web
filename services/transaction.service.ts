import { ApiClient } from './client';
import type {
  TransactionAPIResponse,
  UserBalanceResponse,
  TransactionAPIRequest,
} from './types/transaction.dto';

// Deposit interfaces
export interface DepositRequest {
  amount: number;
  transaction_hash: string;
  from_address: string;
  network: string;
}

// Withdrawal interfaces
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

export class TransactionService {
  private static readonly BASE_PATH = '/api/transactions';
  private static readonly WITHDRAWAL_PATH = '/api/withdrawal';
  private static readonly DEPOSIT_PATH = '/api/deposit/start_deposit_rsc';

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

  /**
   * Saves a deposit transaction to the backend
   * @param depositData - The deposit transaction data
   * @throws Error when the API request fails
   */
  static async saveDeposit(depositData: DepositRequest): Promise<void> {
    try {
      await ApiClient.post<void>(`${this.DEPOSIT_PATH}/`, depositData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to save deposit: ${error.message}`);
      }
      throw new Error('Failed to save deposit: Unknown error');
    }
  }

  /**
   * Initiates a withdrawal of RSC to the specified wallet address
   * @param withdrawalData - The withdrawal data containing amount and destination address
   * @returns Promise with the withdrawal response containing transaction hash
   * @throws Error when the API request fails with the exact error message from the API
   */
  static async withdrawRSC(withdrawalData: WithdrawalRequest): Promise<WithdrawalResponse> {
    try {
      const token = ApiClient.getGlobalAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${this.WITHDRAWAL_PATH}/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(withdrawalData),
        mode: 'cors',
        cache: 'no-cache',
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          const errorData = await response.json();

          // Handle string responses or object responses with message/detail properties
          const errorMessage =
            typeof errorData === 'string'
              ? errorData
              : errorData.message || errorData.detail || 'Request failed';

          throw new Error(errorMessage);
        } else {
          const errorText = await response.text();
          throw new Error(errorText || 'Request failed');
        }
      }

      return await response.json();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during withdrawal');
    }
  }
}
