// hooks/useAuthor.ts
import { useState, useCallback, useEffect } from 'react';
import { AuthorService } from '@/services/author.service';
import type { AuthorUpdatePayload } from '@/services/author.service';
import type { User } from '@/types/user'; // Adjust the import path if needed

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
