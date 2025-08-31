'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { NotePaperSkeleton } from './components/NotePaperSkeleton';

export default function NotebookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { selectedOrg, isLoading: isLoadingOrg, error: orgError } = useOrganizationContext();

  useEffect(() => {
    if (!selectedOrg) return;

    const currentParams = new URLSearchParams(searchParams.toString());
    const queryString = currentParams.toString() ? `?${currentParams.toString()}` : '';

    return router.push(`/notebook/${selectedOrg.slug}${queryString}`);
  }, [selectedOrg, router, searchParams]);

  // Loading state
  if (isLoadingOrg) {
    return <NotePaperSkeleton />;
  }

  // Error state
  if (orgError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{orgError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // This should never render as we redirect in the useEffect
  return <NotePaperSkeleton />;
}
