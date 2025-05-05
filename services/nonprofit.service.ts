import {
  NonprofitOrg,
  NonprofitSearchParams,
  NonprofitDetails,
  NonprofitLink,
  NonprofitFundraiseLink,
  CreateNonprofitParams,
  LinkToFundraiseParams,
  transformNonprofitDetails,
  transformNonprofitLink,
  transformNonprofitSearchResult,
  transformNonprofitFundraiseLink,
} from '@/types/nonprofit';
import { ApiClient } from './client';
import { ID } from '@/types/root';
import { FeatureFlag, isFeatureEnabled } from '@/utils/featureFlags';
import { ApiError } from './types';

export class NonprofitFeatureDisabledError extends Error {
  constructor() {
    super('Nonprofit integration is not available in this environment');
    this.name = 'NonprofitFeatureDisabledError';
  }
}

export class NonprofitServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonprofitServiceError';
  }
}

export class NonprofitService {
  private static readonly BASE_PATH = '/api/organizations/non-profit';

  private static checkFeatureEnabled(): void {
    if (!isFeatureEnabled(FeatureFlag.NonprofitIntegration)) {
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
      const response = await ApiClient.get<any[]>(`${this.BASE_PATH}/search/?${params.toString()}`);

      return response.map(transformNonprofitSearchResult);
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
   * @returns A promise that resolves to the created or retrieved NonprofitDetails object
   * @throws NonprofitFeatureDisabledError when the feature is disabled
   * @throws NonprofitServiceError when the API request fails
   */
  static async createNonprofit(params: CreateNonprofitParams): Promise<NonprofitDetails> {
    this.checkFeatureEnabled();
    const endpoint = `${this.BASE_PATH}/create/`;

    if (!params.endaomentOrgId) {
      throw new NonprofitServiceError('endaomentOrgId is required');
    }

    const apiParams = {
      name: params.name,
      endaoment_org_id: params.endaomentOrgId,
      ein: params.ein,
      base_wallet_address: params.baseWalletAddress,
    };

    try {
      const response = await ApiClient.post<any>(endpoint, apiParams);
      return transformNonprofitDetails(response);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.data && errorData.data.error) {
            throw new NonprofitServiceError(errorData.data.error);
          } else if (errorData.error) {
            throw new NonprofitServiceError(errorData.error);
          }
        } catch (parseError) {}
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
  static async linkToFundraise(params: LinkToFundraiseParams): Promise<NonprofitFundraiseLink> {
    this.checkFeatureEnabled();
    const endpoint = `${this.BASE_PATH}/link_to_fundraise/`;

    const apiParams = {
      nonprofit_id: params.nonprofitId,
      fundraise_id: params.fundraiseId,
      note: params.note || '',
    };

    try {
      const response = await ApiClient.post<any>(endpoint, apiParams);
      return transformNonprofitFundraiseLink(response);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        try {
          const errorData = JSON.parse(error.message);
          if (
            errorData.status === 404 &&
            errorData.data &&
            errorData.data.error === 'Fundraise not found'
          ) {
            throw new NonprofitServiceError('Fundraise not found');
          }

          if (errorData.data && errorData.data.error) {
            throw new NonprofitServiceError(errorData.data.error);
          } else if (errorData.error) {
            throw new NonprofitServiceError(errorData.error);
          }
        } catch (parseError) {}
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
    const endpoint = `${this.BASE_PATH}/get_by_fundraise/?fundraise_id=${fundraiseId}`;

    try {
      const response = await ApiClient.get<any[]>(endpoint);
      return response.map(transformNonprofitLink);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.data && errorData.data.error) {
            throw new NonprofitServiceError(errorData.data.error);
          } else if (errorData.error) {
            throw new NonprofitServiceError(errorData.error);
          }
        } catch (parseError) {}
      }

      throw error instanceof Error
        ? new NonprofitServiceError(error.message)
        : new NonprofitServiceError('Failed to get nonprofits by fundraise ID');
    }
  }
}
