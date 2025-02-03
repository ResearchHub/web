'use client';

import { useState, useEffect } from 'react';
import { CommentService } from '@/services/comment.service';
import { Comment, CommentFilter } from '@/types/comment';
import { ContentType } from '@/types/work';

interface UseCommentsOptions {
  documentId: number;
  contentType: ContentType;
  filter?: CommentFilter;
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
