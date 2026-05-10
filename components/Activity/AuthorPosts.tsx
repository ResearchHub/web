'use client';

import { FC, ReactNode, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MoreHorizontal, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/ui/Avatar';
import { BaseModal } from '@/components/ui/BaseModal';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';
import { Carousel } from '@/components/ui/Carousel';
import { CommentEditor } from '@/components/Comment/CommentEditor';
import { Embed } from '@/components/Embed';
import { extractFirstUrl, type DetectedUrl } from '@/utils/url';
import { Comment } from '@/types/comment';
import { Authorship, ContentType } from '@/types/work';
import { extractTextFromTipTap, parseContent } from '@/components/Comment/lib/commentContentUtils';
import { extractUserMentions } from '@/components/Comment/lib/commentUtils';
import type { CommentContent } from '@/components/Comment/lib/types';
import { CommentService } from '@/services/comment.service';
import { useUser } from '@/contexts/UserContext';
import { formatTimestamp } from '@/utils/date';
import { stripUrls } from '@/utils/url';
import { cn } from '@/utils/styles';

// ---------------------------------------------------------------------------
// Composer hook + modal — exported so other surfaces (e.g. PostVideoCallout)
// can reuse the same submission logic and modal UI without duplicating state.
// ---------------------------------------------------------------------------

type ComposerState = { mode: 'create' } | { mode: 'edit'; comment: Comment } | null;

interface UseAuthorPostComposerArgs {
  documentId: number;
  contentType: ContentType;
}

export interface AuthorPostComposer {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  editingComment?: Comment;
  onSubmit: (payload: { content: CommentContent }) => Promise<boolean>;
  open: () => void;
  openForEdit: (comment: Comment) => void;
}

/**
 * Hook that owns the create/edit composer state and submission logic for an
 * author post (backed by the `AUTHOR_UPDATE` comment filter). The returned
 * object is spreadable into `<PostComposerModal {...composer} />` and also
 * exposes `open` / `openForEdit` for triggering from the consumer's UI.
 */
export function useAuthorPostComposer({
  documentId,
  contentType,
}: UseAuthorPostComposerArgs): AuthorPostComposer {
  const router = useRouter();
  const [composer, setComposer] = useState<ComposerState>(null);

  const onSubmit = async (payload: { content: CommentContent }): Promise<boolean> => {
    if (!composer) return false;
    const isEdit = composer.mode === 'edit';
    const toastId = toast.loading(isEdit ? 'Saving…' : 'Posting…');
    try {
      const apiContent =
        typeof payload.content === 'string' ? payload.content : JSON.stringify(payload.content);
      const mentions =
        payload.content && typeof payload.content === 'object' && 'content' in payload.content
          ? extractUserMentions(payload.content as any)
          : [];

      if (isEdit) {
        await CommentService.updateComment({
          commentId: composer.comment.id,
          documentId,
          contentType,
          content: apiContent,
          contentFormat: 'TIPTAP',
          mentions,
        });
      } else {
        // Backed by the AUTHOR_UPDATE comment type — kept for backend compat.
        await CommentService.createComment({
          workId: documentId,
          contentType,
          content: apiContent,
          contentFormat: 'TIPTAP',
          commentType: 'AUTHOR_UPDATE',
          mentions,
        });
      }

      toast.success(isEdit ? 'Post saved!' : 'Post shared!', { id: toastId });
      setComposer(null);
      router.refresh();
      return true;
    } catch (err) {
      console.error(isEdit ? 'Failed to save author post:' : 'Failed to publish author post:', err);
      toast.error(
        isEdit
          ? 'Failed to save post. Please try again.'
          : 'Failed to publish post. Please try again.',
        { id: toastId }
      );
      return false;
    }
  };

  return {
    isOpen: composer !== null,
    onClose: () => setComposer(null),
    documentId,
    editingComment: composer?.mode === 'edit' ? composer.comment : undefined,
    onSubmit,
    open: () => setComposer({ mode: 'create' }),
    openForEdit: (comment: Comment) => setComposer({ mode: 'edit', comment }),
  };
}

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  /** When provided, the modal opens in edit mode for this comment. */
  editingComment?: Comment;
  onSubmit: (payload: { content: CommentContent }) => Promise<boolean>;
}

export const PostComposerModal: FC<PostComposerModalProps> = ({
  isOpen,
  onClose,
  documentId,
  editingComment,
  onSubmit,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingComment ? 'Edit post' : 'New post'}
      maxWidth="md:!max-w-[640px]"
      padding="p-4 sm:p-6"
    >
      <CommentEditor
        autoFocus
        commentType="AUTHOR_UPDATE"
        placeholder="Share something with your audience. Paste a YouTube, TikTok, X or LinkedIn link to embed it."
        // Per-comment key when editing so an in-flight edit doesn't pollute the
        // create-mode draft, and vice versa.
        storageKey={
          editingComment
            ? `author-post-edit-${editingComment.id}`
            : `author-post-composer-${documentId}`
        }
        initialContent={editingComment?.content}
        editing={!!editingComment}
        onSubmit={onSubmit}
        onCancel={onClose}
        isAuthor
      />
    </BaseModal>
  );
};

/**
 * Quiet, single-line empty state — modeled after LinkedIn's "no recent posts"
 * pattern. Lives here (rather than alongside any one consumer) because every
 * AuthorPosts surface eventually wants the same fallback.
 */
export const ViewerPostsEmptyState: FC = () => (
  <p className="m-0 text-sm text-gray-500">
    No posts from the author yet — they'll show up here when shared.
  </p>
);

// ---------------------------------------------------------------------------
// AuthorPosts section
// ---------------------------------------------------------------------------

interface AuthorPostsProps {
  /**
   * Posts (AUTHOR_UPDATE comments) for the document, expected to be sorted
   * newest-first by the server. Drives the carousel; non-embed posts are
   * filtered out client-side.
   */
  posts: Comment[];
  documentId: number;
  contentType: ContentType;
  /** Authors of the underlying document. Used to gate the "New post" CTA. */
  documentAuthors: Authorship[];
  className?: string;
  /**
   * Override for the empty state. Receives `isAuthor` so the consumer can
   * render different UI for the author vs. visitors. Return `null` to hide the
   * section entirely. Defaults to {@link ViewerPostsEmptyState}.
   */
  emptyState?: (props: { isAuthor: boolean }) => ReactNode;
}

interface EmbeddedPost {
  comment: Comment;
  embed: DetectedUrl;
}

const extractEmbedFromComment = (comment: Comment): DetectedUrl | null => {
  const text =
    typeof comment.content === 'string' ? comment.content : JSON.stringify(comment.content);
  return extractFirstUrl(text);
};

const getCommentSnippet = (comment: Comment, maxLength = 200): string => {
  try {
    const parsed = parseContent(comment.content, comment.contentFormat);
    const text = extractTextFromTipTap(parsed);
    const cleaned = stripUrls(text).replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.slice(0, maxLength).trimEnd() + '…';
  } catch {
    return '';
  }
};

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

  const isOwnComment = (comment: Comment) => !!user?.id && comment.createdBy?.id === user.id;

  // Trust the server's sort order (see CommentService.fetchAuthorPosts).
  const embeddedPosts = useMemo<EmbeddedPost[]>(() => {
    return posts
      .map((comment) => {
        const embed = extractEmbedFromComment(comment);
        return embed ? { comment, embed } : null;
      })
      .filter((v): v is EmbeddedPost => v !== null);
  }, [posts]);

  const hasPosts = embeddedPosts.length > 0;

  const emptyContent = !hasPosts ? (
    emptyState ? (
      emptyState({ isAuthor: isCurrentUserAuthor })
    ) : (
      <ViewerPostsEmptyState />
    )
  ) : null;

  // Consumer can hide the section by returning `null` from `emptyState`.
  if (!hasPosts && emptyContent === null) return null;

  return (
    <section className={cn('mb-6 rounded-lg border bg-white p-4 shadow-sm sm:p-6', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-bold text-gray-900">Author posts</h3>
          {hasPosts && (
            <span className="text-xs font-medium text-gray-500">
              {embeddedPosts.length} {embeddedPosts.length === 1 ? 'post' : 'posts'}
            </span>
          )}
        </div>
        {isCurrentUserAuthor && (
          <Button variant="ghost" size="sm" onClick={composer.open} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New post
          </Button>
        )}
      </div>

      {hasPosts ? (
        <div className="overflow-hidden">
          <Carousel>
            {embeddedPosts.map((post) => (
              <div
                key={post.comment.id}
                className="flex-shrink-0 snap-start w-[88vw] sm:w-[420px] max-w-[440px]"
              >
                <EmbeddedPostCard
                  post={post}
                  onEdit={
                    isOwnComment(post.comment)
                      ? () => composer.openForEdit(post.comment)
                      : undefined
                  }
                />
              </div>
            ))}
          </Carousel>
        </div>
      ) : (
        emptyContent
      )}

      <PostComposerModal {...composer} />
    </section>
  );
};

interface EmbeddedPostCardProps {
  post: EmbeddedPost;
  /** When provided, renders a 3-dots menu with an "Edit" action. */
  onEdit?: () => void;
}

const EmbeddedPostCard: FC<EmbeddedPostCardProps> = ({ post, onEdit }) => {
  const { comment, embed } = post;
  const author = comment.createdBy;
  const dateLabel = formatTimestamp(comment.createdDate, false);
  const authorLabel =
    author?.fullName || `${author?.firstName ?? ''} ${author?.lastName ?? ''}`.trim() || 'Author';
  const snippet = getCommentSnippet(comment);

  return (
    <article className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-3">
      <header className="flex min-w-0 items-center gap-2">
        <Avatar
          src={author?.authorProfile?.profileImage}
          alt={authorLabel}
          size="xs"
          authorId={author?.authorProfile?.id}
        />
        <span className="truncate text-sm font-medium text-gray-900">{authorLabel}</span>
        <span className="shrink-0 whitespace-nowrap text-xs text-gray-500">· {dateLabel}</span>
        {onEdit && (
          <BaseMenu
            trigger={
              <button
                type="button"
                aria-label="More options"
                className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            }
          >
            <BaseMenuItem onSelect={onEdit}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </BaseMenuItem>
          </BaseMenu>
        )}
      </header>

      {snippet && (
        <p className="m-0 mt-2 line-clamp-2 text-sm leading-snug text-gray-700">{snippet}</p>
      )}

      <div className="mt-2">
        <Embed embed={embed} />
      </div>
    </article>
  );
};
