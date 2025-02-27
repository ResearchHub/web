import { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, label, error, helperText, required, id, onCheckedChange, onChange, ...props },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className={className}>
        <div className="flex items-start gap-2">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white transition-all checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50"
              ref={ref}
              id={id}
              onChange={handleChange}
              required={required}
              {...props}
            />
            <Check className="pointer-events-none absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100" />
          </div>
          {label && (
            <label htmlFor={id} className="text-sm text-gray-600 cursor-pointer">
              {label} {required && <span className="text-gray-700">*</span>}
            </label>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
