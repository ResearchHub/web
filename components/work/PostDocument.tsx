'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { MessageCircleQuestion } from 'lucide-react';
import { Work, Comment } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { WorkLineItems } from './WorkLineItems';
import { PageHeader } from '@/components/ui/PageHeader';
import { WorkTabs, TabType } from './WorkTabs';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { PostBlockEditor } from './PostBlockEditor';
import { EarningOpportunityBanner } from '@/components/banners/EarningOpportunityBanner';
import { ReviewStatusBanner } from '@/components/Bounty/ReviewStatusBanner';
import { QuestionEditModal } from '@/components/modals/QuestionEditModal';
import { AwardBountyModal } from '@/components/Comment/AwardBountyModal';
import { useUser } from '@/contexts/UserContext';
import TipTapRenderer from '@/components/Comment/lib/TipTapRenderer';
import { htmlToTipTapJSON } from '@/components/Comment/lib/htmlToTipTap';

interface PostDocumentProps {
  work: Work;
  metadata: WorkMetadata;
  content?: string;
  defaultTab?: TabType;
}

export const PostDocument = ({
  work,
  metadata,
  content,
  defaultTab = 'paper',
}: PostDocumentProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedBountyId, setSelectedBountyId] = useState<number | undefined>(undefined);
  const [bountyComment, setBountyComment] = useState<Comment | null>(null);
  const [parsedQuestionContent, setParsedQuestionContent] = useState<any>(null);

  const { user } = useUser();

  // Parse question content on client side
  useEffect(() => {
    if (work.postType === 'QUESTION' && work.previewContent) {
      setParsedQuestionContent(htmlToTipTapJSON(work.previewContent));
    }
  }, [work.postType, work.previewContent]);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Handle edit mode toggle from WorkLineItems
  const handleEditToggle = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  // Handle award bounty click
  const handleAwardBounty = useCallback(
    (bountyId: number) => {
      const bounty = metadata.bounties?.find((b) => b.id === bountyId);
      if (bounty?.comment) {
        // Transform BountyComment to Comment for the modal
        const transformedBountyComment: any = {
          id: bounty.comment.id,
          content: bounty.comment.content,
          contentFormat: bounty.comment.contentFormat,
          commentType: bounty.comment.commentType,
          createdBy: bounty.createdBy,
          bounties: [bounty],
          thread: {
            objectId: work.id,
          },
        };
        setBountyComment(transformedBountyComment);
        setSelectedBountyId(bountyId);
        setShowAwardModal(true);
      }
    },
    [metadata.bounties, work.id]
  );

  // Render tab content based on activeTab

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'paper':
        return (
          <div className="mt-6">
            {work.previewContent ? (
              work.postType === 'QUESTION' ? (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  {parsedQuestionContent ? (
                    <TipTapRenderer content={parsedQuestionContent} debug={false} />
                  ) : (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  )}
                </div>
              ) : (
                <PostBlockEditor content={work.previewContent} editable={false} />
              )
            ) : content ? (
              <div
                className="prose max-w-none bg-white rounded-lg shadow-sm border p-6 mb-6"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-gray-500">No content available</p>
            )}
          </div>
        );
      case 'reviews':
        return (
          <div className="space-y-6" key="reviews-tab">
            <ReviewStatusBanner bounties={metadata.bounties || []} />
            <CommentFeed
              unifiedDocumentId={work.unifiedDocumentId || null}
              documentId={work.id}
              contentType={work.contentType}
              commentType="REVIEW"
              editorProps={{
                placeholder: 'Write your review...',
                initialRating: 0,
                commentType: 'REVIEW',
              }}
              key={`review-feed-${work.id}`}
              work={work}
            />
          </div>
        );
      case 'bounties':
        return (
          <div className="space-y-6" key="bounties-tab">
            <CommentFeed
              unifiedDocumentId={work.unifiedDocumentId || null}
              documentId={work.id}
              contentType={work.contentType}
              commentType="BOUNTY"
              renderCommentActions={false}
              hideEditor={true}
              key={`bounty-feed-${work.id}`}
              work={work}
            />
          </div>
        );
      case 'conversation':
        return (
          <div className="space-y-6" key="conversation-tab">
            <CommentFeed
              unifiedDocumentId={work.unifiedDocumentId || null}
              documentId={work.id}
              contentType={work.contentType}
              commentType="GENERIC_COMMENT"
              key={`comment-feed-${work.id}`}
              work={work}
            />
          </div>
        );
      default:
        return null;
    }
  }, [activeTab, work.id, work.contentType, work.previewContent, content, parsedQuestionContent]);

  return (
    <div>
      {/* Show on mobile only - desktop shows in right sidebar */}
      <div className="lg:hidden mb-3">
        <EarningOpportunityBanner
          work={work}
          metadata={metadata}
          onAwardBounty={handleAwardBounty}
        />
      </div>
      {/* Title & Actions */}
      {work.type === 'preprint' && (
        <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
          Preprint
        </div>
      )}
      <PageHeader title={work.title} className="text-2xl md:!text-3xl mt-0" />
      <WorkLineItems
        work={work}
        metadata={metadata}
        onEditClick={handleEditToggle}
        onAwardClick={handleAwardBounty}
      />

      {/* Tabs - Only show for non-questions, or if you're not on the main question content */}
      {work.postType !== 'QUESTION' && (
        <WorkTabs
          work={work}
          metadata={metadata}
          defaultTab={defaultTab}
          contentType="post"
          onTabChange={handleTabChange}
        />
      )}

      {/* Tab Content / Question Content */}
      {work.postType === 'QUESTION' ? (
        <div className="space-y-8 mt-6">
          {/* Question Body */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {parsedQuestionContent ? (
              <TipTapRenderer content={parsedQuestionContent} debug={false} />
            ) : (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            )}
          </div>

          {/* Answers (Comment Feed) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageCircleQuestion className="h-5 w-5 text-primary-500" />
                <span>Answers</span>
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {metadata.metrics.conversationComments || 0}
                </span>
              </h2>
            </div>
            <CommentFeed
              unifiedDocumentId={work.unifiedDocumentId || null}
              documentId={work.id}
              contentType={work.contentType}
              commentType="GENERIC_COMMENT"
              key={`question-answers-${work.id}`}
              work={work}
            />
          </div>
        </div>
      ) : (
        renderTabContent
      )}

      {/* Question Edit Modal */}
      <QuestionEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        work={work}
      />

      {/* Award Bounty Modal */}
      {showAwardModal && bountyComment && (
        <AwardBountyModal
          isOpen={showAwardModal}
          onClose={() => {
            setShowAwardModal(false);
            setSelectedBountyId(undefined);
            setBountyComment(null);
          }}
          comment={bountyComment}
          contentType={work.contentType}
          bountyId={selectedBountyId}
        />
      )}
    </div>
  );
};
