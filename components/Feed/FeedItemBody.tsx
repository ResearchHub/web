'use client';

import { FC, useState } from 'react';
import { Content, FeedEntry } from '@/types/feed';
import { Button } from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/styles';
import { FeedItemHeader } from './FeedItemHeader';
import { Avatar } from '@/components/ui/Avatar';

interface FeedItemBodyProps {
  content: Content;
  target?: Content;
  context?: Content;
  metrics?: FeedEntry['metrics'];
  contributors?: FeedEntry['contributors'];
  hideTypeLabel?: boolean;
}

const buildUrl = (item: Content) => {
  const title = item.title || '';
  const slug = title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]/g, '');
  return `/work/${item.id}/${slug}`;
};

export const FeedItemBody: FC<FeedItemBodyProps> = ({
  content,
  target,
  context,
  metrics,
  contributors,
  hideTypeLabel,
}) => {
  const [showFundModal, setShowFundModal] = useState(false);
  const [expandedPaperIds, setExpandedPaperIds] = useState<Set<string | number>>(new Set());

  const renderItem = (item: Content, isTarget: boolean = false) => {
    const toggleExpanded = (id: string | number) => {
      setExpandedPaperIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    };

    const itemContent = (() => {
      switch (item.type) {
        case 'paper':
          return renderPaper(item, expandedPaperIds.has(item.id), () => toggleExpanded(item.id));
        default:
          return null;
      }
    })();

    if (!itemContent) return null;

    const getTypeLabel = (type: string) => {
      if (type === 'funding_request') return 'Preregistration';
      else if (type === 'review') return 'Peer Review';
      return type.replace('_', ' ');
    };

    const isCard =
      isTarget || item.type === 'paper' || item.type === 'review' || item.type === 'grant';
    const isComment = item.type === 'comment';

    const renderCard = (children: React.ReactNode) => {
      if (!isCard) return children;

      const cardContent = (
        <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
          {children}
        </div>
      );

      return isCard ? <Link href={buildUrl(item)}>{cardContent}</Link> : cardContent;
    };

    return renderCard(
      <div>
        {!isComment && !hideTypeLabel && (
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
              {getTypeLabel(item.type)}
            </div>
            {item.type === 'paper' && 'journal' in item && item.journal && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border border-gray-200 bg-gray-50 hover:bg-gray-200 transition-colors">
                <Avatar
                  src={item.journal.imageUrl}
                  alt={item.journal.slug}
                  size="xxs"
                  className="ring-1 ring-gray-200"
                />
                <span className="text-gray-700">{item.journal.slug}</span>
              </div>
            )}
          </div>
        )}
        {itemContent}
      </div>
    );
  };

  const renderComment = (comment: Content) => {
    if (comment.type !== 'comment') return null;

    const commentContent = comment.type === 'comment' ? comment.content : '';

    return (
      <div>
        <div className="text-sm text-gray-800">{commentContent}</div>
        {comment.parent ? (
          <div className="mt-2 border p-2 border-gray-200 rounded-lg bg-gray-50 pl-3">
            <div>
              <FeedItemHeader
                action="post"
                timestamp={comment.parent.timestamp}
                content={comment.parent}
                size="xs"
              />
              <div className="ml-8">
                <div className="text-sm text-gray-800">
                  {comment.parent.type === 'comment' ? comment.parent.content : ''}
                </div>
              </div>
            </div>
          </div>
        ) : (
          context && <div className="mt-2">{renderItem(context, true)}</div>
        )}
      </div>
    );
  };

  const renderPaper = (paper: Content, isExpanded: boolean, onToggleExpand: () => void) => {
    if (paper.type !== 'paper') return null;

    const truncateAbstract = (text: string, limit: number = 200) => {
      if (text.length <= limit) return text;
      return text.slice(0, limit).trim() + '...';
    };

    const abstract = paper.abstract || '';
    const isAbstractTruncated = abstract.length > 200;

    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1.5 hover:text-indigo-600">
          {paper.title}
        </h3>
        <div className="text-sm text-gray-800">
          <p>{isExpanded ? abstract : truncateAbstract(abstract)}</p>
          {isAbstractTruncated && (
            <Button
              variant="link"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onToggleExpand();
              }}
              className="flex items-center gap-0.5 mt-1"
            >
              {isExpanded ? 'Show less' : 'Read more'}
              <ChevronDown
                size={14}
                className={cn(
                  'transition-transform duration-200',
                  isExpanded && 'transform rotate-180'
                )}
              />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {renderItem(content)}
      {target && renderItem(target, true)}
    </div>
  );
};
