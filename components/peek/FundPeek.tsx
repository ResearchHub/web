import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { CommentService } from '@/services/comment.service';
import { FundDocument } from '@/components/work/FundDocument';
import { SidePeek } from '@/components/ui/SidePeek';

async function getFundingProject(id: string) {
  const idPattern = /^\d+$/;
  if (idPattern.exec(id) === null) {
    notFound();
  }
  try {
    const work = await PostService.get(id);
    return work;
  } catch (e) {
    // Allow Next to manage 404s uniformly
    notFound();
  }
}

export async function FundPeek({ id, closeHref }: Readonly<{ id: string; closeHref?: string }>) {
  const work = await getFundingProject(id);

  const [metadata, content, authorUpdates] = await Promise.all([
    MetadataService.get(work.unifiedDocumentId?.toString() || ''),
    work.contentUrl ? PostService.getContent(work.contentUrl) : Promise.resolve(undefined),
    CommentService.fetchAuthorUpdates({ documentId: work.id, contentType: work.contentType }),
  ]);

  return (
    <SidePeek title={work.title} fullHref={`/fund/${work.id}/${work.slug}`} closeHref={closeHref}>
      <Suspense>
        <FundDocument
          work={work}
          metadata={metadata}
          content={content}
          defaultTab="paper"
          authorUpdates={authorUpdates}
        />
      </Suspense>
    </SidePeek>
  );
}
