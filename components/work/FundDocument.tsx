'use client';

import { useState, useMemo } from 'react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { WorkLineItems } from './WorkLineItems';
import { PageHeader } from '@/components/ui/PageHeader';
import { WorkTabs, TabType } from './WorkTabs';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { PostBlockEditor } from './PostBlockEditor';
import { FundItem } from '@/components/Fund/FundItem';

interface FundDocumentProps {
  work: Work;
  metadata: WorkMetadata;
  content?: string;
  defaultTab?: TabType;
}

export const FundDocument = ({
  work,
  metadata,
  content,
  defaultTab = 'paper',
}: FundDocumentProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Render tab content based on activeTab
  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'paper':
        return (
          <div className="mt-6">
            {metadata.fundraising && (
              <div className="mb-6">
                <FundItem
                  id={metadata.fundraising.id}
                  title={work.title}
                  status={metadata.fundraising.status}
                  amount={metadata.fundraising.amountRaised.rsc}
                  goalAmount={metadata.fundraising.goalAmount.rsc}
                  deadline={metadata.fundraising.endDate}
                  contributors={metadata.fundraising.contributors.topContributors.map(
                    (profile) => ({
                      profile,
                      amount: 0, // Individual contribution amounts not available in metadata
                    })
                  )}
                  nftRewardsEnabled={work.figures.length > 0}
                  nftImageSrc={work.figures[0]?.url}
                />
              </div>
            )}

            {/* Content section */}
            {work.previewContent ? (
              <PostBlockEditor content={work.previewContent} />
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
              documentId={work.id}
              contentType={work.contentType}
              commentType="REVIEW"
              editorProps={{
                placeholder: 'Write your review...',
                initialRating: 0,
                commentType: 'REVIEW',
              }}
              key={`review-feed-${work.id}`}
            />
          </div>
        );
      case 'bounties':
        return (
          <div className="space-y-6" key="bounties-tab">
            <CommentFeed
              documentId={work.id}
              contentType={work.contentType}
              commentType="BOUNTY"
              renderCommentActions={false}
              hideEditor={true}
              key={`bounty-feed-${work.id}`}
            />
          </div>
        );
      case 'comments':
        return (
          <div className="space-y-6" key="comments-tab">
            <CommentFeed
              documentId={work.id}
              contentType={work.contentType}
              commentType="GENERIC_COMMENT"
              key={`comment-feed-${work.id}`}
            />
          </div>
        );
      default:
        return null;
    }
  }, [activeTab, work, metadata, content]);

  return (
    <div>
      {/* Title & Actions */}
      {work.type === 'preprint' && (
        <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
          Preprint
        </div>
      )}
      <PageHeader title={work.title} className="text-3xl mt-2" />
      <WorkLineItems work={work} showClaimButton={false} />

      {/* Tabs */}
      <WorkTabs
        work={work}
        metadata={metadata}
        defaultTab={defaultTab}
        contentType="fund"
        onTabChange={handleTabChange}
      />

      {/* Tab Content */}
      {renderTabContent}
    </div>
  );
};
