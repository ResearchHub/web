'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { ConnectedAppsSection } from './components/ConnectedAppsSection';
import { SecuritySection } from './components/SecuritySection';

export default function SettingsPage() {
  return (
    <PageLayout rightSidebar={false}>
      <div className="max-w-3xl mx-auto space-y-6">
        <SecuritySection />
        <ConnectedAppsSection />
      </div>
    </PageLayout>
  );
}
