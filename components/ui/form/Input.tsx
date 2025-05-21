import { cn } from '@/utils/styles';
import { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  rightElement?: React.ReactNode;
  helperText?: string;
  label?: string;
  required?: boolean;
  wrapperClassName?: string;
}

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
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    const isRoundedFull = className?.includes('rounded-full');
    const roundedClass = isRoundedFull ? 'rounded-full' : 'rounded-lg';

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor={props.id}>
            {label} {required && <span className="text-gray-700">*</span>}
          </label>
        )}
        <div
          className={cn(
            'relative flex border border-gray-200 transition-all',
            roundedClass,
            error && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20',
            className,
            'w-full'
          )}
        >
          {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>}
          <input
            className={cn(
              'w-full px-4 py-2 text-sm outline-none border-none focus:ring-2 focus:ring-indigo-500',
              roundedClass,
              'placeholder:text-gray-500',
              icon && 'pl-11',
              className?.includes('bg-') ? className : 'bg-white'
            )}
            ref={ref}
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
