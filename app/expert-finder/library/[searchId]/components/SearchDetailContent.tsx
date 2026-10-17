'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ExpertSearchLiveStatus } from '@/app/expert-finder/components/ExpertSearchLiveStatus';
import { TAB_EXPERT_RESULTS, TAB_OUTREACH } from '@/app/expert-finder/lib/searchDetailTabs';
import {
  Download,
  Eye,
  MailCheck,
  MailX,
  Send,
  UserPlus,
  MoreVertical,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Tabs } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { useExpertSearchDetail, useFindMoreExperts } from '@/hooks/useExpertFinder';
import {
  clearExpertSearchAppendBaseline,
  getExpertSearchAppendBaseline,
  markExpertSearchAppendBaseline,
  useExpertSearchProgress,
} from '@/hooks/useExpertSearchProgress';
import { ApiError } from '@/services/types/api';
import type { FindMoreExpertsPayload } from '@/services/expertFinder.service';
import { CampaignPreviewModal } from '@/app/expert-finder/campaigns/components/CampaignPreviewModal';
import { SearchDetailHeader } from './SearchDetailHeader';
import { ExpertResultCard } from './ExpertResultCard';
import { ExpertFormModal } from './ExpertFormModal';
import { FindMoreExpertsModal } from './FindMoreExpertsModal';
import { SendModal } from './SendModal';
import { GeneratedEmailsList } from '@/app/expert-finder/library/[searchId]/outreach/components/GeneratedEmailsList';
import { SearchDetailSkeleton } from '@/components/ExpertFinder/SearchDetailSkeleton';
import { expertHasOutreachHistory, type ExpertResult } from '@/types/expertFinder';
import { isValidEmail } from '@/utils/validation';

function isFindMoreStep(step: string | null | undefined): boolean {
  return /find(?:ing)? more/i.test(step ?? '');
}

function existingExpertsBaseline(detail: {
  expertResults: { length: number };
  expertCount: number;
}): number {
  return Math.max(detail.expertResults.length, detail.expertCount);
}

export interface SearchDetailContentProps {
  searchId: string;
}

function SearchActionsMenu({
  reportPdfUrl,
  reportCsvUrl,
  onAddExpert,
  onPreviewCampaign,
  previewDisabledReason,
}: {
  reportPdfUrl?: string | null;
  reportCsvUrl?: string | null;
  onAddExpert: () => void;
  onPreviewCampaign?: () => void;
  previewDisabledReason?: string | null;
}) {
  const previewItem = (
    <BaseMenuItem
      disabled={Boolean(previewDisabledReason) || onPreviewCampaign == null}
      onSelect={() => {
        if (previewDisabledReason || !onPreviewCampaign) return;
        onPreviewCampaign();
      }}
    >
      <Eye className="h-4 w-4 mr-2 shrink-0 text-gray-500" aria-hidden />
      <span>Preview</span>
    </BaseMenuItem>
  );

  return (
    <BaseMenu
      align="end"
      trigger={
        <button
          type="button"
          className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition-colors',
            'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
          )}
          aria-label="More search actions"
        >
          <MoreVertical className="h-4 w-4" aria-hidden />
        </button>
      }
    >
      {onPreviewCampaign != null ? (
        previewDisabledReason ? (
          <Tooltip
            content={previewDisabledReason}
            position="left"
            width="w-56"
            wrapperClassName="block w-full"
          >
            <div className="w-full">{previewItem}</div>
          </Tooltip>
        ) : (
          previewItem
        )
      ) : null}
      <BaseMenuItem onSelect={onAddExpert}>
        <UserPlus className="h-4 w-4 mr-2 shrink-0 text-gray-500" aria-hidden />
        <span>Add expert</span>
      </BaseMenuItem>
      {reportPdfUrl && (
        <BaseMenuItem onSelect={() => window.open(reportPdfUrl, '_blank', 'noopener,noreferrer')}>
          <Download className="h-4 w-4 mr-2 shrink-0 text-gray-500" aria-hidden />
          <span>Download PDF Report</span>
        </BaseMenuItem>
      )}
      {reportCsvUrl && (
        <BaseMenuItem onSelect={() => window.open(reportCsvUrl, '_blank', 'noopener,noreferrer')}>
          <Download className="h-4 w-4 mr-2 shrink-0 text-gray-500" aria-hidden />
          <span>Download CSV (Contacts)</span>
        </BaseMenuItem>
      )}
    </BaseMenu>
  );
}

export function SearchDetailContent({ searchId }: SearchDetailContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab') === TAB_OUTREACH ? TAB_OUTREACH : TAB_EXPERT_RESULTS;

  const [{ searchDetail, isLoading, error }, refetch] = useExpertSearchDetail(searchId);
  const [{ isLoading: isFindMoreSubmitting, error: findMoreError }, findMore] =
    useFindMoreExperts();

  const [showAddExpertModal, setShowAddExpertModal] = useState(false);
  const [showFindMoreModal, setShowFindMoreModal] = useState(false);
  const [liveRunKey, setLiveRunKey] = useState(0);
  const [liveExpertsBaseline, setLiveExpertsBaseline] = useState(() =>
    getExpertSearchAppendBaseline(searchId)
  );
  const [appendLiveActive, setAppendLiveActive] = useState(
    () => getExpertSearchAppendBaseline(searchId) > 0
  );

  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [hideContacted, setHideContacted] = useState(false);
  const [showSendCampaignModal, setShowSendCampaignModal] = useState(false);
  const [sendCampaignExperts, setSendCampaignExperts] = useState<ExpertResult[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewExpert, setPreviewExpert] = useState<ExpertResult | null>(null);

  const serverInProgress =
    searchDetail != null &&
    (searchDetail.status === 'pending' || searchDetail.status === 'processing');
  const isInProgress = appendLiveActive || serverInProgress;

  const handleLiveTerminal = useCallback(() => {
    setAppendLiveActive(false);
    clearExpertSearchAppendBaseline(searchId);
    void refetch();
  }, [refetch, searchId]);

  const beginAppendLiveRun = useCallback(() => {
    const baseline = searchDetail ? existingExpertsBaseline(searchDetail) : 0;
    markExpertSearchAppendBaseline(searchId, baseline);
    setLiveExpertsBaseline(baseline);
    setLiveRunKey((key) => key + 1);
    setAppendLiveActive(true);
  }, [searchDetail, searchId]);

  // Recover append baseline after refresh / remount while find-more is still running.
  useEffect(() => {
    if (!serverInProgress || !searchDetail) return;
    const stored = getExpertSearchAppendBaseline(searchId);
    if (stored > 0) {
      setLiveExpertsBaseline(stored);
      setAppendLiveActive(true);
      setLiveRunKey((key) => (key > 0 ? key : 1));
      return;
    }
    if (isFindMoreStep(searchDetail.currentStep) && searchDetail.expertResults.length > 0) {
      const baseline = existingExpertsBaseline(searchDetail);
      markExpertSearchAppendBaseline(searchId, baseline);
      setLiveExpertsBaseline(baseline);
      setAppendLiveActive(true);
      setLiveRunKey((key) => (key > 0 ? key : 1));
    }
  }, [serverInProgress, searchDetail, searchId]);

  const isAppendLiveRun =
    liveRunKey > 0 || liveExpertsBaseline > 0 || getExpertSearchAppendBaseline(searchId) > 0;

  const liveSeed = useMemo(() => {
    if (appendLiveActive && searchDetail?.status === 'completed') {
      return {
        status: 'processing' as const,
        progress: 0,
        currentStep: 'Finding more experts…',
      };
    }
    if (!searchDetail) {
      return appendLiveActive
        ? { status: 'processing' as const, progress: 0, currentStep: 'Finding more experts…' }
        : undefined;
    }
    return {
      status: appendLiveActive ? 'processing' : searchDetail.status,
      progress: searchDetail.progress,
      currentStep: searchDetail.currentStep || (isAppendLiveRun ? 'Finding more experts…' : ''),
    };
  }, [searchDetail, isAppendLiveRun, appendLiveActive]);

  const {
    progress: liveProgress,
    currentStep: liveCurrentStep,
    status: liveStatus,
    expertsFound: liveExpertsFound,
  } = useExpertSearchProgress({
    searchId,
    enabled: isInProgress,
    runKey: liveRunKey,
    expertsBaseline: liveExpertsBaseline,
    seed: liveSeed,
    onTerminal: handleLiveTerminal,
  });

  const toggleSelection = useCallback((index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const openSendCampaignForExperts = useCallback((experts: ExpertResult[]) => {
    setSendCampaignExperts(experts);
    setShowSendCampaignModal(true);
  }, []);

  const openPreviewForExpert = useCallback((expert: ExpertResult) => {
    setPreviewExpert(expert);
    setShowPreviewModal(true);
  }, []);

  const abortAppendLiveRun = useCallback(() => {
    setAppendLiveActive(false);
    setLiveExpertsBaseline(0);
    clearExpertSearchAppendBaseline(searchId);
  }, [searchId]);

  const handleFindMoreSubmit = useCallback(
    async (payload: FindMoreExpertsPayload) => {
      beginAppendLiveRun();
      try {
        await findMore(searchId, payload);
        setShowFindMoreModal(false);
        await refetch();
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 409) {
          // Already running — keep live mode and sync status.
          toast.error('Search is already running');
          setShowFindMoreModal(false);
          await refetch();
          return;
        }
        abortAppendLiveRun();
        // Modal surfaces findMoreError from the hook
      }
    },
    [beginAppendLiveRun, abortAppendLiveRun, findMore, searchId, refetch]
  );

  const expertResults = searchDetail?.expertResults ?? [];

  const visibleExpertEntries = useMemo(
    () =>
      expertResults
        .map((expert, index) => ({ expert, index }))
        .filter(({ expert }) => !hideContacted || !expertHasOutreachHistory(expert)),
    [expertResults, hideContacted]
  );

  const contactedExpertCount = useMemo(
    () => expertResults.filter(expertHasOutreachHistory).length,
    [expertResults]
  );

  const selectedPreviewExpert = useMemo(() => {
    if (selectedIndices.size !== 1) return null;
    const index = Array.from(selectedIndices)[0];
    const expert = expertResults[index];
    if (!expert) return null;
    const email = expert.email?.trim() ?? '';
    return email && isValidEmail(email) ? expert : null;
  }, [expertResults, selectedIndices]);

  const previewDisabledReason = useMemo(() => {
    if (selectedIndices.size === 0) {
      return 'Select a single expert to preview';
    }
    if (selectedIndices.size > 1) {
      return 'Preview is available only for a single expert';
    }
    if (selectedPreviewExpert == null) {
      return 'Selected expert needs a valid email to preview';
    }
    return null;
  }, [selectedIndices.size, selectedPreviewExpert]);

  const toggleHideContacted = useCallback(() => {
    setHideContacted((prev) => {
      const next = !prev;
      if (next) {
        setSelectedIndices((selected) => {
          const pruned = new Set<number>();
          selected.forEach((index) => {
            const expert = expertResults[index];
            if (expert && !expertHasOutreachHistory(expert)) pruned.add(index);
          });
          return pruned;
        });
      }
      return next;
    });
  }, [expertResults]);

  const expertResultsTabHref = pathname ? `${pathname}?tab=${TAB_EXPERT_RESULTS}` : undefined;
  const outreachTabHref = pathname ? `${pathname}?tab=${TAB_OUTREACH}` : undefined;

  if (isLoading && !searchDetail) {
    return <SearchDetailSkeleton activeTab={tab} />;
  }

  if (error && !searchDetail) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
        <Link
          href="/expert-finder/library"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          ← Back to Library
        </Link>
      </div>
    );
  }

  if (!searchDetail) {
    return null;
  }

  const displayedExpertTotal = Math.max(
    searchDetail.expertCount,
    searchDetail.expertResults.length
  );

  const statusAllowsFindMore =
    searchDetail.status === 'completed' || searchDetail.status === 'failed';
  const canFindMore = statusAllowsFindMore && !isInProgress;

  const showCompletedResults =
    searchDetail.status === 'completed' ||
    (searchDetail.status === 'failed' && searchDetail.expertResults.length > 0) ||
    (isInProgress && searchDetail.expertResults.length > 0);

  const visibleIndices = visibleExpertEntries.map(({ index }) => index);
  const allVisibleSelected =
    visibleIndices.length > 0 && visibleIndices.every((index) => selectedIndices.has(index));
  const resultsCountLabel = hideContacted
    ? `${visibleExpertEntries.length} of ${displayedExpertTotal}`
    : String(displayedExpertTotal);

  // Proposal drafts / proposal invitations only apply to searches linked to a
  // grant (funding round) document.
  const isGrantLinked = searchDetail.work?.contentType === 'funding_request';

  const findMoreButton = canFindMore ? (
    <Button
      variant="outlined"
      size="sm"
      className="gap-2"
      onClick={() => setShowFindMoreModal(true)}
    >
      <Search className="h-4 w-4" aria-hidden />
      Find more experts
    </Button>
  ) : null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Library', href: '/expert-finder/library' },
          {
            label: searchDetail.name?.trim()
              ? searchDetail.name
              : `Search #${searchDetail.searchId}`,
          },
        ]}
        className="mb-2"
      />

      <SearchDetailHeader search={searchDetail} />

      {searchDetail.status === 'failed' ? (
        <div className="space-y-3">
          <Alert variant="error">
            <div>
              <p className="font-semibold mb-1">Search failed</p>
              <p className="font-normal whitespace-pre-wrap">
                {searchDetail.errorMessage || 'An error occurred while running the search.'}
              </p>
              {searchDetail.currentStep ? (
                <p className="font-normal text-sm mt-2 text-red-900/90">
                  Step: {searchDetail.currentStep}
                </p>
              ) : null}
            </div>
          </Alert>
          {canFindMore && searchDetail.expertResults.length === 0 ? (
            <div className="flex flex-wrap items-center gap-2">{findMoreButton}</div>
          ) : null}
        </div>
      ) : null}

      {searchDetail.status === 'completed' && searchDetail.errorMessage.trim() !== '' && (
        <Alert variant="warning">
          <div>
            <p className="font-semibold mb-1">Find more did not finish cleanly</p>
            <p className="font-normal text-sm whitespace-pre-wrap">{searchDetail.errorMessage}</p>
            <p className="font-normal text-sm mt-2 text-amber-900/80">
              Existing experts from this search are still available below.
            </p>
          </div>
        </Alert>
      )}

      {isInProgress ? (
        <ExpertSearchLiveStatus
          progress={liveProgress}
          currentStep={
            liveCurrentStep ||
            (isAppendLiveRun ? 'Finding more experts…' : searchDetail.currentStep)
          }
          status={liveStatus ?? (appendLiveActive ? 'processing' : searchDetail.status)}
          expertsFound={liveExpertsFound}
          isAppendRun={isAppendLiveRun}
        />
      ) : null}

      {showCompletedResults && (
        <>
          <Tabs
            tabs={[
              {
                id: TAB_EXPERT_RESULTS,
                label: 'Expert results',
                href: expertResultsTabHref,
              },
              {
                id: TAB_OUTREACH,
                label: 'Outreach',
                href: outreachTabHref,
              },
            ]}
            activeTab={tab}
            onTabChange={() => {}}
            variant="primary"
          />

          {tab === TAB_OUTREACH && (
            <section>
              <GeneratedEmailsList
                searchId={searchId}
                emptyMessage={
                  <p className="text-gray-600">
                    No outreach yet. Select experts on the Expert results tab and click Send.
                  </p>
                }
              />
            </section>
          )}

          {tab === TAB_EXPERT_RESULTS && searchDetail.expertResults.length > 0 ? (
            <section>
              <div className="mb-4 space-y-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-[2px] mt-[2px]">
                  Results ({resultsCountLabel})
                </h2>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {allVisibleSelected ? (
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() => setSelectedIndices(new Set())}
                      >
                        Unselect all
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() => setSelectedIndices(new Set(visibleIndices))}
                        disabled={visibleIndices.length === 0}
                      >
                        Select all
                      </Button>
                    )}
                    <span className="text-sm text-gray-600">{selectedIndices.size} selected</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {findMoreButton}
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const experts = Array.from(selectedIndices).map(
                          (i) => searchDetail.expertResults[i]
                        );
                        openSendCampaignForExperts(experts);
                      }}
                      disabled={selectedIndices.size === 0}
                    >
                      <Send className="h-4 w-4" aria-hidden />
                      Send
                    </Button>
                    {contactedExpertCount > 0 ? (
                      <Tooltip
                        content={
                          hideContacted
                            ? 'Showing experts without prior outreach'
                            : 'Hide experts already contacted'
                        }
                        position="top"
                        wrapperClassName="inline-flex shrink-0"
                      >
                        <button
                          type="button"
                          aria-pressed={hideContacted}
                          aria-label={
                            hideContacted
                              ? 'Show experts already contacted'
                              : 'Hide experts already contacted'
                          }
                          onClick={toggleHideContacted}
                          className={cn(
                            'inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                            hideContacted
                              ? 'border-primary-600 bg-primary-50 text-primary-700 hover:bg-primary-100'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          {hideContacted ? (
                            <MailX className="h-4 w-4" aria-hidden />
                          ) : (
                            <MailCheck className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                      </Tooltip>
                    ) : null}
                    <SearchActionsMenu
                      reportPdfUrl={searchDetail.reportPdfUrl}
                      reportCsvUrl={searchDetail.reportCsvUrl}
                      onAddExpert={() => setShowAddExpertModal(true)}
                      onPreviewCampaign={() => {
                        if (selectedPreviewExpert) openPreviewForExpert(selectedPreviewExpert);
                      }}
                      previewDisabledReason={previewDisabledReason}
                    />
                  </div>
                </div>
              </div>
              {visibleExpertEntries.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
                  <p>All experts on this list already have outreach.</p>
                  <button
                    type="button"
                    className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                    onClick={toggleHideContacted}
                  >
                    Show contacted experts
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:!grid-cols-2">
                  {visibleExpertEntries.map(({ expert, index }) => (
                    <ExpertResultCard
                      key={expert.expertId != null ? `expert-${expert.expertId}` : `idx-${index}`}
                      expert={expert}
                      index={index}
                      selected={selectedIndices.has(index)}
                      onToggleSelect={toggleSelection}
                      searchId={searchId}
                      onSuccess={refetch}
                      proposalDraftsEnabled={isGrantLinked}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : tab === TAB_EXPERT_RESULTS ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600 space-y-3">
              <p>No experts found for this search.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {findMoreButton}
                <SearchActionsMenu
                  reportPdfUrl={searchDetail.reportPdfUrl}
                  reportCsvUrl={searchDetail.reportCsvUrl}
                  onAddExpert={() => setShowAddExpertModal(true)}
                />
              </div>
            </div>
          ) : null}
        </>
      )}

      <ExpertFormModal
        isOpen={showAddExpertModal}
        onClose={() => setShowAddExpertModal(false)}
        searchId={searchId}
        onSuccess={refetch}
      />
      <FindMoreExpertsModal
        isOpen={showFindMoreModal}
        onClose={() => setShowFindMoreModal(false)}
        initialAdditionalContext={searchDetail.additionalContext}
        isSubmitting={isFindMoreSubmitting}
        error={findMoreError}
        onSubmit={handleFindMoreSubmit}
      />
      <SendModal
        isOpen={showSendCampaignModal}
        onClose={() => setShowSendCampaignModal(false)}
        searchId={Number(searchId)}
        experts={sendCampaignExperts}
        onSuccess={() => {
          setSelectedIndices(new Set());
          void refetch();
          if (pathname) {
            router.push(`${pathname}?tab=${TAB_OUTREACH}`);
          }
        }}
      />
      <CampaignPreviewModal
        isOpen={showPreviewModal && previewExpert != null}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewExpert(null);
        }}
        expertEmail={previewExpert?.email?.trim() || ''}
        expertSearchId={Number(searchId)}
      />
    </div>
  );
}
