import { useState, useEffect } from 'react';
import { ContributionService, ContributionType } from '@/services/contribution.service';
import type { Contribution, ContributionListResponse } from '@/types/contribution';
import { ID } from '@/types/root';
import { getContributionUrl, parseContribution } from '@/types/contributionTransformer';

interface UseContributionsOptions {
  contribution_type?: ContributionType;
  author_id?: ID;
  initialData?: ContributionListResponse;
}

export const useContributions = (options: UseContributionsOptions = {}) => {
  const [contributions, setContributions] = useState<Contribution[]>(
    options.initialData?.results || []
  );
  const [isLoading, setIsLoading] = useState(!options.initialData);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<ContributionListResponse | null>(
    options.initialData || null
  );
  const [error, setError] = useState<Error | null>(null);

  // Load initial contributions
  useEffect(() => {
    if (options.initialData) {
      return;
    }

    loadContributions();
  }, [options.contribution_type, options.author_id]);

  const loadContributions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ContributionService.getContributions({
        contribution_type: options.contribution_type,
        author_id: options.author_id,
      });

      // Filter results by checking if they can be parsed and have a valid URL
      const filteredResults = response.results.filter((result) => {
        try {
          const parsed = parseContribution(result);
          if (!parsed) return false;
          getContributionUrl(parsed); // Just to validate, we don't need the URL
          return true;
        } catch (error) {
          console.error('[Contribution] Could not parse contribution', error);
          return false;
        }
      });

      setContributions(filteredResults);
      setCurrentResponse({ ...response, results: filteredResults });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load contributions'));
      console.error('Error loading contributions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!currentResponse?.next || isLoading || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = await ContributionService.loadMore(currentResponse);

      setContributions((prev) => [...prev, ...nextPage.results]);
      setCurrentResponse(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more contributions'));
      console.error('Error loading more contributions:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setContributions([]);
    setCurrentResponse(null);
  }, [options.contribution_type]);

  return {
    contributions,
    isLoading,
    error,
    hasMore: !!currentResponse?.next,
    loadMore,
    refresh: loadContributions,
    isLoadingMore,
  };
};
