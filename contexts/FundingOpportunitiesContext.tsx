'use client';

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { FeedService } from '@/services/feed.service';
import { FeedEntry, FeedGrantContent } from '@/types/feed';

export interface FundingOpportunity {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly previewImage?: string;
  readonly organization: string;
  readonly amountRsc: number;
}

interface FundingOpportunitiesContextValue {
  readonly opportunities: FundingOpportunity[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly fetchData: () => Promise<void>;
}

const FundingOpportunitiesContext = createContext<FundingOpportunitiesContextValue | null>(null);

interface FundingOpportunitiesProviderProps {
  readonly children: ReactNode;
}

function transformGrantToOpportunity(entry: FeedEntry): FundingOpportunity {
  const grant = entry.content as FeedGrantContent;
  return {
    id: entry.id,
    title: grant.title,
    slug: grant.slug,
    previewImage: grant.previewImage,
    organization: grant.organization || grant.grant?.organization || '',
    amountRsc: grant.grant?.amount?.rsc ?? 0,
  };
}

export function FundingOpportunitiesProvider({ children }: FundingOpportunitiesProviderProps) {
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (hasAttemptedRef.current) return;
    hasAttemptedRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      const result = await FeedService.getFeed({
        endpoint: 'grant_feed',
        fundraiseStatus: 'OPEN',
        ordering: 'funding_opportunities',
        pageSize: 5,
        page: 1,
      });

      const mapped = result.entries
        .filter((e) => e.contentType === 'GRANT')
        .slice(0, 5)
        .map(transformGrantToOpportunity);

      setOpportunities(mapped);
    } catch (err) {
      console.error('Failed to fetch funding opportunities:', err);
      setError('Failed to load funding opportunities.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <FundingOpportunitiesContext.Provider value={{ opportunities, isLoading, error, fetchData }}>
      {children}
    </FundingOpportunitiesContext.Provider>
  );
}

export function useFundingOpportunities() {
  const context = useContext(FundingOpportunitiesContext);
  if (!context) {
    throw new Error('useFundingOpportunities must be used within a FundingOpportunitiesProvider');
  }
  return context;
}
