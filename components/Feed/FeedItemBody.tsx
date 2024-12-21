'use client'

import { FC, useState } from 'react';
import { FeedActionType, FeedEntry, FeedItemType, CommentItem, FundingRequestItem, RewardItem, GrantItem, PaperItem, ReviewItem, ContributionItem } from '@/types/feed';
import { User } from '@/types/user';
import { Avatar } from '@/components/ui/Avatar';
import {
  ChevronDown,
  Clock,
  Trophy,
  GraduationCap,
  HandCoins,
  FileText,
  MessageCircle,
  Sparkles,
  Award,
  PlayCircle,
} from 'lucide-react';
import { ResearchCoinIcon } from '../ui/icons/ResearchCoinIcon';
import { Button } from '../ui/Button';
import { AuthorList } from '../ui/AuthorList';
import { assertNever } from '@/utils/assertNever';
import { FeedItemHeader } from './FeedItemHeader';
import { AvatarStack } from '../ui/AvatarStack';
import Link from 'next/link';
import { FeedItemDate } from './lib/FeedItemDate';

const TRUNCATE_LIMIT = 280;

// Utility to handle text size scaling based on context
const getTextSize = (
  baseSize: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl', 
  isNested: boolean,
  inCard?: boolean
): string => {
  const sizes = ['xs', 'sm', 'md', 'base', 'lg', 'xl'];
  let currentIndex = sizes.indexOf(baseSize);
  
  // If it's already 'sm' and in a card, don't scale down further
  if (baseSize === 'sm' && inCard) {
    return 'sm';
  }
  
  // Only step down once, either for nesting or card
  if (isNested || inCard) {
    currentIndex = Math.max(1, currentIndex - 1); // Use 1 instead of 0 to prevent scaling below 'sm'
  }
  
  return sizes[currentIndex];
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
  card?: boolean;
}

interface ExpandableTextProps {
  text: string;
  isNested?: boolean;
  baseTextSize?: 'sm' | 'md' | 'base';
  inCard?: boolean;
}

// Shared components
const ContentWrapper: FC<ContentWrapperProps> = ({ children, isNested, className = '', card = false }) => (
  <div className={`
    space-y-3 
    ${isNested ? 'border-gray-200' : ''} 
    ${card ? 'border p-4 rounded-lg' : ''}
    ${className}
  `}>
    {children}
  </div>
);

const ExpandableText: FC<ExpandableTextProps> = ({ 
  text, 
  isNested, 
  baseTextSize = 'base',
  inCard = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text?.length > TRUNCATE_LIMIT;
  const textSize = getTextSize(baseTextSize, Boolean(isNested), inCard);

  if (!text) return null;

  return (
    <div>
      <p className={`text-gray-600 text-${textSize} ${!isExpanded && shouldTruncate ? 'line-clamp-3' : ''}`}>
        {text}
      </p>
      {shouldTruncate && !isExpanded && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="-ml-3 text-blue-500 hover:text-blue-600 h-8"
        >
          <span className="font-medium text-sm">Read more</span>
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
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

  const getRelatedItemIcon = (type: string) => {
    switch (type) {
      case 'paper':
        return FileText;
      case 'comment':
        return MessageCircle;
      case 'funding_request':
        return HandCoins;
      case 'reward':
        return Trophy;
      case 'grant':
        return GraduationCap;
      case 'review':
        return Sparkles;
      case 'contribution':
        return Award;
      default:
        return FileText;
    }
  };

  const renderRelatedItemLink = () => {
    if (!relatedItem || !('type' in relatedItem) || !('title' in relatedItem)) return null;

    const Icon = getRelatedItemIcon(relatedItem.type);

    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-5 hover:bg-gray-100  text-gray-600 hover:text-gray-900 h-8 rounded-md"
        asChild
      >
        <Link href={`/${relatedItem.type}/${relatedItem.slug || ''}`} className="flex items-center gap-1.5 px-2">
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">
            RE: {relatedItem.title}
          </span>
        </Link>
      </Button>
    );
  };

  return (
    <div className="space-y-3">
      {title && (
        typeof title === 'string' ? (
          <h2 className={`font-semibold text-${getTextSize('lg', Boolean(isNested))} text-gray-900`}>
            {title}
          </h2>
        ) : title
      )}
      {relatedItem && renderRelatedItemLink()}
    </div>
  );
};

interface CommentContentProps {
  comment: CommentItem;
  relatedItem?: FeedEntry['relatedItem'];
  isNested?: boolean;
}

const CommentContent: FC<CommentContentProps> = ({ comment, relatedItem, isNested }) => {
  return (
    <ContentWrapper isNested={isNested}>
      <div className="space-y-3">
        <ExpandableText text={comment.content} isNested={isNested} />
        
        {comment.parent && (
          <ContentWrapper isNested={true} card={true}>
            <div className="flex items-start space-x-3">
              <Avatar
                src={comment.parent.user.authorProfile?.profileImage}
                alt={comment.parent.user.fullName}
                size={getAvatarSize('sm', true)}
                className="ring-2 ring-gray-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-x-1.5">
                  <span className={`font-semibold text-gray-900 text-${getTextSize('md', true)}`}>
                    {comment.parent.user.fullName}
                  </span>
                  <span className="text-gray-400">·</span>
                  <FeedItemDate date={comment.parent.timestamp} />
                </div>
                <ExpandableText 
                  text={comment.parent.content} 
                  isNested={true}
                  baseTextSize="md"
                />
              </div>
            </div>
          </ContentWrapper>
        )}
        
        {relatedItem && (
          <ContentHeader relatedItem={relatedItem} isNested={isNested} />
        )}
      </div>
    </ContentWrapper>
  );
};

interface PaperContentProps {
  paper: PaperItem;
  isNested?: boolean;
}

const PaperContent: FC<PaperContentProps> = ({ paper, isNested }) => {
  // Convert paper authors to avatar items
  const authorAvatars = paper.authors?.map(author => ({
    src: author.authorProfile?.profileImage,
    alt: author.fullName,
    tooltip: author.fullName
  })) || [];

  return (
    <ContentWrapper isNested={isNested} card={true}>
      <ContentHeader
        title={
          <h2 className={`font-semibold text-${getTextSize('lg', Boolean(isNested), true)} text-gray-900`}>
            {paper.title}
          </h2>
        }
        isNested={isNested}
      />
      <div className="flex items-center gap-2">
        <AvatarStack 
          items={authorAvatars}
          size="xs"
          maxItems={3}
          label="Authors"
        />
      </div>
      <ExpandableText 
        text={paper.abstract || ''} 
        isNested={isNested}
        baseTextSize="md"
        inCard={true}
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
  userStackLabel = 'Contributors',
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

  const getButtonStyle = () => {
    switch (type) {
      case 'reward':
        return {
          icon: PlayCircle,
          className: "text-indigo-700 hover:text-indigo-800 border-indigo-300 bg-indigo-100 hover:bg-indigo-200 font-medium w-auto"
        };
      default:
        return {
          icon: ResearchCoinIcon,
          className: "text-orange-700 hover:text-orange-800 border-orange-300 bg-orange-100 hover:bg-orange-200 font-medium w-auto"
        };
    }
  };

  const renderAmountSection = () => {
    switch (type) {
      case 'funding_request':
        return (
          <div className={`flex items-center gap-4 text-${textSize}`}>
            <div className="flex items-center gap-2">
              <ResearchCoinIcon size={16} className="text-orange-500" />
              <span className="text-orange-500 font-medium">{amount.toLocaleString()} RSC raised</span>
              {goalAmount && (
                <span className="text-gray-500">of {goalAmount.toLocaleString()} RSC goal</span>
              )}
            </div>
            {deadline && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <FeedItemDate date={deadline} className="text-sm" />
                </div>
              </>
            )}
          </div>
        );
      case 'reward':
        return (
          <div className={`flex items-center gap-4 text-${textSize}`}>
            <div className="flex items-center gap-2">
              <ResearchCoinIcon size={16} className="text-orange-500" />
              <span className="text-orange-500 font-medium">{amount.toLocaleString()} RSC reward</span>
            </div>
            {deadline && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <FeedItemDate date={deadline} className="text-sm" />
                </div>
              </>
            )}
          </div>
        );
      case 'grant':
        return (
          <div className={`flex items-center gap-4 text-${textSize}`}>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-orange-500" />
              <span className="text-orange-500 font-medium">{amount.toLocaleString()} RSC grant</span>
            </div>
            {deadline && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <FeedItemDate date={deadline} className="text-sm" />
                </div>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const buttonStyle = getButtonStyle();

  return (
    <div className="space-y-4">
      <div className={`flex flex-col sm:flex-row ${isRewardOrGrant ? 'justify-between' : ''} sm:items-center gap-4`}>
        <div className="flex items-center gap-4">
          {renderAmountSection()}
        </div>
        {isRewardOrGrant && userAvatars.length > 0 && (
          <AvatarStack 
            items={userAvatars} 
            size={'xs'} 
            maxItems={3}
            label={userStackLabel}
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
          variant="outline"
          size="sm"
          className={buttonStyle.className}
        >
          <buttonStyle.icon className="w-4 h-4 mr-1.5" />
          {ctaText}
        </Button>
        {!isRewardOrGrant && userAvatars.length > 0 && (
          <AvatarStack 
            items={userAvatars} 
            size={'xs'} 
            maxItems={3}
            label={userStackLabel}
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
          <div className="border p-4 rounded-lg">
            {item.type !== 'paper' && (
              <FeedItemHeader
                actor={item.user}
                timestamp={item.timestamp}
                action={action}
                item={item}
                isNested={true}
              />
            )}
            <div>
              {renderItemContent(item, true, relatedItem, true)}
            </div>
          </div>
        </div>
      );
    }

    return renderItemContent(item, isNested, relatedItem);
  };

  const renderItemContent = (
    item: FeedItemType, 
    isNested?: boolean, 
    relatedItem?: FeedEntry['relatedItem'],
    isReposted?: boolean
  ) => {
    switch (item.type) {
      case 'paper':
        return (
          <ContentWrapper 
            isNested={isNested} 
            card={!isReposted}
          >
            <ContentHeader
              title={
                <h2 className={`font-semibold text-${getTextSize('lg', Boolean(isNested), true)} text-gray-900`}>
                  {item.title}
                </h2>
              }
              isNested={isNested}
            />
            <ExpandableText 
              text={item.abstract} 
              isNested={isNested} 
              baseTextSize="sm"
              inCard={true} 
            />
          </ContentWrapper>
        );
      case 'comment':
        return <CommentContent comment={item} relatedItem={relatedItem} isNested={isNested} />;
      case 'funding_request':
        return (
          <ContentWrapper 
            isNested={isNested} 
            card={!isReposted}
          >
            <ContentHeader 
              title={
                <h2 className={`font-semibold text-${getTextSize('lg', Boolean(isNested), true)} text-gray-900`}>
                  {item.title}
                </h2>
              }
              isNested={isNested} 
            />
            <ExpandableText 
              text={item.abstract} 
              isNested={isNested} 
              baseTextSize="sm"
              inCard={true} 
            />
            <ActionFooter
              amount={item.amount}
              icon={HandCoins}
              goalAmount={item.goalAmount}
              progress={item.progress}
              deadline={item.expirationDate}
              ctaText="Contribute"
              users={item.contributors}
              type="funding_request"
              isNested={isNested}
            />
          </ContentWrapper>
        );
      case 'reward':
        return (
          <ContentWrapper 
            isNested={isNested} 
            card={!isReposted}
          >
            <ContentHeader 
              title={
                <h2 className={`font-semibold text-${getTextSize('lg', Boolean(isNested), true)} text-gray-900`}>
                  {item.title}
                </h2>
              }
              isNested={isNested}
            />
            <ExpandableText 
              text={item.abstract} 
              isNested={isNested} 
              baseTextSize="sm"
              inCard={true} 
            />
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
          <ContentWrapper 
            isNested={isNested} 
            card={!isReposted}
          >
            <ContentHeader 
              title={
                <h2 className={`font-semibold text-${getTextSize('lg', Boolean(isNested), true)} text-gray-900`}>
                  {item.title}
                </h2>
              }
              isNested={isNested}
            />
            <ExpandableText 
              text={item.abstract} 
              isNested={isNested} 
              baseTextSize="sm" 
              inCard={true} 
            />
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
        return (
          <ContentWrapper 
            isNested={isNested} 
            card={!isReposted}
          >
            <div className="flex items-center gap-2">
              <ResearchCoinIcon size={16} className="text-orange-500" />
              <span className={`text-orange-500 text-${getTextSize('sm', Boolean(isNested), true)}`}>
                {item.amount.toLocaleString()} RSC
              </span>
            </div>
          </ContentWrapper>
        );
      case 'contribution':
        return renderItemContent(
          item.recipientItem,
          isNested,
          relatedItem,
          false // not reposted
        );
      default:
        return assertNever(item);
    }
  };

  return (
    <div className="mt-3">
      {renderContent()}
    </div>
  );
}; 