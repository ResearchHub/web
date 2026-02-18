'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { CreateRFPButton } from '@/components/RFP/CreateRFPButton';

export default function CreateRFPPage() {
  return (
    <PageLayout rightSidebar={false}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <CreateRFPButton />
      </div>
    </PageLayout>
  );
}
