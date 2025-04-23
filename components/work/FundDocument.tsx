'use client';

import { useState, useMemo } from 'react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { WorkLineItems } from './WorkLineItems';
import { PageHeader } from '@/components/ui/PageHeader';
import { WorkTabs, TabType } from './WorkTabs';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { PostBlockEditor } from './PostBlockEditor';
import { FundraiseProgress } from '@/components/Fund/FundraiseProgress';

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
  console.log('&metadata', metadata);
  console.log('&work', work);
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
              key={`review-feed-${work.id}`}
              editorProps={{
                placeholder: 'Write your review...',
                initialRating: 0,
                commentType: 'REVIEW',
                storageKey: `review-feed-${work.id}`,
              }}
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
              editorProps={{
                storageKey: `bounty-feed-${work.id}`,
              }}
            />
          </div>
        );
      case 'conversation':
        return (
          <div className="space-y-6" key="conversation-tab">
            <CommentFeed
              documentId={work.id}
              contentType={work.contentType}
              commentType="GENERIC_COMMENT"
              key={`comment-feed-${work.id}`}
              editorProps={{
                storageKey: `comment-feed-${work.id}`,
              }}
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

      {/* FundraiseProgress - now placed between line items and tabs */}
      {metadata.fundraising && (
        <div className="my-6">
          <FundraiseProgress
            fundraise={{
              id: metadata.fundraising.id,
              status: metadata.fundraising.status,
              amountRaised: {
                rsc: metadata.fundraising.amountRaised.rsc,
                usd: metadata.fundraising.amountRaised.usd,
              },
              goalAmount: {
                rsc: metadata.fundraising.goalAmount.rsc,
                usd: metadata.fundraising.goalAmount.usd,
              },
              endDate: metadata.fundraising.endDate,
              contributors: {
                numContributors: metadata.fundraising.contributors.topContributors.length,
                topContributors: metadata.fundraising.contributors.topContributors,
              },
              createdDate: metadata.fundraising.createdDate || '',
              updatedDate: metadata.fundraising.updatedDate || '',
              goalCurrency: metadata.fundraising.goalCurrency || 'RSC',
            }}
            onContribute={() => {
              // Handle contribute action
            }}
          />
        </div>
      )}

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
