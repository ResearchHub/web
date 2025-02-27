'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';

interface StatusBadgeProps {
  status: 'open' | 'closed' | 'pending' | 'completed';
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status, className, size = 'sm' }) => {
  const sizeClasses = {
    xs: 'text-xs gap-1 py-1 px-2',
    sm: 'text-sm gap-1.5 py-1.5 px-3',
    md: 'text-base gap-2 py-2 px-4',
  };

  const statusConfig = {
    open: {
      dotColor: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      label: 'Open',
    },
    closed: {
      dotColor: 'bg-gray-500',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: 'Closed',
    },
    pending: {
      dotColor: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-100',
      label: 'Pending',
    },
    completed: {
      dotColor: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      label: 'Completed',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-md border',
        sizeClasses[size],
        config.textColor,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className={cn('w-2 h-2 rounded-full', config.dotColor)}></div>
      <span>{config.label}</span>
    </div>
  );
};
