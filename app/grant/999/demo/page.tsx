import { PageLayout } from '@/app/layouts/PageLayout';
import { GrantRightSidebar } from '@/components/work/GrantRightSidebar';
import { GrantDocument } from '@/components/work/GrantDocument';
import { Suspense } from 'react';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { defaultMockGrant } from '@/store/grantStore';

export default function DemoGrantPage() {
  const { work: mockWork, metadata: mockMetadata } = defaultMockGrant;
  console.log({ mockWork, mockMetadata });

  return (
    <PageLayout rightSidebar={<GrantRightSidebar work={mockWork} metadata={mockMetadata} />}>
      <Suspense>
        <GrantDocument work={mockWork} metadata={mockMetadata} defaultTab="paper" />
        <SearchHistoryTracker work={mockWork} />
      </Suspense>
    </PageLayout>
  );
}
