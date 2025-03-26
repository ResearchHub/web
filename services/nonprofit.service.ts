import {
  NonprofitOrg,
  NonprofitSearchParams,
  NonprofitDetails,
  NonprofitLink,
} from '@/types/nonprofit';
import { ApiClient } from './client';
import { ID } from '@/types/root';
import { isFeatureEnabled } from '@/utils/featureFlags';
import { ApiError } from './types';

// Custom error class for feature flag issues
export class NonprofitFeatureDisabledError extends Error {
  constructor() {
    super('Nonprofit integration is not available in this environment');
    this.name = 'NonprofitFeatureDisabledError';
  }
}

// Custom error class for nonprofit service errors
export class NonprofitServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonprofitServiceError';
  }
}

/**
 * Service for interacting with nonprofit organizations API
 */
export class NonprofitService {
  private static readonly BASE_PATH = '/api/organizations/non-profit';

  /**
   * Check if nonprofit integration is enabled
   * @throws NonprofitFeatureDisabledError if the feature is disabled
   */
  private static checkFeatureEnabled(): void {
    if (!isFeatureEnabled('nonprofitIntegration')) {
      throw new NonprofitFeatureDisabledError();
    }
  }

  /**
   * Search for nonprofit organizations based on provided parameters
   * @param searchTerm - The search term to find matching nonprofit organizations
   * @param options - Additional search parameters
   * @returns A promise that resolves to an array of NonprofitOrg objects
   * @throws NonprofitFeatureDisabledError when the feature is disabled
   * @throws NonprofitServiceError when the API request fails
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
      throw error instanceof Error
        ? new NonprofitServiceError(error.message)
        : new NonprofitServiceError('Failed to search nonprofit organizations');
    }
  }

  /**
   * Create or retrieve a nonprofit organization
   * @param params - The nonprofit organization parameters
   * @returns A promise that resolves to the created or retrieved NonprofitOrg object
   * @throws NonprofitFeatureDisabledError when the feature is disabled
   * @throws NonprofitServiceError when the API request fails
   */
  static async createNonprofit(params: {
    name: string;
    endaoment_org_id: string;
    ein?: string;
    base_wallet_address?: string;
  }): Promise<NonprofitOrg> {
    this.checkFeatureEnabled();
    const endpoint = `${this.BASE_PATH}/create/`;

    // Validate endaoment_org_id is present
    if (!params.endaoment_org_id) {
      throw new NonprofitServiceError('endaoment_org_id is required');
    }

    try {
      const response = await ApiClient.post<NonprofitOrg>(endpoint, params);
      return response;
    } catch (error: unknown) {
      // Check for specific API errors
      if (error instanceof ApiError) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.data && errorData.data.error) {
            throw new NonprofitServiceError(errorData.data.error);
          } else if (errorData.error) {
            throw new NonprofitServiceError(errorData.error);
          }
        } catch (parseError) {
          // If parsing fails, continue with original error
        }
      }

      throw error instanceof Error
        ? new NonprofitServiceError(error.message)
        : new NonprofitServiceError('Failed to create nonprofit organization');
    }
  }

  /**
   * Link a nonprofit organization to a fundraise
   * @param params - The link parameters
   * @returns A promise that resolves to the created link object
   * @throws NonprofitFeatureDisabledError when the feature is disabled
   * @throws NonprofitServiceError when the API request fails
   */
  static async linkToFundraise(params: {
    nonprofit_id: ID;
    fundraise_id: ID;
    note?: string;
  }): Promise<{ id: ID; nonprofit: NonprofitOrg; fundraise: { id: ID } }> {
    this.checkFeatureEnabled();
    const endpoint = `${this.BASE_PATH}/link-to-fundraise/`;

    try {
      const response = await ApiClient.post<{
        id: ID;
        nonprofit: NonprofitOrg;
        fundraise: { id: ID };
      }>(endpoint, params);

      return response;
    } catch (error: unknown) {
      // Check for specific error cases
      if (error instanceof ApiError) {
        try {
          const errorData = JSON.parse(error.message);
          // Check for 404 response, which might indicate a missing fundraise
          if (
            errorData.status === 404 &&
            errorData.data &&
            errorData.data.error === 'Fundraise not found'
          ) {
            throw new NonprofitServiceError('Fundraise not found');
          }

          // Try to extract specific error messages
          if (errorData.data && errorData.data.error) {
            throw new NonprofitServiceError(errorData.data.error);
          } else if (errorData.error) {
            throw new NonprofitServiceError(errorData.error);
          }
        } catch (parseError) {
          // If parsing fails, continue with original error
        }
      }

      throw error instanceof Error
        ? new NonprofitServiceError(error.message)
        : new NonprofitServiceError('Failed to link nonprofit to fundraise');
    }
  }

  /**
   * Get nonprofits linked to a fundraise
   * @param fundraiseId - The ID of the fundraise
   * @returns A promise that resolves to an array of nonprofit links
   * @throws NonprofitFeatureDisabledError when the feature is disabled
   * @throws NonprofitServiceError when the API request fails
   */
  static async getNonprofitsByFundraiseId(fundraiseId: ID): Promise<NonprofitLink[]> {
    this.checkFeatureEnabled();
    const endpoint = `${this.BASE_PATH}/get-by-fundraise/?fundraise_id=${fundraiseId}`;

    try {
      const response = await ApiClient.get<NonprofitLink[]>(endpoint);
      return response;
    } catch (error: unknown) {
      // Check for specific error cases
      if (error instanceof ApiError) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.data && errorData.data.error) {
            throw new NonprofitServiceError(errorData.data.error);
          } else if (errorData.error) {
            throw new NonprofitServiceError(errorData.error);
          }
        } catch (parseError) {
          // If parsing fails, continue with original error
        }
      }

      throw error instanceof Error
        ? new NonprofitServiceError(error.message)
        : new NonprofitServiceError('Failed to get nonprofits by fundraise ID');
    }
  }
}
