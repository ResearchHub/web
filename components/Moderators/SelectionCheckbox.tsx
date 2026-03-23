import { FC } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/utils/styles';

interface SelectionCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  ariaLabel: string;
}

export const SelectionCheckbox: FC<SelectionCheckboxProps> = ({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
}) => (
  <button
    onClick={onChange}
    className={cn(
      'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer',
      checked || indeterminate
        ? 'bg-indigo-600 border-indigo-600 text-white'
        : 'border-gray-300 hover:border-indigo-400 bg-white'
    )}
    aria-label={ariaLabel}
  >
    {checked && !indeterminate && <Check className="w-3 h-3" />}
    {indeterminate && <Minus className="w-3 h-3" />}
  </button>
);
