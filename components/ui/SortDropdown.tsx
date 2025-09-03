import { FC, useState } from 'react';
import { ChevronDown, ArrowDownUp } from 'lucide-react';
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
      className={`flex w-full items-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-1.5 text-sm min-w-[120px] justify-between ${className}`}
    >
      <ArrowDownUp className="h-4 w-4 text-gray-500 flex-none" />
      <span className="text-gray-700 truncate">{activeOption.label}</span>
      <ChevronDown className="h-4 w-4 text-gray-500 flex-none" />
    </button>
  );

  const menuContent = (
    <BaseMenu
      trigger={trigger}
      align="start"
      sideOffset={5}
      open={open}
      onOpenChange={setOpen}
      className="w-[var(--trigger-width)]"
    >
      <div className="w-full" style={{ minWidth: 'var(--trigger-width)' }}>
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
      </div>
    </BaseMenu>
  );

  // Set CSS variable for trigger width when button mounts
  const setTriggerWidth = (node: HTMLElement | null) => {
    if (node) {
      document.documentElement.style.setProperty('--trigger-width', `${node.offsetWidth}px`);
    }
  };

  return (
    <div ref={setTriggerWidth} className="">
      {menuContent}
    </div>
  );
};

export default SortDropdown;
