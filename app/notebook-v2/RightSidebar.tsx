'use client';

import { PublishingForm } from '@/components/Editor/components/Sidebar/PublishingForm';

export const RightSidebar = () => {
  return (
    <div className="h-full overflow-y-auto">
      <PublishingForm bountyAmount={null} onBountyClick={() => {}} />
    </div>
  );
};
