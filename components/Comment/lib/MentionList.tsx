import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '@/utils/styles';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

interface MentionItem {
  id: string;
  label: string;
  entityType: 'paper' | 'user' | 'author' | 'post';
  authorProfileId?: string | null;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  authors?: string[];
  isVerified?: boolean;
  authorProfile?: {
    headline?: string;
    profileImage?: string | null;
  };
  doi?: string;
  citations?: number;
  source?: string;
}

interface MentionListProps {
  items: MentionItem[];
  command: (item: MentionItem) => void;
}

const generateUniqueKey = (item: MentionItem, index: number) => {
  if (item.id) return `${item.entityType}-${item.id}`;
  if (item.doi) return `${item.entityType}-doi-${item.doi}`;
  return `${item.entityType}-${index}-${item.label.slice(0, 20)}`;
};

export const MentionList = forwardRef<
  { onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean },
  MentionListProps
>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const users = props.items.filter(
    (item) => item.entityType === 'user' || item.entityType === 'author'
  );

  const selectItem = (index: number) => {
    const item = users[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    if (users.length === 0) return;
    setSelectedIndex((current) => (current - 1 + users.length) % users.length);
  };

  const downHandler = () => {
    if (users.length === 0) return;
    setSelectedIndex((current) => (current + 1) % users.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  const renderUserItem = (item: MentionItem) => (
    <div className="flex items-center gap-2.5">
      <Avatar src={item.authorProfile?.profileImage} alt={item.label} size="sm" />
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-gray-900 text-sm">{item.label}</span>
          {item.isVerified && <VerifiedBadge size="xs" />}
        </div>
        {item.authorProfile?.headline && (
          <div className="text-xs text-gray-500 line-clamp-1">{item.authorProfile.headline}</div>
        )}
      </div>
    </div>
  );

  const renderSectionHeader = (title: string) => (
    <div className="px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50/80">{title}</div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-[320px] max-w-[400px] max-h-[400px] overflow-y-auto">
      {users.length > 0 && (
        <>
          {renderSectionHeader('People')}
          <div>
            {users.map((item, index) => (
              <button
                key={generateUniqueKey(item, index)}
                className={cn(
                  'w-full px-3 py-2 text-left transition-colors duration-150',
                  'focus:outline-none',
                  index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                )}
                onClick={() => selectItem(index)}
              >
                {renderUserItem(item)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';
