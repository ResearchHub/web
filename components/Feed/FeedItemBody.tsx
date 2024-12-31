'use client'

import { FC } from 'react';
import { Content, FeedEntry } from '@/types/feed';
import { Button } from '@/components/ui/Button';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Progress } from '@/components/ui/Progress';
import { Star, Clock, FileText } from 'lucide-react';
import { formatDeadline } from '@/utils/date';
import Link from 'next/link';
import { cn } from '@/utils/styles';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { ResearchCoinIcon } from '../ui/icons/ResearchCoinIcon';
import { FeedItemHeader } from './FeedItemHeader';

interface FeedItemBodyProps {
  content: Content;
  target?: Content;
  context?: Content;
  metrics?: FeedEntry['metrics'];
  applicants?: FeedEntry['applicants'];
}

const buildUrl = (item: Content) => {
  const title = item.title || '';
  const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
  return `/${item.type}/${item.id}/${slug}`;
};

export const FeedItemBody: FC<FeedItemBodyProps> = ({ content, target, context, metrics, applicants }) => {
  const renderItem = (item: Content, isTarget: boolean = false) => {
    const itemContent = (() => {
      switch (item.type) {
        case 'paper':
          return renderPaper(item);
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
      if (type === 'funding_request') return 'crowdfund';
      else if (type === 'review') return 'Peer Review';
      return type.replace('_', ' ');
    };

    const isCard = isTarget || item.type === 'paper' || item.type === 'review' || item.type === 'grant';
    const isComment = item.type === 'comment';

    const renderCard = (children: React.ReactNode) => {
      if (!isCard) return children;
      
      const cardContent = (
        <div className="p-4 border border-gray-300 bg-white rounded-md transition-colors duration-150 hover:bg-gray-50">
          {children}
        </div>
      );

      return isCard ? (
        <Link href={buildUrl(item)}>
          {cardContent}
        </Link>
      ) : cardContent;
    };

    return renderCard(
      <div>
        {!isComment && (
          <div className="flex items-center mb-3">
            <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
              {getTypeLabel(item.type)}
            </div>
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
        <div className="text-md text-gray-800">
          {commentContent}
        </div>
        {comment.parent ? (
          <div className="mt-3 rounded-md border p-3 border-gray-300 pl-4">
            <div>
              <FeedItemHeader
                action="post"
                timestamp={comment.parent.timestamp}
                content={comment.parent}
                size="xs"
              />
              <div className="ml-9">
                <div className="text-sm text-gray-800">
                  {comment.parent.type === 'comment' ? comment.parent.content : ''}
                </div>
              </div>
            </div>
          </div>
        ) : context && (
          <div className="mt-3">
            {renderItem(context, true)}
          </div>
        )}
      </div>
    );
  };

  const renderContribution = (contribution: Content) => {
    if (contribution.type !== 'contribution') return null;
    return null;
  };

  const renderPaper = (paper: Content) => {
    if (paper.type !== 'paper') return null;
    
    return (
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-indigo-600">
          {paper.title}
        </h3>
        <p className="text-sm text-gray-800">
          {paper.abstract}
        </p>
      </div>
    );
  };

  const renderFundingRequest = (fundingRequest: Content) => {
    if (fundingRequest.type !== 'funding_request') return null;
    const deadlineText = formatDeadline(fundingRequest.deadline);
    
    const getStatusDisplay = () => {
      switch (fundingRequest.status) {
        case 'COMPLETED':
          return (
            <span className="text-sm text-green-500 font-medium">
              Fundraise Completed
            </span>
          );
        case 'CLOSED':
          return (
            <span className="text-sm text-gray-500 font-medium">
              Fundraise Closed
            </span>
          );
        case 'OPEN':
          return deadlineText === 'Ended' ? (
            <span className="text-sm text-gray-500 font-medium">
              Fundraise Ended
            </span>
          ) : (
            <span className="text-sm text-gray-800">
              {deadlineText}
            </span>
          );
        default:
          return null;
      }
    };

    const progress = fundingRequest.amount && fundingRequest.goalAmount 
      ? (fundingRequest.amount / fundingRequest.goalAmount) * 100
      : 0;
    
    return (
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-indigo-600">
          {fundingRequest.title}
        </h3>
        <p className="text-sm text-gray-800 mb-3">
          {fundingRequest.abstract}
        </p>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ResearchCoinIcon size={16} outlined />
              <span className="text-sm font-medium text-orange-500">
                {fundingRequest.amount.toLocaleString()} RSC raised
              </span>
              <span className="text-sm text-gray-500">
                of {fundingRequest.goalAmount.toLocaleString()} RSC goal
              </span>
            </div>
            {getStatusDisplay()}
          </div>
          <Progress 
            value={progress}
            variant={fundingRequest.status === 'COMPLETED' ? 'success' : 'default'}
            size="xs"
          />
        </div>
      </div>
    );
  };

  const renderGrant = (grant: Content) => {
    if (grant.type !== 'grant') return null;
    const deadlineText = formatDeadline(grant.deadline);
    
    return (
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-indigo-600">
          <Link href={buildUrl(grant)}>{grant.title}</Link>
        </h3>
        <p className="text-sm text-gray-800 mb-3">
          {grant.abstract}
        </p>
        <div className="flex items-center space-x-4 text-sm">
          {grant.amount && (
            <div className="flex items-center space-x-1">
              <RSCBadge 
                amount={grant.amount} 
                variant="inline" 
                showText
              />
            </div>
          )}
          {grant.deadline && (
            <>
              <span className="text-gray-500">•</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className={`text-gray-500 ${deadlineText === 'Ended' ? 'line-through' : ''}`}>
                  {deadlineText}
                </span>
              </div>
            </>
          )}
          {metrics?.applicants && metrics.applicants > 0 && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {metrics.applicants} Applicant{metrics.applicants !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <Button 
            variant="outlined" 
            size="sm" 
            disabled={deadlineText === 'Ended'}
          >
            Start Task
          </Button>
          {metrics?.applicants && metrics.applicants > 0 && applicants && (
            <AvatarStack 
              items={applicants.map(profile => ({
                src: profile.profileImage || '',
                alt: profile.fullName,
                tooltip: profile.fullName
              }))}
              size="xs"
              maxItems={3}
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
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          {review.title}
        </h3>
        <p className="text-sm text-gray-800 mb-3">
          {review.content}
        </p>
        {review.score !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-800">Score:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.score! ? 'text-yellow-500 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
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
        <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-indigo-600">
          <Link href={buildUrl(bounty)}>{bounty.title}</Link>
        </h3>
        <p className="text-sm text-gray-800 mb-3">
          {bounty.description}
        </p>
        <div className="flex items-center space-x-4 text-sm">
          {bounty.amount && (
            <div className="flex items-center space-x-1">
              <RSCBadge 
                amount={bounty.amount} 
                variant="inline" 
                showText
              />
            </div>
          )}
          {bounty.deadline && (
            <>
              <span className="text-gray-500">•</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className={`text-gray-500`}>
                  {deadlineText}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="outlined" 
              size="sm" 
              disabled={deadlineText === 'Ended'}
            >
              Start Task
            </Button>
          </div>
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