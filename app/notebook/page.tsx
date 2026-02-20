'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { NotePaperSkeleton } from '@/components/Notebook/NotePaperSkeleton';
import { Button } from '@/components/ui/Button';

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
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // This should never render as we redirect in the useEffect
  return <NotePaperSkeleton />;
}
