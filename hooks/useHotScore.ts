import { useState, useEffect } from 'react';
import { MetadataService, HotScoreData } from '@/services/metadata.service';

interface UseHotScoreReturn {
  hotScoreV2?: number;
  hotScoreBreakdown?: HotScoreData['hotScoreBreakdown'];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and manage hot score data for a paper
 * @param paperId - The paper ID
 * @param unifiedDocumentId - The unified document ID
 * @param enabled - Whether to fetch the hot score (e.g., based on user permissions)
 */
export function useHotScore(
  paperId: number | undefined,
  unifiedDocumentId: number | undefined,
  enabled: boolean = true
): UseHotScoreReturn {
  const [hotScoreData, setHotScoreData] = useState<HotScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't fetch if not enabled or missing required IDs
    if (!enabled || !paperId || !unifiedDocumentId) {
      setHotScoreData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;

    const fetchHotScore = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await MetadataService.getHotScore(
          paperId,
          unifiedDocumentId,
          true // include breakdown
        );

        if (!isCancelled) {
          setHotScoreData(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch hot score'));
          console.error('Error fetching hot score:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchHotScore();

    return () => {
      isCancelled = true;
    };
  }, [paperId, unifiedDocumentId, enabled]);

  return {
    hotScoreV2: hotScoreData?.hotScoreV2,
    hotScoreBreakdown: hotScoreData?.hotScoreBreakdown,
    isLoading,
    error,
  };
}
