'use client';

import { FC, ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';

export interface OverflowMenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
}

/** The round ⋯ button, for a row's top-right corner. */
const OVERFLOW_MENU_TRIGGER_CLASS =
  'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800';

interface OverflowMenuProps {
  items: OverflowMenuItem[];
  align?: 'start' | 'end';
}

/**
 * A row's ⋯ menu: a round button that opens its actions in a popover anchored to it,
 * at every screen width. The test id is the one the smoke specs and the old comment
 * cards use for the same control.
 */
export const OverflowMenu: FC<OverflowMenuProps> = ({ items, align = 'end' }) => (
  <BaseMenu
    align={align}
    trigger={
      <button
        type="button"
        className={OVERFLOW_MENU_TRIGGER_CLASS}
        aria-label="More options"
        data-testid="feed-item-more-options"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
    }
  >
    {items.map((item) => (
      <BaseMenuItem key={item.key} onClick={item.onSelect} className="flex items-center gap-2">
        {item.icon}
        <span>{item.label}</span>
      </BaseMenuItem>
    ))}
  </BaseMenu>
);
