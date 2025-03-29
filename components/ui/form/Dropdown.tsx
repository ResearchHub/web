'use client';

import { FC, ReactNode, Fragment, useState } from 'react';
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react';
import { cn } from '@/utils/styles';

type AnchorProps =
  | 'bottom start'
  | 'bottom end'
  | 'top start'
  | 'top end'
  | 'right start'
  | 'right end'
  | 'left start'
  | 'left end';

interface DropdownProps {
  children: ReactNode;
  trigger: ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  sideOffset?: number;
  animate?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  anchor?: AnchorProps;
  label?: string;
  required?: boolean;
}

export const Dropdown: FC<DropdownProps> = ({
  children,
  trigger,
  className,
  animate = false,
  onOpenChange,
  disabled = false,
  anchor = 'bottom start',
  label,
  required = false,
}) => {
  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-gray-700">*</span>}
        </label>
      )}
      <Menu as="div" className="relative inline-block text-left w-full">
        {({ open }) => {
          handleOpenChange(open);

          return (
            <>
              <MenuButton as="div" disabled={disabled} className="w-full">
                {trigger}
              </MenuButton>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems
                  className={cn(
                    'absolute z-50 min-w-[160px] max-w-full w-[var(--button-width)] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-md',
                    animate && 'animate-in fade-in-0 slide-in-from-top-8 duration-200',
                    className
                  )}
                  anchor={anchor}
                >
                  {children}
                </MenuItems>
              </Transition>
            </>
          );
        }}
      </Menu>
    </div>
  );
};

export const DropdownItem: FC<{
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ children, className, onClick, disabled }) => {
  return (
    <MenuItem disabled={disabled}>
      {({ focus }) => (
        <button
          className={cn(
            'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
            focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
            className
          )}
          onClick={onClick}
        >
          {children}
        </button>
      )}
    </MenuItem>
  );
};
