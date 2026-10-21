'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BaseMenu } from '@/components/ui/form/BaseMenu';
import { cn } from '@/utils/styles';
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
 * The sidebar's Draft button, in the primary blue: a Request for Proposal or a
 * Proposal, either of which leads straight to a new draft in the workspace for
 * that side of the money. A popover at every width, phones included, since on
 * one it opens inside the menu panel.
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
    <Button
      aria-label="New draft"
      className={cn('h-10 gap-2 px-4 text-[15px] shadow-sm', forceMinimize && '!hidden')}
    >
      <Plus className="h-5 w-5" aria-hidden="true" />
      <span>Draft</span>
    </Button>
  );

  // Compact trigger for a sidebar forced into the icon rail
  const compactTrigger = (
    <Button
      size="icon"
      aria-label="New draft"
      className={cn(forceMinimize ? 'flex' : 'hidden', 'mx-auto shadow-sm')}
    >
      <Plus className="h-5 w-5" aria-hidden="true" />
    </Button>
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
