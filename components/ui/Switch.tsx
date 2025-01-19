import { Switch as HeadlessSwitch } from '@headlessui/react';
import { cn } from '@/utils/styles';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch = ({ checked, onCheckedChange, disabled, className }: SwitchProps) => {
  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-indigo-600' : 'bg-gray-200',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </HeadlessSwitch>
  );
};
