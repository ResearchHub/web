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
  items: {
    src: string;
    alt: string;
    tooltip?: string;
  }[];
  size?: 'xxs' | 'xs' | 'sm' | 'md';
  maxItems?: number;
  /** Spacing in pixels between avatars. Negative values create overlap. */
  spacing?: number;
  className?: string;
  label?: string;
  /** When true, hides the count label completely */
  hideLabel?: boolean;
  /** When true, leftmost avatar appears on top */
  reverseOrder?: boolean;
  /** When true, disables individual avatar tooltips */
  disableTooltip?: boolean;
}

export const AvatarStack: FC<AvatarStackProps> = ({ 
  items, 
  size = 'sm', 
  maxItems = 3,
  className = '',
  label,
  spacing = -8,
  reverseOrder = false,
  hideLabel = false,
  disableTooltip = false,
}) => {
  const displayItems = items.slice(0, maxItems);
  const remainingCount = items.length - maxItems;

  const renderAvatar = (item: AvatarStackProps['items'][0], index: number) => {
    const avatar = (
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
    );

    if (disableTooltip) return avatar;

    return (
      <Tooltip 
        key={`${item.alt}-${index}`}
        content={item.tooltip || item.alt}
      >
        {avatar}
      </Tooltip>
    );
  };

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex">
        {displayItems.map((item, index) => renderAvatar(item, index))}
        {!hideLabel && remainingCount > 0 && (
          <div 
            className="relative"
            style={{ 
              marginLeft: `${spacing}px`,
              zIndex: reverseOrder ? 0 : displayItems.length
            }}
          >
            <div className={`bg-gray-100 text-gray-500 px-2 rounded-full ring-1 ring-gray-200 text-xs flex items-center capitalize ${
              size === 'xs' ? 'h-4' :
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