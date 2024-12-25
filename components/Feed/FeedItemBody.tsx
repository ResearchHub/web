'use client'

import { FC } from 'react';
import { Content } from '@/types/feed';
import { Button } from '@/components/ui/Button';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Progress } from '@/components/ui/Progress';
import { Star, Clock } from 'lucide-react';
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
}

const getItemUrl = (content: Content) => {
  const title = content.type === 'paper' ? content.title :
               content.type === 'funding_request' ? content.title :
               content.type === 'grant' ? content.title :
               content.type === 'review' ? content.title : '';
  const slug = title?.toLowerCase().replace(/ /g, '-') || content.id;
  return `/${content.type}/${content.id}/${slug}`;
};

export const FeedItemBody: FC<FeedItemBodyProps> = ({ content, target, context }) => {
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
      return type.replace('_', ' ');
    };

    const shouldShowBorder = isTarget || item.type === 'paper';
    const isComment = item.type === 'comment';

    return (
      <div className={cn(
        'rounded-lg',
        shouldShowBorder && 'p-4 border border-gray-200 bg-white',
        isComment && !shouldShowBorder
      )}>
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
    const parentContent = comment.parent?.type === 'comment' ? comment.parent.content : '';

    return (
      <div>
        <div className="text-md text-gray-600">
          {commentContent}
        </div>
        {comment.parent && (
          <div className="mt-3 rounded-lg border p-3 border-gray-200 pl-4">
            <div>
              <FeedItemHeader
                action="post"
                timestamp={comment.parent.timestamp}
                content={comment.parent}
                size="xs"
              />
              <div className="ml-9">
                <div className="text-sm text-gray-600">
                  {parentContent}
                </div>
              </div>
            </div>
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
    const authors = paper.participants?.role === 'author' ? paper.participants.profiles : [];
    
    return (
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-indigo-600">
          {paper.title}
        </h3>
        <p className="text-sm text-gray-600">
          {paper.abstract}
        </p>
      </div>
    );
  };

  const renderFundingRequest = (fundingRequest: Content) => {
    if (fundingRequest.type !== 'funding_request') return null;
    const contributors = fundingRequest.participants?.role === 'contributor' ? fundingRequest.participants.profiles : [];
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
            <span className="text-sm text-gray-600">
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
        <p className="text-sm text-gray-600 mb-3">
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
        <div className="flex justify-between items-center">
          <Button 
            variant="contribute" 
            size="sm" 
          >
            Contribute
          </Button>
          {contributors.length > 0 && (
            <div className="flex items-center ml-4">
              <AvatarStack
                items={contributors.map(profile => ({
                  src: profile.profileImage,
                  alt: profile.fullName,
                  tooltip: profile.fullName
                }))}
                size="xs"
                maxItems={2}
                label='contributors'
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGrant = (grant: Content) => {
    if (grant.type !== 'grant') return null;
    const applicants = grant.participants?.role === 'applicant' ? grant.participants.profiles : [];
    const deadlineText = formatDeadline(grant.deadline);
    
    return (
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-indigo-600">
          {grant.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {grant.abstract}
        </p>
        <div className="flex items-center space-x-4 text-sm">
          {grant.amount && (
            <div className="flex items-center space-x-1">
              <ResearchCoinIcon size={16} color="#F97316" />
              <span className="text-orange-500 font-medium">
                {grant.amount.toLocaleString()} RSC
              </span>
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
        </div>
        <div className="flex items-center justify-between mt-4">
          <Button size="sm" disabled={deadlineText === 'Ended'}>Apply Now</Button>
          {applicants.length > 0 && (
            <div className="flex items-center gap-2">
              <AvatarStack
                items={applicants.map(profile => ({
                  src: profile.profileImage,
                  alt: profile.fullName,
                  tooltip: profile.fullName
                }))}
                size="xs"
                maxItems={2}
              />
              <span className="text-sm text-gray-500">
                {applicants.length} Applicant{applicants.length !== 1 ? 's' : ''}
              </span>
            </div>
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
        <p className="text-sm text-gray-600 mb-3">
          {review.content}
        </p>
        {review.score !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Score:</span>
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
    const participants = bounty.participants?.role === 'contributor' ? bounty.participants.profiles : [];
    
    return (
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-indigo-600">
          <Link href={getItemUrl(bounty)}>{bounty.title}</Link>
        </h3>
        <p className="text-sm text-gray-600 mb-3">
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
              variant="start-task" 
              size="sm" 
            >
              Start Task
            </Button>
            <Button 
              variant="contribute" 
              size="sm" 
            >
              Contribute
            </Button>
          </div>
          {participants.length > 0 && (
            <div className="flex items-center gap-2">
              <AvatarStack
                items={participants.map(profile => ({
                  src: profile.profileImage,
                  alt: profile.fullName,
                  tooltip: profile.fullName
                }))}
                size="xs"
                maxItems={2}
                label='contributors'
              />
            </div>
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