import React from 'react';
import ReactDatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import { cn } from '@/utils/styles';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  error,
  helperText,
  required,
  minDate,
  maxDate,
  className,
  disabled,
  ...props
}: DatePickerProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full">
        <ReactDatePicker
          selected={value}
          onChange={onChange}
          placeholderText={placeholder}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          dateFormat="MM/dd/yyyy"
          wrapperClassName="w-full"
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            'placeholder:text-gray-400'
          )}
          {...props}
        />
      </div>
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
