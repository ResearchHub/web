'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { PostBlockEditor } from './PostBlockEditor';
import { ReviewStatusBanner } from '@/components/Bounty/ReviewStatusBanner';
import { QuestionEditModal } from '@/components/modals/QuestionEditModal';
import TipTapRenderer from '@/components/Comment/lib/TipTapRenderer';
import { htmlToTipTapJSON } from '@/components/Comment/lib/htmlToTipTap';
import { useWorkTab } from './WorkHeader/WorkTabContext';

interface PostDocumentProps {
  work: Work;
  metadata: WorkMetadata;
  content?: string;
}

export const PostDocument = ({ work, metadata, content }: PostDocumentProps) => {
  const { activeTab } = useWorkTab();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [parsedQuestionContent, setParsedQuestionContent] = useState<any>(null);

  useEffect(() => {
    if (work.postType === 'QUESTION' && work.previewContent) {
      setParsedQuestionContent(htmlToTipTapJSON(work.previewContent));
    }
  }, [work.postType, work.previewContent]);

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
      {renderTabContent}

      <QuestionEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        work={work}
      />
    </div>
  );
};
