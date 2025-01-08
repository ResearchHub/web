import { ApiClient } from './client';
import type { ExchangeRateResponse } from './types/transaction.dto';

/**
 * Service to handle RSC/USD exchange rate fetching and caching.
 * Exchange rates are stored in a paginated API with the most recent rates first.
 * For any given date, we:
 * 1. Try to find an exact rate within one hour of the target date
 * 2. If not found, use the closest future rate (to match market expectations)
 * 3. If no future rate exists, use the most recent historical rate
 * 
 * This approach ensures we always have a reasonable rate estimate while
 * prioritizing rates that would have been available at the time of transaction.
 */
export class ExchangeRateService {
  private static readonly BASE_PATH = '/api/exchange_rate';
  private static rateCache = new Map<string, number>();
  private static pendingRequests = new Map<string, Promise<number>>();
  private static readonly MAX_RETRIES = 365 * 2.4; // Maximum days * pages per day
  private static readonly ENTRIES_PER_PAGE = 10;
  private static readonly ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds

  /**
   * Fetches exchange rate for a specific date.
   * Uses a caching system to:
   * - Prevent duplicate API calls for the same date
   * - Cache successful results for future use
   * - Handle concurrent requests for the same date
   */
  static async fetchRateForDate(date: string): Promise<number> {
    // Check cache first
    if (this.rateCache.has(date)) {
      return this.rateCache.get(date)!;
    }

    // Check if there's a pending request
    if (this.pendingRequests.has(date)) {
      return this.pendingRequests.get(date)!;
    }

    // Create new request
    const request = this.fetchRateFromAPI(date);
    this.pendingRequests.set(date, request);

    try {
      const rate = await request;
      this.rateCache.set(date, rate);
      return rate;
    } finally {
      this.pendingRequests.delete(date);
    }
  }

  /**
   * Fetches exchange rates for multiple dates in parallel
   */
  static async fetchRatesForDates(dates: string[]): Promise<Map<string, number>> {
    const uniqueDates = Array.from(new Set(dates));
    const results = await Promise.all(
      uniqueDates.map(async date => {
        const rate = await this.fetchRateForDate(date);
        return [date, rate] as const;
      })
    );

    return new Map(results);
  }

  /**
   * Internal method to fetch rate from API.
   * Uses a pagination strategy to efficiently search through historical rates:
   * 1. Estimates initial page based on time difference
   * 2. Searches through pages until finding an appropriate rate
   * 3. Implements fallback logic when exact matches aren't found
   */
  private static async fetchRateFromAPI(date: string): Promise<number> {
    try {
      const targetDate = new Date(date);
      let retryCount = 0;
      let nextUrl: string | null = `${this.BASE_PATH}/?${new URLSearchParams({
        ordering: '-created_date',
        page_size: '10'
      }).toString()}`;

      // Calculate the page number based on the target date
      const now = new Date();
      const hoursDiff = Math.floor((now.getTime() - targetDate.getTime()) / this.ONE_HOUR);
      let startPage = Math.floor(hoursDiff / this.ENTRIES_PER_PAGE);

      let closestFutureRate: number | null = null;
      let closestFutureTimeDiff: number = Infinity;

      while (nextUrl && retryCount < this.MAX_RETRIES) {
        const pageUrl = nextUrl.includes('page=') 
          ? nextUrl 
          : `${nextUrl}${nextUrl.includes('?') ? '&' : '?'}page=${startPage + 1}`;

        const response: ExchangeRateResponse = await ApiClient.get<ExchangeRateResponse>(pageUrl);

        if (!response.results?.length) {
          throw new Error('No exchange rates available');
        }

        // Check if we've gone too far back in time before processing rates
        const oldestDateInPage = new Date(response.results[response.results.length - 1].created_date);
        if (oldestDateInPage < targetDate) {
          // If we have a future rate, use it
          if (closestFutureRate !== null) {
            return closestFutureRate;
          }
          // Otherwise use the most recent rate from this page
          return response.results[0].rate;
        }

        // Process rates in this page
        for (const rate of response.results) {
          const rateDate = new Date(rate.created_date);
          const timeDiff = Math.abs(rateDate.getTime() - targetDate.getTime());
          
          // If within one hour, use this rate immediately
          if (timeDiff <= this.ONE_HOUR) {
            return rate.rate;
          }
          
          // Keep track of the closest future rate
          if (rateDate > targetDate && timeDiff < closestFutureTimeDiff) {
            closestFutureRate = rate.rate;
            closestFutureTimeDiff = timeDiff;
          }
        }

        // Update for next iteration
        nextUrl = response.next;
        startPage++;
        retryCount++;
      }

      // If we've exhausted all pages and have a future rate, use it
      if (closestFutureRate !== null) {
        return closestFutureRate;
      }

      throw new Error(`No exchange rate found for date: ${date} after ${retryCount} retries`);
    } catch (error) {
      console.error(`Failed to fetch exchange rate for ${date}:`, error);
      throw error;
    }
  }

  /**
   * Clears the rate cache
   */
  static clearCache() {
    this.rateCache.clear();
  }
}