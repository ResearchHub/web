import React from 'react';
import { cn } from '@/components/Editor/lib/utils';

export const DropdownCategoryTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="text-[.65rem] font-semibold mb-1 uppercase text-neutral-500 dark:text-neutral-400 px-1.5">
      {children}
    </div>
  );
};

type DropdownButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
};

export const DropdownButton = React.forwardRef<HTMLButtonElement, DropdownButtonProps>(
  function DropdownButtonInner({ children, isActive, disabled, className, ...rest }, ref) {
    const buttonClass = cn(
      'flex items-center gap-2 p-1.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 text-left bg-transparent w-full rounded',
      !isActive && !disabled,
      'hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-900 dark:hover:text-neutral-200',
      isActive &&
        !disabled &&
        'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200',
      disabled && 'text-neutral-400 cursor-not-allowed dark:text-neutral-600',
      className
    );

    // Spread `rest` so that Radix-injected props (onPointerMove,
    // onPointerLeave, onKeyDown, data-state, aria-*, id) reach the
    // underlying <button>. Without this, `asChild` patterns silently lose
    // Radix's hover-to-open and keyboard handling.
    return (
      <button {...rest} className={buttonClass} disabled={disabled} ref={ref}>
        {children}
      </button>
    );
  }
);
