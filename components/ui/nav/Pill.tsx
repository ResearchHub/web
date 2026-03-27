'use client';

import { FC, ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/styles';
import { PillSize, pillSizeClasses } from './pillSize';

export interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: PillSize;
}

export const Pill: FC<PillProps> = ({
  active = false,
  size = 'sm',
  className,
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-all duration-150 select-none whitespace-nowrap',
        pillSizeClasses[size],
        active ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
