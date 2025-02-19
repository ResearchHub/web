import { cn } from '@/utils/styles';
import { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  rightElement?: React.ReactNode;
  helperText?: string;
  label?: string;
  required?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
  labelClassName?: string;
}

const sizeClasses = {
  sm: {
    input: 'px-3 py-1.5 text-sm',
    label: 'text-xs',
    iconPadding: 'pl-9',
    iconPosition: 'left-3',
  },
  md: {
    input: 'px-4 py-2 text-sm',
    label: 'text-sm',
    iconPadding: 'pl-11',
    iconPosition: 'left-4',
  },
  lg: {
    input: 'px-4 py-3 text-base',
    label: 'text-base',
    iconPadding: 'pl-12',
    iconPosition: 'left-4',
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      icon,
      error,
      rightElement,
      helperText,
      label,
      required,
      inputSize = 'md',
      labelClassName,
      ...props
    },
    ref
  ) => {
    const isRoundedFull = className?.includes('rounded-full');
    const roundedClass = isRoundedFull ? 'rounded-full' : 'rounded-lg';
    const sizeClass = sizeClasses[inputSize];

    return (
      <div>
        {label && (
          <label className={cn('block mb-1 text-gray-700', sizeClass.label, labelClassName)}>
            {label} {required && <span className="text-gray-700">*</span>}
          </label>
        )}
        <div
          className={cn(
            'relative flex border border-gray-200 transition-all',
            roundedClass,
            error && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20',
            className
          )}
        >
          {icon && (
            <div className={cn('absolute top-1/2 -translate-y-1/2', sizeClass.iconPosition)}>
              {icon}
            </div>
          )}
          <input
            className={cn(
              'w-full outline-none border-none',
              roundedClass,
              'placeholder:text-gray-500',
              sizeClass.input,
              icon && sizeClass.iconPadding,
              className?.includes('bg-') ? className : 'bg-white'
            )}
            ref={ref}
            required={required}
            {...props}
          />
          {rightElement && <div className="flex">{rightElement}</div>}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
