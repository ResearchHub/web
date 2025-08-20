'use client';

import { useState, useMemo, useCallback } from 'react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { WorkLineItems } from './WorkLineItems';
import { PageHeader } from '@/components/ui/PageHeader';
import { WorkTabs, TabType } from './WorkTabs';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { PostBlockEditor } from './PostBlockEditor';
import { EarningOpportunityBanner } from '@/components/banners/EarningOpportunityBanner';
import { QuestionEditModal } from '@/components/modals/QuestionEditModal';
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
  console.log('work', work);
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Handle edit mode toggle from WorkLineItems
  const handleEditToggle = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  // Render tab content based on activeTab

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'paper':
        return (
          <div className="mt-6">
            {work.previewContent ? (
              work.postType === 'QUESTION' ? (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <TipTapRenderer content={htmlToTipTapJSON(work.previewContent)} debug={false} />
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
  }, [activeTab, work.id, work.contentType, work.previewContent, content]);

  return (
    <div>
      <EarningOpportunityBanner work={work} metadata={metadata} />
      {/* Title & Actions */}
      {work.type === 'preprint' && (
        <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
          Preprint
        </div>
      )}
      <PageHeader title={work.title} className="text-2xl md:!text-3xl mt-2" />
      <WorkLineItems work={work} metadata={metadata} onEditClick={handleEditToggle} />

      {/* Tabs */}
      <WorkTabs
        work={work}
        metadata={metadata}
        defaultTab={defaultTab}
        contentType="post"
        onTabChange={handleTabChange}
      />

      {/* Tab Content */}
      {renderTabContent}

      {/* Question Edit Modal */}
      <QuestionEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        work={work}
      />
    </div>
  );
};
