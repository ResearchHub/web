'use client';

import { useState, useMemo } from 'react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { WorkLineItems } from './WorkLineItems';
import { PageHeader } from '@/components/ui/PageHeader';
import { WorkTabs, TabType } from './WorkTabs';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { GrantApplications } from './GrantApplications';
import { format } from 'date-fns';
import { PostBlockEditor } from './PostBlockEditor';
import { formatDeadline, isDeadlineInFuture } from '@/utils/date';
import { isExpiringSoon } from '@/components/Bounty/lib/bountyUtil';
import { useInterest } from '@/hooks/useInterest';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { Button } from '@/components/ui/Button';
import { ThumbsDown } from 'lucide-react';

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
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const { markNotInterested, isProcessing: isMarkingNotInterested } = useInterest({
    votableEntityId: work.id,
    feedContentType: 'POST', // Grants are posts
    relatedDocumentTopics: work.topics,
    relatedDocumentId: work.id.toString(),
    relatedDocumentContentType: work.contentType,
  });

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
      case 'applications':
        // Applications tab
        return (
          <div className="space-y-6" key="applications-tab">
            <GrantApplications grantId={Number(work.note?.post?.grant?.id)} />
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
  }, [activeTab, work, metadata]);

  const endDate = work.note?.post?.grant?.endDate
    ? new Date(work.note?.post?.grant?.endDate)
    : undefined;
  const isActive =
    work.note?.post?.grant?.status === 'OPEN' &&
    (work.note?.post?.grant?.endDate ? isDeadlineInFuture(work.note?.post?.grant?.endDate) : true);

  // Show countdown when grant expires within 24 hours
  const expiringSoon = isExpiringSoon(work.note?.post?.grant?.endDate, 1);

  return (
    <div>
      <PageHeader title={work.title} className="text-2xl md:!text-3xl mt-2" />
      <WorkLineItems work={work} showClaimButton={false} metadata={metadata} />

      {/* Top summary as line items */}
      <div className="space-y-2 text-sm text-gray-600 mt-2">
        {/* Funding */}
        {work.note?.post?.grant?.amount && work.note?.post?.grant?.currency && (
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-28">Amount</span>
            <div className="space-y-1 md:space-y-0 md:flex md:items-center md:gap-2">
              <div className="font-semibold text-orange-500 flex items-center gap-1">
                <span>$</span>
                {(work.note?.post?.grant?.amount.usd || 0).toLocaleString()}
                <span>USD</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-gray-300" />
              <div className="text-sm text-gray-600">Multiple applicants can be selected</div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-start">
          <span className="font-medium text-gray-900 w-28">Status</span>
          <div className="flex-1 text-sm">
            <div className="space-y-2">
              {/* Status line */}
              <div className="flex items-center gap-2 text-gray-800">
                <span
                  className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'} inline-block`}
                />
                <span>{isActive ? 'Accepting Applications' : 'Closed'}</span>
              </div>

              {/* Deadline and countdown - stack on mobile */}
              {endDate && isActive && (
                <div className="space-y-1 md:space-y-0 md:flex md:items-center md:gap-2">
                  <span className="text-sm text-gray-600">
                    Closes {format(endDate, 'MMMM d, yyyy')} at {format(endDate, 'h:mm a')}
                  </span>
                  {/* Show countdown when expiring soon */}
                  {expiringSoon && work.note?.post?.grant?.endDate && (
                    <>
                      <div className="hidden md:block h-4 w-px bg-gray-300" />
                      <span className="text-sm text-amber-600 font-medium block md:inline">
                        {formatDeadline(work.note.post.grant.endDate)}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Closed grant deadline */}
              {!isActive && endDate && (
                <span className="text-gray-600 text-sm">
                  Closed on {format(endDate, 'MMMM d, yyyy')} at {format(endDate, 'h:mm a')}
                </span>
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

      {/* Not Interested Button */}
      <div className="mt-8 flex justify-center">
        <Button
          variant="outlined"
          size="sm"
          onClick={() => executeAuthenticatedAction(markNotInterested)}
          disabled={isMarkingNotInterested}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ThumbsDown className="h-4 w-4" />
          {'Not Interested'}
        </Button>
      </div>
    </div>
  );
};
