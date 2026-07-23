import { FC, useEffect, useRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/utils/styles';

interface SelectionCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  ariaLabel: string;
  disabled?: boolean;
}

export const SelectionCheckbox: FC<SelectionCheckboxProps> = ({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label
      className={cn(
        'relative flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer',
        checked || indeterminate
          ? 'bg-indigo-600 border-indigo-600 text-white'
          : 'border-gray-300 hover:border-indigo-400 bg-white',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel}
        className="sr-only"
      />
      {checked && !indeterminate && <Check className="w-3 h-3" aria-hidden="true" />}
      {indeterminate && <Minus className="w-3 h-3" aria-hidden="true" />}
    </label>
  );
};
