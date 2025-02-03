'use client';

import { useState, useEffect } from 'react';
import { CommentService, CreateCommentOptions } from '@/services/comment.service';
import { Comment, CommentFilter } from '@/types/comment';
import { ContentType } from '@/types/work';
import { ApiError } from '@/services/types';

interface UseCommentsOptions {
  documentId: number;
  contentType: ContentType;
  filter?: CommentFilter;
}

interface CommentState {
  data: Comment | null;
  isLoading: boolean;
  error: string | null;
}

export const useComments = ({ documentId, contentType, filter }: UseCommentsOptions) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  async function fetchComments(pageNum: number = 1) {
    try {
      setIsLoading(true);
      const response = await CommentService.fetchComments({
        documentId,
        contentType,
        filter,
        page: pageNum,
      });

      if (pageNum === 1) {
        setComments(response.comments);
      } else {
        setComments((prev) => [...prev, ...response.comments]);
      }

      setCount(response.count);
      setHasMore(response.comments.length === 15); // pageSize is 15
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err : new Error('Failed to fetch comments'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchComments(1);
  }, [documentId, contentType, filter]);

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage);
  }

  function refresh() {
    setPage(1);
    fetchComments(1);
  }

  return {
    comments,
    setComments,
    count,
    setCount,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
};

type CreateCommentFn = (input: CreateCommentOptions) => Promise<void>;
type UseCommentReturn = [CommentState, CreateCommentFn];

export const useCreateComment = (): UseCommentReturn => {
  const [data, setData] = useState<Comment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createComment = async (input: CreateCommentOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await CommentService.createComment(input);
      setData(response);
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg = data?.detail || 'Failed to create comment';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, createComment];
};
