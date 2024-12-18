'use client'

import { FC, useState } from 'react';
import { feedEntries } from '@/store/feedStore';
import { CommentItem, FeedActionType, FeedEntry, FeedItemType, FundingRequestItem, PaperItem, RewardItem, GrantItem, ReviewItem, ContributionItem } from '@/types/feed';
import { formatTimestamp } from '@/utils/date';
import {
  MessageCircle,
  Repeat,
  Share,
  MoreHorizontal,
  Coins,
  Award,
  FileText,
  ChevronDown,
  Star,
  HandCoins,
  Clock,
  Bookmark,
  ExternalLink,
  ArrowRight,
  Trophy,
  GraduationCap,
} from 'lucide-react';
import { AvatarStack } from './ui/AvatarStack';
import { AuthorList } from './ui/AuthorList'
import { Button } from './ui/Button';
import { assertNever } from '@/utils/assertNever';
import { User } from '@/types/user';
import { FeedTabs } from './FeedTabs';
import { InterestSelector } from './InterestSelector/InterestSelector';
import { PageLayout } from '@/app/layouts/PageLayout';
import toast from 'react-hot-toast';

const TRUNCATE_LIMIT = 280;

const FeedItemHeader: FC<{
  actor: FeedEntry['actor'];
  timestamp: string;
  action: FeedActionType;
  item: FeedItemType;
  isReposted?: boolean;
}> = ({ actor, timestamp, action, item, isReposted }) => {

  const getActionText = () => {
    switch (action) {
      case 'repost':
        return 'Reposted';
      case 'contribute':
        return 'Contributed RSC';
      case 'publish':
        return 'Published';
      case 'post':
        switch (item.type) {
          case 'comment':
            return 'Commented';
          case 'funding_request':
            return 'Started crowdfund';
          case 'reward':
            return 'Opened reward';
          case 'grant':
            return 'Published grant';
          case 'paper':
            return 'Published paper';
          case 'review':
            return 'Reviewed';
          case 'contribution':
            return 'Contributed';
          default:
            return assertNever(item);
        }
      default:
        return assertNever(action);
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'repost':
        return <Repeat className="w-4 h-4 text-gray-500" />;
      case 'contribute':
        return <Coins className="w-4 h-4 text-gray-500" />;
      case 'publish':
        return <FileText className="w-4 h-4 text-gray-500" />;
      case 'post':
        switch (item.type) {
          case 'comment':
            return <MessageCircle className="w-4 h-4 text-gray-500" />;
          case 'funding_request':
            return <HandCoins className="w-4 h-4 text-gray-500" />;
          case 'reward':
            return <Trophy className="w-4 h-4 text-gray-500" />;
          case 'grant':
            return <GraduationCap className="w-4 h-4 text-gray-500" />;
          case 'paper':
            return <FileText className="w-4 h-4 text-gray-500" />;
          case 'review':
            return <Star className="w-4 h-4 text-gray-500" />;
          case 'contribution':
            return <Coins className="w-4 h-4 text-gray-500" />;
          default:
            return assertNever(item);
        }
      default:
        return assertNever(action);
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <img
          src={actor.authorProfile?.profileImage}
          alt={actor.fullName}
          className={`rounded-full ring-2 ring-gray-100 ${isReposted ? 'w-5 h-5' : 'w-10 h-10'}`}
        />
        <div>
          <div className="flex items-center space-x-2">
            <span className={`font-semibold text-gray-900 text-sm`}>
              {actor.fullName}
            </span>
            <span className={`text-gray-500 ${isReposted ? 'text-xs' : 'text-sm'}`}>•</span>
            <span className={`text-gray-500 ${isReposted ? 'text-xs' : 'text-sm'}`}>
              {formatTimestamp(timestamp)}
            </span>
          </div>
          <div className="flex items-center mt-0.5 space-x-2 text-sm">
            <span className="flex items-center space-x-2 text-gray-500">
              {getActionIcon()}
              <span>{getActionText()}</span>
            </span>
          </div>
        </div>
      </div>
      {!isReposted && (
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

const FeedItemBody: FC<{
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

    return (
      <div className="space-y-4">
        <div className={`flex flex-col sm:flex-row ${isRewardOrGrant ? 'justify-between' : ''} sm:items-center gap-4 border-b border-gray-100 pb-4`}>
          <div className="flex items-center gap-2 text-sm">
            <Coins className="w-5 h-5 text-orange-500" />
            <span className="text-orange-500 font-medium">{amount.toLocaleString()} RSC</span>
            {goalAmount && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">raised of {goalAmount.toLocaleString()} RSC goal</span>
              </>
            )}
            {progress && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">{progress}%</span>
              </>
            )}
            {deadline && (
              <>
                <span className="text-gray-500">•</span>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Due {formatTimestamp(deadline)}</span>
                </div>
              </>
            )}
          </div>
          {isRewardOrGrant && users && users.length > 0 && (
            <AvatarStack
              items={users.map(user => ({
                src: user.authorProfile?.profileImage,
                alt: user.fullName,
                tooltip: user.fullName
              }))}
              size="md"
              maxItems={3}
            />
          )}
        </div>

        {progress && (
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
            <AvatarStack
              items={users.map(user => ({
                src: user.authorProfile?.profileImage,
                alt: user.fullName,
                tooltip: user.fullName
              }))}
              size="md"
              maxItems={3}
            />
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

  const renderReward = () => {
    const reward = item as RewardItem;
    const [showFullDescription, setShowFullDescription] = useState(false);
    const description = reward.description || '';
    const shouldTruncate = description.length > TRUNCATE_LIMIT;

    return (
      <div className="space-y-4">
        {renderContentHeader(reward.title)}
        {description && (
          <div className="border-b border-gray-100 pb-4">
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

  const renderGrant = () => {
    const grant = item as GrantItem;
    return (
      <div className="space-y-4">
        {renderContentHeader(grant.title)}
        <div className="border-b border-gray-100 pb-4">
          <p className="text-gray-600 text-sm leading-relaxed">{grant.description}</p>
        </div>
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
            <FeedItemBody
              item={item}
              action="post"
              isReposted={true}
            />
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

const FeedItemActions: FC<{
  metrics: FeedEntry['metrics'];
  item: FeedItemType;
}> = ({ metrics, item }) => {
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm">{metrics?.comments || 0}</span>
      </button>
      <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
        <Repeat className="w-5 h-5" />
        <span className="text-sm">{metrics?.reposts || 0}</span>
      </button>
      <button className="flex items-center space-x-1 text-gray-500 hover:text-orange-500 transition-colors">
        <Bookmark className="w-5 h-5" />
        <span className="text-sm">{metrics?.saves || 0}</span>
      </button>
      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors" title="Open in new tab">
        <ExternalLink className="w-5 h-5" />
      </button>
    </div>
  );
};

const FeedItem: FC<{ entry: FeedEntry }> = ({ entry }) => {
  const { action, actor, timestamp, item, relatedItem, metrics } = entry;
  
  const repostMessage = action === 'repost' 
    ? (entry as { repostMessage?: string }).repostMessage 
    : undefined;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <FeedItemHeader 
          actor={actor} 
          timestamp={timestamp} 
          action={action} 
          item={item} 
        />
        <FeedItemBody 
          item={item} 
          relatedItem={relatedItem} 
          action={action} 
          repostMessage={repostMessage}
        />
        <FeedItemActions metrics={metrics} item={item} />
      </div>
    </div>
  );
};

const Feed3: FC = () => {
  const [showInterests, setShowInterests] = useState(false);
  const [activeInterestTab, setActiveInterestTab] = useState<'journal' | 'person' | 'topic'>('journal');
  const [activeTab, setActiveTab] = useState<'for-you' | 'following' | 'popular' | 'latest'>('for-you');

  const getFeedContent = (): FeedEntry[] => {
    switch (activeTab) {
      case 'for-you':
        return feedEntries; // Original order
      case 'following':
        return [...feedEntries].sort((a, b) => a.actor.fullName.localeCompare(b.actor.fullName));
      case 'popular':
        return [...feedEntries].sort((a, b) => 
          (b.metrics.votes + b.metrics.comments) - 
          (a.metrics.votes + a.metrics.comments)
        );
      case 'latest':
        return [...feedEntries].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      default:
        return feedEntries;
    }
  };

  const handleInterestSelection = async (interests: any[]) => {
    setShowInterests(false);
    toast.success('Your preferences have been updated', {
      duration: 4000,
      position: 'bottom-right',
      style: {
        background: '#F9FAFB',
        color: '#111827',
        border: '1px solid #E5E7EB',
      },
    });
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today in Science</h1>
        <p className="text-gray-600 mt-1">Discover the latest research, grants, earning, and funding opportunities</p>
      </div>

      <FeedTabs 
        showingInterests={showInterests} 
        onInterestsClick={() => setShowInterests(!showInterests)}
        activeInterestTab={activeInterestTab}
        onInterestTabChange={setActiveInterestTab}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {showInterests ? (
        <InterestSelector
          mode="preferences"
          activeTab={activeInterestTab}
          onComplete={handleInterestSelection}
        />
      ) : (
        <div className="max-w-4xl mx-auto">
          {getFeedContent().map((entry) => (
            <FeedItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Feed3; 