'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronRight } from 'lucide-react';
import { Icon } from '@/components/ui/icons';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { cn } from '@/utils/styles';

/** Shared icon color so both menu icons match exactly (matches PublishMenu). */
const ICON_COLOR = '#374151';

const ITEM_CLASS =
  'group/item cursor-pointer gap-2.5 rounded-lg px-3 py-2.5 text-gray-900 transition-colors duration-150 hover:bg-gray-100 focus:bg-gray-100';

const ARROW_CLASS =
  'ml-auto flex-shrink-0 text-gray-900 opacity-0 transition-opacity duration-200 group-hover/item:opacity-100';

interface FundingLinksMenuProps {
  /** The element that toggles the menu open (rendered as the dropdown trigger). */
  trigger: ReactNode;
  /**
   * When true, the dropdown stretches to match the trigger's width (used for
   * the full-width hero widget so it lines up with the CTA below).
   */
  matchTriggerWidth?: boolean;
}

/**
 * Disclosure menu for the funding hero/snapshot. Keeps the secondary
 * destinations (My ResearchCoin and the funder dashboard) tucked behind a click
 * so the surrounding card stays focused on the figures, then reveals them on
 * demand.
 */
export const FundingLinksMenu: FC<FundingLinksMenuProps> = ({
  trigger,
  matchTriggerWidth = false,
}) => (
  <BaseMenu
    align="end"
    trigger={trigger}
    className={cn(!matchTriggerWidth && 'min-w-[11rem]')}
    sameWidth={matchTriggerWidth}
    animate
  >
    <BaseMenuItem asChild className={ITEM_CLASS}>
      <Link href="/researchcoin">
        <Icon name="rscThin" size={20} color={ICON_COLOR} />
        My ResearchCoin
        <ChevronRight size={16} className={ARROW_CLASS} />
      </Link>
    </BaseMenuItem>
    <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-gray-100" />
    <BaseMenuItem asChild className={ITEM_CLASS}>
      <Link href="/fund/dashboard">
        <Icon name="fund" size={20} color={ICON_COLOR} />
        Funder dashboard
        <ChevronRight size={16} className={ARROW_CLASS} />
      </Link>
    </BaseMenuItem>
  </BaseMenu>
);
