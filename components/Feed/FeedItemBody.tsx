'use client';

import { FC, useState } from 'react';
import { Content, FeedEntry } from '@/types/feed';
import { Bounty } from '@/types/bounty';
import { Work, WorkType } from '@/types/work';
import { Button } from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/styles';
import { Avatar } from '@/components/ui/Avatar';
import { Journal } from '@/types/journal';
import { useRouter } from 'next/navigation';
import { ExpandableContent } from '@/components/Feed/shared/ExpandableContent';
import { Post } from '@/types/note';

// Type guards to check content type
const isBounty = (content: Content): content is Bounty => {
  return 'bountyType' in content;
};

const isWork = (content: Content): content is Work => {
  return 'contentType' in content;
};

interface FeedItemBodyProps {
  content: Content;
  target?: Content;
  context?: Content;
  metrics?: FeedEntry['metrics'];
  hideTypeLabel?: boolean;
  isLoading?: boolean;
}

const buildUrl = (item: Content) => {
  if (isWork(item)) {
    return `/paper/${item.id}/${item.slug}`;
  } else if (isBounty(item)) {
    return `/bounty/${item.id}`;
  }
  return '#';
};

export const FeedItemBody: FC<FeedItemBodyProps> = ({
  content,
  target,
  context,
  metrics,
  hideTypeLabel,
  isLoading,
}) => {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const renderItem = (item: Content, isTarget: boolean = false) => {
    const toggleExpanded = (id: string | number) => {
      setExpandedItems((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

    const isExpanded = expandedItems[item.id] || false;
    const onToggleExpand = () => toggleExpanded(item.id);

    if (isBounty(item)) {
      return renderBounty(item, isExpanded, onToggleExpand);
    } else if (isWork(item)) {
      if (item.contentType === 'post') {
        return renderPost(item, isExpanded, onToggleExpand);
      } else if (item.contentType === 'paper') {
        return renderPaper(item, isExpanded, onToggleExpand);
      }
    }

    // Fallback for unknown content types
    return <div>Unknown content type</div>;
  };

  const renderCard = (children: React.ReactNode) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">{children}</div>
    );
  };

  const renderBounty = (bounty: Bounty, isExpanded: boolean, onToggleExpand: () => void) => {
    // Render bounty content
    return renderCard(
      <div>
        <h3 className="text-lg font-medium">Bounty: {bounty.amount} RSC</h3>
        <p className="text-gray-600 mt-2">
          Status: {bounty.status}, Type: {bounty.bountyType}
        </p>
      </div>
    );
  };

  const renderPost = (work: Work, isExpanded: boolean, onToggleExpand: () => void) => {
    // Render post content
    return renderCard(
      renderExpandableContent(
        'post',
        work.title,
        work.previewContent || '',
        isExpanded,
        onToggleExpand
      )
    );
  };

  const renderPaper = (work: Work, isExpanded: boolean, onToggleExpand: () => void) => {
    // Render paper content
    return renderCard(
      renderExpandableContent(
        'paper',
        work.title,
        work.abstract || '',
        isExpanded,
        onToggleExpand,
        work.journal
      )
    );
  };

  const renderExpandableContent = (
    type: 'post' | 'paper',
    title: string,
    summary: string,
    isExpanded: boolean,
    onToggleExpand: () => void,
    journal?: Journal
  ) => {
    // Use the ExpandableContent component
    return (
      <div>
        {journal && (
          <div className="flex items-center mt-1 mb-2">
            {journal.imageUrl && (
              <Avatar
                src={journal.imageUrl}
                alt={journal.name}
                size="xs"
                className="mr-2 ring-1 ring-gray-200"
              />
            )}
            <span className="text-sm text-gray-600">{journal.name}</span>
          </div>
        )}
        <ExpandableContent
          title={title}
          content={summary || ''}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          controlled={true}
          isLoading={isLoading}
          titleClassName="text-lg font-medium"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderItem(content)}
      {target && <div className="mt-4">{renderItem(target, true)}</div>}
    </div>
  );
};
