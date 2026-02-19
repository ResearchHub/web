import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { Work } from '@/types/work';
import { PageLayout } from '@/app/layouts/PageLayout';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { GrantDocument } from '@/components/work/GrantDocument';
import { GrantRightSidebar } from '@/components/work/GrantRightSidebar';
import { TabType } from '@/components/work/WorkTabs';

interface GrantPageServerProps {
  id: string;
  defaultTab: TabType;
}

export async function getGrant(id: string): Promise<Work> {
  if (!id.match(/^\d+$/)) {
    notFound();
  }

  try {
    return await PostService.get(id);
  } catch {
    notFound();
  }
}

export function getWorkHTMLContent(work: Work): Promise<string | undefined> {
  if (!work.contentUrl) return Promise.resolve(undefined);

  return PostService.getContent(work.contentUrl).catch((error) => {
    console.error('Failed to fetch content:', error);
    return undefined;
  });
}

export async function GrantPageServer({ id, defaultTab }: GrantPageServerProps) {
  const work = await getGrant(id);
  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');
  const contentPromise = getWorkHTMLContent(work);

  return (
    <PageLayout rightSidebar={<GrantRightSidebar work={work} metadata={metadata} />}>
      <Suspense>
        <GrantDocument
          work={work}
          metadata={metadata}
          contentPromise={contentPromise}
          defaultTab={defaultTab}
        />
        <SearchHistoryTracker work={work} />
        <WorkDocumentTracker work={work} metadata={metadata} tab={defaultTab} />
      </Suspense>
    </PageLayout>
  );
}
