'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface AmountBadgeProps {
  className?: string;
  children: ReactNode;
}

export const AmountBadge: FC<AmountBadgeProps> = ({ className, children }) => (
  <span
    className={cn(
      'inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[13px] font-semibold leading-tight',
      'bg-green-100 text-green-800',
      className
    )}
  >
    {children}
  </span>
);
