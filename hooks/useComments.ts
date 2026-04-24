'use client';

import { useState } from 'react';
import { CommentService, CreateCommentOptions } from '@/services/comment.service';
import { Comment } from '@/types/comment';
import { ApiError } from '@/services/types';

interface CommentState {
  data: Comment | null;
  isLoading: boolean;
  error: string | null;
}

type CreateCommentFn = (input: CreateCommentOptions) => Promise<Comment | null>;
type UseCommentReturn = [CommentState, CreateCommentFn];

export const useCreateComment = (): UseCommentReturn => {
  const [state, setState] = useState<CommentState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const createComment = async (input: CreateCommentOptions): Promise<Comment | null> => {
    try {
      setState({ ...state, isLoading: true, error: null });
      const comment = await CommentService.createComment(input);
      setState({ data: comment, isLoading: false, error: null });

      // Comment event emission removed - now handled by CommentContext

      return comment;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to create comment';
      setState({ data: null, isLoading: false, error: errorMessage });
      return null;
    }
  };

  return [state, createComment];
};
