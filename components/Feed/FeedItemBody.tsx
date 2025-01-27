'use client';

import { FC, useState } from 'react';
import { Content, FeedEntry } from '@/types/feed';
import { Button } from '@/components/ui/Button';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Progress } from '@/components/ui/Progress';
import { Star, Clock, FileText, Plus, FileUp, ChevronDown, Beaker } from 'lucide-react';
import { formatDeadline } from '@/utils/date';
import Link from 'next/link';
import { cn } from '@/utils/styles';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { ResearchCoinIcon } from '../ui/icons/ResearchCoinIcon';
import { FeedItemHeader } from './FeedItemHeader';
import { ContributorsButton } from '../ui/ContributorsButton';
import { Avatar } from '@/components/ui/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHexagonImage, faPlus } from '@fortawesome/pro-solid-svg-icons';
import { FundResearchModal } from '../modals/FundResearchModal';
import { FundItem } from '../Fund/FundItem';

interface FeedItemBodyProps {
  content: Content;
  target?: Content;
  context?: Content;
  metrics?: FeedEntry['metrics'];
  applicants?: FeedEntry['applicants'];
  contributors?: FeedEntry['contributors'];
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
  applicants,
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
        case 'funding_request':
          return renderFundingRequest(item);
        case 'grant':
          return renderGrant(item);
        case 'bounty':
          return renderBounty(item);
        case 'review':
          return renderReview(item);
        case 'contribution':
          return renderContribution(item);
        case 'comment':
          return renderComment(item);
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
                  src={item.journal.image}
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

  const renderContribution = (contribution: Content) => {
    if (contribution.type !== 'contribution') return null;
    return null;
  };

  const renderPaper = (paper: Content, isExpanded: boolean, onToggleExpand: () => void) => {
    if (paper.type !== 'paper') return null;

    const truncateAbstract = (text: string, limit: number = 200) => {
      if (text.length <= limit) return text;
      return text.slice(0, limit).trim() + '...';
    };

    const isAbstractTruncated = paper.abstract.length > 200;

    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1.5 hover:text-indigo-600">
          {paper.title}
        </h3>
        <div className="text-sm text-gray-800">
          <p>{isExpanded ? paper.abstract : truncateAbstract(paper.abstract)}</p>
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

  const renderFundingRequest = (fundingRequest: Content) => {
    if (fundingRequest.type !== 'funding_request') return null;

    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1.5 hover:text-indigo-600">
          {fundingRequest.title}
        </h3>
        <p className="text-sm text-gray-800 mb-2">{fundingRequest.abstract}</p>
        <FundItem
          title={fundingRequest.title}
          status={fundingRequest.status}
          amount={fundingRequest.amount}
          goalAmount={fundingRequest.goalAmount}
          deadline={fundingRequest.deadline}
          nftRewardsEnabled={false}
          contributors={contributors?.map((contributor) => ({
            profile: contributor.profile,
            amount: contributor.amount,
          }))}
          variant="compact"
        />
      </div>
    );
  };

  const renderGrant = (grant: Content) => {
    if (grant.type !== 'grant') return null;
    const deadlineText = formatDeadline(grant.deadline);

    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1.5 hover:text-indigo-600">
          {grant.title}
        </h3>
        <p className="text-sm text-gray-800 mb-2">{grant.abstract}</p>
        <div className="flex items-center gap-3 text-xs">
          {grant.amount && <RSCBadge amount={grant.amount} variant="inline" showText />}
          {grant.deadline && (
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{deadlineText}</span>
            </div>
          )}
          {metrics?.applicants && metrics.applicants > 0 && (
            <span className="text-gray-500">
              {metrics.applicants} Applicant{metrics.applicants !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <Button variant="secondary" size="sm" disabled={deadlineText === 'Ended'}>
            Start Task
          </Button>
          {metrics?.applicants && metrics.applicants > 0 && applicants && (
            <ContributorsButton
              contributors={applicants.map((profile) => ({
                profile,
                amount: 0,
              }))}
              onContribute={() => {}}
            />
          )}
        </div>
      </div>
    );
  };

  const renderReview = (review: Content) => {
    if (review.type !== 'review') return null;
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{review.title}</h3>
        <p className="text-sm text-gray-800 mb-2">{review.content}</p>
        {review.score !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-800">Score:</span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < review.score! ? 'text-yellow-500 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-xs font-medium text-orange-500">
              Get paid to become a peer reviewer
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderBounty = (bounty: Content) => {
    if (bounty.type !== 'bounty') return null;
    const deadlineText = formatDeadline(bounty.deadline);

    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1.5 hover:text-indigo-600">
          {bounty.title}
        </h3>
        <p className="text-sm text-gray-800 mb-2">{bounty.description}</p>
        <div className="flex items-center gap-3 text-xs">
          {bounty.amount && <RSCBadge amount={bounty.amount} variant="inline" showText />}
          {bounty.deadline && (
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{deadlineText}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <Button variant="start-task" size="sm" disabled={deadlineText === 'Ended'}>
            Start Task
          </Button>
          {contributors && contributors.length > 0 && (
            <ContributorsButton contributors={contributors} onContribute={() => {}} />
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
