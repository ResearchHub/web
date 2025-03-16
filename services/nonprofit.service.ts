import { NonprofitOrg, NonprofitSearchParams } from '@/types/nonprofit';
import { ApiClient } from './client';

/**
 * Service for interacting with nonprofit organizations API
 */
export class NonprofitService {
  private static readonly BASE_PATH = '/api/organizations/non-profit';

  /**
   * Search for nonprofit organizations based on provided parameters
   * @param searchTerm - The search term to find matching nonprofit organizations
   * @param options - Additional search parameters (nteeMajorCodes, nteeMinorCodes, countries, count, offset)
   * @returns A promise that resolves to an array of NonprofitOrg objects
   * @throws Error when the API request fails
   */
  static async searchNonprofitOrgs(
    searchTerm: string,
    options: Omit<NonprofitSearchParams, 'searchTerm'> = {}
  ): Promise<NonprofitOrg[]> {
    const params = new URLSearchParams({
      searchTerm,
      ...(options.nteeMajorCodes && { nteeMajorCodes: options.nteeMajorCodes }),
      ...(options.nteeMinorCodes && { nteeMinorCodes: options.nteeMinorCodes }),
      ...(options.countries && { countries: options.countries }),
      ...(options.count && { count: options.count.toString() }),
      ...(options.offset && { offset: options.offset.toString() }),
    });

    try {
      const response = await ApiClient.get<NonprofitOrg[]>(
        `${this.BASE_PATH}/search/?${params.toString()}`
      );

      return response;
    } catch (error) {
      console.error('Error searching nonprofit organizations:', error);
      throw error;
    }
  }
}
