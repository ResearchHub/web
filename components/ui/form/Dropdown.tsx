'use client';

import { FC, ReactNode, Fragment, useState } from 'react';
import { Menu, MenuButton, MenuItems, MenuItem, Transition, Listbox } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/styles';

const MULTI_SELECT_COLLAPSE_THRESHOLD = 3;

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
  error?: string;
  helperText?: string;
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
  error,
  helperText,
}) => {
  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {label} {required && <span className="text-gray-700">*</span>}
        </label>
      )}
      <Menu as="div" className="relative inline-block text-left w-full">
        {({ open }) => {
          handleOpenChange(open);

          return (
            <>
              <MenuButton as="div" disabled={disabled} className="w-full">
                <div
                  className={cn(
                    'transition-all',
                    error &&
                      'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20'
                  )}
                >
                  {trigger}
                </div>
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
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
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

// ── MultiSelectDropdown (Headless UI Listbox multiple) ───────────────────────

export interface MultiSelectOption<T extends string = string> {
  value: T;
  label: string;
}

export interface MultiSelectDropdownProps<T extends string = string> {
  options: MultiSelectOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
  /** When more than this many are selected, button shows "Selected (N)". Default 3. */
  collapseLabelAbove?: number;
  /** Custom trigger (button) content. Defaults to selected labels or "Selected (N)". */
  renderTrigger?: (selected: T[], label: string) => ReactNode;
}

export function MultiSelectDropdown<T extends string = string>({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select...',
  error,
  helperText,
  className,
  disabled = false,
  collapseLabelAbove = MULTI_SELECT_COLLAPSE_THRESHOLD,
  renderTrigger,
}: MultiSelectDropdownProps<T>) {
  const displayLabel =
    value.length > collapseLabelAbove
      ? `Selected (${value.length})`
      : value.length === 0
        ? ''
        : value.map((v) => options.find((o) => o.value === v)?.label ?? v).join(', ');

  return (
    <div className={cn('w-full', className)}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <Listbox value={value} onChange={onChange} multiple disabled={disabled}>
          {({ open }) => (
            <>
              <Listbox.Button
                as="button"
                type="button"
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary-500',
                  'text-gray-900 font-normal',
                  error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
                  disabled && 'cursor-not-allowed opacity-60'
                )}
              >
                {renderTrigger ? (
                  renderTrigger(value, displayLabel)
                ) : (
                  <>
                    <span className={cn('block truncate', !displayLabel && 'text-gray-500')}>
                      {displayLabel || placeholder}
                    </span>
                    <ChevronDown
                      className={cn(
                        'ml-2 h-4 w-4 shrink-0 transition-transform text-gray-400',
                        open && 'rotate-180'
                      )}
                    />
                  </>
                )}
              </Listbox.Button>
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
                <Listbox.Options
                  static
                  className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-md focus:outline-none"
                >
                  {options.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      value={option.value}
                      className={({ active, selected }) =>
                        cn(
                          'relative flex cursor-pointer select-none items-center rounded-sm py-2 pl-3 pr-9 text-sm',
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          selected && 'bg-primary-50 text-primary-900'
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className="block truncate">{option.label}</span>
                          {selected && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-600">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </>
          )}
        </Listbox>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}
