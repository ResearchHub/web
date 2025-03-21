'use client';

import { Description, RadioGroup as HeadlessRadioGroup, Label, Radio } from '@headlessui/react';
import { cn } from '@/utils/styles';
import { forwardRef } from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface FlagRadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const FlagRadioGroup = forwardRef<HTMLDivElement, FlagRadioGroupProps>(
  ({ options, value, onChange, className }, ref) => {
    return (
      <div ref={ref}>
        <HeadlessRadioGroup value={value} onChange={onChange}>
          <div className={cn('space-y-1.5', className)}>
            {options.map((option) => (
              <Radio
                key={option.value}
                value={option.value}
                className={({ checked }) =>
                  cn(
                    'flex items-start p-2 rounded-lg border cursor-pointer',
                    checked
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )
                }
              >
                {({ checked }) => (
                  <div className="flex-1">
                    <Label
                      as="p"
                      className={cn(
                        'text-sm font-medium',
                        checked ? 'text-indigo-900' : 'text-gray-900'
                      )}
                    >
                      {option.label}
                    </Label>
                    {option.description && (
                      <Description
                        as="p"
                        className={cn('text-xs', checked ? 'text-indigo-700' : 'text-gray-500')}
                      >
                        {option.description}
                      </Description>
                    )}
                  </div>
                )}
              </Radio>
            ))}
          </div>
        </HeadlessRadioGroup>
      </div>
    );
  }
);

FlagRadioGroup.displayName = 'FlagRadioGroup';
