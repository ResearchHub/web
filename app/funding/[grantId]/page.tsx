import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { GrantService } from '@/services/grant.service';
import { FundingGrantPageClient } from './FundingGrantPageClient';

interface FundingGrantPageProps {
  params: Promise<{
    grantId: string;
  }>;
}

// Generate static params for common grants (optional optimization)
export async function generateStaticParams() {
  // Fetch grants to pre-render
  try {
    const result = await GrantService.getGrants({
      page: 1,
      pageSize: 10,
      status: 'OPEN',
    });

    return result.grants.map((grant) => {
      const content = grant.content as any;
      return {
        grantId: content.grant?.id?.toString() || content.id?.toString(),
      };
    });
  } catch {
    return [];
  }
}

async function getGrantData(grantId: string) {
  try {
    const grant = await GrantService.getGrantById(grantId);
    return grant;
  } catch (error) {
    console.error('Error fetching grant:', error);
    return null;
  }
}

export default async function FundingGrantPage({ params }: FundingGrantPageProps) {
  const { grantId } = await params;
  const grant = await getGrantData(grantId);

  if (!grant) {
    notFound();
  }

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
      <FundingGrantPageClient initialGrant={grant} grantId={Number(grantId)} />
    </Suspense>
  );
}
