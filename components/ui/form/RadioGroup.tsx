'use client';

import { Description, RadioGroup as HeadlessRadioGroup, Label, Radio } from '@headlessui/react';
import { cn } from '@/utils/styles';
import { forwardRef, type ReactNode } from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  badge?: ReactNode;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  size?: 'default' | 'sm';
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    { options, value, onChange, label, className, required, error, helperText, size = 'default' },
    ref
  ) => {
    const isSm = size === 'sm';
    return (
      <div ref={ref}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {label} {required && <span className="text-gray-700">*</span>}
          </label>
        )}
        <HeadlessRadioGroup value={value} onChange={onChange}>
          <div className={cn(isSm ? 'space-y-1.5' : 'space-y-2', className)}>
            {options.map((option) => (
              <Radio
                key={option.value}
                value={option.value}
                className={({ checked }) =>
                  cn(
                    'flex flex-wrap items-start rounded-lg border cursor-pointer',
                    isSm ? 'p-2.5 gap-2.5' : 'p-3 gap-3',
                    checked
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300',
                    error && 'border-red-500'
                  )
                }
              >
                {({ checked }) => (
                  <>
                    <div
                      className={cn(
                        'flex-shrink-0 self-center',
                        'rounded-full border flex items-center justify-center',
                        isSm ? 'h-4 w-4' : 'h-6 w-6',
                        checked ? 'border-primary-600 bg-primary-600' : 'border-gray-300 bg-white'
                      )}
                    >
                      {checked && (
                        <div
                          className={cn('rounded-full bg-white', isSm ? 'h-1.5 w-1.5' : 'h-3 w-3')}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label
                        as="p"
                        className={cn(
                          'font-medium',
                          isSm && 'text-sm',
                          checked ? 'text-primary-900' : 'text-gray-900'
                        )}
                      >
                        {option.label}
                      </Label>
                      {option.description && (
                        <Description
                          as="p"
                          className={cn(
                            isSm ? 'text-xs' : 'text-sm',
                            checked ? 'text-primary-700' : 'text-gray-500'
                          )}
                        >
                          {option.description}
                        </Description>
                      )}
                    </div>
                    {option.badge && (
                      <div
                        className={cn(
                          // Mobile: full-width new line, indented to align under the text
                          // (dot width + gap = 16px + 10px = 26px for sm size, 24px + 12px = 36px for default)
                          'w-full sm:w-auto',
                          isSm ? 'pl-[26px] sm:pl-0' : 'pl-9 sm:pl-0',
                          // Desktop: push to far right, vertically centred
                          'sm:ml-auto sm:self-center',
                          // Collapse the wrap gap on mobile so it sits snug under the description
                          '-mt-1 sm:mt-0'
                        )}
                      >
                        {option.badge}
                      </div>
                    )}
                  </>
                )}
              </Radio>
            ))}
          </div>
        </HeadlessRadioGroup>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
