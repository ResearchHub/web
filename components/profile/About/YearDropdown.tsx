'use client';

import { useId } from 'react';
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

/**
 * A native select: with ~90 years to scroll through, phones show their own
 * year picker, which beats any menu.
 */
export function YearDropdown({
  value,
  onChange,
  label = 'Year of Graduation',
  required = false,
  className,
}: YearDropdownProps) {
  const id = useId();

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-gray-700">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value?.value ?? ''}
          onChange={(e) => onChange(yearOptions.find((option) => option.value === e.target.value))}
          className={cn(
            'w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-primary-500',
            !value && 'text-gray-500',
            className
          )}
        >
          <option value="">{value ? 'No year' : 'Select Year'}</option>
          {/* Newest first */}
          {[...yearOptions].reverse().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
        />
      </div>
    </div>
  );
}
