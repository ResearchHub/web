'use client';

import { FC, ReactNode, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Comment } from '@/types/comment';
import type { Authorship, ContentType } from '@/types/work';
import { useUser } from '@/contexts/UserContext';
import { commentToPostCard, type PostCardData } from '../lib/postCard';
import { AuthorPostsCarousel } from './AuthorPostsCarousel';
import { PostComposerModal } from './PostComposerModal';
import { useAuthorPostComposer } from './useAuthorPostComposer';

// Re-exports for callers that still import these from here. The actual
// implementations now live in co-located files so the funder dashboard (and
// any future consumer) can import them without pulling in the proposal-page
// section wrapper below.
export { useAuthorPostComposer } from './useAuthorPostComposer';
export { PostComposerModal } from './PostComposerModal';
export type { AuthorPostComposer } from './useAuthorPostComposer';

export const ViewerPostsEmptyState: FC = () => (
  <p className="m-0 text-sm text-gray-500">
    No posts from the author yet — they&apos;ll show up here when shared.
  </p>
);

interface AuthorPostsProps {
  posts: Comment[];
  documentId: number;
  contentType: ContentType;
  /** Authors of the underlying document. Used to gate the "New post" CTA. */
  documentAuthors: Authorship[];
  className?: string;
  /** Return `null` to hide the section entirely. Defaults to `ViewerPostsEmptyState`. */
  emptyState?: (props: { isAuthor: boolean }) => ReactNode;
}

/**
 * Proposal-page section for "author posts": owns the create/edit composer
 * and gates the "New post" CTA on document authorship. Card rendering and
 * pagination live in `AuthorPostsCarousel`; this wrapper just produces the
 * `PostCardData[]` (with an `onEdit` callback wired into the composer for
 * comments the viewer owns).
 */
export const AuthorPosts: FC<AuthorPostsProps> = ({
  posts,
  documentId,
  contentType,
  documentAuthors,
  className,
  emptyState,
}) => {
  const { user } = useUser();
  const composer = useAuthorPostComposer({ documentId, contentType });

  const isCurrentUserAuthor = useMemo(() => {
    if (!user?.authorProfile?.id) return false;
    return documentAuthors.some(
      (authorship) => authorship.authorProfile.id === user.authorProfile?.id
    );
  }, [user?.authorProfile?.id, documentAuthors]);

  const cards = useMemo<PostCardData[]>(() => {
    return posts
      .map((comment) => {
        const isOwn = !!user?.id && comment.createdBy?.id === user.id;
        return commentToPostCard(comment, {
          onEdit: isOwn ? () => composer.openForEdit(comment) : undefined,
        });
      })
      .filter((c): c is PostCardData => c !== null);
  }, [posts, user?.id, composer]);

  const hasCards = cards.length > 0;
  // Consumer can hide the section by returning `null` from `emptyState`; we
  // fall back to `ViewerPostsEmptyState` otherwise so the surface still
  // renders the header + "New post" CTA for authors.
  const resolvedEmptyState: ReactNode = hasCards ? undefined : emptyState ? (
    emptyState({ isAuthor: isCurrentUserAuthor })
  ) : (
    <ViewerPostsEmptyState />
  );

  if (!hasCards && resolvedEmptyState === null) return null;

  return (
    <>
      <AuthorPostsCarousel
        cards={cards}
        title="Author posts"
        headerAction={
          isCurrentUserAuthor && (
            <Button variant="ghost" size="sm" onClick={composer.open} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New post
            </Button>
          )
        }
        emptyState={resolvedEmptyState}
        variant="card"
        className={className}
      />
      <PostComposerModal {...composer} />
    </>
  );
};
