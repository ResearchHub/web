'use client';

import { PublishingForm } from '@/components/Editor/components/Sidebar/PublishingForm';

/**
 * Right sidebar component for the notebook layout
 * Displays the publishing form for creating a new note
 */
export const RightSidebar = () => {
  return (
    <div className="h-full overflow-y-auto">
      <PublishingForm bountyAmount={null} onBountyClick={() => {}} />
    </div>
  );
};
