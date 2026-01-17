'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart2,
  CheckCircle,
  FileText,
  MessageCircle,
  Play,
  Star,
  AlertTriangle,
  FlaskConicalOff,
  History,
  Plus,
  X,
} from 'lucide-react';
import { Work, DocumentVersion } from '@/types/work';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { WorkRightSidebar } from './WorkRightSidebar';
import { PageHeader } from '@/components/ui/PageHeader';
import { WorkLineItems } from './WorkLineItems';
import { WorkMetadata } from '@/services/metadata.service';
import { DocumentViewer } from './DocumentViewer';
import { CommentEditor } from '@/components/Comment/CommentEditor';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { WorkTabs, TabType } from './WorkTabs';
import { WorkHistoryDisplay } from './WorkHistoryDisplay';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

import { Button } from '@/components/ui/Button';
import { useUser } from '@/contexts/UserContext';
import { EarningOpportunityBanner } from '@/components/banners/EarningOpportunityBanner';
import { ReviewStatusBanner } from '@/components/Bounty/ReviewStatusBanner';

interface WorkDocumentProps {
  work: Work;
  metadata: WorkMetadata;
  defaultTab?: TabType;
}

export const WorkDocument = ({ work, metadata, defaultTab = 'paper' }: WorkDocumentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { user } = useUser();

  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (pathname.includes('/conversation')) return 'conversation';
    if (pathname.includes('/reviews')) return 'reviews';
    if (pathname.includes('/bounties')) return 'bounties';
    if (pathname.includes('/history')) return 'history';
    return defaultTab;
  });

  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [showMobileMetrics, setShowMobileMetrics] = useState(false);
  const [pdfUnavailable, setPdfUnavailable] = useState(false);

  // Determine if we should auto focus the review editor based on query param
  const shouldFocusReviewEditor = useMemo(() => {
    return searchParams?.get('focus') === 'true';
  }, [searchParams]);

  // Update active tab if defaultTab prop changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Handle tab change (updates URL via WorkTabs now)
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const isAuthor = useMemo(() => {
    if (!user) return false;
    return work.authors?.some((a) => a.authorProfile.id === user!.authorProfile!.id);
  }, [user, work.authors]);

  const handleAddVersion = () => {
    if (!user) return; // should be authenticated already

    // Determine the latest version's paperId to pre-populate the form with the most recent data
    let latestPaperId = work.id;

    if (work.versions && work.versions.length > 0) {
      // Try to use the version flagged as latest first
      const latestFlag = work.versions.find((v) => v.isLatest);

      if (latestFlag) {
        latestPaperId = latestFlag.paperId;
      } else {
        // Fallback: pick the version with newest publishedDate
        const sorted = [...work.versions].sort(
          (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
        );
        latestPaperId = sorted[0].paperId;
      }
    }

    router.push(`/paper/${latestPaperId}/create/version`);
  };

  // Render tab content based on activeTab - memoized to prevent unnecessary re-renders
  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'paper':
        return (
          <>
            {/* Abstract - Only show if no PDF, if PDF can't be displayed, or if PDF is currently unavailable */}
            {(!work.formats.find((format) => format.type === 'PDF')?.url ||
              !work.pdfCopyrightAllowsDisplay ||
              pdfUnavailable) && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Abstract</h2>
                <p className="text-gray-700">{work.abstract}</p>
              </div>
            )}

            {/* PDF Viewer */}
            {(() => {
              const pdfFormat = work.formats.find((format) => format.type === 'PDF');
              return (
                pdfFormat?.url &&
                !pdfUnavailable && (
                  <div className="bg-white rounded-lg shadow-sm border mb-6 relative">
                    {work.pdfCopyrightAllowsDisplay ? (
                      <DocumentViewer
                        url={pdfFormat.internalUrl || pdfFormat.url}
                        className="min-h-[800px]"
                        onPdfUnavailable={() => setPdfUnavailable(true)}
                      />
                    ) : (
                      <div className="p-8 text-center">
                        <FlaskConicalOff className="h-10 w-10 text-primary-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Content is restricted</h3>
                        <p className="text-gray-600 mb-4">
                          This paper's license is marked as closed access or non-commercial and
                          cannot be viewed on ResearchHub.
                        </p>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            window.open(
                              work.doi ? `https://doi.org/${work.doi}` : '#',
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                        >
                          Visit External Site
                        </Button>
                      </div>
                    )}
                  </div>
                )
              );
            })()}
          </>
        );
      case 'reviews':
        return (
          <div className="space-y-6" key="reviews-tab">
            <ReviewStatusBanner bounties={metadata.bounties || []} />
            <CommentFeed
              documentId={work.id}
              unifiedDocumentId={work.unifiedDocumentId || null}
              contentType={work.contentType}
              commentType="REVIEW"
              editorProps={{
                placeholder: 'Write your review...',
                initialRating: 0,
                commentType: 'REVIEW',
                autoFocus: shouldFocusReviewEditor,
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
              documentId={work.id}
              unifiedDocumentId={work.unifiedDocumentId || null}
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
          <div className="space-y-6" key="comments-tab">
            <CommentFeed
              documentId={work.id}
              unifiedDocumentId={work.unifiedDocumentId || null}
              contentType={work.contentType}
              commentType="GENERIC_COMMENT"
              key={`comment-feed-${work.id}`}
              work={work}
            />
          </div>
        );
      case 'history':
        return (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Version History</h2>
              {isAuthor && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleAddVersion}
                  className="inline-flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Version</span>
                </Button>
              )}
            </div>
            <WorkHistoryDisplay
              versions={work.versions || []}
              currentPaperId={work.id}
              slug={work.slug}
            />
          </>
        );
      default:
        return null;
    }
  }, [
    activeTab,
    work.id,
    work.contentType,
    work.abstract,
    work.formats,
    shouldFocusReviewEditor,
    work.versions,
    work.slug,
    router,
    isAuthor,
    handleAddVersion,
  ]);

  return (
    <div>
      {/* Show on mobile only - desktop shows in right sidebar */}
      <div className="lg:hidden mb-3">
        <EarningOpportunityBanner work={work} metadata={metadata} />
      </div>
      {/* Title & Actions */}
      <PageHeader title={work.title} className="text-2xl md:!text-3xl mt-0" />

      <WorkLineItems
        work={work}
        metadata={metadata}
        insightsButton={
          <button
            className="lg:!hidden flex items-center px-4 py-2.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
            onClick={() => setShowMobileMetrics(true)}
          >
            <BarChart2 className="h-5 w-5" />
          </button>
        }
      />

      {/* Navigation */}
      <WorkTabs
        work={work}
        metadata={metadata}
        defaultTab={defaultTab}
        contentType="paper"
        onTabChange={handleTabChange}
      />

      {/* Tab Content */}
      <div className="mt-6">{renderTabContent}</div>

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[70] lg:hidden ${
          showMobileMetrics ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setShowMobileMetrics(false)}
      >
        <div
          className={`absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl transition-transform duration-200 p-4 ${
            showMobileMetrics ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full overflow-y-auto relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMetrics(false)}
              aria-label="Close sidebar"
              className="absolute -top-2 right-0 z-10"
            >
              <X className="w-4 h-4 text-gray-600" />
            </Button>
            <WorkRightSidebar metadata={metadata} work={work} />
          </div>
        </div>
      </div>
    </div>
  );
};
