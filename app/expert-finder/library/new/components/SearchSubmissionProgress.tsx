'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { ExpertSearchLiveStatus } from '@/app/expert-finder/components/ExpertSearchLiveStatus';
import { useExpertSearchProgress } from '@/hooks/useExpertSearchProgress';
import toast from 'react-hot-toast';

const SEARCH_DETAIL_PATH = '/expert-finder/library';

interface SearchSubmissionProgressProps {
  searchId: number;
  wsUrl?: string | null;
}

function getDetailPageUrl(searchId: number): string {
  if (typeof globalThis.window === 'undefined') return '';
  return `${globalThis.window.location.origin}${SEARCH_DETAIL_PATH}/${searchId}`;
}

export function SearchSubmissionProgress({
  searchId,
  wsUrl = null,
}: SearchSubmissionProgressProps) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const detailUrl = getDetailPageUrl(searchId);

  const handleTerminal = useCallback(
    (event: { kind: 'search_finished' | 'search_failed'; status: string }) => {
      if (event.kind === 'search_finished' && event.status !== 'failed') {
        router.push(`${SEARCH_DETAIL_PATH}/${searchId}`);
      }
    },
    [router, searchId]
  );

  const { status, error, currentStep, progress, expertsFound } = useExpertSearchProgress({
    searchId,
    wsUrl,
    onTerminal: handleTerminal,
  });

  useEffect(() => {
    if (status !== 'completed') return;
    router.push(`${SEARCH_DETAIL_PATH}/${searchId}`);
  }, [status, searchId, router]);

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

  const failureMessage = error?.trim() || null;

  let statusHeading: string;
  if (status === 'failed') {
    statusHeading = 'Search failed';
  } else if (status === 'completed') {
    statusHeading = 'Search completed';
  } else {
    statusHeading = 'Search in progress';
  }

  const showLiveStatus = status !== 'failed';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{statusHeading}</h3>

      {status === 'failed' ? (
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
      ) : showLiveStatus ? (
        <ExpertSearchLiveStatus
          className="mb-4"
          progress={progress}
          currentStep={currentStep}
          status={status}
          expertsFound={expertsFound}
        />
      ) : null}

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
