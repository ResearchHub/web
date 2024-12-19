'use client'

import { FC } from 'react';
import { Avatar } from './Avatar';
import { Tooltip } from './Tooltip';

interface AvatarItem {
  src?: string | null;
  alt: string;
  tooltip?: string;
}

interface AvatarStackProps {
  items: AvatarItem[];
  size?: 'xs' | 'sm' | 'md' | 'lg';
  maxItems?: number;
  className?: string;
  label?: string;
}

export const AvatarStack: FC<AvatarStackProps> = ({ 
  items, 
  size = 'sm', 
  maxItems = 3,
  className = '',
  label
}) => {
  const displayItems = items.slice(0, maxItems);
  const remainingCount = items.length - maxItems;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {displayItems.map((item, index) => (
          <Tooltip 
            key={`${item.alt}-${index}`}
            content={item.tooltip || item.alt}
          >
            <div className="relative inline-block">
              <Avatar
                src={item.src}
                alt={item.alt}
                size={size}
                className="ring-1 ring-gray-200"
              />
            </div>
          </Tooltip>
        ))}
        {remainingCount > 0 && label && (
          <div className="relative -ml-2">
            <div className={`bg-gray-100 text-gray-500 px-2 rounded-full ring-1 ring-gray-200 text-xs flex items-center ${
              size === 'xs' ? 'h-6' :
              size === 'sm' ? 'h-8' :
              size === 'md' ? 'h-10' :
              'h-12'
            }`}>
              +{remainingCount} {label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 