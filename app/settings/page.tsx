'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { SecuritySection } from './components/SecuritySection';

export default function SettingsPage() {
  return (
    <PageLayout rightSidebar={false}>
      <div className="max-w-3xl mx-auto">
        <SecuritySection />
      </div>
    </PageLayout>
  );
}
