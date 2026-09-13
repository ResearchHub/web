'use client';

import { BaseMenu, BaseMenuRadioGroup, BaseMenuRadioItem } from '@/components/ui/form/BaseMenu';
import {
  MenuTrigger,
  type MenuTriggerProps,
  type MenuTriggerVariant,
} from '@/components/ui/MenuTrigger';

export interface SortMenuOption<T extends string = string> {
  readonly label: string;
  readonly value: T;
}

export interface SortMenuProps<T extends string> {
  readonly options: ReadonlyArray<SortMenuOption<T>>;
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly triggerVariant?: MenuTriggerVariant;
  /** Extra props for the default trigger — a test id, a class. */
  readonly triggerProps?: Omit<MenuTriggerProps, 'children' | 'variant'>;
  readonly align?: 'start' | 'center' | 'end';
  readonly className?: string;
  readonly disabled?: boolean;
}

/**
 * Pick one of a few orderings. One menu for every sort control in the app —
 * feed headings, funding toolbars — so they all open, close, and
 * answer the keyboard the same way; only the trigger's look varies.
 */
export function SortMenu<T extends string>({
  options,
  value,
  onChange,
  triggerVariant = 'inline',
  triggerProps,
  align = 'end',
  className,
  disabled = false,
}: SortMenuProps<T>) {
  const selected = options.find((option) => option.value === value) ?? options[0];
  return (
    <BaseMenu
      align={align}
      disabled={disabled}
      className={className ?? 'min-w-[200px] rounded-xl p-1.5'}
      trigger={
        <MenuTrigger
          variant={triggerVariant}
          srLabel="Sort by:"
          disabled={disabled}
          {...triggerProps}
        >
          {selected?.label}
        </MenuTrigger>
      }
    >
      <BaseMenuRadioGroup value={value} onValueChange={(next) => onChange(next as T)}>
        {options.map((option) => (
          <BaseMenuRadioItem key={option.value} value={option.value}>
            {option.label}
          </BaseMenuRadioItem>
        ))}
      </BaseMenuRadioGroup>
    </BaseMenu>
  );
}
