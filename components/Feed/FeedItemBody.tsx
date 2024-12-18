'use client'

import { FC, useState } from 'react';
import { FeedActionType, FeedEntry, FeedItemType, CommentItem, FundingRequestItem, RewardItem, GrantItem, PaperItem, ReviewItem, ContributionItem } from '@/types/feed';
import { User } from '@/types/user';
import { formatTimestamp } from '@/utils/date';
import { Avatar } from '@/components/ui/Avatar';
import {
  ChevronDown,
  Coins,
  Clock,
  Trophy,
  GraduationCap,
  HandCoins,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { AuthorList } from '../ui/AuthorList';
import { assertNever } from '@/utils/assertNever';
import { FeedItemHeader } from './FeedItemHeader';
import { AvatarStack } from '../ui/AvatarStack';

const TRUNCATE_LIMIT = 280;

// Utility to handle text size scaling based on context
const getTextSize = (baseSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl', isNested: boolean): string => {
  const sizes = ['xs', 'sm', 'base', 'lg', 'xl'];
  const currentIndex = sizes.indexOf(baseSize);
  return currentIndex > 0 && isNested ? sizes[currentIndex - 1] : baseSize;
};

// Utility to handle avatar size scaling based on context
const getAvatarSize = (baseSize: 'xs' | 'sm' | 'md' | 'lg', isNested: boolean): 'xs' | 'sm' | 'md' | 'lg' => {
  const sizes: ('xs' | 'sm' | 'md' | 'lg')[] = ['xs', 'sm', 'md', 'lg'];
  const currentIndex = sizes.indexOf(baseSize);
  return currentIndex > 0 && isNested ? sizes[currentIndex - 1] : baseSize;
};

// Shared interfaces
interface ContentWrapperProps {
  children: React.ReactNode;
  isNested?: boolean;
  className?: string;
}

interface ExpandableTextProps {
  text: string;
  isNested?: boolean;
  baseTextSize?: 'sm' | 'base';
}

// Shared components
const ContentWrapper: FC<ContentWrapperProps> = ({ children, isNested, className = '' }) => (
  <div className={`space-y-2 ${isNested ? 'pl-4 border-l-2 border-gray-200' : ''} ${className}`}>
    {children}
  </div>
);

const ExpandableText: FC<ExpandableTextProps> = ({ text, isNested, baseTextSize = 'base' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > TRUNCATE_LIMIT;
  const textSize = getTextSize(baseTextSize, Boolean(isNested));

  if (!text) return null;

  return (
    <div>
      <p className={`text-gray-600 text-${textSize} ${!isExpanded && shouldTruncate ? 'line-clamp-3' : ''}`}>
        {text}
      </p>
      {shouldTruncate && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center space-x-1 mt-2"
        >
          <span>Read more</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Main component props
interface FeedItemBodyProps {
  item: FeedItemType;
  relatedItem?: FeedEntry['relatedItem'];
  action: FeedActionType;
  repostMessage?: string;
  isNested?: boolean;
}

// Content components
interface ContentHeaderProps {
  title?: string | JSX.Element;
  relatedItem?: FeedEntry['relatedItem'];
  isNested?: boolean;
}

const ContentHeader: FC<ContentHeaderProps> = ({ title, relatedItem, isNested }) => {
  if (!title && !relatedItem) return null;

  return (
    <div className="space-y-1.5">
      {title && (
        typeof title === 'string' ? (
          <h2 className={`font-semibold text-${getTextSize('lg', Boolean(isNested))} text-gray-900`}>
            {title}
          </h2>
        ) : title
      )}
      {relatedItem && (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            RE: <a href={`/${relatedItem.type}/${relatedItem.slug}`} className="text-blue-500 hover:underline cursor-pointer">
              {relatedItem.title}
            </a>
          </div>
          {'authors' in relatedItem && relatedItem.authors && (
            <AuthorList 
              authors={relatedItem.authors}
              size={isNested ? 'xs' : 'sm'}
              isNested={isNested}
            />
          )}
        </div>
      )}
    </div>
  );
};

interface CommentContentProps {
  comment: CommentItem;
  isNested?: boolean;
}

const CommentContent: FC<CommentContentProps> = ({ comment, isNested }) => {
  return (
    <ContentWrapper isNested={isNested}>
      <ContentHeader relatedItem={comment.parent} isNested={isNested} />
      <ExpandableText text={comment.content} isNested={isNested} />
      
      {comment.parent && (
        <ContentWrapper isNested={true}>
          <div className="flex items-start space-x-3">
            <Avatar
              src={comment.parent.user.authorProfile?.profileImage}
              alt={comment.parent.user.fullName}
              size={getAvatarSize('sm', true)}
              className="ring-2 ring-gray-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-x-1.5">
                <span className={`font-semibold text-gray-900 text-${getTextSize('sm', true)}`}>
                  {comment.parent.user.fullName}
                </span>
                <span className="text-gray-400">·</span>
                <span className={`text-gray-500 text-${getTextSize('sm', true)}`}>
                  {formatTimestamp(comment.parent.timestamp)}
                </span>
              </div>
              <ExpandableText 
                text={comment.parent.content} 
                isNested={true}
                baseTextSize="sm"
              />
            </div>
          </div>
        </ContentWrapper>
      )}
    </ContentWrapper>
  );
};

interface PaperContentProps {
  paper: PaperItem;
  isNested?: boolean;
}

const PaperContent: FC<PaperContentProps> = ({ paper, isNested }) => {
  return (
    <ContentWrapper isNested={isNested}>
      <ContentHeader
        title={
          <h2 className={`font-semibold text-${getTextSize('lg', Boolean(isNested))} text-gray-900`}>
            {paper.title}
          </h2>
        }
        isNested={isNested}
      />
      <ExpandableText 
        text={paper.abstract || ''} 
        isNested={isNested}
        baseTextSize="base"
      />
    </ContentWrapper>
  );
};

interface ActionFooterProps {
  amount: number;
  icon: typeof Trophy | typeof GraduationCap | typeof HandCoins;
  deadline?: string;
  progress?: number;
  goalAmount?: number;
  ctaText: string;
  users?: User[];
  userStackLabel?: string;
  type: 'reward' | 'grant' | 'funding_request';
  isNested?: boolean;
}

const ActionFooter: FC<ActionFooterProps> = ({
  amount,
  icon: Icon,
  deadline,
  progress,
  goalAmount,
  ctaText,
  users,
  userStackLabel,
  type,
  isNested
}) => {
  const isRewardOrGrant = type === 'reward' || type === 'grant';
  const isFundingRequest = type === 'funding_request';
  const textSize = getTextSize('sm', Boolean(isNested));

  const userAvatars = users?.map(user => ({
    src: user.authorProfile?.profileImage,
    alt: user.fullName,
    tooltip: user.fullName
  })) || [];

  return (
    <div className="space-y-4">
      <div className={`flex flex-col sm:flex-row ${isRewardOrGrant ? 'justify-between' : ''} sm:items-center gap-4`}>
        <div className={`flex items-center gap-2 text-${textSize}`}>
          <Coins className="w-5 h-5 text-orange-500" />
          <span className="text-orange-500 font-medium">{amount.toLocaleString()} RSC</span>
          {goalAmount && (
            <span className="text-gray-500">{goalAmount.toLocaleString()} RSC</span>
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
        {isRewardOrGrant && userAvatars.length > 0 && (
          <AvatarStack 
            items={userAvatars} 
            size={isNested ? 'xs' : 'sm'} 
            maxItems={3}
          />
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
          size={isNested ? 'sm' : 'md'}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 w-full sm:w-auto"
        >
          {ctaText}
        </Button>
        {!isRewardOrGrant && userAvatars.length > 0 && (
          <AvatarStack 
            items={userAvatars} 
            size={isNested ? 'xs' : 'sm'} 
            maxItems={3}
          />
        )}
      </div>
    </div>
  );
};

export const FeedItemBody: FC<FeedItemBodyProps> = ({ 
  item, 
  relatedItem, 
  action, 
  repostMessage, 
  isNested 
}) => {
  const renderContent = () => {
    if (action === 'repost') {
      return (
        <div className="space-y-2">
          {repostMessage && (
            <p className="text-gray-600">{repostMessage}</p>
          )}
          <div>
            {item.type !== 'paper' && (
              <FeedItemHeader
                actor={item.user}
                timestamp={item.timestamp}
                action={action}
                item={item}
                isNested={true}
              />
            )}
            <div className="mt-4">
              {renderItemContent(item, true)}
            </div>
          </div>
        </div>
      );
    }

    return renderItemContent(item, isNested);
  };

  const renderItemContent = (item: FeedItemType, isNested?: boolean) => {
    switch (item.type) {
      case 'paper':
        return <PaperContent paper={item} isNested={isNested} />;
      case 'comment':
        return <CommentContent comment={item} isNested={isNested} />;
      case 'funding_request':
        return (
          <ContentWrapper isNested={isNested}>
            <ContentHeader title={item.title} isNested={isNested} />
            <ExpandableText text={item.abstract} isNested={isNested} />
            <ActionFooter
              amount={item.amount}
              icon={HandCoins}
              goalAmount={item.goalAmount}
              progress={item.progress}
              ctaText="Contribute"
              users={item.contributors}
              type="funding_request"
              isNested={isNested}
            />
          </ContentWrapper>
        );
      case 'reward':
        return (
          <ContentWrapper isNested={isNested}>
            <ContentHeader title={item.title} isNested={isNested} />
            <ExpandableText text={item.abstract} isNested={isNested} />
            <ActionFooter
              amount={item.amount}
              icon={Trophy}
              deadline={item.deadline}
              ctaText="Start Task"
              users={item.contributors}
              type="reward"
              isNested={isNested}
            />
          </ContentWrapper>
        );
      case 'grant':
        return (
          <ContentWrapper isNested={isNested}>
            <ContentHeader title={item.title} isNested={isNested} />
            <ExpandableText text={item.abstract} isNested={isNested} baseTextSize="sm" />
            <ActionFooter
              amount={item.amount}
              icon={GraduationCap}
              deadline={item.deadline}
              ctaText="Apply Now"
              users={item.applicants}
              userStackLabel="Applicants"
              type="grant"
              isNested={isNested}
            />
          </ContentWrapper>
        );
      case 'review':
      case 'contribution':
        return (
          <ContentWrapper isNested={isNested}>
            <ContentHeader title={item.title} isNested={isNested} />
            <ExpandableText text={item.abstract} isNested={isNested} />
            <div className="flex items-center gap-2">
              <Coins className={`w-${isNested ? '4' : '5'} h-${isNested ? '4' : '5'} text-orange-500`} />
              <span className={`text-orange-500 text-${getTextSize('sm', Boolean(isNested))}`}>
                {item.amount.toLocaleString()} RSC
              </span>
            </div>
          </ContentWrapper>
        );
      default:
        return assertNever(item);
    }
  };

  return (
    <div className="mt-1.5">
      {renderContent()}
    </div>
  );
}; 