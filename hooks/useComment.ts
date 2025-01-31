import { useState } from 'react';
import { CommentService } from '@/services/comment.service';
import type { CommentResponse, CreateCommentInput } from '@/services/types/comment.dto';

interface CommentState {
  data: CommentResponse | null;
  isLoading: boolean;
  error: Error | null;
}

type CreateCommentFn = (input: CreateCommentInput) => Promise<void>;
type UseCommentReturn = [CommentState, CreateCommentFn];

export function useCreateComment(): UseCommentReturn {
  const [state, setState] = useState<CommentState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const createComment = async (input: CreateCommentInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await CommentService.createComment(input);
      setState((prev) => ({ ...prev, data: response, isLoading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err : new Error('Failed to create comment'),
        isLoading: false,
      }));
    }
  };

  return [state, createComment];
}
