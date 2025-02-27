'use client';

import { FC, useState } from 'react';
import { Bounty, Content, FeedEntry, Paper, Post } from '@/types/feed';
import { Button } from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/styles';
import { Avatar } from '@/components/ui/Avatar';
import { Journal } from '@/types/journal';
import { useRouter } from 'next/navigation';

interface FeedItemBodyProps {
  content: Content;
  target?: Content;
  context?: Content;
  metrics?: FeedEntry['metrics'];
  hideTypeLabel?: boolean;
}

const buildUrl = (item: Content) => {
  const title = item.title || '';
  const slug = title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]/g, '');
  return `/${item.type}/${item.id}/${slug}`;
};

export const FeedItemBody: FC<FeedItemBodyProps> = ({
  content,
  target,
  context,
  metrics,
  hideTypeLabel,
}) => {
  const router = useRouter();
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
        case 'bounty':
          return renderBounty(item, expandedPaperIds.has(item.id), () => toggleExpanded(item.id));
        case 'paper':
          return renderPaper(item, expandedPaperIds.has(item.id), () => toggleExpanded(item.id));
        case 'post':
          return renderPost(item, expandedPaperIds.has(item.id), () => toggleExpanded(item.id));
        default:
          return null;
      }
    })();

    if (!itemContent) return null;

    const isCard =
      isTarget || item.type === 'bounty' || item.type === 'paper' || item.type === 'post';

    const renderCard = (children: React.ReactNode) => {
      if (!isCard) return children;

      const cardContent = (
        <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
          {children}
        </div>
      );

      return isCard ? <Link href={buildUrl(item)}>{cardContent}</Link> : cardContent;
    };

    return renderCard(<div>{itemContent}</div>);
  };

  const renderBounty = (bounty: Bounty, isExpanded: boolean, onToggleExpand: () => void) => {
    if (bounty.paper) {
      return renderPaper(bounty.paper, isExpanded, onToggleExpand);
    }
    return <div>An amount of {bounty.amount} has been added to the bounty.</div>;
  };

  const renderPost = (post: Post, isExpanded: boolean, onToggleExpand: () => void) => {
    return renderExpandableContent(
      'post',
      post.title ?? '',
      post.summary || '',
      isExpanded,
      onToggleExpand
    );
  };

  const renderPaper = (paper: Paper, isExpanded: boolean, onToggleExpand: () => void) => {
    return renderExpandableContent(
      'paper',
      paper.title ?? '',
      paper.abstract || '',
      isExpanded,
      onToggleExpand,
      paper.journal
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
    const truncateSummary = (summary: string, limit: number = 200) => {
      if (summary.length <= limit) return summary;
      return summary.slice(0, limit).trim() + '...';
    };

    const isSummaryTruncated = summary.length > 200;

    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
            {type}
          </div>
          {journal && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border border-gray-200 bg-gray-50 hover:bg-gray-200 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/journal/${journal.slug}`);
              }}
            >
              <div className="flex items-center gap-1.5">
                <Avatar
                  src={journal.imageUrl}
                  alt={journal.slug}
                  size="xxs"
                  className="ring-1 ring-gray-200"
                />
                <span className="text-gray-700">{journal.name}</span>
              </div>
            </div>
          )}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1.5 hover:text-indigo-600">
          {title}
        </h3>
        <div className="text-sm text-gray-800">
          <p>{isExpanded ? summary : truncateSummary(summary)}</p>
          {isSummaryTruncated && (
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
