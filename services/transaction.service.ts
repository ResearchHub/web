import { ApiClient } from './client'
import type { 
  TransactionResponse,
  TransactionDTO,
} from './types/transaction.dto'

export class TransactionService {
  private static readonly BASE_PATH = '/api'

  static async getTransactions() {
    return ApiClient.get<TransactionResponse>(
      `${this.BASE_PATH}/transactions/`
    )
  }

  static async getTransactionsByUrl(url: string) {
    const urlObject = new URL(url)
    return ApiClient.get<TransactionResponse>(urlObject.pathname + urlObject.search)
  }
} 