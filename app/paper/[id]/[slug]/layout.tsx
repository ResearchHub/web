import { Suspense } from 'react';
import { MetadataService } from '@/services/metadata.service';
import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkHeader, WorkTabProvider } from '@/components/work/WorkHeader/index';
import { WorkRightSidebar } from '@/components/work/WorkRightSidebar';
import { getPaper } from '@/app/paper/getPaper';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
  children: React.ReactNode;
}

export default async function PaperSlugLayout({ params, children }: Props) {
  const { id } = await params;
  const work = await getPaper(id);
  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');

  return (
    <WorkTabProvider>
      <PageLayout
        topBanner={<WorkHeader work={work} metadata={metadata} />}
        rightSidebar={<WorkRightSidebar work={work} metadata={metadata} />}
      >
        <Suspense>{children}</Suspense>
      </PageLayout>
    </WorkTabProvider>
  );
}
