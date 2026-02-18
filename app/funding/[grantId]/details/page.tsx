import { Suspense } from 'react';
import { FundingGrantPageServer } from '../FundingGrantPageServer';

interface FundingGrantDetailsPageProps {
  params: Promise<{
    grantId: string;
  }>;
}

export default async function FundingGrantDetailsPage({ params }: FundingGrantDetailsPageProps) {
  const { grantId } = await params;

  return (
    <Suspense
      fallback={
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-xl mb-8" />
          <div className="h-8 bg-gray-200 rounded w-32 mb-4" />
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      }
    >
      <FundingGrantPageServer grantId={grantId} initialTab="details" />
    </Suspense>
  );
}
