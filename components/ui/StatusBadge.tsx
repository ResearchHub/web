'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { RadiatingDot } from './RadiatingDot';
import { Badge } from './Badge';

interface StatusBadgeProps {
  status: 'open' | 'closed' | 'pending' | 'completed' | 'expiring';
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

interface StatusConfig {
  dotColor: string;
  radiateColor: string;
  ringColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  label: string;
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status, className, size = 'sm' }) => {
  const sizeClasses = {
    xs: 'text-xs gap-1 py-1 px-2',
    sm: 'text-sm gap-1.5 py-1.5 px-3',
    md: 'text-base gap-2 py-2 px-4',
  };

  const statusConfig: Record<string, StatusConfig> = {
    open: {
      dotColor: 'bg-blue-500',
      radiateColor: 'bg-blue-400',
      ringColor: 'border-blue-200',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      label: 'Open',
    },
    expiring: {
      dotColor: 'bg-orange-500',
      radiateColor: 'bg-orange-400',
      ringColor: 'border-orange-200',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      label: 'Expiring Soon',
    },
    closed: {
      dotColor: 'bg-gray-500',
      radiateColor: 'bg-gray-400',
      ringColor: 'border-gray-200',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: 'Closed',
    },
    pending: {
      dotColor: 'bg-yellow-500',
      radiateColor: 'bg-yellow-400',
      ringColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-100',
      label: 'Pending',
    },
    completed: {
      dotColor: 'bg-green-500',
      radiateColor: 'bg-green-400',
      ringColor: 'border-green-200',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      label: 'Completed',
    },
  };

  const config = statusConfig[status];

  const badgeSize = size === 'xs' ? 'sm' : size === 'sm' ? 'default' : 'lg';

  return (
    <Badge
      className={cn(
        'flex items-center gap-1.5',
        sizeClasses[size],
        config.textColor,
        config.bgColor,
        config.borderColor,
        className
      )}
      size={badgeSize}
    >
      {status === 'open' || status === 'expiring' ? (
        <RadiatingDot
          color={config.dotColor}
          radiateColor={config.radiateColor}
          ringColor={config.ringColor}
          isRadiating={true}
        />
      ) : (
        <RadiatingDot color={config.dotColor} isRadiating={false} />
      )}
      <span>{config.label}</span>
    </Badge>
  );
};
