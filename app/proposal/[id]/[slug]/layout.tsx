import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { CommentService } from '@/services/comment.service';
import { buildArticleMetadata } from '@/lib/metadata';
import { stripHtml } from '@/utils/stringUtils';
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;
  try {
    const work = await PostService.get(id);
    const description =
      work.abstract ||
      stripHtml(work.previewContent || '').substring(0, 155) ||
      'View this research proposal on ResearchHub.';
    return buildArticleMetadata({
      title: work.title,
      description,
      url: `/proposal/${id}/${slug}`,
      image: work.image,
      publishedTime: work.publishedDate || work.createdDate,
      modifiedTime: work.updatedDate,
      authors: work.authors.map((a) => a.authorProfile.fullName),
      section: work.topics[0]?.name,
      tags: work.topics.map((t) => t.name),
    });
  } catch {
    return {};
  }
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
