'use client';

import { useCallback, useState, useEffect, memo, useMemo } from 'react';
import { Comment, CommentType } from '@/types/comment';
import { ContentType, Work } from '@/types/work';
import { Bounty } from '@/types/bounty';
import { CommentItem } from './CommentItem';
import { CommentEditor, CommentEditorProps } from './CommentEditor';
import { Button } from '@/components/ui/Button';
import { CommentProvider, useComments as useCommentsContext } from '@/contexts/CommentContext';
import { cn } from '@/utils/styles';
import { CommentSortAndFilters } from './CommentSortAndFilters';
import { CommentLoader } from './CommentLoader';
import CommentList from './CommentList';
import { toast } from 'react-hot-toast';
import { CommentContent } from './lib/types';
import { CommentService } from '@/services/comment.service';
import { MessageSquare, Plus, PenLine, User as UserIcon, Star } from 'lucide-react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useUser } from '@/contexts/UserContext';
import { CommentEmptyState } from './CommentEmptyState';
import { CreateBountyModal } from '@/components/modals/CreateBountyModal';
import { comment } from 'postcss';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useStorageKey } from '@/utils/storageKeys';

interface CommentFeedProps {
  documentId: number;
  contentType: ContentType;
  className?: string;
  commentType?: CommentType;
  editorProps?: Partial<CommentEditorProps>;
  renderCommentActions?: boolean;
  hideEditor?: boolean;
  debug?: boolean;
  unifiedDocumentId: number | null;
  work?: Work;
  workAuthors?: Work['authors'];
  workBounties?: Bounty[];
}

function CommentFeed({
  documentId,
  contentType,
  className,
  commentType = 'GENERIC_COMMENT',
  editorProps = {},
  renderCommentActions = true,
  hideEditor = false,
  debug = false,
  unifiedDocumentId,
  work,
  workAuthors,
  workBounties,
}: CommentFeedProps) {
  // Add debugging for mount/unmount if debug is enabled
  useEffect(() => {
    if (debug) {
      console.log(`CommentFeed MOUNTED - type: ${commentType}, docId: ${documentId}`);
      return () => {
        console.log(`CommentFeed UNMOUNTED - type: ${commentType}, docId: ${documentId}`);
      };
    }
  }, [commentType, documentId, debug]);

  const [isBountyModalOpen, setIsBountyModalOpen] = useState(false);

  const handleCreateBounty = useCallback(() => {
    setIsBountyModalOpen(true);
  }, []);

  const handleCloseBountyModal = useCallback(() => {
    setIsBountyModalOpen(false);
  }, []);

  return (
    <CommentProvider
      documentId={documentId}
      contentType={contentType}
      commentType={commentType}
      debug={debug}
      work={work}
      workBounties={workBounties}
    >
      <div className={cn('space-y-6', className)}>
        <CommentFeedContent
          className={className}
          editorProps={editorProps}
          renderCommentActions={renderCommentActions}
          hideEditor={hideEditor}
          commentType={commentType}
          contentType={contentType}
          debug={debug}
          onCreateBounty={handleCreateBounty}
          unifiedDocumentId={unifiedDocumentId}
          work={work}
          workAuthors={workAuthors}
        />
      </div>
      <CreateBountyModal
        isOpen={isBountyModalOpen}
        onClose={handleCloseBountyModal}
        workId={documentId.toString()}
      />
    </CommentProvider>
  );
}

// Remove memo wrapper but keep useCallback optimizations
function CommentFeedContent({
  className,
  editorProps = {},
  renderCommentActions = true,
  hideEditor = false,
  commentType,
  contentType,
  debug = false,
  unifiedDocumentId,
  onCreateBounty,
  work,
  workAuthors,
}: Omit<CommentFeedProps, 'documentId'> & { onCreateBounty: () => void }) {
  // Add debugging for content component if debug is enabled
  useEffect(() => {
    if (debug) {
      console.log(`CommentFeedContent MOUNTED - type: ${commentType}`);
      return () => {
        console.log(`CommentFeedContent UNMOUNTED - type: ${commentType}`);
      };
    }
  }, [commentType, debug]);

  const { filteredComments, count, loading, createComment, loadMore } = useCommentsContext();

  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { user } = useUser();
  const { showShareModal } = useShareModalContext();

  const docId = unifiedDocumentId || work?.unifiedDocumentId || work?.id || 'unknown';
  const baseStorageKey = `${(commentType || 'generic_comment').toLowerCase()}-editor-draft-${docId}`;
  const storageKey = useStorageKey(baseStorageKey);

  // Check if current user is an author
  const isCurrentUserAuthor = useMemo(() => {
    if (!user?.id || !workAuthors) return false;
    return workAuthors.some(
      (authorship) => authorship.authorProfile.id === user?.authorProfile?.id
    );
  }, [user?.id, user?.authorProfile?.id, workAuthors]);

  const handleSubmit = useCallback(
    async ({ content, rating: overallRating }: { content: CommentContent; rating?: number }) => {
      const toastId = toast.loading('Submitting comment...');

      try {
        const result = await createComment(content, overallRating);

        if (!result) {
          toast.error('Failed to submit comment. Please try again.', { id: toastId });
          return false;
        }

        if (commentType === 'REVIEW' && overallRating !== undefined && result) {
          try {
            await CommentService.createCommunityReview({
              unifiedDocumentId: unifiedDocumentId,
              commentId: result.id,
              score: overallRating,
            });

            result.score = overallRating;
            result.reviewScore = overallRating;
            toast.success('Review submitted successfully!', { id: toastId });
            showShareModal({
              url: window.location.href,
              docTitle: work?.title || 'the document',
              action: 'USER_PEER_REVIEWED',
            });
          } catch (reviewError) {
            console.error('Error creating community review:', reviewError);
            toast.success('Comment submitted, but review data could not be saved.', {
              id: toastId,
            });
          }
        } else {
          toast.success('Comment submitted successfully!', { id: toastId });
        }

        return true;
      } catch (error) {
        console.error('Error creating comment:', error);
        toast.error('Failed to submit comment. Please try again.', { id: toastId });
        return false;
      }
    },
    [commentType, createComment]
  );

  const handleLoadMore = useCallback(async () => {
    try {
      await loadMore();
    } catch (error) {
      console.error('Error loading more comments:', error);
    }
  }, [loadMore]);

  // Handle bounty creation
  const handleCreateBounty = useCallback(() => {
    onCreateBounty();
  }, [onCreateBounty]);

  // AuthenticatedCommentEditor component
  const AuthenticatedCommentEditor = useCallback(
    ({ onSubmit, commentType, ...props }: CommentEditorProps) => {
      const { user: currentUser } = useUser();

      if (currentUser) {
        return (
          <CommentEditor
            onSubmit={onSubmit}
            commentType={commentType}
            isAuthor={isCurrentUserAuthor}
            {...props}
          />
        );
      }

      return (
        <button
          type="button"
          onClick={() => executeAuthenticatedAction(() => {})}
          className="group w-full flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/40 px-4 py-3 text-left transition-colors hover:border-blue-400 hover:bg-blue-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 shrink-0">
            <UserIcon className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <span className="text-sm text-gray-600 group-hover:text-gray-800 truncate">
              {commentType === 'REVIEW'
                ? 'Sign in to write a peer review…'
                : commentType === 'AUTHOR_UPDATE'
                  ? 'Sign in to post an update…'
                  : 'Sign in to write a comment…'}
            </span>
            {commentType === 'REVIEW' && (
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 text-gray-300" />
                ))}
              </div>
            )}
          </div>
          <PenLine className="h-4 w-4 text-blue-500" />
        </button>
      );
    },
    [executeAuthenticatedAction, isCurrentUserAuthor]
  );

  return (
    <div className={cn('space-y-6', className)}>
      {!hideEditor && (
        <div className="mt-4 mb-6">
          <AuthenticatedCommentEditor
            onSubmit={handleSubmit}
            placeholder="Add a comment..."
            commentType={commentType}
            storageKey={storageKey}
            {...editorProps}
          />
          <div className="mt-12 mb-2">
            {commentType !== 'BOUNTY' && (
              <CommentSortAndFilters commentType={commentType} commentCount={count} />
            )}
          </div>
          <div className="h-px bg-gray-200 my-4"></div>
        </div>
      )}

      <div className="comment-list-container">
        {loading ? (
          <CommentLoader count={3} commentType={commentType} />
        ) : filteredComments.length === 0 ? (
          <CommentEmptyState
            commentType={commentType || 'GENERIC_COMMENT'}
            onCreateBounty={handleCreateBounty}
            work={work}
          />
        ) : (
          <>
            {commentType === 'BOUNTY' && (
              <div className="flex justify-between items-center mb-4">
                <CommentSortAndFilters commentType={commentType} commentCount={count} />
                <Button
                  onClick={() => executeAuthenticatedAction(handleCreateBounty)}
                  variant="outlined"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Bounty
                </Button>
              </div>
            )}

            {commentType === 'BOUNTY' && <div className="h-px bg-gray-200 my-4"></div>}

            <CommentList
              commentType={commentType}
              comments={filteredComments}
              isRootList={true}
              contentType={contentType}
            />

            {filteredComments.length < count && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  {loading ? 'Loading...' : `Load More`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export { CommentFeed };
