'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ExpertSearchLiveStatus } from '@/app/expert-finder/components/ExpertSearchLiveStatus';
import { TAB_EXPERT_RESULTS, TAB_OUTREACH } from '@/app/expert-finder/lib/searchDetailTabs';
import { getSearchEngine, isContentFilteredError } from '@/app/expert-finder/lib/searchEngine';
import { Download, Mail, MailCheck, MailX, UserPlus, MoreVertical, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
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
import { clampExpertCount, type FindMoreExpertsPayload } from '@/services/expertFinder.service';
import { SearchDetailHeader } from './SearchDetailHeader';
import { ExpertResultCard } from './ExpertResultCard';
import { GenerateEmailModal, type GenerateEmailConfirmPayload } from './GenerateEmailModal';
import { GenerateEmailProgressModal } from './GenerateEmailProgressModal';
import { ExpertFormModal } from './ExpertFormModal';
import { FindMoreExpertsModal } from './FindMoreExpertsModal';
import { GeneratedEmailsList } from '@/app/expert-finder/library/[searchId]/outreach/components/GeneratedEmailsList';
import { SearchDetailSkeleton } from '@/components/ExpertFinder/SearchDetailSkeleton';
import { expertHasOutreachHistory, type ExpertResult } from '@/types/expertFinder';

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
}: {
  reportPdfUrl?: string | null;
  reportCsvUrl?: string | null;
  onAddExpert: () => void;
}) {
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
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [generateExperts, setGenerateExperts] = useState<ExpertResult[]>([]);
  const [generatePayload, setGeneratePayload] = useState<GenerateEmailConfirmPayload | null>(null);

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

  const openGenerateForExperts = useCallback((experts: ExpertResult[]) => {
    setGenerateExperts(experts);
    setShowGenerateModal(true);
  }, []);

  const handleGenerateConfirm = useCallback((payload: GenerateEmailConfirmPayload) => {
    setGeneratePayload(payload);
    setShowGenerateModal(false);
    setShowProgressModal(true);
  }, []);

  const handleProgressClose = useCallback(() => {
    setShowProgressModal(false);
    setGeneratePayload(null);
  }, []);

  const handleProgressDone = useCallback(() => {
    setSelectedIndices(new Set());
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

  const handleRetryWithBasicEngine = useCallback(async () => {
    if (!searchDetail) return;
    const expertCount = clampExpertCount(searchDetail.config?.expert_count, 'basic');
    beginAppendLiveRun();
    try {
      await findMore(searchId, { expert_count: expertCount, engine: 'basic' });
      await refetch();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('Search is already running');
        await refetch();
        return;
      }
      abortAppendLiveRun();
      toast.error(err instanceof Error ? err.message : 'Failed to retry with Basic engine');
    }
  }, [searchDetail, beginAppendLiveRun, abortAppendLiveRun, findMore, searchId, refetch]);

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

  const searchEngine = getSearchEngine(searchDetail.config);
  const statusAllowsFindMore =
    searchDetail.status === 'completed' || searchDetail.status === 'failed';
  const canFindMore = statusAllowsFindMore && !isInProgress;
  const showContentFilterRetry =
    searchDetail.status === 'failed' &&
    searchEngine === 'advanced' &&
    (isContentFilteredError(searchDetail.errorMessage) ||
      isContentFilteredError(searchDetail.currentStep));

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

      {searchDetail.status === 'failed' && showContentFilterRetry ? (
        <Alert variant="warning">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="font-semibold">Advanced search was blocked</p>
              <p className="font-normal">
                A content filter stopped the Advanced engine. You can still find experts with the
                Basic engine.
              </p>
            </div>
            <LoadingButton
              type="button"
              variant="default"
              size="sm"
              isLoading={isFindMoreSubmitting}
              onClick={() => void handleRetryWithBasicEngine()}
            >
              Continue with Basic engine
            </LoadingButton>
          </div>
        </Alert>
      ) : null}

      {searchDetail.status === 'failed' && !showContentFilterRetry ? (
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
                getDetailHref={(e) => `/expert-finder/library/${searchId}/outreach/${e.id}`}
                emptyMessage={
                  <p className="text-gray-600">
                    No outreach for this search yet. Use the Expert results tab to select experts
                    and generate outreach.
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
                        openGenerateForExperts(experts);
                      }}
                      disabled={selectedIndices.size === 0}
                    >
                      <Mail className="h-4 w-4" aria-hidden />
                      Generate outreach
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
                      onGenerateEmail={(expert) => openGenerateForExperts([expert])}
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
        engine={searchEngine}
        initialAdditionalContext={searchDetail.additionalContext}
        isSubmitting={isFindMoreSubmitting}
        error={findMoreError}
        onSubmit={handleFindMoreSubmit}
      />
      <GenerateEmailModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        experts={generateExperts}
        onConfirm={handleGenerateConfirm}
        isGrantLinked={isGrantLinked}
      />
      <GenerateEmailProgressModal
        isOpen={showProgressModal}
        onClose={handleProgressClose}
        experts={generateExperts}
        searchId={searchId}
        generation={generatePayload}
        onDone={handleProgressDone}
      />
    </div>
  );
}
