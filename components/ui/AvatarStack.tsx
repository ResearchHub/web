'use client';

import { FC } from 'react';
import { Avatar } from './Avatar';
import { Tooltip } from './Tooltip';
import { cn } from '@/utils/styles';
import { UserTooltip } from './UserTooltip';

interface AvatarStackProps {
  items: {
    src: string;
    alt: string;
    tooltip?: string;
    userId?: number;
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
  /** Custom ring color class for avatars */
  ringColorClass?: string;
  /** When true, shows a +N avatar for remaining items */
  showExtraCount?: boolean;
  /** Total count of items (for cases where items provided is already truncated) */
  totalItemsCount?: number;
  /** All items (including those not shown) for tooltip on extraCount */
  allItems?: {
    src: string;
    alt: string;
    tooltip?: string;
    userId?: number;
  }[];
  /** Label for the extra count tooltip */
  extraCountLabel?: string;
}

export const AvatarStack: FC<AvatarStackProps> = ({
  items,
  size = 'sm',
  maxItems = 3,
  className = '',
  spacing = -8,
  reverseOrder = false,
  disableTooltip = false,
  ringColorClass = 'ring-gray-300',
  showExtraCount = false,
  totalItemsCount,
  allItems,
  extraCountLabel = 'Others',
}) => {
  // Determine how many items to display
  const displayItems = items.slice(0, maxItems);

  // Calculate extra count if showExtraCount is true
  const totalCount = totalItemsCount !== undefined ? totalItemsCount : items.length;
  const extraCount = Math.max(0, totalCount - maxItems);
  const hasExtra = showExtraCount && extraCount > 0;

  // Get the list of extra items for tooltip
  const extraItems = allItems ? allItems.slice(maxItems) : items.slice(maxItems);

  // Size mapping for the Avatar component
  const getAvatarSize = (avatarSize: string) => {
    switch (avatarSize) {
      case 'xxs':
        return { width: '16px', height: '16px' };
      case 'xs':
        return { width: '24px', height: '24px' };
      case 'md':
        return { width: '40px', height: '40px' };
      default:
        return { width: '32px', height: '32px' }; // 'sm'
    }
  };

  // Get font size for the extra count based on avatar size
  const getExtraCountFontSize = () => {
    switch (size) {
      case 'xxs':
        return '8px';
      case 'xs':
        return '10px';
      case 'md':
        return '14px';
      default:
        return '12px'; // 'sm'
    }
  };

  const renderAvatar = (item: AvatarStackProps['items'][0], index: number) => {
    const avatar = (
      <div
        className="relative inline-flex"
        style={{
          marginLeft: index !== 0 ? `${spacing}px` : undefined,
          zIndex: reverseOrder ? displayItems.length - index : index,
        }}
      >
        <Avatar src={item.src} alt={item.alt} size={size} className={`ring-2 ${ringColorClass}`} />
      </div>
    );

    if (disableTooltip) return avatar;

    if (item.userId) {
      return (
        <UserTooltip key={`${item.alt}-${index}`} userId={item.userId}>
          {avatar}
        </UserTooltip>
      );
    }

    return (
      <Tooltip key={`${item.alt}-${index}`} content={item.tooltip || item.alt}>
        {avatar}
      </Tooltip>
    );
  };

  // Generate tooltip content for extra count
  const getExtraCountTooltip = () => {
    if (extraItems.length === 0) return extraCountLabel;

    return (
      <div className="text-left">
        <div className="font-medium mb-1">
          {extraCountLabel} ({extraCount})
        </div>
        <ul className="space-y-0.5">
          {extraItems.slice(0, 10).map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <Avatar src={item.src} alt={item.alt} size="xxs" className="ring-1 ring-white" />
              <span>{item.tooltip || item.alt}</span>
            </li>
          ))}
          {extraItems.length > 10 && (
            <li className="text-gray-500">+ {extraItems.length - 10} more</li>
          )}
        </ul>
      </div>
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

        {/* Extra count avatar */}
        {hasExtra && (
          <div
            className="relative inline-flex"
            style={{
              marginLeft: `${spacing}px`,
              zIndex: displayItems.length,
            }}
          >
            <Tooltip
              content={getExtraCountTooltip()}
              position="top"
              width={extraItems.length > 0 ? 'w-[200px]' : undefined}
            >
              <div
                className={`flex items-center justify-center rounded-full bg-gray-100 ring-2 ${ringColorClass} text-gray-600 font-medium`}
                style={{
                  fontSize: getExtraCountFontSize(),
                  ...getAvatarSize(size),
                }}
              >
                +{extraCount}
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};
