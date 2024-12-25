'use client'

import { FC } from 'react';
import { Avatar } from './Avatar';
import { Tooltip } from './Tooltip';
import { cn } from '@/utils/styles';

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
  /** Spacing in pixels between avatars. Negative values create overlap. */
  spacing?: number;
  /** When true, leftmost avatar appears on top */
  reverseOrder?: boolean;
  /** When true, hides the count label completely */
  hideLabel?: boolean;
}

export const AvatarStack: FC<AvatarStackProps> = ({ 
  items, 
  size = 'sm', 
  maxItems = 3,
  className = '',
  label,
  spacing = -8,
  reverseOrder = false,
  hideLabel = false
}) => {
  const displayItems = items.slice(0, maxItems);
  const remainingCount = items.length - maxItems;

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex">
        {displayItems.map((item, index) => (
          <Tooltip 
            key={`${item.alt}-${index}`}
            content={item.tooltip || item.alt}
          >
            <div 
              className="relative inline-block" 
              style={{ 
                marginLeft: index !== 0 ? `${spacing}px` : undefined,
                zIndex: reverseOrder ? displayItems.length - index : index,
              }}
            >
              <Avatar
                src={item.src}
                alt={item.alt}
                size={size}
                className="ring-1 ring-gray-200"
              />
            </div>
          </Tooltip>
        ))}
        {!hideLabel && remainingCount > 0 && (
          <div 
            className="relative"
            style={{ 
              marginLeft: `${spacing}px`,
              zIndex: reverseOrder ? 0 : displayItems.length
            }}
          >
            <div className={`bg-gray-100 text-gray-500 px-2 rounded-full ring-1 ring-gray-200 text-xs flex items-center capitalize ${
              size === 'xs' ? 'h-6' :
              size === 'sm' ? 'h-8' :
              size === 'md' ? 'h-10' :
              'h-12'
            }`}>
              {remainingCount > 0 && `+${remainingCount}`} {label ? ` ${label}` : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 