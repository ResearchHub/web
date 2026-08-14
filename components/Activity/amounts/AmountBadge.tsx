'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface AmountBadgeProps {
  className?: string;
  children: ReactNode;
  size?: 'sm' | 'md';
}

export const AmountBadge: FC<AmountBadgeProps> = ({ className, children, size = 'md' }) => (
  <span
    className={cn(
      'inline-flex items-center rounded font-mono font-semibold leading-tight',
      'bg-green-100 text-green-800',
      size === 'sm' ? 'px-1 py-px text-[11px]' : 'px-1.5 text-[12px]',
      className
    )}
  >
    {children}
  </span>
);
