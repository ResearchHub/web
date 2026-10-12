'use client';

import { FC, ReactNode, useState } from 'react';
import { EyeOff, Flag, MoreHorizontal } from 'lucide-react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useUser } from '@/contexts/UserContext';
import { useFlagModal } from '@/hooks/useFlagging';
import { useHideFromFeed } from '@/hooks/useHideFromFeed';
import { useIsMobile } from '@/hooks/useIsMobile';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { ConfirmationModal } from '@/components/ui/form/ConfirmationModal';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import type { ActivityWork } from '../lib/activityWork.utils';
import type { FeedEntry } from '@/types/feed';
import type { ContentType } from '@/types/work';

interface ActivityCardMenuProps {
  work: ActivityWork;
  /** Feed entries the card stands for, which moderators can hide together. */
  hideableEntries: FeedEntry[];
}

interface MenuAction {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
}

/** Flags are filed against the work; papers have their own type, everything else is a post. */
function toFlagContentType(work: ActivityWork): ContentType {
  return work.documentType === 'paper' ? 'paper' : 'post';
}

/**
 * The card's ⋯ menu, in its top-right corner: a dropdown on larger screens and a
 * drawer from the bottom on phones, where a small floating menu is hard to hit.
 */
export const ActivityCardMenu: FC<ActivityCardMenuProps> = ({ work, hideableEntries }) => {
  const { user } = useUser();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { isOpen: isFlagOpen, contentToFlag, openFlagModal, closeFlagModal } = useFlagModal();
  const { hideFromFeed, isHiding } = useHideFromFeed();
  const isMobile = useIsMobile();

  // The drawer mounts on first use and stays, so later opens slide in and out.
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHideConfirmOpen, setIsHideConfirmOpen] = useState(false);

  const canHideFromFeed = !!user?.isModerator && hideableEntries.length > 0;

  const actions: MenuAction[] = [
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

  const triggerClass =
    'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800';

  const openDrawer = () => {
    setIsDrawerMounted(true);
    // One frame closed first, so the drawer slides in rather than appearing.
    requestAnimationFrame(() => setIsDrawerOpen(true));
  };

  return (
    <>
      {isMobile ? (
        <button
          type="button"
          onClick={openDrawer}
          className={triggerClass}
          aria-label="More options"
          data-testid="feed-item-more-options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      ) : (
        <BaseMenu
          align="end"
          trigger={
            <button
              type="button"
              className={triggerClass}
              aria-label="More options"
              data-testid="feed-item-more-options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          }
        >
          {actions.map((action) => (
            <BaseMenuItem
              key={action.key}
              onClick={action.onSelect}
              className="flex items-center gap-2"
            >
              {action.icon}
              <span>{action.label}</span>
            </BaseMenuItem>
          ))}
        </BaseMenu>
      )}

      {isDrawerMounted && (
        <SwipeableDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          height="auto"
          showCloseButton={false}
        >
          <div className="flex flex-col pb-[env(safe-area-inset-bottom)]">
            {actions.map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  action.onSelect();
                }}
                className="flex h-12 items-center gap-3 rounded-xl px-3 text-left text-[15px] font-medium text-gray-900 hover:bg-gray-50"
              >
                <span className="text-gray-500">{action.icon}</span>
                {action.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="mt-2 flex h-12 items-center justify-center rounded-xl bg-gray-100 text-[15px] font-semibold text-gray-900"
            >
              Cancel
            </button>
          </div>
        </SwipeableDrawer>
      )}

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
