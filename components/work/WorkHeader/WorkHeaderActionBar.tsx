'use client';

import { ReactNode } from 'react';
import { Share, MoreHorizontal } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { BaseMenu } from '@/components/ui/form/BaseMenu';
import { cn } from '@/utils/styles';

export interface WorkHeaderActionBarProps {
  moreMenuItems: ReactNode;
  onShare: () => void;
  onSave: () => void;
  isInList: boolean;
  isSaveDisabled: boolean;
  primaryAction?: ReactNode;
  size?: 'sm' | 'lg';
}

export function WorkHeaderActionBar({
  moreMenuItems,
  onShare,
  onSave,
  isInList,
  isSaveDisabled,
  primaryAction,
  size = 'lg',
}: WorkHeaderActionBarProps) {
  if (size === 'sm') {
    return (
      <>
        {primaryAction}
        <BaseMenu
          align="start"
          trigger={
            <button
              className="h-8 px-2 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal className="h-[18px] w-[18px]" />
            </button>
          }
        >
          {moreMenuItems}
        </BaseMenu>
        <button
          onClick={onShare}
          className="h-8 px-2 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Share"
        >
          <Share className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onSave}
          disabled={isSaveDisabled}
          className={cn(
            'h-8 px-2 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors',
            isInList ? 'text-green-600' : 'text-gray-400 hover:text-gray-700',
            isSaveDisabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Save"
        >
          <FontAwesomeIcon icon={isInList ? faBookmarkSolid : faBookmark} className="h-3.5 w-3.5" />
        </button>
      </>
    );
  }

  const btnClass =
    'flex-1 flex items-center justify-center py-3 px-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors';

  return (
    <div className="flex items-stretch gap-1.5">
      <BaseMenu
        align="end"
        trigger={
          <button className={cn(btnClass, 'text-gray-600')} aria-label="More options">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        }
      >
        {moreMenuItems}
      </BaseMenu>
      <button onClick={onShare} className={cn(btnClass, 'text-gray-600')} aria-label="Share">
        <Share className="h-4 w-4" />
      </button>
      <button
        onClick={onSave}
        disabled={isSaveDisabled}
        className={cn(
          btnClass,
          isInList ? 'text-green-600 border-green-300' : 'text-gray-600',
          isSaveDisabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="Save"
      >
        <FontAwesomeIcon icon={isInList ? faBookmarkSolid : faBookmark} className="h-4 w-4" />
      </button>
    </div>
  );
}
