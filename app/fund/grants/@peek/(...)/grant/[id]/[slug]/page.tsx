import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { GrantDocument } from '@/components/work/GrantDocument';
import { SidePeek } from '@/components/ui/SidePeek';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

async function getGrant(id: string) {
  const idPattern = /^\d+$/;
  if (idPattern.exec(id) === null) {
    notFound();
  }
  try {
    const work = await PostService.get(id);
    return work;
  } catch (e) {
    // Allow Next to handle 404 routing consistently
    notFound();
  }
}

export default async function PeekGrantPage({ params }: Readonly<Props>) {
  const { id } = await params;
  const work = await getGrant(id);

  const [metadata, content] = await Promise.all([
    MetadataService.get(work.unifiedDocumentId?.toString() || ''),
    work.contentUrl ? PostService.getContent(work.contentUrl) : Promise.resolve(undefined),
  ]);

  return (
    <SidePeek title={work.title}>
      <Suspense>
        <GrantDocument work={work} metadata={metadata} content={content} defaultTab="paper" />
      </Suspense>
    </SidePeek>
  );
}
