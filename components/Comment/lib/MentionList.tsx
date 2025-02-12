import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '@/utils/styles';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { FileText } from 'lucide-react';
import { Author, AuthorList } from '@/components/ui/AuthorList';

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

  const getItemFromIndex = (index: number): MentionItem | null => {
    const userCount = users.length;
    const hasUserHeader = users.length > 0;
    const hasPaperHeader = papers.length > 0;

    if (hasUserHeader && index === 0) return null;
    if (hasUserHeader && index <= userCount) {
      return users[index - 1];
    }
    if (hasPaperHeader && index === userCount + (hasUserHeader ? 1 : 0)) return null;
    return papers[index - userCount - (hasUserHeader ? 1 : 0) - (hasPaperHeader ? 1 : 0)];
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

  const renderPaperItem = (item: MentionItem) => (
    <div className="flex items-start gap-2.5">
      <div className="mt-[3px]">
        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
      </div>
      <div className="flex-grow min-w-0">
        <div className="text-sm text-gray-900 leading-[1.3]">{item.displayName || item.label}</div>
        {item.authors && (
          <div className="text-xs text-gray-500 mt-0.5">
            <AuthorList
              size="xs"
              className="text-gray-500 font-normal"
              authors={item.authors.map((name) => ({ name }))}
              abbreviated={true}
              delimiter=","
              delimiterClassName="mx-0 mr-1"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderSectionHeader = (title: string) => (
    <div className="px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50/80">{title}</div>
  );

  let currentIndex = -1;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-[320px] max-w-[400px] max-h-[400px] overflow-y-auto">
      {users.length > 0 && (
        <>
          {renderSectionHeader('People')}
          <div>
            {users.map((item, index) => {
              currentIndex++;
              const itemIndex = currentIndex + 1;
              return (
                <button
                  key={generateUniqueKey(item, index)}
                  className={cn(
                    'w-full px-3 py-2 text-left transition-colors duration-150',
                    'focus:outline-none',
                    itemIndex === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                  )}
                  onClick={() => selectItem(itemIndex)}
                >
                  {renderUserItem(item)}
                </button>
              );
            })}
          </div>
        </>
      )}

      {papers.length > 0 && (
        <>
          {renderSectionHeader('Papers')}
          <div>
            {papers.map((item, index) => {
              currentIndex++;
              const itemIndex = currentIndex + (users.length > 0 ? 2 : 1);
              return (
                <button
                  key={generateUniqueKey(item, index)}
                  className={cn(
                    'w-full px-3 py-2 text-left transition-colors duration-150',
                    'focus:outline-none',
                    itemIndex === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                  )}
                  onClick={() => selectItem(itemIndex)}
                >
                  {renderPaperItem(item)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';
