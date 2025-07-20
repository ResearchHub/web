import { useState, useEffect } from 'react';
import { ReferralService } from '@/services/referral.service';
import type {
  TransformedNetworkDetail,
  TransformedReferralMetrics,
  TransformedNetworkDetailsResult,
  TransformedModNetworkDetail,
  TransformedModNetworkDetailsResult,
} from '@/types/referral';

interface UseReferralMetricsReturn {
  metrics: TransformedReferralMetrics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage referral metrics data
 * @returns Object containing metrics data, loading state, error state, and refetch function
 */
export function useReferralMetrics(): UseReferralMetricsReturn {
  const [metrics, setMetrics] = useState<TransformedReferralMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const metricsData = await ReferralService.getMyMetrics();
      setMetrics(metricsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch referral metrics';
      setError(errorMessage);
      console.error('Error fetching referral metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchData,
  };
}

interface UseReferralNetworkDetailsReturn {
  networkDetails: TransformedNetworkDetail[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPrevPage: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage referral network details data with pagination
 * @returns Object containing network details data, loading state, error state, pagination info, and navigation functions
 */
export function useReferralNetworkDetails(pageSize: number = 5): UseReferralNetworkDetailsReturn {
  const [networkDetails, setNetworkDetails] = useState<TransformedNetworkDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const fetchData = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response: TransformedNetworkDetailsResult = await ReferralService.getNetworkDetails({
        page,
        pageSize,
      });

      setNetworkDetails(response.networkDetails);
      setTotalCount(response.count);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch network details';
      setError(errorMessage);
      console.error('Error fetching network details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPage = async (page: number) => {
    if (page < 1 || page > totalPages) return;
    await fetchData(page);
  };

  const goToNextPage = async () => {
    if (hasNextPage) {
      await fetchData(currentPage + 1);
    }
  };

  const goToPrevPage = async () => {
    if (hasPrevPage) {
      await fetchData(currentPage - 1);
    }
  };

  const refetch = async () => {
    await fetchData(1);
  };

  useEffect(() => {
    fetchData(1);
  }, [pageSize]);

  return {
    networkDetails,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    goToNextPage,
    goToPrevPage,
    refetch,
  };
}

interface UseModReferralNetworkDetailsReturn {
  networkDetails: TransformedModNetworkDetail[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  // Sorting state
  sortField: string | null;
  sortDirection: 'asc' | 'desc' | null;
  // Navigation functions
  goToPage: (page: number) => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPrevPage: () => Promise<void>;
  // Sorting functions
  setSort: (field: string, direction: 'asc' | 'desc' | null) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage moderator referral network details data with pagination and sorting
 * @returns Object containing moderator network details data, loading state, error state, pagination info, sorting state, and navigation/sorting functions
 */
export function useModReferralNetworkDetails(
  pageSize: number = 5
): UseModReferralNetworkDetailsReturn {
  const [networkDetails, setNetworkDetails] = useState<TransformedModNetworkDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const fetchData = async (
    page: number,
    sortFieldParam?: string | null,
    sortDirectionParam?: 'asc' | 'desc' | null
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response: TransformedModNetworkDetailsResult =
        await ReferralService.getModNetworkDetails({
          page,
          pageSize,
          sortField: sortFieldParam || sortField,
          sortDirection: sortDirectionParam || sortDirection,
        });

      setNetworkDetails(response.networkDetails);
      setTotalCount(response.count);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch moderator network details';
      setError(errorMessage);
      console.error('Error fetching moderator network details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPage = async (page: number) => {
    if (page < 1 || page > totalPages) return;
    await fetchData(page);
  };

  const goToNextPage = async () => {
    if (hasNextPage) {
      await fetchData(currentPage + 1);
    }
  };

  const goToPrevPage = async () => {
    if (hasPrevPage) {
      await fetchData(currentPage - 1);
    }
  };

  const setSort = async (field: string, direction: 'asc' | 'desc' | null) => {
    setSortField(direction ? field : null);
    setSortDirection(direction);
    // Reset to first page when sorting changes
    await fetchData(1, field, direction);
  };

  const refetch = async () => {
    await fetchData(1);
  };

  useEffect(() => {
    fetchData(1);
  }, [pageSize]);

  return {
    networkDetails,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    sortField,
    sortDirection,
    goToPage,
    goToNextPage,
    goToPrevPage,
    setSort,
    refetch,
  };
}
