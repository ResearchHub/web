import { Suspense } from 'react';
import { FundPeek } from '@/components/peek/FundPeek';
import SidePeekSkeleton from '@/components/skeletons/SidePeekSkeleton';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export default async function PeekPreviouslyFundedProjectPage({ params }: Readonly<Props>) {
  const { id } = await params;
  return (
    <Suspense fallback={<SidePeekSkeleton title="Loading project" />}>
      <FundPeek id={id} />
    </Suspense>
  );
}
