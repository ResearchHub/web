'use client';

import { Plus } from 'lucide-react';
import { BaseMenu } from '@/components/ui/form/BaseMenu';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import {
  FUNDING_DRAFT_OPTIONS,
  FundingDraftMenuItems,
  FundingDraftOptionContent,
  type FundingDraftOption,
} from '@/components/Funding/fundingDraftOptions';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useState } from 'react';

interface PublishMenuProps {
  forceMinimize?: boolean;
  /** Runs once an item is picked, for a host that should then get out of the way. */
  onItemSelected?: () => void;
}

/**
 * The sidebar's Publish button: a Request for Proposal or a Proposal, either
 * of which leads straight to a new draft in the workspace for that side of
 * the money.
 */
export const PublishMenu: React.FC<PublishMenuProps> = ({
  forceMinimize = false,
  onItemSelected,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { startNew } = useFundingDrafting();
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

  const menuContent = <FundingDraftMenuItems onSelect={handleMenuItemClick} />;

  // Mobile drawer content
  const mobileDrawerContent = (
    <div className="space-y-2">
      {FUNDING_DRAFT_OPTIONS.map((item) => (
        <div
          key={item.id}
          onClick={() => handleMenuItemClick(item)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleMenuItemClick(item);
            }
          }}
          className="group w-full px-3 py-3 cursor-pointer rounded-xl transition-colors duration-150 hover:bg-gray-100 active:bg-gray-100"
          role="button"
          tabIndex={0}
          aria-label={`${item.title}: ${item.description}`}
        >
          <FundingDraftOptionContent option={item} />
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
            height="60vh"
            showCloseButton={false}
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
            withOverlay={false}
            animate
          >
            {menuContent}
          </BaseMenu>

          {/* Compact Menu - same content, different trigger */}
          <BaseMenu
            trigger={compactTrigger}
            align="start"
            sideOffset={8}
            className="w-[320px] p-1 rounded-xl"
            withOverlay={false}
            animate
          >
            {menuContent}
          </BaseMenu>
        </>
      )}
    </div>
  );
};
