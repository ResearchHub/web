import { Suspense } from 'react';
import { FundingGrantPageServer } from './FundingGrantPageServer';

interface FundingGrantPageProps {
  params: Promise<{
    grantId: string;
  }>;
}

export default async function FundingGrantPage({ params }: FundingGrantPageProps) {
  const { grantId } = await params;

  return (
    <Suspense
      fallback={
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-xl mb-8" />
          <div className="h-8 bg-gray-200 rounded w-32 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      }
    >
      <FundingGrantPageServer grantId={grantId} />
    </Suspense>
  );
}
