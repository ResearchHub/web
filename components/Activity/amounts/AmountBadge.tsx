'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface AmountBadgeProps {
  className?: string;
  children: ReactNode;
  size?: 'sm' | 'md';
  variant?: 'green' | 'orange';
}

export const AmountBadge: FC<AmountBadgeProps> = ({
  className,
  children,
  size = 'md',
  variant = 'green',
}) => (
  <span
    className={cn(
      'text-[length:calc(1em+1px)] font-medium',
      variant === 'orange' ? 'text-orange-700' : 'text-green-700',
      size === 'sm' && '!text-xs',
      className
    )}
  >
    {children}
  </span>
);
