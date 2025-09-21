'use client';

import { useCallback, useState, useEffect, memo, useMemo } from 'react';
import { Comment, CommentType } from '@/types/comment';
import { ContentType, Work } from '@/types/work';
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
import { extractTextFromTipTap, parseContent } from './lib/commentContentUtils';
import { CommentService } from '@/services/comment.service';
import { MessageSquare, Plus } from 'lucide-react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useUser } from '@/contexts/UserContext';
import { CommentEmptyState } from './CommentEmptyState';
import { CreateBountyModal } from '@/components/modals/CreateBountyModal';
import { comment } from 'postcss';
import { useShareModalContext } from '@/contexts/ShareContext';

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

  const { filteredComments, count, loading, createComment, loadMore, addMockReply } =
    useCommentsContext();

  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { user } = useUser();
  const { showShareModal } = useShareModalContext();
  const [agentLoadingParentId, setAgentLoadingParentId] = useState<number | null>(null);
  const [agentLoadingFields, setAgentLoadingFields] = useState<string[]>([]);
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

        // Detect agent tags in plain text of TIPTAP content for mock injection
        const parsed = typeof content === 'string' ? content : parseContent(content, 'TIPTAP');
        const textForDetection =
          typeof parsed === 'string' ? parsed : extractTextFromTipTap(parsed);
        const normalizedText = (textForDetection || '').toLowerCase();
        const agentTriggers = ['#neuroimaging', '#glymphatic system', "#alzheimer's disease"];

        const shouldTriggerAgents = agentTriggers.every((tag) => normalizedText.includes(tag));

        if (shouldTriggerAgents && result) {
          setAgentLoadingParentId(result.id);
          setAgentLoadingFields(['neuroimaging', 'glymphatic system', "alzheimer's disease"]);
          // Create a robust mock reply content about CSF flow modulation via breathing techniques
          const mockReplyContent: CommentContent = {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Consensus: Controlled breathing may modulate cerebrospinal fluid (CSF) dynamics and enhance glymphatic clearance, offering a promising, low-risk adjunct for early Alzheimer’s intervention.',
                  },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Rationale: MRI and intracranial physiology studies link slow, deep nasal breathing and extended exhalation with amplified CSF pulsatility, synchronized with venous and arterial oscillations. This appears to entrain perivascular flow and increase solute transport along glymphatic pathways.',
                  },
                ],
              },
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Mechanism: Enhanced respiratory-driven CSF waves may improve periarterial influx and perivenous efflux, potentially reducing metabolite burden.',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Protocol sketch: 10–20 minutes/day, 4–6 breaths/min, nasal inhale, prolonged exhale (e.g., 1:2 ratio). Avoid Valsalva-like strain.',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Population: Mild cognitive impairment or early AD; pair with sleep hygiene to leverage slow-wave–linked clearance.',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Next steps: Pilot a randomized, sham-controlled study with MRI CSF-flow quantification, arterial spin labeling, and cognitive secondary outcomes to establish effect sizes and feasibility.',
                  },
                ],
              },
            ],
          };

          // After a delay matching the placeholder, inject the mock agent reply and clear loading
          setTimeout(() => {
            addMockReply(result.id, mockReplyContent);
            setAgentLoadingParentId(null);
            setAgentLoadingFields([]);
          }, 3600);
        }

        if (commentType === 'REVIEW' && overallRating !== undefined && result) {
          try {
            await CommentService.createCommunityReview({
              unifiedDocumentId: unifiedDocumentId,
              commentId: result.id,
              score: overallRating,
            });

            result.score = overallRating;
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
        <div
          className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:border-blue-500 transition-all duration-200 cursor-pointer"
          onClick={() => executeAuthenticatedAction(() => {})}
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200"></div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[15px]">
                  <span className="text-gray-600">
                    Sign in to {commentType === 'REVIEW' ? 'review' : 'comment'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 text-gray-500">
            {commentType === 'REVIEW' ? 'Share your thoughts on this paper...' : 'Add a comment...'}
          </div>
        </div>
      );
    },
    [executeAuthenticatedAction, isCurrentUserAuthor]
  );

  return (
    <div className={cn('space-y-6', className)}>
      {!hideEditor && (
        <div className="mb-6">
          <AuthenticatedCommentEditor
            onSubmit={handleSubmit}
            placeholder="Add a comment..."
            commentType={commentType}
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
                  variant="default"
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
              loadingParentId={agentLoadingParentId}
              loadingFields={agentLoadingFields}
              onLoadingDone={() => {
                setAgentLoadingParentId(null);
                setAgentLoadingFields([]);
              }}
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
