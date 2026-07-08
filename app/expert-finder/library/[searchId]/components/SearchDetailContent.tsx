'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { TAB_EXPERT_RESULTS, TAB_OUTREACH } from '@/app/expert-finder/lib/searchDetailTabs';
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Download,
  Mail,
  UserPlus,
  MoreHorizontal,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { BaseModal } from '@/components/ui/BaseModal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Tabs } from '@/components/ui/Tabs';
import { useExpertSearchDetail } from '@/hooks/useExpertFinder';
import { cn } from '@/utils/styles';
import { SearchDetailHeader, SearchDetailMeta } from './SearchDetailHeader';
import { ExpertResultCard } from './ExpertResultCard';
import { GenerateEmailModal, type GenerateEmailConfirmPayload } from './GenerateEmailModal';
import { GenerateEmailProgressModal } from './GenerateEmailProgressModal';
import { ExpertFormModal } from './ExpertFormModal';
import { DemoSendEmailProgressModal } from './DemoSendEmailProgressModal';
import { GeneratedEmailsList } from '@/app/expert-finder/library/[searchId]/outreach/components/GeneratedEmailsList';
import type { ExpertResult } from '@/types/expertFinder';

export interface SearchDetailContentProps {
  searchId: string;
}

export function SearchDetailContent({ searchId }: SearchDetailContentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab') === TAB_OUTREACH ? TAB_OUTREACH : TAB_EXPERT_RESULTS;
  const isLibraryDemo = searchId === '990001';

  const [{ searchDetail, isLoading, error }, refetch] = useExpertSearchDetail(searchId);
  const [showAddExpertModal, setShowAddExpertModal] = useState(false);

  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [sendingRecipients, setSendingRecipients] = useState<string[] | null>(null);
  const [sentEmailCount, setSentEmailCount] = useState<number | null>(null);
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

  const startDemoSend = useCallback((experts: ExpertResult[]) => {
    const names = experts.map((e) => e.name?.trim() || e.email?.trim() || 'Unknown');
    setSendingRecipients(names.length > 0 ? names : ['Unknown']);
  }, []);

  const handleDemoSendComplete = useCallback((count: number) => {
    setSendingRecipients(null);
    setSentEmailCount(Math.max(1, count));
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

  const hasReports = Boolean(searchDetail.reportPdfUrl || searchDetail.reportCsvUrl);
  const pageClassName = cn(
    'w-full mx-auto px-4 py-8 space-y-6',
    isLibraryDemo ? 'max-w-6xl' : 'max-w-5xl'
  );

  const reportsMenu =
    searchDetail.status === 'completed' && hasReports ? (
      <BaseMenu
        align="end"
        trigger={
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50"
            aria-label="Report options"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden />
          </button>
        }
      >
        {searchDetail.reportPdfUrl && (
          <BaseMenuItem
            onSelect={() => window.open(searchDetail.reportPdfUrl, '_blank', 'noopener')}
          >
            <Download className="h-4 w-4 mr-2" aria-hidden />
            <span>Download PDF report</span>
          </BaseMenuItem>
        )}
        {searchDetail.reportCsvUrl && (
          <BaseMenuItem
            onSelect={() => window.open(searchDetail.reportCsvUrl, '_blank', 'noopener')}
          >
            <Download className="h-4 w-4 mr-2" aria-hidden />
            <span>Download CSV (contacts)</span>
          </BaseMenuItem>
        )}
      </BaseMenu>
    ) : null;

  return (
    <div className={pageClassName}>
      <div>
        <Breadcrumbs
          items={[
            { label: 'Library', href: '/expert-finder/library' },
            {
              label: searchDetail.name?.trim()
                ? searchDetail.name
                : `Search #${searchDetail.searchId}`,
            },
          ]}
        />
        <div className="mt-1">
          <SearchDetailMeta search={searchDetail} />
        </div>
      </div>

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
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Results ({displayedExpertTotal})
                  </h2>
                  <button
                    type="button"
                    className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 disabled:opacity-50"
                    disabled={searchDetail.expertResults.length === 0}
                    onClick={() =>
                      setSelectedIndices((prev) =>
                        prev.size === searchDetail.expertResults.length
                          ? new Set()
                          : new Set(searchDetail.expertResults.map((_, i) => i))
                      )
                    }
                  >
                    {selectedIndices.size === searchDetail.expertResults.length
                      ? 'Unselect all'
                      : 'Select all'}
                  </button>
                  {selectedIndices.size > 0 && (
                    <span className="text-sm text-gray-500">· {selectedIndices.size} selected</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowAddExpertModal(true)}
                  >
                    <UserPlus className="h-4 w-4" aria-hidden />
                    Add expert
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      const experts = Array.from(selectedIndices).map(
                        (i) => searchDetail.expertResults[i]
                      );
                      if (isLibraryDemo) {
                        startDemoSend(experts);
                        setSelectedIndices(new Set());
                        return;
                      }
                      openGenerateForExperts(experts);
                    }}
                    disabled={selectedIndices.size === 0}
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    {isLibraryDemo ? 'Send email' : 'Generate emails'}
                  </Button>
                  {reportsMenu}
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
                    onGenerateEmail={(expert) =>
                      isLibraryDemo ? startDemoSend([expert]) : openGenerateForExperts([expert])
                    }
                    emailCtaLabel={isLibraryDemo ? 'Send email' : undefined}
                    searchId={searchId}
                    onSuccess={refetch}
                  />
                ))}
              </div>
            </section>
          ) : tab === TAB_EXPERT_RESULTS ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600 space-y-3">
              <p>No experts found for this search.</p>
              <Button
                variant="outlined"
                size="sm"
                className="gap-2"
                onClick={() => setShowAddExpertModal(true)}
              >
                <UserPlus className="h-4 w-4" aria-hidden />
                Add expert manually
              </Button>
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
      />
      <GenerateEmailProgressModal
        isOpen={showProgressModal}
        onClose={handleProgressClose}
        experts={generateExperts}
        searchId={searchId}
        generation={generatePayload}
        onDone={handleProgressDone}
      />
      <DemoSendEmailProgressModal
        isOpen={sendingRecipients != null}
        recipients={sendingRecipients ?? []}
        onComplete={handleDemoSendComplete}
        onClose={() => setSendingRecipients(null)}
      />
      <BaseModal
        isOpen={sentEmailCount != null}
        onClose={() => setSentEmailCount(null)}
        title={sentEmailCount != null && sentEmailCount > 1 ? 'Emails sent' : 'Email sent'}
        size="md"
        footer={
          <div className="flex justify-end">
            <Button variant="default" size="sm" onClick={() => setSentEmailCount(null)}>
              Done
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden />
          <p className="text-sm text-gray-600">
            {sentEmailCount && sentEmailCount > 1
              ? `${sentEmailCount} emails were sent successfully.`
              : 'The email was sent successfully.'}
          </p>
        </div>
      </BaseModal>

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
