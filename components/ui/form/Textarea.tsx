import { cn } from '@/utils/styles';
import { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  labelClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helperText, required, labelClassName, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className={cn('block text-sm text-gray-700 mb-1', labelClassName)}>
            {label} {required && <span className="text-gray-700">*</span>}
          </label>
        )}
        <div
          className={cn(
            'relative flex border border-gray-200 transition-all rounded-lg',
            error && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20',
            className
          )}
        >
          <textarea
            className={cn(
              'w-full outline-none border-none rounded-lg',
              'placeholder:text-gray-500',
              className?.includes('bg-') ? className : 'bg-white'
            )}
            ref={ref}
            required={required}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
