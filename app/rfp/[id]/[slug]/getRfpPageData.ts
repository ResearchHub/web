import { cache } from 'react';
import { notFound } from 'next/navigation';
import { MetadataService } from '@/services/metadata.service';
import { PostService } from '@/services/post.service';

export const getRfpPageData = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const work = await PostService.get(id).catch(() => notFound());
  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');
  return { work, metadata };
});
