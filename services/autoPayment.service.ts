import { ApiClient } from './client';
import type { AutoPayment, AutoPaymentApi, AutoPaymentsFilters } from '@/types/autoPayment';
import { transformAutoPayment } from '@/types/autoPayment';

interface AutoPaymentsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AutoPaymentApi[];
}

export interface AutoPaymentsResult {
  payments: AutoPayment[];
  count: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class AutoPaymentServiceError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'AutoPaymentServiceError';
  }
}

export class AutoPaymentService {
  private static readonly BASE_PATH = '/api/audit/auto_payments';

  static async fetchAutoPayments(
    filters: AutoPaymentsFilters,
    params: { page: number; pageSize: number }
  ): Promise<AutoPaymentsResult> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page.toString());
      queryParams.append('page_size', params.pageSize.toString());

      if (filters.distributionType) {
        queryParams.append('distribution_type', filters.distributionType);
      }
      if (filters.recipientId) {
        queryParams.append('recipient', filters.recipientId.toString());
      }
      if (filters.createdAfter) {
        queryParams.append('created_after', filters.createdAfter.toISOString());
      }
      if (filters.createdBefore) {
        queryParams.append('created_before', filters.createdBefore.toISOString());
      }

      const response = await ApiClient.get<AutoPaymentsApiResponse>(
        `${this.BASE_PATH}/?${queryParams.toString()}`
      );

      return {
        payments: response.results.map(transformAutoPayment),
        count: response.count,
        hasNextPage: !!response.next,
        hasPrevPage: !!response.previous,
      };
    } catch (error) {
      console.error('Error fetching auto-payments:', error);
      throw new AutoPaymentServiceError('Failed to fetch auto-payments. Please try again.', error);
    }
  }
}
