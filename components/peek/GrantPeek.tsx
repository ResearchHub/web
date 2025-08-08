import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { GrantDocument } from '@/components/work/GrantDocument';
import { SidePeek } from '@/components/ui/SidePeek';

async function getGrant(id: string) {
  const idPattern = /^\d+$/;
  if (idPattern.exec(id) === null) {
    notFound();
  }
  try {
    const work = await PostService.get(id);
    return work;
  } catch (e) {
    notFound();
  }
}

export async function GrantPeek({ id, closeHref }: Readonly<{ id: string; closeHref?: string }>) {
  const work = await getGrant(id);

  const [metadata, content] = await Promise.all([
    MetadataService.get(work.unifiedDocumentId?.toString() || ''),
    work.contentUrl ? PostService.getContent(work.contentUrl) : Promise.resolve(undefined),
  ]);

  return (
    <SidePeek title={work.title} fullHref={`/grant/${work.id}/${work.slug}`} closeHref={closeHref}>
      <Suspense>
        <GrantDocument work={work} metadata={metadata} content={content} defaultTab="paper" />
      </Suspense>
    </SidePeek>
  );
}
