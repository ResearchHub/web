'use client';

import { useParams } from 'next/navigation';
import { WorkHeaderSkeleton } from '@/components/work/WorkSkeleton';

export function PaperHeaderSkeleton() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : undefined;

  return <WorkHeaderSkeleton tabCount={4} titleSlug={slug} />;
}
