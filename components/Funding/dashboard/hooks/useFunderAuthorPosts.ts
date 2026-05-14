'use client';

import { useMemo } from 'react';
import { feedEntryToPostCard, type PostCardData } from '@/components/Comment/lib/postCard';
import { useFunderActivity } from './useFunderActivity';

interface UseFunderAuthorPostsResult {
  cards: PostCardData[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

/**
 * Pulls the funder activity feed and adapts each entry into the
 * `PostCardData` shape consumed by `AuthorPostsCarousel`. Drops entries
 * that aren't AUTHOR_UPDATE comments and entries without an embeddable URL
 * (the card UI is built around the embed). Pagination is forwarded
 * unchanged so the carousel can trigger `loadMore` on scroll.
 */
export function useFunderAuthorPosts(funderId: number | undefined): UseFunderAuthorPostsResult {
  const { entries, isLoading, hasMore, loadMore } = useFunderActivity(funderId);

  const cards = useMemo<PostCardData[]>(
    () => entries.map(feedEntryToPostCard).filter((c): c is PostCardData => c !== null),
    [entries]
  );

  return { cards, isLoading, hasMore, loadMore };
}
