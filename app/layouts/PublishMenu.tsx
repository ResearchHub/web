'use client';

import { Plus } from 'lucide-react';
import { BaseMenu } from '@/components/ui/form/BaseMenu';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import {
  FundingDraftMenuItems,
  type FundingDraftOption,
} from '@/components/Funding/fundingDraftOptions';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';

interface PublishMenuProps {
  forceMinimize?: boolean;
  /** Runs once an item is picked, for a host that should then get out of the way. */
  onItemSelected?: () => void;
}

/**
 * The sidebar's Draft button: a Request for Proposal or a Proposal, either
 * of which leads straight to a new draft in the workspace for that side of
 * the money. A popover at every width, phones included, since on one it opens
 * inside the menu panel.
 */
export const PublishMenu: React.FC<PublishMenuProps> = ({
  forceMinimize = false,
  onItemSelected,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { startNew } = useFundingDrafting();

  const handleMenuItemClick = (item: FundingDraftOption) => {
    executeAuthenticatedAction(() => startNew(item.intent));
    onItemSelected?.();
  };

  // Regular trigger for standard mode
  const standardTrigger = (
    <button
      className={`flex items-center px-5 py-3.5 gap-2.5 text-[15px] font-medium rounded-lg bg-gray-100 hover:bg-gray-50 text-gray-800 shadow-[rgba(0,_0,_0,_0.15)_1.95px_1.95px_2.6px] ${forceMinimize ? '!hidden' : ''}`}
    >
      <Plus className="h-[22px] w-[22px] stroke-[1.5]" />
      <span>Draft</span>
    </button>
  );

  // Compact trigger for a sidebar forced into the icon rail
  const compactTrigger = (
    <button
      className={`${forceMinimize ? 'flex' : 'hidden'} items-center justify-center p-3 rounded-lg bg-gray-100 hover:bg-gray-50 text-gray-800 shadow-[rgba(0,_0,_0,_0.15)_1.95px_1.95px_2.6px] mx-auto`}
    >
      <Plus className="h-[22px] w-[22px] stroke-[1.5]" />
    </button>
  );

  const menuContent = <FundingDraftMenuItems onSelect={handleMenuItemClick} />;

  return (
    <div className={`relative ${forceMinimize ? 'flex justify-center' : ''}`}>
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
    </div>
  );
};
