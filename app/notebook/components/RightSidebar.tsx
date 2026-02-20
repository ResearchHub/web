'use client';

import { PublishingForm } from '@/app/notebook/components/PublishingForm';

interface RightSidebarProps {
  /** Pre-set article type (e.g. 'grant') when opened from a modal. */
  defaultArticleType?: string;
  /** When true, hides fields not relevant in modal context (Work Type, Application Deadline). */
  isModal?: boolean;
}

/**
 * Right sidebar for the notebook layout.
 *
 * Wraps the PublishingForm so NoteEditorLayout only deals with layout
 * concerns. If additional right-sidebar content is needed in the future
 * (e.g. tabs, preview), add it here.
 *
 * Used by:
 *   - `NoteEditorLayout` (desktop inline sidebar + mobile slide-out)
 */
export const RightSidebar = ({ defaultArticleType, isModal }: RightSidebarProps) => {
  return (
    <div className="h-full">
      <PublishingForm defaultArticleType={defaultArticleType} isModal={isModal} />
    </div>
  );
};
