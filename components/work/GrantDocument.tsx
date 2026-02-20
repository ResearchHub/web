'use client';

import { useState, useMemo } from 'react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { WorkLineItems } from './WorkLineItems';
import { PageHeader } from '@/components/ui/PageHeader';
import { WorkTabs, TabType } from './WorkTabs';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { PostBlockEditor } from './PostBlockEditor';
import { isDeadlineInFuture } from '@/utils/date';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
import { ProposalListProvider } from '@/contexts/ProposalListContext';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';

interface GrantDocumentProps {
  work: Work;
  metadata: WorkMetadata;
  defaultTab?: TabType;
}

export const GrantDocument = ({ work, metadata, defaultTab = 'overview' }: GrantDocumentProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const grantId = Number(work.note?.post?.grant?.id);

  const detailsContent = work.previewContent ? (
    <PostBlockEditor content={work.previewContent} />
  ) : (
    <p className="text-gray-500">No content available</p>
  );

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 mt-6" key="overview-tab">
            {detailsContent}
          </div>
        );
      case 'proposals':
        return (
          <div className="space-y-6" key="proposals-tab">
            <FundingProposalGrid />
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
  }, [activeTab, work, metadata, grantId, detailsContent]);

  const isActive =
    work.note?.post?.grant?.status === 'OPEN' &&
    (work.note?.post?.grant?.endDate ? isDeadlineInFuture(work.note?.post?.grant?.endDate) : true);

  return (
    <ProposalListProvider grantId={grantId}>
      <div>
        <div className="flex items-center gap-2 mb-2 mt-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
          />
          <span className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
            {isActive ? 'Accepting Proposals' : 'Closed'}
          </span>
        </div>

        <PageHeader title={work.title} className="text-2xl md:!text-3xl mt-0" />
        <WorkLineItems work={work} showClaimButton={false} metadata={metadata} />

        {work.note?.post?.grant?.amount && work.note?.post?.grant?.currency && (
          <div className="mt-2 text-sm text-gray-600 right-sidebar:hidden">
            <div className="flex items-start gap-4 min-w-0">
              <span className="font-medium text-gray-900 flex-shrink-0 w-16 tablet:w-28">
                Amount
              </span>
              <div className="flex-1 min-w-0 space-y-1 md:space-y-0 md:flex md:items-center md:gap-2">
                <div className="font-semibold text-primary-600 flex items-center gap-1">
                  <span>$</span>
                  {(work.note?.post?.grant?.amount.usd || 0).toLocaleString()}
                  <span>USD</span>
                </div>
                <div className="hidden md:block h-4 w-px bg-gray-300" />
                <div className="text-sm text-gray-600">
                  May be divided across multiple proposals.
                </div>
              </div>
            </div>
          </div>
        )}

        <WorkTabs
          work={work}
          metadata={metadata}
          defaultTab={defaultTab}
          contentType="grant"
          onTabChange={handleTabChange}
        />

        {renderTabContent}

        <ApplyToGrantModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onUseSelected={() => setIsApplyModalOpen(false)}
          grantId={grantId.toString()}
        />
      </div>
    </ProposalListProvider>
  );
};
