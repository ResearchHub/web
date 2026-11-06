'use client';

import { FC, useState } from 'react';
import { EyeOff, Flag } from 'lucide-react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useUser } from '@/contexts/UserContext';
import { useFlagModal } from '@/hooks/useFlagging';
import { useHideFromFeed } from '@/hooks/useHideFromFeed';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { ConfirmationModal } from '@/components/ui/form/ConfirmationModal';
import { OverflowMenu, type OverflowMenuItem } from '@/components/ui/OverflowMenu';
import type { ActivityWork } from '../lib/activityWork.utils';
import type { FeedEntry } from '@/types/feed';
import type { ContentType } from '@/types/work';

interface ActivityCardMenuProps {
  work: ActivityWork;
  /** Feed entries the card stands for, which moderators can hide together. */
  hideableEntries: FeedEntry[];
}

/** Flags are filed against the work; papers have their own type, everything else is a post. */
function toFlagContentType(work: ActivityWork): ContentType {
  return work.documentType === 'paper' ? 'paper' : 'post';
}

/**
 * The card's ⋯ menu, in its top-right corner: a popover anchored to the button at
 * every screen width, as on the comment rows.
 */
export const ActivityCardMenu: FC<ActivityCardMenuProps> = ({ work, hideableEntries }) => {
  const { user } = useUser();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { isOpen: isFlagOpen, contentToFlag, openFlagModal, closeFlagModal } = useFlagModal();
  const { hideFromFeed, isHiding } = useHideFromFeed();
  const [isHideConfirmOpen, setIsHideConfirmOpen] = useState(false);

  const canHideFromFeed = !!user?.isModerator && hideableEntries.length > 0;

  const actions: OverflowMenuItem[] = [
    ...(canHideFromFeed
      ? [
          {
            key: 'hide',
            label: 'Hide from feed',
            icon: <EyeOff className="h-4 w-4" />,
            onSelect: () => setIsHideConfirmOpen(true),
          },
        ]
      : []),
    {
      key: 'flag',
      label: 'Flag content',
      icon: <Flag className="h-4 w-4" />,
      onSelect: () =>
        executeAuthenticatedAction(() => openFlagModal(String(work.id), toFlagContentType(work))),
    },
  ];

  return (
    <>
      <OverflowMenu items={actions} />

      {isFlagOpen && contentToFlag && (
        <FlagContentModal
          isOpen={isFlagOpen}
          onClose={closeFlagModal}
          documentId={contentToFlag.documentId}
          workType={contentToFlag.contentType}
          commentId={contentToFlag.commentId}
        />
      )}

      {canHideFromFeed && (
        <ConfirmationModal
          isOpen={isHideConfirmOpen}
          onClose={() => setIsHideConfirmOpen(false)}
          title="Hide from feed"
          description={
            hideableEntries.length > 1
              ? 'All feed entries will be hidden from activity feed.'
              : 'This feed entry will be hidden from activity feed.'
          }
          confirmLabel="Hide from feed"
          confirmVariant="destructive"
          isConfirming={isHiding}
          onConfirm={async () => {
            const success = await hideFromFeed(hideableEntries.map((entry) => entry.id));
            if (success) setIsHideConfirmOpen(false);
          }}
        />
      )}
    </>
  );
};
