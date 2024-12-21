'use client'

import { FC, ReactNode } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/utils/styles';

interface BaseMenuProps {
  children: ReactNode;
  trigger: ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export const BaseMenu: FC<BaseMenuProps> = ({ 
  children, 
  trigger,
  align = 'end',
  className 
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md",
            className
          )}
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
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenu.Item>
  );
}; 