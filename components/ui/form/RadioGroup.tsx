'use client';

import { Description, RadioGroup as HeadlessRadioGroup, Label, Radio } from '@headlessui/react';
import { cn } from '@/utils/styles';
import { forwardRef } from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
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
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ options, value, onChange, label, className, required, error, helperText }, ref) => {
    return (
      <div ref={ref}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {label} {required && <span className="text-gray-700">*</span>}
          </label>
        )}
        <HeadlessRadioGroup value={value} onChange={onChange}>
          <div className={cn('space-y-2', className)}>
            {options.map((option) => (
              <Radio
                key={option.value}
                value={option.value}
                className={({ checked }) =>
                  cn(
                    'flex items-start p-3 gap-3 rounded-lg border cursor-pointer',
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
                        'h-6 w-6 rounded-full border flex items-center justify-center',
                        checked ? 'border-primary-600 bg-primary-600' : 'border-gray-300 bg-white'
                      )}
                    >
                      {checked && <div className="h-3 w-3 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <Label
                        as="p"
                        className={cn(
                          'font-medium',
                          checked ? 'text-primary-900' : 'text-gray-900'
                        )}
                      >
                        {option.label}
                      </Label>
                      {option.description && (
                        <Description
                          as="p"
                          className={cn('text-sm', checked ? 'text-primary-700' : 'text-gray-500')}
                        >
                          {option.description}
                        </Description>
                      )}
                    </div>
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
