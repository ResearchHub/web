'use client';

import { PublishingForm } from '@/app/notebook/components/PublishingForm';

interface RightSidebarProps {
  /** Pre-set article type (e.g. 'grant') when opened from a modal. */
  defaultArticleType?: string;
  /** When true, hides fields not relevant in modal context (Work Type, Application Deadline). */
  isModal?: boolean;
}

/**
 * Right sidebar component for the notebook layout.
 * Displays the publishing form for creating / editing a note.
 */
export const RightSidebar = ({ defaultArticleType, isModal }: RightSidebarProps) => {
  return (
    <div className="h-full">
      <PublishingForm
        bountyAmount={null}
        onBountyClick={() => {}}
        defaultArticleType={defaultArticleType}
        isModal={isModal}
      />
    </div>
  );
};
