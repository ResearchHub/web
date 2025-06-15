import { cn } from '@/utils/styles';
import { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helperText, required, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-1">
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
              'w-full px-4 py-2 text-sm outline-none border-none rounded-lg resize-vertical focus:ring-2 focus:ring-primary-500',
              'placeholder:text-gray-500 min-h-[100px]',
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
