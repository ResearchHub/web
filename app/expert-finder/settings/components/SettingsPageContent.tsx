'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export function SettingsPageContent() {
  const [error] = useState<string | null>(null);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: 'Settings' }]} className="mb-2" />
        <p className="text-sm text-gray-600">
          Manage your Expert Finder account and Gmail connection for outreach.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
    </div>
  );
}
