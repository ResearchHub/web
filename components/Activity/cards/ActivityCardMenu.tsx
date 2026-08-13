'use client';

import { FC, useState } from 'react';
import { Flag, MoreHorizontal } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import type { ContentType } from '@/types/work';

interface ActivityCardMenuProps {
  documentId: number;
  contentType: ContentType;
}

export const ActivityCardMenu: FC<ActivityCardMenuProps> = ({ documentId, contentType }) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);

  return (
    <>
      <BaseMenu
        align="end"
        trigger={
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        }
      >
        <BaseMenuItem
          onSelect={() => executeAuthenticatedAction(() => setIsFlagModalOpen(true))}
          className="flex items-center gap-2"
        >
          <Flag className="h-4 w-4" />
          <span>Flag Content</span>
        </BaseMenuItem>
      </BaseMenu>

      <FlagContentModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        documentId={documentId.toString()}
        workType={contentType}
      />
    </>
  );
};
