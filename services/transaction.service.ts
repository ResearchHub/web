import { ApiClient } from './client'
import type { TransactionAPIResponse, UserBalanceResponse, ExchangeRateResponse } from './types/transaction.dto'

export class TransactionService {
  private static readonly BASE_PATH = '/api/transactions'
  private static readonly WITHDRAWAL_PATH = '/api/withdrawal'
  private static readonly EXCHANGE_RATE_PATH = '/api/exchange_rate'

  static async getTransactions(page: number = 1) {
    return ApiClient.get<TransactionAPIResponse>(
      `${this.BASE_PATH}/?page=${page}`
    )
  }

  static async getUserBalance() {
    return ApiClient.get<UserBalanceResponse>(`${this.WITHDRAWAL_PATH}/`)
  }

  static async getLatestExchangeRate() {
    return ApiClient.get<ExchangeRateResponse>(
      `${this.EXCHANGE_RATE_PATH}/?page_size=1&ordering=-id&price_source=COIN_GECKO`
    );
  }

  static async exportTransactionsCSV() {
    return ApiClient.getBlob(`${this.BASE_PATH}/turbotax_csv_export/`);
  }
} 