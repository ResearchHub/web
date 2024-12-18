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
}

export const AvatarStack: FC<AvatarStackProps> = ({ 
  items, 
  size = 'sm', 
  maxItems = 3,
  className = '' 
}) => {
  const displayItems = items.slice(0, maxItems);
  const remainingCount = items.length - maxItems;

  return (
    <div className={`flex -space-x-2 ${className}`}>
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
              className="border-2 border-white"
            />
          </div>
        </Tooltip>
      ))}
      {remainingCount > 0 && (
        <Tooltip content={`${remainingCount} more`}>
          <div className={`relative inline-flex items-center justify-center bg-gray-100 text-gray-600 border-2 border-white rounded-full ${
            size === 'xs' ? 'w-6 h-6 text-xs' :
            size === 'sm' ? 'w-8 h-8 text-sm' :
            size === 'md' ? 'w-10 h-10 text-base' :
            'w-12 h-12 text-lg'
          }`}>
            +{remainingCount}
          </div>
        </Tooltip>
      )}
    </div>
  );
}; 