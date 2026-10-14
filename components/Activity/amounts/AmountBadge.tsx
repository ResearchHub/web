'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface AmountBadgeProps {
  className?: string;
  children: ReactNode;
  size?: 'sm' | 'md';
}

/** An amount of money in a line of text: green and monospaced, like the cover's figures. */
export const AmountBadge: FC<AmountBadgeProps> = ({ className, children, size = 'md' }) => (
  <span
    className={cn(
      'font-mono text-[length:calc(1em+1px)] font-medium text-green-700',
      size === 'sm' && '!text-xs',
      className
    )}
  >
    {children}
  </span>
);
