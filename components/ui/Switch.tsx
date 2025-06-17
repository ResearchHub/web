import { Switch as HeadlessSwitch } from '@headlessui/react';
import { cn } from '@/utils/styles';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'currency';
}

export const Switch = ({
  checked,
  onCheckedChange,
  disabled,
  className,
  variant = 'default',
}: SwitchProps) => {
  const getBackgroundColor = () => {
    if (variant === 'currency') {
      // For currency toggle: Both states use gray
      return 'bg-gray-400';
    }
    // Default behavior
    return checked ? 'bg-primary-600' : 'bg-gray-200';
  };

  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        'inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        getBackgroundColor(),
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
