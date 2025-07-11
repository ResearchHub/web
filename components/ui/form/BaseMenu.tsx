'use client';

import { FC, ReactNode, useState, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Portal from '@radix-ui/react-portal';
import { Transition } from '@headlessui/react';
import { cn } from '@/utils/styles';

interface BaseMenuProps {
  children: ReactNode;
  trigger: ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
  withOverlay?: boolean;
  sideOffset?: number;
  animate?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  sameWidth?: boolean;
  open?: boolean;
}

export const BaseMenu: FC<BaseMenuProps> = ({
  children,
  trigger,
  align = 'end',
  className,
  withOverlay = false,
  sideOffset = 5,
  animate = false,
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
    <>
      {withOverlay && (
        <Portal.Root>
          <Transition
            show={isOpen}
            enter="transition-opacity duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black/[0.15]"
              style={{ zIndex: 99999 }}
              onClick={() => handleOpenChange(false)}
            />
          </Transition>
        </Portal.Root>
      )}
      <DropdownMenu.Root open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenu.Trigger disabled={disabled} asChild>
          {trigger}
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align={align}
            sideOffset={sideOffset}
            className={cn(
              'z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-md',
              animate && 'animate-in fade-in-0 slide-in-from-top-8 duration-200',
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
    </>
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
