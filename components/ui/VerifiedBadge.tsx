import { BadgeCheck } from 'lucide-react';
import clsx from 'clsx';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isOrganization?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function VerifiedBadge({
  size = 'md',
  isOrganization = false,
  className,
}: VerifiedBadgeProps) {
  return (
    <BadgeCheck
      className={clsx(
        'stroke-2',
        isOrganization ? 'text-purple-500' : 'text-blue-500',
        sizeClasses[size],
        className
      )}
    />
  );
}
