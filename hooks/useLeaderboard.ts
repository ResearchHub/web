import { useState, useEffect, useCallback } from 'react';
import { LeaderboardService, LEADERBOARD_PAGE_SIZE } from '@/services/leaderboard.service';
import type { TopReviewer, TopFunder } from '@/types/leaderboard';

export interface LeaderboardListState<T> {
  items: T[];
  currentUser: T | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UseLeaderboardReviewersReturn {
  state: LeaderboardListState<TopReviewer>;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  pageSize: number;
}

export interface UseLeaderboardFundersReturn {
  state: LeaderboardListState<TopFunder>;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  pageSize: number;
}

/**
 * Fetches paginated top reviewers for a given period.
 * Page is controlled via URL (parent passes page and onPageChange).
 */
export function useLeaderboardReviewers(
  period: string,
  page: number,
  onPageChange: (page: number) => void
): UseLeaderboardReviewersReturn {
  const [items, setItems] = useState<TopReviewer[]>([]);
  const [currentUser, setCurrentUser] = useState<TopReviewer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / LEADERBOARD_PAGE_SIZE) || 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const fetchPage = useCallback(
    async (pageNum: number) => {
      if (!period) {
        setItems([]);
        setCurrentUser(null);
        setTotalCount(0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const {
          results,
          count,
          currentUser: user,
        } = await LeaderboardService.fetchReviewers(period, pageNum);
        setItems(results);
        setTotalCount(count);
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to fetch reviewers:', err);
        setError('Failed to load reviewers data.');
        setItems([]);
        setCurrentUser(null);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [period]
  );

  useEffect(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const goToPage = useCallback(
    (pageNum: number) => {
      if (pageNum < 1 || pageNum > totalPages) return;
      onPageChange(pageNum);
    },
    [onPageChange, totalPages]
  );

  const goToNextPage = useCallback(() => {
    if (hasNextPage) onPageChange(page + 1);
  }, [hasNextPage, page, onPageChange]);

  const goToPrevPage = useCallback(() => {
    if (hasPrevPage) onPageChange(page - 1);
  }, [hasPrevPage, page, onPageChange]);

  return {
    state: {
      items,
      currentUser,
      isLoading,
      error,
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage,
      hasPrevPage,
    },
    goToPage,
    goToNextPage,
    goToPrevPage,
    pageSize: LEADERBOARD_PAGE_SIZE,
  };
}

/**
 * Fetches paginated top funders for a given period.
 * Page is controlled via URL (parent passes page and onPageChange).
 */
export function useLeaderboardFunders(
  period: string,
  page: number,
  onPageChange: (page: number) => void
): UseLeaderboardFundersReturn {
  const [items, setItems] = useState<TopFunder[]>([]);
  const [currentUser, setCurrentUser] = useState<TopFunder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / LEADERBOARD_PAGE_SIZE) || 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const fetchPage = useCallback(
    async (pageNum: number) => {
      if (!period) {
        setItems([]);
        setCurrentUser(null);
        setTotalCount(0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const {
          results,
          count,
          currentUser: user,
        } = await LeaderboardService.fetchFunders(period, pageNum);
        setItems(results);
        setTotalCount(count);
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to fetch funders:', err);
        setError('Failed to load funders data.');
        setItems([]);
        setCurrentUser(null);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [period]
  );

  useEffect(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const goToPage = useCallback(
    (pageNum: number) => {
      if (pageNum < 1 || pageNum > totalPages) return;
      onPageChange(pageNum);
    },
    [onPageChange, totalPages]
  );

  const goToNextPage = useCallback(() => {
    if (hasNextPage) onPageChange(page + 1);
  }, [hasNextPage, page, onPageChange]);

  const goToPrevPage = useCallback(() => {
    if (hasPrevPage) onPageChange(page - 1);
  }, [hasPrevPage, page, onPageChange]);

  return {
    state: {
      items,
      currentUser,
      isLoading,
      error,
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage,
      hasPrevPage,
    },
    goToPage,
    goToNextPage,
    goToPrevPage,
    pageSize: LEADERBOARD_PAGE_SIZE,
  };
}
