'use client';

import { Plus, ScrollText } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import {
  FUNDING_DRAFT_OPTIONS,
  FundingDraftMenuItems,
  FundingDraftOptionContent,
  type FundingDraftOption,
} from '@/components/Funding/fundingDraftOptions';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { useChangelogDrafting } from '@/components/changelog/useChangelogDrafting';
import { useUser } from '@/contexts/UserContext';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useState } from 'react';

/** Moderators also publish product updates; the entry drafts in the workspace too. */
const CHANGELOG_OPTION = {
  id: 'changelog',
  title: 'ChangeLog',
  description: 'Publish a ResearchHub product update',
  icon: <ScrollText className="h-[18px] w-[18px] text-gray-700" />,
};

interface PublishMenuProps {
  forceMinimize?: boolean;
  /** Runs once an item is picked, for a host that should then get out of the way. */
  onItemSelected?: () => void;
}

/**
 * The sidebar's Publish button: a Request for Proposal or a Proposal, either
 * of which leads straight to a new draft in the workspace for that side of
 * the money, and for moderators a ChangeLog entry.
 */
export const PublishMenu: React.FC<PublishMenuProps> = ({
  forceMinimize = false,
  onItemSelected,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { startNew } = useFundingDrafting();
  const { startChangelog } = useChangelogDrafting();
  const { user } = useUser();
  const isModerator = !!user?.isModerator;
  const { smAndDown } = useScreenSize();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleMenuItemClick = (item: FundingDraftOption) => {
    executeAuthenticatedAction(() => startNew(item.intent));

    // Close mobile drawer after action
    if (smAndDown) {
      setIsMobileDrawerOpen(false);
    }
    onItemSelected?.();
  };

  const handleChangelogClick = () => {
    executeAuthenticatedAction(() => {
      void startChangelog();
    });
    if (smAndDown) {
      setIsMobileDrawerOpen(false);
    }
    onItemSelected?.();
  };

  // Regular trigger for standard mode
  const standardTrigger = (
    <button
      className={`flex items-center px-5 py-3.5 gap-2.5 text-[15px] font-medium rounded-lg bg-gray-100 hover:bg-gray-50 text-gray-800 shadow-[rgba(0,_0,_0,_0.15)_1.95px_1.95px_2.6px] ${forceMinimize ? '!hidden' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();

        if (smAndDown) {
          setIsMobileDrawerOpen(true);
        }
      }}
    >
      <Plus className="h-[22px] w-[22px] stroke-[1.5]" />
      <span>Publish</span>
    </button>
  );

  // Compact trigger for a sidebar forced into the icon rail
  const compactTrigger = (
    <button
      className={`${forceMinimize ? 'flex' : 'hidden'} items-center justify-center p-3 rounded-lg bg-gray-100 hover:bg-gray-50 text-gray-800 shadow-[rgba(0,_0,_0,_0.15)_1.95px_1.95px_2.6px] mx-auto`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();

        if (smAndDown) {
          setIsMobileDrawerOpen(true);
        }
      }}
    >
      <Plus className="h-[22px] w-[22px] stroke-[1.5]" />
    </button>
  );

  const menuContent = (
    <div className="space-y-1">
      <FundingDraftMenuItems onSelect={handleMenuItemClick} />
      {isModerator && (
        <BaseMenuItem
          onClick={handleChangelogClick}
          className="group w-full cursor-pointer rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-gray-100 focus:bg-gray-100"
        >
          <FundingDraftOptionContent option={CHANGELOG_OPTION} />
        </BaseMenuItem>
      )}
    </div>
  );

  // Mobile drawer content
  const mobileItems = [
    ...FUNDING_DRAFT_OPTIONS.map((item) => ({
      option: item,
      onPick: () => handleMenuItemClick(item),
    })),
    ...(isModerator ? [{ option: CHANGELOG_OPTION, onPick: handleChangelogClick }] : []),
  ];
  const mobileDrawerContent = (
    <div className="space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {mobileItems.map(({ option, onPick }) => (
        <div
          key={option.id}
          onClick={onPick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onPick();
            }
          }}
          className="group w-full px-3 py-3 cursor-pointer rounded-xl transition-colors duration-150 hover:bg-gray-100 active:bg-gray-100"
          role="button"
          tabIndex={0}
          aria-label={`${option.title}: ${option.description}`}
        >
          <FundingDraftOptionContent option={option} />
        </div>
      ))}
    </div>
  );

  return (
    <div className={`relative ${forceMinimize ? 'flex justify-center' : ''}`}>
      {/* Mobile view with SwipeableDrawer */}
      {smAndDown && (
        <>
          <div
            onClick={() => setIsMobileDrawerOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsMobileDrawerOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Open publish menu"
          >
            {standardTrigger}
            {compactTrigger}
          </div>
          <SwipeableDrawer
            isOpen={isMobileDrawerOpen}
            onClose={() => setIsMobileDrawerOpen(false)}
            height="auto"
            showCloseButton={false}
            header={
              <h2 className="text-lg font-semibold text-gray-900">
                What would you like to publish?
              </h2>
            }
          >
            {mobileDrawerContent}
          </SwipeableDrawer>
        </>
      )}

      {/* Desktop view with BaseMenu */}
      {!smAndDown && (
        <>
          {/* Standard Menu */}
          <BaseMenu
            trigger={standardTrigger}
            align="start"
            sideOffset={8}
            className="w-[320px] p-1 rounded-xl"
          >
            {menuContent}
          </BaseMenu>

          {/* Compact Menu - same content, different trigger */}
          <BaseMenu
            trigger={compactTrigger}
            align="start"
            sideOffset={8}
            className="w-[320px] p-1 rounded-xl"
          >
            {menuContent}
          </BaseMenu>
        </>
      )}
    </div>
  );
};
