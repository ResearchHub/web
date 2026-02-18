'use client';

import { FC, ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/styles';

export interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const Pill: FC<PillProps> = ({ active = false, className, children, ...props }) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 select-none whitespace-nowrap',
        active ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
