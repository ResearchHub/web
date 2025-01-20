import { ApiClient } from './client';
import type { ExchangeRateResponse } from './types/transaction.dto';

export class ExchangeRateService {
  private static readonly BASE_PATH = '/api/exchange_rate';

  /**
   * Fetches and transforms the latest exchange rate
   * @returns The latest exchange rate as a number
   * @throws Error if no exchange rates are available
   */
  static async getLatestRate(): Promise<number> {
    try {
      const response = await ApiClient.get<ExchangeRateResponse>(
        `${this.BASE_PATH}/?page_size=1&ordering=-id&price_source=COIN_GECKO`
      );

      if (!response.results?.length) {
        throw new Error('No exchange rates available');
      }

      return response.results[0].rate;
    } catch (error) {
      console.error('Failed to fetch latest exchange rate:', error);
      throw error;
    }
  }
}
