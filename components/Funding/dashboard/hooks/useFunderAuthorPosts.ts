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
 * `PostCardData` shape consumed by `AuthorPostsCarousel`. Emits two card
 * variants:
 *  - `'post'` for AUTHOR_UPDATE comments that contain an embeddable URL
 *    (text-only updates are dropped — the post card UI requires an embed).
 *  - `'review'` for REVIEW comments (rendered with score + a "Read review"
 *    CTA that opens `PeerReviewModal`).
 *
 * Pagination is forwarded unchanged so the carousel can trigger `loadMore`
 * on scroll.
 */
export function useFunderAuthorPosts(funderId: number | undefined): UseFunderAuthorPostsResult {
  const { entries, isLoading, hasMore, loadMore } = useFunderActivity(funderId);

  const cards = useMemo<PostCardData[]>(
    () => entries.map(feedEntryToPostCard).filter((c): c is PostCardData => c !== null),
    [entries]
  );

  return { cards, isLoading, hasMore, loadMore };
}
