import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { CommentService } from '@/services/comment.service';
import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkHeaderProposal, WorkTabProvider } from '@/components/work/WorkHeader/index';
import { ProposalSidebar } from '@/components/work/ProposalSidebar';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
  children: React.ReactNode;
}

export default async function ProposalSlugLayout({ params, children }: Props) {
  const { id } = await params;

  if (!id.match(/^\d+$/)) {
    notFound();
  }

  let work;
  try {
    work = await PostService.get(id);
  } catch {
    notFound();
  }

  const [metadata, authorUpdates] = await Promise.all([
    MetadataService.get(work.unifiedDocumentId?.toString() || ''),
    CommentService.fetchAuthorUpdates({
      documentId: work.id,
      contentType: work.contentType,
    }),
  ]);

  return (
    <WorkTabProvider>
      <PageLayout
        topBanner={
          <WorkHeaderProposal work={work} metadata={metadata} updatesCount={authorUpdates.length} />
        }
        rightSidebar={<ProposalSidebar work={work} metadata={metadata} />}
      >
        <Suspense>{children}</Suspense>
      </PageLayout>
    </WorkTabProvider>
  );
}
