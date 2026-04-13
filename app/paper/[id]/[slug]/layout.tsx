import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PaperService } from '@/services/paper.service';
import { MetadataService } from '@/services/metadata.service';
import { buildArticleMetadata } from '@/lib/metadata';
import { stripHtml } from '@/utils/stringUtils';
import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkHeader, WorkTabProvider } from '@/components/work/WorkHeader/index';
import { WorkRightSidebar } from '@/components/work/WorkRightSidebar';

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
    const work = await PaperService.get(id);
    const previewText = stripHtml(work.previewContent || '').substring(0, 155);
    const description =
      (work.abstract && work.abstract.length >= 80 ? work.abstract : previewText) ||
      'Read this research paper on ResearchHub.';
    return buildArticleMetadata({
      title: work.title,
      description,
      url: `/paper/${id}/${slug}`,
      image: work.image || work.figures?.[0]?.url,
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

export default async function PaperSlugLayout({ params, children }: Props) {
  const { id } = await params;

  if (!id.match(/^\d+$/)) {
    notFound();
  }

  let work;
  try {
    work = await PaperService.get(id);
  } catch {
    notFound();
  }
  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');

  return (
    <WorkTabProvider>
      <PageLayout
        topBanner={<WorkHeader work={work} metadata={metadata} contentType="paper" />}
        rightSidebar={<WorkRightSidebar work={work} metadata={metadata} />}
      >
        <Suspense>{children}</Suspense>
      </PageLayout>
    </WorkTabProvider>
  );
}
