'use client';

import { FC } from 'react';
import { Feather } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { cn } from '@/utils/styles';

interface AuthorBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export const AuthorBadge: FC<AuthorBadgeProps> = ({ size = 'md', className, showText = true }) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-amber-50 px-2 py-1',
        className
      )}
    >
      <Feather className={cn('text-amber-600 mr-1', sizeClasses[size])} />
      {showText && <span className="text-amber-600 text-xs font-medium">Author</span>}
    </div>
  );
};
