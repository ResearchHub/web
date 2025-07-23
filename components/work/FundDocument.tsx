'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { BarChart2 } from 'lucide-react';
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
import { calculateUpdateRate } from '@/components/Fund/lib/FundUtils';
import { getUpdatesStartDate } from '@/components/Fund/lib/FundUtils';
import { FundingRightSidebar } from './FundingRightSidebar';
import { useUser } from '@/contexts/UserContext';
import { UpdateRateBadge } from '@/components/ui/badges/UpdateRateBadge';
import { EarningOpportunityBanner } from '@/components/banners/EarningOpportunityBanner';
import { useShareModalContext } from '@/contexts/ShareContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/pro-solid-svg-icons';
import { Button } from '../ui/Button';

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
  const [showMobileMetrics, setShowMobileMetrics] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const storageKey = useStorageKey('rh-comments');
  const { user } = useUser();
  const { showShareModal } = useShareModalContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Check if current user is an author of the work
  const isCurrentUserAuthor = useMemo(() => {
    if (!user?.id) return false;
    return work.authors.some(
      (authorship) => authorship.authorProfile.id === user?.authorProfile?.id
    );
  }, [user?.id, work.authors]);

  useEffect(() => {
    const newParam = searchParams.get('new');
    if (newParam === 'true') {
      showShareModal({
        action: 'USER_OPENED_PROPOSAL',
        docTitle: work.title,
        url: `${window.location.origin}${pathname}`,
        shouldShowConfetti: true,
      });

      const url = new URL(window.location.href);
      url.searchParams.delete('new');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router, pathname, work.title, showShareModal]);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (showMobileMetrics) {
      setShowOverlay(true);
      setTimeout(() => setOverlayVisible(true), 0);
    } else {
      setOverlayVisible(false);
      const timeout = setTimeout(() => setShowOverlay(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [showMobileMetrics]);

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
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 lg:hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Updates Timeline</h3>
                  <p className="mt-1 text-sm text-gray-700">
                    Track updates made by authors about their research progress.
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <UpdateRateBadge
                    updateRate={calculateUpdateRate(
                      authorUpdates,
                      getUpdatesStartDate(metadata.fundraising, work)
                    )}
                  />
                </div>
              </div>
              <ProgressUpdates
                updates={authorUpdates.map((update) => ({
                  id: update.id,
                  createdDate: update.createdDate,
                  content: update.content,
                }))}
                startDate={getUpdatesStartDate(metadata.fundraising, work)}
              />
            </div>

            {/* Comment Feed for posting updates */}
            <CommentFeed
              documentId={work.id}
              unifiedDocumentId={work.unifiedDocumentId || null}
              contentType={work.contentType}
              commentType="AUTHOR_UPDATE"
              key={`update-feed-${work.id}`}
              hideEditor={!isCurrentUserAuthor}
              workAuthors={work.authors}
              editorProps={{
                placeholder: 'Write an update...',
                commentType: 'AUTHOR_UPDATE',
                storageKey: `${storageKey}-update-feed-${work.id}`,
              }}
              work={work}
            />
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
              key={`review-feed-${work.id}`}
              workAuthors={work.authors}
              editorProps={{
                placeholder: 'Write your review...',
                initialRating: 0,
                commentType: 'REVIEW',
                storageKey: `${storageKey}-review-feed-${work.id}`,
              }}
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
              workAuthors={work.authors}
              editorProps={{
                storageKey: `${storageKey}-bounty-feed-${work.id}`,
              }}
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
              workAuthors={work.authors}
              editorProps={{
                storageKey: `${storageKey}-comment-feed-${work.id}`,
              }}
              work={work}
            />
          </div>
        );
      default:
        return null;
    }
  }, [activeTab, work, metadata, content, storageKey, isCurrentUserAuthor]);

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

      <WorkLineItems
        work={work}
        metadata={metadata}
        showClaimButton={false}
        insightsButton={
          <button
            className="lg:!hidden flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
            onClick={() => setShowMobileMetrics(true)}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Insights</span>
          </button>
        }
      />
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
            fundraiseTitle={work.title}
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
      {/* Mobile overlay */}
      {showOverlay && (
        <div
          className={`fixed inset-0 bg-black ${
            overlayVisible ? 'opacity-50' : 'opacity-0'
          } z-20 lg:!hidden transition-opacity duration-300 ease-in-out`}
          onClick={() => setShowMobileMetrics(false)}
        />
      )}
      {/* Right Sidebar Container (Sticky) */}
      <div
        className={`
          fixed top-[64px] right-0 w-[280px] sm:!w-80 h-[calc(100vh-64px)] bg-white shadow-xl p-4
          z-50 lg:hidden
          transition-transform duration-300 ease-in-out
          ${showMobileMetrics ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full overflow-y-auto relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileMetrics(false)}
            aria-label="Close sidebar"
            className="absolute -top-2 right-0 z-10"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4 text-gray-600" />
          </Button>
          <FundingRightSidebar work={work} metadata={metadata} authorUpdates={authorUpdates} />
        </div>
      </div>
    </div>
  );
};
