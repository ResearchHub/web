import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
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

export default async function PostSlugLayout({ params, children }: Props) {
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

  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');

  return (
    <WorkTabProvider>
      <PageLayout
        topBanner={<WorkHeader work={work} metadata={metadata} contentType="post" />}
        rightSidebar={<WorkRightSidebar work={work} metadata={metadata} />}
      >
        <Suspense>{children}</Suspense>
      </PageLayout>
    </WorkTabProvider>
  );
}
