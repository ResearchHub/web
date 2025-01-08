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

  static async getFilteredTransactions(filters: {
    startDate: string;
    endDate: string;
    page?: number;
    pageSize?: number;
  }) {
    const params = new URLSearchParams({
      created_date_after: filters.startDate,
      created_date_before: filters.endDate
    })

    // Add pagination parameters if provided
    if (filters.page) {
      params.append('page', filters.page.toString())
    }
    if (filters.pageSize) {
      params.append('page_size', filters.pageSize.toString())
    }

    return ApiClient.get<TransactionAPIResponse>(
      `${this.BASE_PATH}/?${params.toString()}`
    )
  }

  static async getUserBalance() {
    return ApiClient.get<UserBalanceResponse>(this.WITHDRAWAL_PATH)
  }

  static async getLatestExchangeRate() {
    return ApiClient.get<ExchangeRateResponse>(
      `${this.EXCHANGE_RATE_PATH}/?page_size=1&ordering=-id&price_source=COIN_GECKO`
    );
  }
} 