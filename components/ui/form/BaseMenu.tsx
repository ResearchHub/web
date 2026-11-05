'use client';

import { FC, ReactNode, useState, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/utils/styles';

interface BaseMenuProps {
  children: ReactNode;
  trigger: ReactNode;
  /** Which side of the trigger the menu opens on; below it unless there is no room. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  sideOffset?: number;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  sameWidth?: boolean;
  open?: boolean;
}

export const BaseMenu: FC<BaseMenuProps> = ({
  children,
  trigger,
  side,
  align = 'end',
  className,
  sideOffset = 5,
  onOpenChange,
  disabled = false,
  sameWidth = false,
  open,
}) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false);

  const isOpen = open !== undefined ? open : isOpenInternal;

  useEffect(() => {
    if (open !== undefined) {
      setIsOpenInternal(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!disabled) {
      if (open === undefined) {
        setIsOpenInternal(newOpen);
      }
      onOpenChange?.(newOpen);
    }
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger disabled={disabled} asChild>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        {/*
          Grows out of the trigger at every screen width. On a phone it stays
          anchored like on desktop: kept 8px inside the screen edges, and
          scrolling inside itself rather than running off the bottom.
        */}
        <DropdownMenu.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={8}
          className={cn(
            'z-50 min-w-[8rem] max-w-[calc(100vw-16px)] max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-md',
            'origin-[var(--radix-dropdown-menu-content-transform-origin)] animate-menu-in data-[state=closed]:animate-menu-out',
            // Finger-sized rows on touch screens; mouse users keep the compact ones.
            '[@media(pointer:coarse)]:[&_[role^=menuitem]]:min-h-11',
            className
          )}
          style={{
            zIndex: 100000,
            ...(sameWidth && { width: 'var(--radix-dropdown-menu-trigger-width)' }),
          }}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export const BaseMenuItem = ({
  children,
  className,
  ...props
}: DropdownMenu.DropdownMenuItemProps) => {
  return (
    <DropdownMenu.Item
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenu.Item>
  );
};

export const BaseMenuRadioGroup = DropdownMenu.RadioGroup;

/**
 * A single-choice row: radio ring, dot while checked. Radix keeps the checked
 * state and closes the menu on pick; the group above it takes the value.
 */
export const BaseMenuRadioItem = ({
  children,
  className,
  ...props
}: DropdownMenu.DropdownMenuRadioItemProps) => {
  return (
    <DropdownMenu.RadioItem
      className={cn(
        'group relative flex cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-800 outline-none transition-colors',
        'focus:bg-gray-50 data-[highlighted]:bg-gray-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 transition-colors group-data-[state=checked]:border-primary-500"
      >
        <DropdownMenu.ItemIndicator className="h-2 w-2 rounded-full bg-primary-500" />
      </span>
      {children}
    </DropdownMenu.RadioItem>
  );
};
