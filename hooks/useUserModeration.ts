'use client';

import { useState, useCallback } from 'react';
import { UserModerationService, UserModerationError } from '@/services/user-moderation.service';
import type {
  UserModerationState,
  UserModerationActions,
  UseUserModerationReturn,
} from '@/types/moderation';

/**
 * Custom hook for user moderation operations
 * Provides suspend and reinstate functionality for moderators
 * @returns [state, actions] - State object and action functions
 * @example
 * const [state, { suspendUser, reinstateUser }] = useUserModeration();
 */
export const useUserModeration = (): UseUserModerationReturn => {
  const [state, setState] = useState<UserModerationState>({
    isLoading: false,
    error: null,
    lastAction: null,
  });

  const suspendUser = useCallback(async (authorId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await UserModerationService.suspendUser(authorId);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        lastAction: 'suspend',
        error: null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof UserModerationError ? error.message : 'Failed to suspend user';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error; // Re-throw for component handling
    }
  }, []);

  const reinstateUser = useCallback(async (authorId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await UserModerationService.reinstateUser(authorId);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        lastAction: 'reinstate',
        error: null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof UserModerationError ? error.message : 'Failed to reinstate user';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error; // Re-throw for component handling
    }
  }, []);

  const actions: UserModerationActions = {
    suspendUser,
    reinstateUser,
  };

  return [state, actions];
};
