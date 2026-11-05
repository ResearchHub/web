import { useState, useCallback, useEffect } from 'react';
import { AuthorService } from '@/services/author.service';
import type { AuthorUpdatePayload } from '@/services/author.service';
import type { User, RiskScoreEvent, Insight, RiskScoreEventsFilters } from '@/types/user';
import { UserService } from '@/services/user.service';
import { UserDetailsForModerator } from '@/types/user';

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

interface UseDeleteAuthorState {
  isLoading: boolean;
  error: string | null;
}

type DeleteAuthorFn = (authorId: number) => Promise<void>;

type UseDeleteAuthorReturn = [UseDeleteAuthorState, DeleteAuthorFn];

export const useDeleteAuthor = (): UseDeleteAuthorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAuthor = async (authorId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthorService.deleteAuthor(authorId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete author');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, deleteAuthor];
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
  const [isLoading, setIsLoading] = useState(Boolean(authorId));
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

interface UseUserDetailsForModeratorState {
  userDetails: UserDetailsForModerator | null;
  isLoading: boolean;
  error: string | null;
}

type FetchUserDetailsForModeratorFn = () => Promise<void>;

type UseUserDetailsForModeratorReturn = [
  UseUserDetailsForModeratorState,
  FetchUserDetailsForModeratorFn,
];

export function useUserDetailsForModerator(
  userId: string | null
): UseUserDetailsForModeratorReturn {
  const [userDetails, setUserDetails] = useState<UserDetailsForModerator | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    if (!userId) {
      setUserDetails(null);
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await UserService.fetchUserDetails(userId);
      setUserDetails(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch user details for moderation');
      setUserDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [userId, fetchUserDetails]);

  return [{ userDetails, isLoading, error }, fetchUserDetails];
}

interface UseRiskScoreEventsState {
  events: RiskScoreEvent[];
  insights: Insight[];
  count: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
}

type FetchRiskScoreEventsFn = (filters: RiskScoreEventsFilters) => Promise<void>;

type UseRiskScoreEventsReturn = [UseRiskScoreEventsState, FetchRiskScoreEventsFn];

export function useRiskScoreEvents(
  userId: string | null,
  initialFilters?: RiskScoreEventsFilters
): UseRiskScoreEventsReturn {
  const defaultPageSize = initialFilters?.pageSize ?? 20;

  const [events, setEvents] = useState<RiskScoreEvent[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(initialFilters?.page ?? 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(
    async (filters: RiskScoreEventsFilters) => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await UserService.fetchRiskScoreEvents(userId, {
          ...filters,
          page: filters.page ?? 1,
          pageSize: filters.pageSize ?? defaultPageSize,
        });
        setEvents(response.results);
        setInsights(response.insights);
        setCount(response.count);
        setPage(filters.page ?? 1);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch risk score events';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, defaultPageSize]
  );

  useEffect(() => {
    fetchEvents({ page: 1, pageSize: defaultPageSize });
  }, [fetchEvents, defaultPageSize]);

  return [
    { events, insights, count, page, pageSize: defaultPageSize, isLoading, error },
    fetchEvents,
  ];
}
