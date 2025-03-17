import { NonprofitOrg, NonprofitSearchParams } from '@/types/nonprofit';
import { ApiClient } from './client';
import { ID } from '@/types/root';
import { isFeatureEnabled } from '@/utils/featureFlags';

/**
 * Service for interacting with nonprofit organizations API
 */
export class NonprofitService {
  private static readonly BASE_PATH = '/api/organizations/non-profit';

  /**
   * Check if nonprofit integration is enabled
   * @throws Error if the feature is disabled
   */
  private static checkFeatureEnabled(): void {
    if (!isFeatureEnabled('nonprofitIntegration')) {
      throw new Error('Nonprofit integration is not available in this environment');
    }
  }

  /**
   * Search for nonprofit organizations based on provided parameters
   * @param searchTerm - The search term to find matching nonprofit organizations
   * @param options - Additional search parameters
   * @returns A promise that resolves to an array of NonprofitOrg objects
   * @throws Error when the API request fails or when the feature is disabled
   */
  static async searchNonprofitOrgs(
    searchTerm: string,
    options: Omit<NonprofitSearchParams, 'searchTerm'> = {}
  ): Promise<NonprofitOrg[]> {
    this.checkFeatureEnabled();

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

  /**
   * Create or retrieve a nonprofit organization
   * @param params - The nonprofit organization parameters
   * @returns A promise that resolves to the created or retrieved NonprofitOrg object
   * @throws Error when the API request fails or when the feature is disabled
   */
  static async createNonprofit(params: {
    name: string;
    endaoment_org_id: string;
    ein?: string;
    base_wallet_address?: string;
  }): Promise<NonprofitOrg> {
    this.checkFeatureEnabled();

    try {
      const response = await ApiClient.post<NonprofitOrg>(`${this.BASE_PATH}/create/`, params);
      return response;
    } catch (error) {
      console.error('Error creating nonprofit organization:', error);
      throw error;
    }
  }

  /**
   * Link a nonprofit organization to a fundraise
   * @param params - The link parameters
   * @returns A promise that resolves to the created link object
   * @throws Error when the API request fails or when the feature is disabled
   */
  static async linkToFundraise(params: {
    nonprofit_id: ID;
    fundraise_id: ID;
    note?: string;
  }): Promise<{ id: ID; nonprofit: NonprofitOrg; fundraise: { id: ID } }> {
    this.checkFeatureEnabled();

    try {
      const response = await ApiClient.post<{
        id: ID;
        nonprofit: NonprofitOrg;
        fundraise: { id: ID };
      }>(`${this.BASE_PATH}/link-to-fundraise/`, params);
      return response;
    } catch (error) {
      console.error('Error linking nonprofit to fundraise:', error);
      throw error;
    }
  }
}
