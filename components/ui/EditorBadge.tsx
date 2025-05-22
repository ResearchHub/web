import { FC, ReactNode } from 'react';
import { Tooltip } from './Tooltip';
import { cn } from '@/utils/styles';
import { Hub } from '@/types/hub';
import Icon from '@/components/ui/icons/Icon';

interface EditorBadgeProps {
  /**
   * Array of hubs the user is an editor of
   */
  hubs?: Hub[];

  /**
   * Size of the badge
   * @default "sm"
   */
  size?: 'xs' | 'sm' | 'md';

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const EditorBadge: FC<EditorBadgeProps> = ({ hubs, size = 'sm', className }) => {
  if (!hubs || hubs.length === 0) return null;

  // Format hub names with the word "hub" after each name
  const hubNames = hubs.map((hub) => `${hub.name} hub`).join(', ');

  // Create tooltip content with icon
  const tooltipContent = (
    <div className="flex items-center gap-1.5">
      <Icon name="flaskFrame" size={16} className="text-blue-500" />
      <span>Editor of {hubNames}</span>
    </div>
  );

  // Size variations
  const sizeClasses = {
    xs: {
      badge: 'h-4 px-1.5 py-0.5 text-[9px]',
      iconSize: 12,
      marginRight: 'mr-1',
    },
    sm: {
      badge: 'h-5 px-2 py-0.5 text-xs',
      iconSize: 14,
      marginRight: 'mr-1.5',
    },
    md: {
      badge: 'px-2.5 py-1 text-sm text-xs flex items-center',
      iconSize: 16,
      marginRight: 'mr-1',
    },
  };

  return (
    <Tooltip content={tooltipContent}>
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium bg-blue-100',
          'text-blue-900',
          sizeClasses[size].badge,
          className
        )}
      >
        <div className="flex items-center justify-center">
          <Icon
            name="editor"
            color="blue"
            size={sizeClasses[size].iconSize}
            className={sizeClasses[size].marginRight}
          />
          <span className="leading-none pt-px">Editor</span>
        </div>
      </div>
    </Tooltip>
  );
};
