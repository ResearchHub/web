'use client';

import { useState, useCallback } from 'react';
import { ReactionService } from '@/services/reaction.service';
import { ApiError } from '@/services/types';
import type { FlagOptions } from '@/services/reaction.service';
import { ContentType } from '@/types/work';

interface UseFlagState {
  isLoading: boolean;
  error: string | null;
}

type FlagFn = (params: FlagOptions) => Promise<void>;
type UseFlagReturn = [UseFlagState, FlagFn];

/**
 * Hook for flagging content
 * @returns State and function for flagging content
 */
export const useFlag = (): UseFlagReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flag = async (params: FlagOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      await ReactionService.flag(params);
    } catch (err) {
      const parsed = err instanceof ApiError ? JSON.parse(err.message) : {};
      const data = parsed?.data || {};
      const status = parsed?.status;
      const errorMsg =
        data?.message ||
        data?.msg ||
        data?.detail ||
        (status === 409 ? 'Already flagged' : 'Failed to flag content');
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, flag];
};

/**
 * Hook to manage the flag content modal
 * @returns Object with modal state and handlers
 */
export const useFlagModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [contentToFlag, setContentToFlag] = useState<{
    documentId: string;
    contentType: ContentType;
    commentId?: string;
  } | null>(null);

  const openFlagModal = useCallback(
    (documentId: string, contentType: ContentType, commentId?: string) => {
      setContentToFlag({ documentId, contentType, commentId });
      setIsOpen(true);
    },
    []
  );

  const closeFlagModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    contentToFlag,
    openFlagModal,
    closeFlagModal,
  };
};
