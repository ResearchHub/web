'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart2, Coins, CheckCircle, FileText, MessageCircle, Play, Star } from 'lucide-react';
import { Work } from '@/types/work';
import { useRouter, useSearchParams } from 'next/navigation';
import { WorkRightSidebar } from './WorkRightSidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { WorkLineItems } from './WorkLineItems';
import { WorkMetadata } from '@/services/metadata.service';
import { DocumentViewer } from './DocumentViewer';
import { CommentEditor } from '@/components/Comment/CommentEditor';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { calculateOpenBountiesAmount } from '@/components/Bounty/lib/bountyUtil';

interface WorkDocumentProps {
  work: Work;
  metadata: WorkMetadata;
  defaultTab?: 'paper' | 'reviews' | 'bounties' | 'comments';
}

export const WorkDocument = ({ work, metadata, defaultTab = 'paper' }: WorkDocumentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize activeTab from URL or props
  const [activeTab, setActiveTab] = useState(() => {
    // Check if URL contains a tab indicator
    const path = window.location.pathname;
    if (path.includes('/conversation')) return 'comments';
    if (path.includes('/reviews')) return 'reviews';
    if (path.includes('/bounties')) return 'bounties';
    return defaultTab;
  });

  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [showMobileMetrics, setShowMobileMetrics] = useState(false);

  // Only log metadata once to reduce console noise
  useEffect(() => {
    console.log('metadata', metadata);
  }, [metadata]);

  // Add debugging for component rendering
  useEffect(() => {
    console.log(`WorkDocument RENDERED - activeTab: ${activeTab}`);
  });

  // Update URL when tab changes, but without causing a navigation
  const handleTabChange = (tab: typeof activeTab) => {
    // Only update if the tab is actually changing
    if (tab === activeTab) return;

    console.log(`Tab changing from ${activeTab} to ${tab}`);
    setActiveTab(tab);

    // Update the URL without triggering a navigation
    const baseUrl = `/paper/${work.id}/${work.slug}`;
    const newUrl =
      tab === 'comments'
        ? `${baseUrl}/conversation`
        : tab === 'reviews'
          ? `${baseUrl}/reviews`
          : tab === 'bounties'
            ? `${baseUrl}/bounties`
            : baseUrl;

    // Use history.replaceState to update URL without navigation
    window.history.replaceState(null, '', newUrl);
  };

  // Render tab content based on activeTab - memoized to prevent unnecessary re-renders
  const renderTabContent = useMemo(() => {
    console.log(`Rendering tab content for: ${activeTab}`);

    switch (activeTab) {
      case 'paper':
        return (
          <>
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Abstract</h2>
              <p className="text-gray-700">{work.abstract}</p>
            </div>

            {/* PDF Viewer */}
            {work.formats.find((format) => format.type === 'PDF')?.url && (
              <div className="bg-white rounded-lg shadow-sm border mb-6">
                <DocumentViewer
                  url={work.formats.find((format) => format.type === 'PDF')?.url || ''}
                  className="min-h-[800px]"
                />
              </div>
            )}
          </>
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
  }, [activeTab, work.id, work.contentType, work.abstract, work.formats]);

  return (
    <div>
      {/* Rewards Banner - Show when there are open bounties */}
      {metadata.bounties && metadata.openBounties > 0 && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Coins className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-orange-900">
                      {(() => {
                        // Calculate total amount from only OPEN bounties using utility function
                        const totalAmount = calculateOpenBountiesAmount(metadata.bounties);
                        return `${formatRSC({ amount: totalAmount })} RSC Bounties Available`;
                      })()}
                    </h2>
                    <p className="mt-1 text-sm text-orange-700">
                      Earn ResearchCoin by completing bounties on this paper
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleTabChange('bounties')}
                  className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
                >
                  View Bounties
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Title & Actions */}
      {work.type === 'preprint' && (
        <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
          Preprint
        </div>
      )}
      <PageHeader title={work.title} className="text-3xl mt-2" />
      <button
        className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
        onClick={() => setShowMobileMetrics(true)}
      >
        <BarChart2 className="h-4 w-4" />
        <span>Insights</span>
      </button>
      <WorkLineItems work={work} />
      {/* Navigation */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8 mt-6">
          <button
            className={`px-1 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'paper'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('paper')}
          >
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Paper
            </div>
          </button>
          <button
            className={`px-1 py-4 text-sm font-medium ${
              activeTab === 'reviews'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('reviews')}
          >
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Reviews
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'reviews'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {metadata.metrics.reviews}
              </span>
            </div>
          </button>
          <button
            className={`px-1 py-4 text-sm font-medium ${
              activeTab === 'bounties'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('bounties')}
          >
            <div className="flex items-center">
              <Coins
                className={`h-4 w-4 mr-2 ${
                  activeTab === 'bounties' ? 'text-indigo-600' : 'text-gray-500'
                }`}
              />
              Bounties
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'bounties'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className="text-green-600">{metadata.openBounties}</span>
                {metadata.closedBounties > 0 && (
                  <span className="text-gray-500 ml-1">/ {metadata.closedBounties}</span>
                )}
              </span>
            </div>
          </button>
          <button
            className={`px-1 py-4 text-sm font-medium ${
              activeTab === 'comments'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('comments')}
          >
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Comments
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'comments'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {work.metrics.comments}
              </span>
            </div>
          </button>
        </nav>
      </div>
      {/* Content */}
      <div>{renderTabContent}</div>
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 z-50 lg:hidden ${
          showMobileMetrics ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setShowMobileMetrics(false)}
      >
        <div
          className={`absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl transition-transform duration-200 ${
            showMobileMetrics ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <WorkRightSidebar metadata={metadata} work={work} />
        </div>
      </div>
    </div>
  );
};
