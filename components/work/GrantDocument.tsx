'use client';

import { useState, useMemo } from 'react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { WorkLineItems } from './WorkLineItems';
import { PageHeader } from '@/components/ui/PageHeader';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { PostBlockEditor } from './PostBlockEditor';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
import { ProposalListProvider, useProposalList } from '@/contexts/ProposalListContext';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';
import { stripHtml } from '@/utils/stringUtils';
import { cn } from '@/utils/styles';

const PREVIEW_LENGTH = 180;

type GrantTab = 'proposals' | 'conversation';

const DescriptionCallout = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const plainText = useMemo(() => stripHtml(content), [content]);
  const isTruncated = plainText.length > PREVIEW_LENGTH;

  return (
    <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700 border border-transparent hover:border-gray-300 transition-colors cursor-pointer">
      {isExpanded ? (
        <>
          <div className="post-callout-content">
            <PostBlockEditor content={content} />
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="font-semibold text-gray-900 hover:text-gray-700 mt-1"
          >
            Show less
          </button>
        </>
      ) : (
        <p className="leading-relaxed">
          {isTruncated ? plainText.slice(0, PREVIEW_LENGTH).trimEnd() : plainText}
          {isTruncated && (
            <button
              onClick={() => setIsExpanded(true)}
              className="font-semibold text-gray-900 hover:text-gray-700 ml-1"
            >
              ...more
            </button>
          )}
        </p>
      )}
    </div>
  );
};

const GrantTabBar = ({
  activeTab,
  onTabChange,
  commentCount,
}: {
  activeTab: GrantTab;
  onTabChange: (tab: GrantTab) => void;
  commentCount: number;
}) => {
  const { proposalCount } = useProposalList();

  const tabs: { id: GrantTab; label: string }[] = [
    { id: 'proposals', label: `Proposals (${proposalCount})` },
    { id: 'conversation', label: `Conversation (${commentCount})` },
  ];

  return (
    <div className="flex items-center border-b border-gray-200">
      <div className="flex items-center gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'pb-3 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

interface GrantDocumentProps {
  work: Work;
  metadata: WorkMetadata;
}

export const GrantDocument = ({ work, metadata }: GrantDocumentProps) => {
  const [activeTab, setActiveTab] = useState<GrantTab>('proposals');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const grantId = Number(work.note?.post?.grant?.id);

  return (
    <ProposalListProvider grantId={grantId}>
      <div>
        <PageHeader title={work.title} className="text-2xl md:!text-3xl mt-0" />
        <WorkLineItems
          work={work}
          showClaimButton={false}
          metadata={metadata}
          calloutContent={
            work.previewContent ? <DescriptionCallout content={work.previewContent} /> : undefined
          }
        />

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

        <div className="mt-8">
          {/* <GrantTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            commentCount={metadata.metrics.conversationComments || 0}
          /> */}

          <div className="mt-6">
            {activeTab === 'proposals' ? (
              <FundingProposalGrid hideFilters />
            ) : (
              <CommentFeed
                unifiedDocumentId={work.unifiedDocumentId || null}
                documentId={work.id}
                contentType={work.contentType}
                commentType="GENERIC_COMMENT"
                key={`comment-feed-${work.id}`}
                work={work}
              />
            )}
          </div>
        </div>

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
