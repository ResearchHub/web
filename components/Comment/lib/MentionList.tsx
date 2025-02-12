import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '@/utils/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines } from '@fortawesome/free-regular-svg-icons';
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

  // Group items by type
  const users = props.items.filter(
    (item) => item.entityType === 'user' || item.entityType === 'author'
  );
  const papers = props.items.filter((item) => item.entityType === 'paper');

  // Get the actual item based on the selected index
  const getItemFromIndex = (index: number): MentionItem | null => {
    const userCount = users.length;
    const hasUserHeader = users.length > 0;
    const hasPaperHeader = papers.length > 0;

    // Adjust index to account for headers
    if (hasUserHeader && index === 0) return null; // User header
    if (hasUserHeader && index <= userCount) {
      return users[index - 1]; // User item
    }
    if (hasPaperHeader && index === userCount + (hasUserHeader ? 1 : 0)) return null; // Paper header
    return papers[index - userCount - (hasUserHeader ? 1 : 0) - (hasPaperHeader ? 1 : 0)]; // Paper item
  };

  const selectItem = (index: number) => {
    const item = getItemFromIndex(index);
    if (item) {
      props.command(item);
    }
  };

  const getTotalLength = () => {
    const hasUserHeader = users.length > 0;
    const hasPaperHeader = papers.length > 0;
    return users.length + papers.length + (hasUserHeader ? 1 : 0) + (hasPaperHeader ? 1 : 0);
  };

  const upHandler = () => {
    let newIndex = selectedIndex;
    do {
      newIndex = (newIndex - 1 + getTotalLength()) % getTotalLength();
    } while (!getItemFromIndex(newIndex));
    setSelectedIndex(newIndex);
  };

  const downHandler = () => {
    let newIndex = selectedIndex;
    do {
      newIndex = (newIndex + 1) % getTotalLength();
    } while (!getItemFromIndex(newIndex));
    setSelectedIndex(newIndex);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    // Set initial selection to first non-header item
    let initialIndex = users.length > 0 ? 1 : 2;
    setSelectedIndex(initialIndex);
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
    <div className="flex items-center gap-2">
      <Avatar src={item.authorProfile?.profileImage} alt={item.label} size="sm" />
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-medium text-gray-900">{item.label}</span>
          {item.isVerified && <VerifiedBadge size="xs" />}
        </div>
        {item.authorProfile?.headline && (
          <div className="text-xs text-gray-500 truncate">{item.authorProfile.headline}</div>
        )}
      </div>
    </div>
  );

  const renderPaperItem = (item: MentionItem) => (
    <div className="flex items-start gap-2">
      <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-gray-600">
        <FontAwesomeIcon icon={faFileLines} className="h-3 w-3" />
      </div>
      <div className="flex-grow min-w-0">
        <div className="font-medium text-gray-900 line-clamp-2">
          {item.displayName || item.label}
        </div>
        {item.authors && (
          <div className="text-xs text-gray-500 truncate">
            {item.authors.slice(0, 3).join(', ')}
            {item.authors.length > 3 ? ' et al.' : ''}
          </div>
        )}
      </div>
    </div>
  );

  const renderSectionHeader = (title: string) => (
    <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50 border-y border-gray-100">
      {title}
    </div>
  );

  let currentIndex = -1;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-[280px] max-w-[400px] max-h-[400px] overflow-y-auto">
      {users.length > 0 && (
        <div>
          {renderSectionHeader('People')}
          <div>
            {users.map((item, index) => {
              currentIndex++;
              const itemIndex = currentIndex + 1; // Add 1 to account for header
              return (
                <button
                  key={generateUniqueKey(item, index)}
                  className={cn(
                    'w-full px-3 py-1.5 text-left transition-colors duration-150',
                    'group focus:outline-none',
                    itemIndex === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                  )}
                  onClick={() => selectItem(itemIndex)}
                >
                  {renderUserItem(item)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {papers.length > 0 && (
        <div>
          {renderSectionHeader('Papers')}
          <div>
            {papers.map((item, index) => {
              currentIndex++;
              const itemIndex = currentIndex + (users.length > 0 ? 2 : 1); // Add headers
              return (
                <button
                  key={generateUniqueKey(item, index)}
                  className={cn(
                    'w-full px-3 py-1.5 text-left transition-colors duration-150',
                    'group focus:outline-none',
                    itemIndex === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                  )}
                  onClick={() => selectItem(itemIndex)}
                >
                  {renderPaperItem(item)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';
