'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { useExpertSearchProgress } from '@/hooks/useExpertSearchProgress';

const SEARCH_DETAIL_PATH = '/expert-finder/library';

interface SearchSubmissionProgressProps {
  searchId: number;
}

export function SearchSubmissionProgress({ searchId }: SearchSubmissionProgressProps) {
  const router = useRouter();
  const { status, error, currentStep } = useExpertSearchProgress(searchId);

  useEffect(() => {
    if (status !== 'completed') return;
    router.push(`${SEARCH_DETAIL_PATH}/${searchId}`);
  }, [status, searchId, router]);

  if (status === 'failed') {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" aria-hidden />
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-semibold text-gray-900">Search failed</p>
            {error ? (
              <p className="text-sm text-red-700 whitespace-pre-wrap">{error}</p>
            ) : null}
            <Link
              href={`${SEARCH_DETAIL_PATH}/${searchId}`}
              className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'mt-2 inline-flex')}
            >
              Open search details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <Loader2 className="h-6 w-6 animate-spin text-primary-600 shrink-0" />
      <p className="text-sm text-gray-700">{currentStep || 'Finding experts…'}</p>
    </div>
  );
}
