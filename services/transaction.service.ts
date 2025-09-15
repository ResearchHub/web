import { ApiClient } from './client';
import { v4 as uuidv4 } from 'uuid'; // Import uuid here
import type {
  TransactionAPIResponse,
  UserBalanceResponse,
  TransactionAPIRequest,
} from './types/transaction.dto'; // Assuming types are here
import { ApiError } from './types'; // Import from ./types

// Define the type for content type mapping result used internally
export type TipContentType = 'researchhubpost' | 'paper' | 'rhcommentmodel';

// Define the request payload type for the API call (snake_case)
interface TipApiPayload {
  content_type: TipContentType;
  object_id: number;
  client_id: string;
  amount: number;
  purchase_type: 'BOOST';
  purchase_method: 'OFF_CHAIN';
}

// Define a potential response type (adjust as needed based on actual API)
interface TipResponse {
  // Define expected fields from the API response after a successful tip
  success: boolean;
  message?: string;
  // Add other relevant fields
}

// Define the arguments for the service function (camelCase)
interface TipServiceArgs {
  contentType: TipContentType;
  objectId: number;
  amount: number;
}

// Deposit interfaces
export interface DepositRequest {
  amount: number;
  transaction_hash: string;
  from_address: string;
  network: string;
}

// Define the pending deposit response interface
export interface PendingDeposit {
  id: number;
  user: number;
  amount: string;
  from_address: string;
  transaction_hash: string;
  paid_status: 'PENDING' | 'PAID' | 'FAILED' | null;
  paid_date: string | null;
  created_date: string;
  updated_date: string;
  network: string;
  is_public: boolean;
  is_removed: boolean;
  is_removed_date: string | null;
}

export interface PendingDepositResponse {
  results: PendingDeposit[];
  next: string | null;
  count: number;
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
  private static readonly DEPOSITS_PATH = '/api/deposit';
  private static readonly PURCHASE_PATH = '/api/purchase/'; // Define purchase path

  /**
   * Fetches the current transaction fee for withdrawal on the BASE network
   * @returns The transaction fee amount in RSC
   * @throws Error when the API request fails
   */
  static async getWithdrawalFee(): Promise<number> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${this.WITHDRAWAL_PATH}/transaction_fee/?network=BASE`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch transaction fee: ${response.status}`);
      }

      // The API returns the fee as a single decimal number
      const fee = await response.json();
      return parseFloat(fee);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error while fetching transaction fee');
    }
  }

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
   * Fetches deposits for the current user with optional pagination
   * @param page - The page number to fetch (defaults to 1)
   */
  static async getDeposits(page: number = 1): Promise<PendingDepositResponse> {
    const response = await ApiClient.get<PendingDepositResponse>(
      `${this.DEPOSITS_PATH}/?page=${page}`
    );

    if (!response?.results) {
      throw new Error('Invalid response format');
    }

    return response;
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

  /* Sends a tip for a specific piece of content.
   * Accepts camelCase arguments and maps them to the API payload.
   */
  static async tipContentTransaction(args: TipServiceArgs): Promise<TipResponse> {
    const { contentType, objectId, amount } = args;

    // Map to the API payload format
    const payload: TipApiPayload = {
      content_type: contentType,
      object_id: objectId,
      amount: amount,
      client_id: uuidv4(), // Generate client_id here
      purchase_type: 'BOOST',
      purchase_method: 'OFF_CHAIN',
    };

    // Note: The actual response type might differ. Adjust TipResponse accordingly.
    const response = await ApiClient.post<TipResponse>(this.PURCHASE_PATH, payload);
    return response;
  }
}
