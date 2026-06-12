'use client';

import { usePathname } from 'next/navigation';
import { PendingModerationTabs } from '@/components/Moderators/PendingModerationTabs';
import { PendingCountsProvider } from '@/components/Moderators/PendingCountsContext';
import { DEFAULT_PENDING_MODULE, slugToModule } from '@/services/content-moderation.service';

export default function PendingWorksLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const slug = pathname.split('/').pop() ?? '';
  const activeModule = slugToModule(slug) ?? DEFAULT_PENDING_MODULE;

  return (
    <PendingCountsProvider>
      <div className="h-full flex flex-col p-4">
        <div className="bg-white">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Pending</h1>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve or decline pending submissions
            </p>
          </div>

          <div className="mb-4">
            <PendingModerationTabs activeModule={activeModule} />
          </div>
        </div>

        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </PendingCountsProvider>
  );
}
