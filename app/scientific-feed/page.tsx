'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { ScientificFeed } from '@/components/ScientificFeed/ScientificFeed';

export default function ScientificFeedPage() {
  return (
    <PageLayout>
      <div className="py-6">
        <ScientificFeed />
      </div>
    </PageLayout>
  );
}

