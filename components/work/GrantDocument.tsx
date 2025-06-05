'use client';

import { useState, useMemo } from 'react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { WorkLineItems } from './WorkLineItems';
import { PageHeader } from '@/components/ui/PageHeader';
import { WorkTabs, TabType } from './WorkTabs';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { GrantApplications } from './GrantApplications';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { differenceInCalendarDays, format } from 'date-fns';
import { PostBlockEditor } from './PostBlockEditor';

interface GrantDocumentProps {
  work: Work;
  metadata: WorkMetadata;
  defaultTab?: TabType;
  content?: string;
}

export const GrantDocument = ({
  work,
  metadata,
  content,
  defaultTab = 'paper',
}: GrantDocumentProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const renderGrantInfo = () => {
    return (
      <div className="space-y-6 mt-6">
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
  };

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'paper':
        return renderGrantInfo();
      case 'reviews':
        // Applications tab
        return (
          <div className="space-y-6" key="applications-tab">
            <GrantApplications grantId={work.id} />
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
            />
          </div>
        );
      default:
        return null;
    }
  }, [activeTab, work, metadata]);

  const isOpen = work.note?.post?.grant?.status === 'OPEN';

  return (
    <div>
      <PageHeader title={work.title} className="text-3xl mt-2" />
      <WorkLineItems work={work} showClaimButton={false} />

      {/* Top summary as line items */}
      <div className="space-y-2 text-sm text-gray-600 mt-2">
        {/* Funding */}
        {work.note?.post?.grant?.amount && work.note?.post?.grant?.currency && (
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-28">Amount</span>
            <div className="flex flex-row items-center gap-2">
              <CurrencyBadge
                amount={work.note?.post?.grant?.amount.usd}
                currency={work.note?.post?.grant?.currency}
                variant="text"
                showText={true}
                showIcon={true}
                textColor="text-indigo-600"
                className="font-semibold p-0"
                shorten={false}
                showExchangeRate={true}
              />
              <div className="h-4 w-px bg-gray-300" />
              <div className="text-sm text-gray-600">Multiple applicants can be selected</div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-start">
          <span className="font-medium text-gray-900 w-28">Status</span>
          <div className="flex-1 text-sm">
            <div className="flex items-center gap-2 text-gray-800">
              <span
                className={`h-2 w-2 rounded-full ${
                  isOpen ? 'bg-emerald-500' : 'bg-red-500'
                } inline-block`}
              />
              <span>{isOpen ? 'Accepting Applications' : 'Closed'}</span>
              {work.note?.post?.grant?.endDate && isOpen && (
                <>
                  <div className="h-4 w-px bg-gray-300" />
                  <span className="text-gray-600 text-sm">
                    Closes on {format(new Date(work.note?.post?.grant?.endDate), 'MMMM d, yyyy')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <WorkTabs
        work={work}
        metadata={metadata}
        defaultTab={defaultTab}
        contentType="grant"
        onTabChange={handleTabChange}
      />

      {/* Tab content */}
      {renderTabContent}
    </div>
  );
};
