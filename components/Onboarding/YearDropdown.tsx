'use client';

import { useState } from 'react';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/styles';

// Generate a list of years from 1950 to current year + 10
const currentYear = new Date().getFullYear();
export const yearOptions = Array.from({ length: currentYear - 1950 + 10 + 1 }, (_, i) => {
  const year = 1950 + i;
  return { value: year.toString(), label: year.toString() };
});

export interface YearOption {
  value: string;
  label: string;
}

interface YearDropdownProps {
  value: YearOption | undefined;
  onChange: (year: YearOption | undefined) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export function YearDropdown({
  value,
  onChange,
  label = 'Year of Graduation',
  required = false,
  className,
}: YearDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      label={label}
      required={required}
      trigger={
        <button
          type="button"
          className={cn(
            'flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm leading-6 text-left focus:outline-none focus:ring-2 focus:ring-primary-500',
            !value && 'text-gray-500',
            className
          )}
        >
          {value ? value.label : 'Select Year'}
          <ChevronDown
            className={cn('ml-2 h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          />
        </button>
      }
      className="max-h-60 overflow-y-auto py-1"
      onOpenChange={setIsOpen}
    >
      <div className="py-1 max-h-60 overflow-y-auto">
        <DropdownItem
          onClick={() => onChange(undefined)}
          className={!value ? 'bg-gray-100 font-medium' : ''}
        >
          No year
        </DropdownItem>

        {/* Year options in reverse chronological order (newest first) */}
        {[...yearOptions].reverse().map((option) => (
          <DropdownItem
            key={option.value}
            onClick={() => onChange(option)}
            className={value?.value === option.value ? 'bg-gray-100 font-medium' : ''}
          >
            {option.label}
          </DropdownItem>
        ))}
      </div>
    </Dropdown>
  );
}
