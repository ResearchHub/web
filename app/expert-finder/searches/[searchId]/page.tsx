'use client';

import { use } from 'react';
import Link from 'next/link';
import { Loader2, RefreshCw, FileText, Download } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { useExpertSearchDetail } from '@/hooks/useExpertFinder';
import { SearchDetailHeader } from './components/SearchDetailHeader';
import { ExpertResultCard } from './components/ExpertResultCard';

interface SearchDetailPageProps {
  params: Promise<{ searchId: string }>;
}

export default function SearchDetailPage({ params }: SearchDetailPageProps) {
  const { searchId } = use(params);
  const [{ searchDetail, isLoading, error }, refetch] = useExpertSearchDetail(searchId);

  if (isLoading) {
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

  const isInProgress = searchDetail.status === 'pending' || searchDetail.status === 'processing';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Library', href: '/expert-finder/library' },
          { label: `Search #${searchDetail.searchId}` },
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

          {searchDetail.expertResults.length > 0 ? (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Expert results ({searchDetail.expertResults.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {searchDetail.expertResults.map((expert, index) => (
                  <ExpertResultCard key={`expert-${index}`} expert={expert} />
                ))}
              </div>
            </section>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
              No experts found for this search.
            </div>
          )}
        </>
      )}

      {isInProgress && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-gray-500">
            Re-check status when the search has had time to complete.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => refetch()}
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
