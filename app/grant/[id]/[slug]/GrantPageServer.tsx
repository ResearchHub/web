import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { ActivityService } from '@/services/activity.service';
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

export async function GrantPageServer({ id, defaultTab }: GrantPageServerProps) {
  const work = await getGrant(id);
  const grantId = work.note?.post?.grant?.id;

  const [metadata, activity] = await Promise.all([
    MetadataService.get(work.unifiedDocumentId?.toString() || ''),
    grantId
      ? ActivityService.getActivity({ grantId, documentType: 'GRANT' })
      : Promise.resolve({ entries: [], hasMore: false }),
  ]);

  return (
    <PageLayout
      rightSidebar={
        <GrantRightSidebar work={work} metadata={metadata} activityEntries={activity.entries} />
      }
    >
      <Suspense>
        <GrantDocument work={work} metadata={metadata} defaultTab={defaultTab} />
        <SearchHistoryTracker work={work} />
        <WorkDocumentTracker work={work} metadata={metadata} tab={defaultTab} />
      </Suspense>
    </PageLayout>
  );
}
