'use client'

import { FC, useState } from 'react';
import { FeedActionType, FeedEntry, FeedItemType, CommentItem, FundingRequestItem, RewardItem, GrantItem, PaperItem, ReviewItem, ContributionItem } from '@/types/feed';
import { User } from '@/types/user';
import { formatTimestamp } from '@/utils/date';
import {
  ChevronDown,
  Coins,
  Clock,
  Trophy,
  GraduationCap,
  HandCoins,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { UserStack } from '../ui/UserStack';
import { AuthorList } from '../ui/AuthorList';
import { assertNever } from '@/utils/assertNever';
import { FeedItemHeader } from './FeedItemHeader';

const TRUNCATE_LIMIT = 280;

export const FeedItemBody: FC<{
  item: FeedItemType;
  relatedItem?: FeedEntry['relatedItem'];
  action: FeedActionType;
  repostMessage?: string;
  isReposted?: boolean;
}> = ({ item, relatedItem, action, repostMessage, isReposted }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const renderContentHeader = (title?: string) => {
    return (
      <div className="space-y-2">
        {title && (
          <h2 className="font-semibold text-lg text-gray-900">{title}</h2>
        )}
        {relatedItem?.slug && relatedItem?.title && (
          <div className="text-sm text-gray-500">
            RE: <a href={`/${relatedItem.type}/${relatedItem.slug}`} className="text-blue-500 hover:underline cursor-pointer">
              {relatedItem.title}
            </a>
          </div>
        )}
      </div>
    );
  };

  const renderComment = (comment: CommentItem) => {
    const [showFullContent, setShowFullContent] = useState(false);
    const shouldTruncate = comment.content.length > TRUNCATE_LIMIT;

    return (
      <div className="space-y-4">
        {renderContentHeader()}
        <div>
          <p className={`text-gray-600 ${!showFullContent && shouldTruncate ? 'line-clamp-3' : ''}`}>
            {comment.content}
          </p>
          {shouldTruncate && !showFullContent && (
            <button
              onClick={() => setShowFullContent(true)}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center space-x-1 mt-2"
            >
              <span>Read more</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {comment.parent && (
          <div className="pl-4 border-l-2 border-gray-200">
            <div className="flex items-start space-x-3">
              <img
                src={comment.parent.user.authorProfile?.profileImage}
                alt={comment.parent.user.fullName}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 text-sm">{comment.parent.user.fullName}</span>
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-500 text-sm">{formatTimestamp(comment.parent.timestamp)}</span>
                </div>
                <p className="text-gray-600 mt-1 text-sm">{comment.parent.content}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActionFooter = ({
    amount,
    icon: Icon,
    deadline,
    progress,
    goalAmount,
    ctaText,
    users,
    userStackLabel,
    type,
  }: {
    amount: number;
    icon: typeof Trophy | typeof GraduationCap | typeof HandCoins;
    deadline?: string;
    progress?: number;
    goalAmount?: number;
    ctaText: string;
    users?: User[];
    userStackLabel?: string;
    type: 'reward' | 'grant' | 'funding_request';
  }) => {
    const isRewardOrGrant = type === 'reward' || type === 'grant';
    const isFundingRequest = type === 'funding_request';

    return (
      <div className="space-y-4">
        <div className={`flex flex-col sm:flex-row ${isRewardOrGrant ? 'justify-between' : ''} sm:items-center gap-4`}>
          <div className="flex items-center gap-2 text-sm">
            <Coins className="w-5 h-5 text-orange-500" />
            <span className="text-orange-500 font-medium">{amount.toLocaleString()} RSC</span>
            {goalAmount && (
              <span className="text-gray-500 text-sm">of {goalAmount.toLocaleString()} RSC</span>
            )}
            {deadline && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Due {formatTimestamp(deadline)}</span>
                </div>
              </>
            )}
          </div>
          {isRewardOrGrant && users && users.length > 0 && (
            <UserStack users={users} limit={3} descriptiveText={userStackLabel} />
          )}
        </div>

        {progress && isFundingRequest && (
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className={`flex ${isRewardOrGrant ? '' : 'flex-col-reverse sm:flex-row sm:justify-between sm:items-center'} gap-4`}>
          <Button 
            variant="default"
            size="default"
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 w-full sm:w-auto"
          >
            {ctaText}
          </Button>
          {!isRewardOrGrant && users && users.length > 0 && (
            <UserStack users={users} limit={3} descriptiveText={userStackLabel} />
          )}
        </div>
      </div>
    );
  };

  const renderFundingRequest = () => {
    const fundingRequest = item as FundingRequestItem;
    return (
      <div className="space-y-4">
        {renderContentHeader(fundingRequest.title)}
        <div className="border-b border-gray-100 pb-4">
          <p className="text-gray-600 text-sm leading-relaxed">{fundingRequest.description}</p>
        </div>
        {renderActionFooter({
          amount: fundingRequest.amount,
          icon: HandCoins,
          goalAmount: fundingRequest.goalAmount,
          progress: fundingRequest.progress,
          ctaText: 'Contribute',
          users: fundingRequest.contributors,
          type: 'funding_request',
        })}
      </div>
    );
  };

  const renderGrant = () => {
    const grant = item as GrantItem;
    return (
      <div className="space-y-4">
        {renderContentHeader(grant.title)}
        <p className="text-gray-600 text-sm leading-relaxed">{grant.description}</p>
        {renderActionFooter({
          amount: grant.amount,
          icon: GraduationCap,
          deadline: grant.deadline,
          ctaText: 'Apply Now',
          users: grant.applicants,
          userStackLabel: 'Applicants',
          type: 'grant',
        })}
      </div>
    );
  };

  const renderReward = () => {
    const reward = item as RewardItem;
    const [showFullDescription, setShowFullDescription] = useState(false);
    const description = reward.description || '';
    const shouldTruncate = description.length > TRUNCATE_LIMIT;

    return (
      <div className="space-y-4">
        {renderContentHeader(reward.title)}
        {description && (
          <div>
            <p className={`text-gray-600 text-sm leading-relaxed ${!showFullDescription && shouldTruncate ? 'line-clamp-3' : ''}`}>
              {description}
            </p>
            {shouldTruncate && !showFullDescription && (
              <button
                onClick={() => setShowFullDescription(true)}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center space-x-1 mt-2"
              >
                <span>Read more</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        {renderActionFooter({
          amount: reward.amount,
          icon: Trophy,
          deadline: reward.deadline,
          ctaText: 'Start Task',
          users: reward.contributors,
          type: 'reward',
        })}
      </div>
    );
  };

  const renderPaper = () => {
    const paper = item as PaperItem;
    const description = paper.description || '';
    const shouldTruncate = description.length > TRUNCATE_LIMIT;
    const formattedTimestamp = paper.timestamp.includes('ago') ? paper.timestamp : formatTimestamp(paper.timestamp);

    return (
      <div className="space-y-3">
        {renderContentHeader(paper.title)}
        <AuthorList 
          authors={paper.authors || []}
          size={isReposted ? 'sm' : 'base'} 
          timestamp={formattedTimestamp}
        />
        <p className={`text-gray-600 ${isReposted ? 'text-sm' : 'text-base'} ${showFullDescription ? '' : 'line-clamp-3'}`}>
          {description}
        </p>
        
        {!showFullDescription && shouldTruncate && (
          <button
            onClick={() => setShowFullDescription(true)}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center space-x-1"
          >
            <span>Read more</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  const renderReview = () => {
    const review = item as ReviewItem;
    return (
      <div className="space-y-3">
        {renderContentHeader(review.title)}
        {review.description && (
          <p className="text-gray-600">{review.description}</p>
        )}
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-orange-500" />
          <span className="text-orange-500 text-sm">{review.amount.toLocaleString()} RSC</span>
        </div>
      </div>
    );
  };

  const renderContribution = () => {
    const contribution = item as ContributionItem;
    return (
      <div className="space-y-3">
        {renderContentHeader(contribution.title)}
        {contribution.description && (
          <p className="text-gray-600">{contribution.description}</p>
        )}
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-orange-500" />
          <span className="text-orange-500 text-sm">{contribution.amount.toLocaleString()} RSC</span>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (action === 'repost') {
      return (
        <div className="space-y-4">
          {repostMessage && (
            <p className="text-gray-600">{repostMessage}</p>
          )}
          <div className="pl-4 border-l-2 border-gray-200">
            {item.type !== 'paper' && (
              <FeedItemHeader
                actor={item.user}
                timestamp={item.timestamp}
                action={action}
                item={item}
                isReposted={true}
              />
            )}
            <div className="mt-4">
              {item.type === 'paper' ? renderPaper() :
               item.type === 'funding_request' ? renderFundingRequest() :
               item.type === 'comment' ? renderComment(item) :
               item.type === 'reward' ? renderReward() :
               item.type === 'grant' ? renderGrant() :
               item.type === 'review' ? renderReview() :
               item.type === 'contribution' ? renderContribution() :
               assertNever(item)}
            </div>
          </div>
        </div>
      );
    }

    switch (item.type) {
      case 'paper':
        return renderPaper();
      case 'funding_request':
        return renderFundingRequest();
      case 'comment':
        return renderComment(item);
      case 'reward':
        return renderReward();
      case 'grant':
        return renderGrant();
      case 'review':
        return renderReview();
      case 'contribution':
        return renderContribution();
      default:
        return assertNever(item);
    }
  };

  return (
    <div className="mt-4">
      {renderContent()}
    </div>
  );
}; 