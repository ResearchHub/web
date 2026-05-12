'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { TAB_EXPERT_RESULTS, TAB_OUTREACH } from '@/app/expert-finder/lib/searchDetailTabs';
import { Loader2, RefreshCw, FileText, Download, Mail } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { useExpertSearchDetail, usePatchExpert } from '@/hooks/useExpertFinder';
import type { PatchExpertPayload } from '@/services/expertFinder.service';
import { SearchDetailHeader } from './SearchDetailHeader';
import { ExpertResultCard } from './ExpertResultCard';
import { GenerateEmailModal, type GenerateEmailConfirmPayload } from './GenerateEmailModal';
import { GenerateEmailProgressModal } from './GenerateEmailProgressModal';
import { GeneratedEmailsList } from '@/app/expert-finder/library/[searchId]/outreach/components/GeneratedEmailsList';
import type { ExpertResult } from '@/types/expertFinder';

export interface SearchDetailContentProps {
  searchId: string;
}

export function SearchDetailContent({ searchId }: SearchDetailContentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab') === TAB_OUTREACH ? TAB_OUTREACH : TAB_EXPERT_RESULTS;

  const [{ searchDetail, isLoading, error }, refetch] = useExpertSearchDetail(searchId);
  const [, patchExpert] = usePatchExpert();

  const handleSaveExpert = useCallback(
    async (expertId: number, payload: PatchExpertPayload) => {
      await patchExpert(expertId, payload);
      await refetch();
    },
    [patchExpert, refetch]
  );

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
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
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
          {(searchDetail.reportPdfUrl || searchDetail.reportCsvUrl) && (
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                <FileText className="h-6 w-6 shrink-0 text-primary-600" aria-hidden />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Expert Reports Available</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Download comprehensive reports with all expert recommendations and contact
                    information.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {searchDetail.reportPdfUrl && (
                  <a
                    href={searchDetail.reportPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    <Download className="h-4 w-4 shrink-0" aria-hidden />
                    Download PDF Report
                  </a>
                )}
                {searchDetail.reportCsvUrl && (
                  <a
                    href={searchDetail.reportCsvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-primary-300 bg-white px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    <Download className="h-4 w-4 shrink-0" aria-hidden />
                    Download CSV (Contacts)
                  </a>
                )}
              </div>
            </section>
          )}

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
                    onSaveExpert={handleSaveExpert}
                  />
                ))}
              </div>
            </section>
          ) : tab === TAB_EXPERT_RESULTS ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
              No experts found for this search.
            </div>
          ) : null}
        </>
      )}

      <GenerateEmailModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        experts={generateExperts}
        onConfirm={handleGenerateConfirm}
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
