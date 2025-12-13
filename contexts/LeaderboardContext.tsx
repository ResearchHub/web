'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { LeaderboardService } from '@/services/leaderboard.service';
import { TopReviewer, TopFunder } from '@/types/leaderboard';

interface LeaderboardData {
  reviewers: TopReviewer[];
  funders: TopFunder[];
}

interface LeaderboardContextValue {
  data: LeaderboardData | null;
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  lastFetched: number | null;
}

const LeaderboardContext = createContext<LeaderboardContextValue | null>(null);

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

interface LeaderboardProviderProps {
  children: ReactNode;
}

export function LeaderboardProvider({ children }: LeaderboardProviderProps) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    // If we have cached data that's still fresh, don't refetch
    if (data && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
      return;
    }

    // If already loading, don't start another fetch
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await LeaderboardService.fetchLeaderboardOverview();
      setData({
        reviewers: result.reviewers.slice(0, 5),
        funders: result.funders.slice(0, 5),
      });
      setLastFetched(Date.now());
    } catch (err) {
      console.error('Failed to fetch leaderboard overview:', err);
      setError('Failed to load leaderboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [data, lastFetched, isLoading]);

  return (
    <LeaderboardContext.Provider value={{ data, isLoading, error, fetchData, lastFetched }}>
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboard() {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
}
