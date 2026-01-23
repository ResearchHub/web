'use client';

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
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

  // Single ref to prevent re-fetching after failure
  const hasAttemptedRef = useRef(false);

  const fetchData = useCallback(async () => {
    // Only attempt once per mount (successful fetches update lastFetched for cache logic)
    if (hasAttemptedRef.current) return;
    hasAttemptedRef.current = true;

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
  }, []); // Empty deps - stable identity

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
