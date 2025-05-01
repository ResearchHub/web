import { FC, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';

export interface SortOption {
  label: string;
  value: string;
}

interface SortDropdownProps {
  value?: string;
  onChange: (value: SortOption) => void;
  options?: SortOption[];
  className?: string;
}

const defaultOptions: SortOption[] = [
  { label: 'Best', value: 'personalized' },
  { label: 'Newest', value: '-created_date' },
  { label: 'Oldest', value: 'created_date' },
];

export const SortDropdown: FC<SortDropdownProps> = ({
  value = 'personalized',
  onChange,
  options = defaultOptions,
  className = '',
}) => {
  const activeOption = options.find((opt) => opt.value === value) || options[0];
  const [open, setOpen] = useState(false);

  const trigger = (
    <button
      type="button"
      className={`flex items-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-1.5 text-sm min-w-[120px] justify-between ${className}`}
    >
      <span className="text-gray-700 truncate">{activeOption.label}</span>
      <ChevronDown className="h-4 w-4 text-gray-500" />
    </button>
  );

  const menuContent = (
    <BaseMenu trigger={trigger} align="start" sideOffset={5} open={open} onOpenChange={setOpen}>
      {options.map((opt) => (
        <BaseMenuItem
          key={opt.value}
          onSelect={() => {
            onChange(opt);
            setOpen(false);
          }}
          className={opt.value === value ? 'bg-gray-100 text-gray-900' : ''}
        >
          {opt.label}
        </BaseMenuItem>
      ))}
    </BaseMenu>
  );

  return menuContent;
};

export default SortDropdown;
