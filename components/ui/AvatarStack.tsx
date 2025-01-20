'use client';

import { FC } from 'react';
import { Avatar } from './Avatar';
import { Tooltip } from './Tooltip';
import { cn } from '@/utils/styles';

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
  spacing = -8,
  reverseOrder = false,
  disableTooltip = false,
}) => {
  const displayItems = items.slice(0, maxItems);

  const renderAvatar = (item: AvatarStackProps['items'][0], index: number) => {
    const avatar = (
      <div
        className="relative inline-flex"
        style={{
          marginLeft: index !== 0 ? `${spacing}px` : undefined,
          zIndex: reverseOrder ? displayItems.length - index : index,
        }}
      >
        <Avatar src={item.src} alt={item.alt} size={size} className="ring-1 ring-gray-300" />
      </div>
    );

    if (disableTooltip) return avatar;

    return (
      <Tooltip key={`${item.alt}-${index}`} content={item.tooltip || item.alt}>
        {avatar}
      </Tooltip>
    );
  };

  return (
    <div className={cn('inline-flex items-center', className)}>
      <div className="inline-flex">
        {displayItems.map((item, index) => (
          <div key={`${item.alt}-${index}`} className="flex">
            {renderAvatar(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};
