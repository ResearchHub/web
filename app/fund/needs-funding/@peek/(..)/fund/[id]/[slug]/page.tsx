import { Suspense } from 'react';
import { FundPeek } from '@/components/peek/FundPeek';
import SidePeekSkeleton from '@/components/skeletons/SidePeekSkeleton';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export default async function PeekFundingProjectPage({ params }: Readonly<Props>) {
  const { id } = await params;
  return (
    <Suspense fallback={<SidePeekSkeleton title="Loading proposal" />}>
      <FundPeek id={id} />
    </Suspense>
  );
}
