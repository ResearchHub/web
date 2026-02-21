'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useExpertSearchProgress } from '@/hooks/useExpertSearchProgress';
import toast from 'react-hot-toast';

const SEARCH_DETAIL_PATH = '/expert-finder/searches';

interface SearchSubmissionProgressProps {
  searchId: number;
}

function getDetailPageUrl(searchId: number): string {
  if (typeof globalThis.window === 'undefined') return '';
  return `${globalThis.window.location.origin}${SEARCH_DETAIL_PATH}/${searchId}`;
}

export function SearchSubmissionProgress({ searchId }: SearchSubmissionProgressProps) {
  const router = useRouter();
  const { status, error } = useExpertSearchProgress(searchId);
  const [isCopied, setIsCopied] = useState(false);
  const detailUrl = getDetailPageUrl(searchId);

  const isDone = status === 'completed' || status === 'failed';

  useEffect(() => {
    if (!isDone) return;
    router.push(`${SEARCH_DETAIL_PATH}/${searchId}`);
  }, [isDone, searchId, router]);

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

  let statusHeading: string;
  if (!isDone) {
    statusHeading = 'Search in progress';
  } else if (status === 'completed') {
    statusHeading = 'Search completed';
  } else {
    statusHeading = 'Search finished';
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{statusHeading}</h3>

      {!isDone && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600 shrink-0" />
            <p className="text-sm text-gray-600">
              Finding experts… This usually takes up to 10 seconds.
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            You can close this window and check progress on the search details page.
          </p>
        </>
      )}

      {isDone && (
        <p className="text-sm text-gray-600 mb-4">Redirecting you to the search details…</p>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

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
          {isCopied ? ' Copied' : ' Copy'}
        </Button>
      </div>
    </div>
  );
}
