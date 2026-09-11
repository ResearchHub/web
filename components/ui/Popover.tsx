'use client';

import * as RadixPopover from '@radix-ui/react-popover';
import { cn } from '@/utils/styles';

/**
 * A non-modal panel anchored to a trigger, for controls that are not a list
 * of commands — settings, filters, toggles. Menus of actions or choices use
 * `BaseMenu` instead: a menu closes on selection and moves focus per item,
 * which is wrong for a panel of switches the user adjusts in place.
 *
 * Portaled above everything, including the AI Mode overlay, like `BaseMenu`.
 * Radix handles outside click, Escape, focus return, and keeping the panel
 * on screen.
 */
export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverAnchor = RadixPopover.Anchor;
export const PopoverClose = RadixPopover.Close;

export function PopoverContent({
  className,
  align = 'start',
  sideOffset = 6,
  collisionPadding = 8,
  children,
  ...props
}: RadixPopover.PopoverContentProps) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          'z-[100000] rounded-xl border border-gray-200 bg-white p-3 shadow-lg outline-none',
          className
        )}
        {...props}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
}
