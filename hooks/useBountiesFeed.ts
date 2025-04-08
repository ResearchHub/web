import { useState, useEffect } from 'react';
import { FeedEntry } from '@/types/feed';
import { BountyService } from '@/services/bounty.service';
import { BountyType } from '@/types/bounty';

interface UseBountiesFeedResult {
  entries: FeedEntry[];
  isLoading: boolean;
  error: Error | null;
  total: number;
}

/**
 * Hook to fetch bounty feed entries for the earning opportunities carousel
 * @param pageSize Number of entries to fetch
 * @param status Optional status filter for bounties (defaults to 'OPEN')
 * @param bountyType Optional bounty type filter (e.g., 'REVIEW' for peer review bounties)
 */
export function useBountiesFeed(
  pageSize: number = 10,
  status: string = 'OPEN',
  bountyType?: BountyType
): UseBountiesFeedResult {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await BountyService.fetchBounties({
          status,
          personalized: true,
          sort: '-created_date',
          onlyParentBounties: true,
          page: 1,
          pageSize,
        });

        // If bountyType is specified, filter the entries by that type
        const filteredEntries = bountyType
          ? result.entries.filter((entry) => {
              const bountyContent = entry.content as any;
              return (
                bountyContent.bounty &&
                bountyContent.bounty.bountyType &&
                bountyContent.bounty.bountyType === bountyType
              );
            })
          : result.entries;

        setEntries(filteredEntries);
        setTotal(filteredEntries.length); // Update total to reflect filtered count
      } catch (err) {
        console.error('Error fetching bounties feed:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch bounties'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pageSize, status, bountyType]);

  return { entries, isLoading, error, total };
}
