'use client';

import { FC, ReactNode, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Comment } from '@/types/comment';
import type { Authorship, ContentType } from '@/types/work';
import { useUser } from '@/contexts/UserContext';
import { commentToPostCard, type PostCardPost } from '../lib/postCard';
import { AuthorPostsCarousel } from './AuthorPostsCarousel';
import { PostComposerModal } from './PostComposerModal';
import { useAuthorPostComposer } from './useAuthorPostComposer';

export { useAuthorPostComposer } from './useAuthorPostComposer';
export { PostComposerModal } from './PostComposerModal';
export type { AuthorPostComposer } from './useAuthorPostComposer';

const AuthorPostsEmptyShell: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center">
    <p className="m-0 text-sm text-gray-500">{children}</p>
  </div>
);

const AuthorEmptyState: FC = () => (
  <AuthorPostsEmptyShell>
    No posts yet — share an update to keep funders and reviewers in the loop.
  </AuthorPostsEmptyShell>
);

const ViewerEmptyState: FC = () => (
  <AuthorPostsEmptyShell>
    No posts from the author yet — they&apos;ll show up here when shared.
  </AuthorPostsEmptyShell>
);

export const ViewerPostsEmptyState = ViewerEmptyState;

interface AuthorPostsProps {
  posts: Comment[];
  documentId: number;
  contentType: ContentType;
  documentAuthors: Authorship[];
  className?: string;
  emptyState?: (props: { isAuthor: boolean }) => ReactNode;
}

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

  const cards = useMemo<PostCardPost[]>(() => {
    return posts
      .map((comment) => {
        const isOwn = !!user?.id && comment.createdBy?.id === user.id;
        return commentToPostCard(comment, {
          onEdit: isOwn ? () => composer.openForEdit(comment) : undefined,
        });
      })
      .filter((c): c is PostCardPost => c !== null);
  }, [posts, user?.id, composer]);

  const hasCards = cards.length > 0;
  const resolvedEmptyState: ReactNode = hasCards ? undefined : emptyState ? (
    emptyState({ isAuthor: isCurrentUserAuthor })
  ) : isCurrentUserAuthor ? (
    <AuthorEmptyState />
  ) : (
    <ViewerEmptyState />
  );

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
