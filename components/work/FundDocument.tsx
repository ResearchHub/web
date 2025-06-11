'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Comment } from '@/types/comment';
import { WorkLineItems } from './WorkLineItems';
import { PageHeader } from '@/components/ui/PageHeader';
import { WorkTabs, TabType } from './WorkTabs';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { PostBlockEditor } from './PostBlockEditor';
import { FundraiseProgress } from '@/components/Fund/FundraiseProgress';
import { ProgressUpdates } from '@/components/ui/ProgressUpdates';
import { useStorageKey } from '@/utils/storageKeys';
import { NewFundingModal } from '@/components/modals/NewFundingModal';

interface FundDocumentProps {
  work: Work;
  metadata: WorkMetadata;
  content?: string;
  defaultTab?: TabType;
  authorUpdates?: Comment[];
}

export const FundDocument = ({
  work,
  metadata,
  content,
  defaultTab = 'paper',
  authorUpdates = [],
}: FundDocumentProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const storageKey = useStorageKey('rh-comments');

  // New funding modal logic
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isNewFundingModalOpen, setIsNewFundingModalOpen] = useState(false);

  useEffect(() => {
    const newParam = searchParams.get('new');
    setIsNewFundingModalOpen(newParam === 'true');
  }, [searchParams]);

  const handleCloseNewFundingModal = () => {
    setIsNewFundingModalOpen(false);

    // More robust URL parameter removal
    const url = new URL(window.location.href);
    url.searchParams.delete('new');

    const newUrl = url.pathname + (url.search || '');

    console.log('Current URL:', window.location.href);
    console.log('New URL:', newUrl);

    // Use router.replace for navigation
    router.replace(newUrl, { scroll: false });
  };

  // Generate clean URL for sharing (without the new=true parameter)
  const getCleanUrl = () => {
    if (typeof window === 'undefined') return '';

    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete('new');

    const search = current.toString();
    const query = search ? `?${search}` : '';

    return `${window.location.origin}${pathname}${query}`;
  };

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
      case 'updates':
        return (
          <div className="space-y-6" key="updates-tab">
            {/* Project Activity Timeline */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Updates Timeline</h3>
                  <p className="mt-1 text-sm text-gray-700">
                    Track updates made by authors about their research progress.
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                    {(() => {
                      const updateRate =
                        authorUpdates.length > 0
                          ? Math.round(
                              (authorUpdates.filter((update) => {
                                const updateDate = new Date(update.createdDate);
                                const now = new Date();
                                const monthsDiff =
                                  (now.getFullYear() - updateDate.getFullYear()) * 12 +
                                  (now.getMonth() - updateDate.getMonth());
                                return monthsDiff <= 12;
                              }).length /
                                12) *
                                100
                            )
                          : 0;
                      return `${updateRate}% update rate`;
                    })()}
                  </span>
                </div>
              </div>
              <ProgressUpdates
                updates={authorUpdates.map((update) => ({
                  id: update.id,
                  createdDate: update.createdDate,
                  content: update.content,
                }))}
              />
            </div>

            {/* Comment Feed for posting updates */}
            <CommentFeed
              documentId={work.id}
              contentType={work.contentType}
              commentType="AUTHOR_UPDATE"
              key={`update-feed-${work.id}`}
              editorProps={{
                placeholder: 'Write an update...',
                commentType: 'AUTHOR_UPDATE',
                storageKey: `${storageKey}-update-feed-${work.id}`,
              }}
            />
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
                storageKey: `${storageKey}-review-feed-${work.id}`,
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
                storageKey: `${storageKey}-bounty-feed-${work.id}`,
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
                storageKey: `${storageKey}-comment-feed-${work.id}`,
              }}
            />
          </div>
        );
      default:
        return null;
    }
  }, [activeTab, work, metadata, content, storageKey]);

  return (
    <div>
      {/* Title & Actions */}
      {work.type === 'preprint' && (
        <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
          Preprint
        </div>
      )}
      <PageHeader title={work.title} className="text-3xl mt-2" />
      <WorkLineItems work={work} showClaimButton={false} metadata={metadata} />

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
        updatesCount={authorUpdates.length}
      />

      {/* Tab Content */}
      {renderTabContent}

      {/* New Funding Modal */}
      <NewFundingModal
        isOpen={isNewFundingModalOpen}
        onClose={handleCloseNewFundingModal}
        preregistrationUrl={getCleanUrl()}
      />
    </div>
  );
};
