'use client';

import { useState } from 'react';
import { PendingModerationTabs } from '@/components/Moderators/PendingModerationTabs';
import { PendingModerationList } from '@/components/Moderators/PendingModerationList';
import type { PendingModule } from '@/services/pending-moderation.service';

export default function PendingWorksPage() {
  const [activeModule, setActiveModule] = useState<PendingModule>('funding_opportunities');

  return (
    <div className="h-full flex flex-col p-4">
      <div className="bg-white">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Pending</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and approve or decline pending submissions
          </p>
        </div>

        <div className="mb-4">
          <PendingModerationTabs activeModule={activeModule} onModuleChange={setActiveModule} />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <PendingModerationList key={activeModule} module={activeModule} />
      </div>
    </div>
  );
}
