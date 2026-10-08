'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Copy, Check, AlertCircle, AlertTriangle } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button, buttonVariants } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { cn } from '@/utils/styles';
import { useExpertSearchProgress } from '@/hooks/useExpertSearchProgress';
import { useFindMoreExperts } from '@/hooks/useExpertFinder';
import { ExpertFinderService, clampExpertCount } from '@/services/expertFinder.service';
import { ApiError } from '@/services/types/api';
import { getSearchEngine, isContentFilteredError } from '@/app/expert-finder/lib/searchEngine';
import type { ExpertSearchResult } from '@/types/expertFinder';
import toast from 'react-hot-toast';

const SEARCH_DETAIL_PATH = '/expert-finder/library';

interface SearchSubmissionProgressProps {
  searchId: number;
}

function getDetailPageUrl(searchId: number): string {
  if (typeof globalThis.window === 'undefined') return '';
  return `${globalThis.window.location.origin}${SEARCH_DETAIL_PATH}/${searchId}`;
}

export function SearchSubmissionProgress({ searchId }: SearchSubmissionProgressProps) {
  const router = useRouter();
  const { status, error, currentStep } = useExpertSearchProgress(searchId);
  const [{ isLoading: isRetrying }, findMore] = useFindMoreExperts();
  const [isCopied, setIsCopied] = useState(false);
  const [failedDetail, setFailedDetail] = useState<ExpertSearchResult | null>(null);
  const detailUrl = getDetailPageUrl(searchId);

  const inProgress =
    status !== 'completed' && status !== 'failed' && status !== null && status !== undefined;

  useEffect(() => {
    if (status !== 'completed') return;
    router.push(`${SEARCH_DETAIL_PATH}/${searchId}`);
  }, [status, searchId, router]);

  useEffect(() => {
    if (status !== 'failed') {
      setFailedDetail(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const d = await ExpertFinderService.getSearch(searchId);
        if (!cancelled) {
          setFailedDetail(d);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, searchId]);

  const handleCopy = () => {
    if (!detailUrl) return;
    navigator.clipboard.writeText(detailUrl).then(
      () => {
        setIsCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setIsCopied(false), 2000);
      },
      () => toast.error('Failed to copy link')
    );
  };

  const failureMessage = error?.trim() || failedDetail?.errorMessage?.trim() || null;
  const searchEngine = getSearchEngine(failedDetail?.config);
  const showContentFilterRetry =
    status === 'failed' &&
    searchEngine === 'advanced' &&
    isContentFilteredError(failureMessage);

  const handleRetryWithBasicEngine = async () => {
    const expertCount = clampExpertCount(failedDetail?.config?.expert_count, 'basic');
    try {
      await findMore(searchId, { expert_count: expertCount, engine: 'basic' });
      router.push(`${SEARCH_DETAIL_PATH}/${searchId}`);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('Search is already running');
        router.push(`${SEARCH_DETAIL_PATH}/${searchId}`);
        return;
      }
      toast.error(err instanceof Error ? err.message : 'Failed to retry with Basic engine');
    }
  };

  let statusHeading: string;
  if (status === 'failed' && showContentFilterRetry) {
    statusHeading = 'Almost there';
  } else if (status === 'failed') {
    statusHeading = 'Search failed';
  } else if (status === 'completed') {
    statusHeading = 'Search completed';
  } else {
    statusHeading = 'Search in progress';
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{statusHeading}</h3>

      {status === 'failed' && showContentFilterRetry ? (
        <div className="mb-4 space-y-3">
          <Alert variant="warning" icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}>
            <div className="space-y-1">
              <p className="font-semibold">Advanced search was blocked</p>
              <p className="font-normal">
                A content filter stopped the Advanced engine. You can still find experts with the
                Basic engine.
              </p>
            </div>
          </Alert>
          <div className="flex flex-wrap items-center gap-2">
            <LoadingButton
              type="button"
              variant="default"
              size="sm"
              isLoading={isRetrying}
              onClick={() => void handleRetryWithBasicEngine()}
            >
              Continue with Basic engine
            </LoadingButton>
            <Link
              href={`${SEARCH_DETAIL_PATH}/${searchId}`}
              className={cn(buttonVariants({ variant: 'outlined', size: 'sm' }), 'inline-flex')}
            >
              Open search details
            </Link>
          </div>
        </div>
      ) : status === 'failed' ? (
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" aria-hidden />
          <div className="min-w-0 space-y-2">
            <p className="text-sm text-gray-700">
              The search did not finish successfully. Details may include model output validation
              (for example strict table format) rather than only a network or timeout error.
            </p>
            {failureMessage ? (
              <p className="text-sm text-red-700 font-medium whitespace-pre-wrap">
                {failureMessage}
              </p>
            ) : null}
            {currentStep ? (
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">Last step:</span> {currentStep}
              </p>
            ) : null}
            <Link
              href={`${SEARCH_DETAIL_PATH}/${searchId}`}
              className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'mt-2 inline-flex')}
            >
              Open search details
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-gray-600">Finding experts… This can take a bit of time.</p>
              {inProgress && currentStep ? (
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">Progress:</span> {currentStep}
                </p>
              ) : null}
            </div>
          </div>
          {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
        </>
      )}

      <p className="text-sm text-gray-500 mb-4">
        Feel free to close this window and check results later by visiting the search details page.
      </p>

      <div className="flex items-stretch gap-2">
        <input
          type="text"
          readOnly
          value={detailUrl}
          className="flex-1 min-w-0 h-10 px-3 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Search details link"
        />
        <Button
          type="button"
          variant="outlined"
          size="sm"
          onClick={handleCopy}
          className="h-10 shrink-0 px-3"
          aria-label="Copy link"
        >
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
