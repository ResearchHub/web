'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { CreateGrantButton } from '@/components/Grant/CreateGrantButton';

export default function CreateGrantPage() {
  return (
    <PageLayout rightSidebar={false}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <CreateGrantButton />
      </div>
    </PageLayout>
  );
}
