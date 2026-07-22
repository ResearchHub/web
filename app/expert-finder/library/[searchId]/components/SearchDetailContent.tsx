'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { TAB_EXPERT_RESULTS, TAB_OUTREACH } from '@/app/expert-finder/lib/searchDetailTabs';
import { Loader2, RefreshCw, Download, Mail, UserPlus, MoreVertical } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Tabs } from '@/components/ui/Tabs';
import { cn } from '@/utils/styles';
import { useExpertSearchDetail } from '@/hooks/useExpertFinder';
import { SearchDetailHeader } from './SearchDetailHeader';
import { ExpertResultCard } from './ExpertResultCard';
import { GenerateEmailModal, type GenerateEmailConfirmPayload } from './GenerateEmailModal';
import { GenerateEmailProgressModal } from './GenerateEmailProgressModal';
import { ExpertFormModal } from './ExpertFormModal';
import { GeneratedEmailsList } from '@/app/expert-finder/library/[searchId]/outreach/components/GeneratedEmailsList';
import { SearchDetailSkeleton } from '@/components/ExpertFinder/SearchDetailSkeleton';
import type { ExpertResult } from '@/types/expertFinder';

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
  const [showAddExpertModal, setShowAddExpertModal] = useState(false);

  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [generateExperts, setGenerateExperts] = useState<ExpertResult[]>([]);
  const [generatePayload, setGeneratePayload] = useState<GenerateEmailConfirmPayload | null>(null);

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

  const expertResultsTabHref = pathname ? `${pathname}?tab=${TAB_EXPERT_RESULTS}` : undefined;
  const outreachTabHref = pathname ? `${pathname}?tab=${TAB_OUTREACH}` : undefined;

  const isInProgress =
    searchDetail != null &&
    (searchDetail.status === 'pending' || searchDetail.status === 'processing');

  if (isLoading && !searchDetail) {
    return <SearchDetailSkeleton />;
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

  const displayedExpertTotal =
    searchDetail.status === 'completed'
      ? Math.max(searchDetail.expertCount, searchDetail.expertResults.length)
      : searchDetail.expertResults.length;

  // Proposal drafts / proposal invitations only apply to searches linked to a
  // grant (funding round) document.
  const isGrantLinked = searchDetail.work?.contentType === 'funding_request';

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

      {searchDetail.status === 'failed' && (
        <div className="space-y-3">
          <Alert variant="error">
            <div>
              <p className="font-semibold mb-1">Search failed</p>
              <p className="font-normal">
                {searchDetail.errorMessage || 'An error occurred while running the search.'}
              </p>
              {searchDetail.currentStep ? (
                <p className="font-normal text-sm mt-2 text-red-900/90">
                  Step: {searchDetail.currentStep}
                </p>
              ) : null}
              <p className="font-normal text-sm mt-2 text-red-900/80">
                If the model output did not match the required table format, validation errors will
                appear above.
              </p>
            </div>
          </Alert>
        </div>
      )}

      {searchDetail.status === 'completed' && (
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
                    No generated emails for this search yet. Use the Expert results tab to select
                    experts and generate emails.
                  </p>
                }
              />
            </section>
          )}

          {tab === TAB_EXPERT_RESULTS && searchDetail.expertResults.length > 0 ? (
            <section>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-[2px] mt-[2px]">
                  Results ({displayedExpertTotal})
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedIndices.size === searchDetail.expertResults.length ? (
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
                      onClick={() =>
                        setSelectedIndices(new Set(searchDetail.expertResults.map((_, i) => i)))
                      }
                      disabled={searchDetail.expertResults.length === 0}
                    >
                      Select all
                    </Button>
                  )}
                  <span className="text-sm text-gray-600">{selectedIndices.size} selected</span>
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
                    Generate emails
                  </Button>
                  <SearchActionsMenu
                    reportPdfUrl={searchDetail.reportPdfUrl}
                    reportCsvUrl={searchDetail.reportCsvUrl}
                    onAddExpert={() => setShowAddExpertModal(true)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:!grid-cols-2">
                {searchDetail.expertResults.map((expert, index) => (
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
            </section>
          ) : tab === TAB_EXPERT_RESULTS ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600 space-y-3">
              <p>No experts found for this search.</p>
              <div className="flex justify-center">
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

      {isInProgress && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-gray-500">
            Re-check status when the search has had time to complete.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={refetch}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
            ) : (
              <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
            )}
            <span>{isLoading ? 'Refreshing…' : 'Refresh'}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
