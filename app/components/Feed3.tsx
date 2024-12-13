'use client'

import { FC, useState } from 'react';
import { feedEntries } from '@/store/feedStore';
import { CommentType, FeedActionType, FeedEntry, FeedItemType, FundingRequestItem, PaperType } from '@/types/feed';
import {
  MessageCircle,
  Repeat,
  Heart,
  Share,
  MoreHorizontal,
  Coins,
  Award,
  FileText,
  ChevronDown,
  Star,
  HandCoins,
} from 'lucide-react';
import { UserStack } from './ui/UserStack';

const FeedItemHeader: FC<{
  actor: FeedEntry['actor'];
  timestamp: string;
  action: FeedActionType;
  item: FeedItemType;
  isReposted?: boolean;
}> = ({ actor, timestamp, action, item, isReposted }) => {

  const getActionText = () => {
    // Special actions that always have the same text
    switch (action) {
      case 'repost':
        return 'Reposted';
      case 'contribute':
        return 'Contributed RSC';
      case 'publish':
        return 'Published';
    }

    // For 'post' action, text depends on item type
    if (action === 'post') {
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
          return 'Posted';
      }
    }

    return 'Posted'; // fallback
  };

  const getActionIcon = () => {
    // Special actions that always have the same icon
    switch (action) {
      case 'repost':
        return <Repeat className="w-4 h-4 text-gray-500" />;
      case 'contribute':
        return <Coins className="w-4 h-4 text-gray-500" />;
      case 'publish':
        return <FileText className="w-4 h-4 text-gray-500" />;
    }

    // For 'post' action, icon depends on item type
    if (action === 'post') {
      switch (item.type) {
        case 'comment':
          return <MessageCircle className="w-4 h-4 text-gray-500" />;
        case 'funding_request':
          return <HandCoins className="w-4 h-4 text-gray-500" />;
        case 'reward':
          return <Award className="w-4 h-4 text-gray-500" />;
        case 'grant':
          return <Award className="w-4 h-4 text-gray-500" />;
        case 'paper':
          return <FileText className="w-4 h-4 text-gray-500" />;
        case 'review':
          return <Star className="w-4 h-4 text-gray-500" />;
        case 'contribution':
          return <Coins className="w-4 h-4 text-gray-500" />;
        default:
          return <FileText className="w-4 h-4 text-gray-500" />;
      }
    }

    return <FileText className="w-4 h-4 text-gray-500" />; // fallback
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <img
          src={actor.profileImage}
          alt={actor.fullName}
          className={`rounded-full ring-2 ring-gray-100 ${isReposted ? 'w-5 h-5' : 'w-10 h-10'}`}
        />
        <div>
          <div className="flex items-center space-x-2">
            <span className={`font-semibold text-gray-900 text-sm`}>
              {actor.fullName}
            </span>
            <span className={`text-gray-500 ${isReposted ? 'text-xs' : 'text-sm'}`}>•</span>
            <span className={`text-gray-500 ${isReposted ? 'text-xs' : 'text-sm'}`}>{timestamp}</span>
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

  const getRelatedItemTitle = (item: FeedItemType | undefined) => {
    if (!item) return '';
    
    if ('title' in item) {
      return item.title;
    }
    
    // For comments, use truncated content as title
    if (item.type === 'comment') {
      return item.content.length > 60 
        ? `${item.content.slice(0, 60)}...` 
        : item.content;
    }
    
    return '';
  };

  const renderComment = () => {
    const comment = item as CommentType;
    return (
      <div className="space-y-4">
        <p className="text-gray-600">{comment.content}</p>
        
        {comment.parent && (
          <div className="pl-4 border-l-2 border-gray-200">
            <div className="flex items-start space-x-3">
              <img
                src={comment.parent.user.profileImage}
                alt={comment.parent.user.fullName}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 text-sm">{comment.parent.user.fullName}</span>
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-500 text-sm">{comment.parent.timestamp}</span>
                </div>
                <p className="text-gray-600 mt-1 text-sm">{comment.parent.content}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFundingRequest = () => {
    const fundingRequest = item as FundingRequestItem;
    return (
      <div className="space-y-3">
        <h2 className="font-semibold text-lg text-gray-900">{fundingRequest.title}</h2>
        <p className="text-gray-600">{fundingRequest.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-gray-500 text-orange-500" />
              <span className="text-orange-500 font-medium">{fundingRequest.amount.toLocaleString()} RSC</span>
              <span>raised of {fundingRequest.goalAmount.toLocaleString()} RSC goal</span>
            </span>
            <span>{fundingRequest.progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${fundingRequest.progress}%` }}
            />
          </div>
          {fundingRequest.contributors && (
            <div className="flex items-center space-x-2">
              <UserStack users={fundingRequest.contributors} limit={3} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPaper = () => {
    const paper = item as PaperType;
    return (
      <div className="space-y-2">
        <h2 className={`font-semibold text-gray-900 ${isReposted ? 'text-base' : 'text-lg'}`}>
          {paper.title}
        </h2>
        <p className={`text-gray-600 ${isReposted ? 'text-sm' : 'text-base'} ${showFullDescription ? '' : 'line-clamp-3'}`}>
          {paper.description}
        </p>
        {!showFullDescription && paper.description?.length > 200 && (
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

    return (
      <>
        {item.type === 'paper' && renderPaper()}
        {item.type === 'funding_request' && renderFundingRequest()}
        {item.type === 'comment' && renderComment()}
      </>
    );
  };

  return (
    <div className="mt-4">
      {relatedItem && (
        <div className="mb-3 text-sm text-gray-500">
          RE: <span className="text-blue-500 hover:underline cursor-pointer">
            {getRelatedItemTitle(relatedItem)}
          </span>
        </div>
      )}
      {renderContent()}
    </div>
  );
};

const FeedItemActions: FC<{
  metrics: FeedEntry['metrics'];
}> = ({ metrics }) => {
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
      <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
        <Heart className="w-5 h-5" />
        <span className="text-sm">{metrics?.votes || 0}</span>
      </button>
      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
        <Share className="w-5 h-5" />
      </button>
    </div>
  );
};

const FeedItem: FC<{ entry: FeedEntry }> = ({ entry }) => {
  const { action, actor, timestamp, item, relatedItem, metrics } = entry;
  
  const repostMessage = action === 'repost' ? 
    (entry as Extract<FeedEntry, { action: 'repost' }>).repostMessage : 
    undefined;

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
        <FeedItemActions metrics={metrics} />
      </div>
    </div>
  );
};

const Feed3: FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      {feedEntries.map((entry) => (
        <FeedItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
};

export default Feed3; 