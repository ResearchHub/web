import { useState, useCallback, useEffect } from 'react';
import { AuthorService } from '@/services/author.service';
import type { AuthorUpdatePayload } from '@/services/author.service';
import type { User } from '@/types/user';
import { Achievement } from '@/types/authorProfile';
import { AuthorSummaryStats } from '@/types/authorProfile';

interface UseUpdateAuthorProfileImageState {
  isLoading: boolean;
  error: string | null;
}

type UpdateAuthorProfileImageFn = (authorId: number, coverImage: File | Blob) => Promise<void>;

type UseUpdateAuthorProfileImageReturn = [
  UseUpdateAuthorProfileImageState,
  UpdateAuthorProfileImageFn,
];

export const useUpdateAuthorProfileImage = (): UseUpdateAuthorProfileImageReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAuthorProfileImage = async (
    authorId: number,
    coverImage: File | Blob
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthorService.updateAuthorProfileImage(authorId, coverImage);
    } catch (err: any) {
      setError(err?.message || 'Failed to update author profile image');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, updateAuthorProfileImage];
};

interface UseUpdateAuthorProfileDataState {
  isLoading: boolean;
  error: string | null;
}

type UpdateAuthorProfileDataFn = (authorId: number, data: AuthorUpdatePayload) => Promise<void>;

type UseUpdateAuthorProfileDataReturn = [
  UseUpdateAuthorProfileDataState,
  UpdateAuthorProfileDataFn,
];

export const useUpdateAuthorProfileData = (): UseUpdateAuthorProfileDataReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAuthorProfileData = async (
    authorId: number,
    data: AuthorUpdatePayload
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthorService.updateAuthorProfileData(authorId, data);
    } catch (err: any) {
      setError(err?.message || 'Failed to update author profile data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, updateAuthorProfileData];
};

interface UseAuthorInfoState {
  author: User | null;
  isLoading: boolean;
  error: string | null;
}

type FetchAuthorInfoFn = () => Promise<void>;

type UseFetchAuthorInfoReturn = [UseAuthorInfoState, FetchAuthorInfoFn];

export function useAuthorInfo(authorId: number | null): UseFetchAuthorInfoReturn {
  const [author, setAuthor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthorInfo = useCallback(async () => {
    if (!authorId) {
      setAuthor(null);
      setError('Author ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await AuthorService.getAuthorInfo(authorId);
      setAuthor(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch author info');
      setAuthor(null);
    } finally {
      setIsLoading(false);
    }
  }, [authorId]);

  useEffect(() => {
    fetchAuthorInfo();
  }, [authorId, fetchAuthorInfo]);

  return [{ author, isLoading, error }, fetchAuthorInfo];
}

interface UseAuthorAchievementsState {
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
}

type FetchAuthorAchievementsFn = () => Promise<void>;

type UseAuthorAchievementsReturn = [UseAuthorAchievementsState, FetchAuthorAchievementsFn];

export function useAuthorAchievements(authorId: number | null): UseAuthorAchievementsReturn {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthorAchievements = useCallback(async () => {
    if (!authorId) {
      setAchievements([]);
      setError('Author ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await AuthorService.getAuthorAchievements(authorId);
      console.log('data', data);
      setAchievements(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch author achievements');
      setAchievements([]);
    } finally {
      setIsLoading(false);
    }
  }, [authorId]);

  useEffect(() => {
    fetchAuthorAchievements();
  }, [authorId, fetchAuthorAchievements]);

  return [{ achievements, isLoading, error }, fetchAuthorAchievements];
}

interface UseAuthorSummaryStatsState {
  summaryStats: AuthorSummaryStats | null;
  isLoading: boolean;
  error: string | null;
}

type FetchAuthorSummaryStatsFn = () => Promise<void>;

type UseAuthorSummaryStatsReturn = [UseAuthorSummaryStatsState, FetchAuthorSummaryStatsFn];

export function useAuthorSummaryStats(authorId: number | null): UseAuthorSummaryStatsReturn {
  const [summaryStats, setSummaryStats] = useState<AuthorSummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthorSummaryStats = useCallback(async () => {
    if (!authorId) {
      setSummaryStats(null);
      setError('Author ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await AuthorService.getAuthorSummaryStats(authorId);
      setSummaryStats(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch author summary stats');
      setSummaryStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [authorId]);

  useEffect(() => {
    fetchAuthorSummaryStats();
  }, [authorId, fetchAuthorSummaryStats]);

  return [{ summaryStats, isLoading, error }, fetchAuthorSummaryStats];
}
