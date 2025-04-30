// hooks/useAuthor.ts
import { useState } from 'react';
import { AuthorService } from '@/services/author.service';
import type { AuthorUpdatePayload } from '@/services/author.service';

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
