import { useState, useEffect } from 'react';
import { ReferralService } from '@/services/referral.service';
import type { TransformedReferralMetrics, TransformedNetworkDetail } from '@/types/referral';

interface UseReferralMetricsReturn {
  metrics: TransformedReferralMetrics | null;
  networkDetails: TransformedNetworkDetail[] | null;
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
  const [networkDetails, setNetworkDetails] = useState<TransformedNetworkDetail[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both metrics and network details in parallel
      const [metricsData, networkData] = await Promise.all([
        ReferralService.getMyMetrics(),
        ReferralService.getNetworkDetails(),
      ]);

      setMetrics(metricsData);
      setNetworkDetails(networkData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch referral data';
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
    networkDetails,
    isLoading,
    error,
    refetch: fetchData,
  };
}
