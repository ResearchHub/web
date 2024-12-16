import { FC } from 'react';
import { feedEntries } from '@/store/feedStore';
import { FeedEntry } from '@/types/feed';
import { 
  MessageCircle, 
  Share2, 
  Bookmark, 
  ArrowUpCircle,
  Clock,
  Users,
  Award,
  FileText,
  Coins,
  Reply,
  ChevronRight
} from 'lucide-react';

interface FeedItemProps {
  entry: FeedEntry;
}

const getActionText = (action: string, actor: any) => {
  switch (action) {
    case 'comment':
      return 'commented';
    case 'post':
      return 'posted';
    case 'share':
      return 'shared';
    case 'review':
      return 'reviewed';
    case 'contribute':
      return 'contributed to';
    default:
      return action;
  }
};

const FeedItem: FC<FeedItemProps> = ({ entry }) => {
  const { action, actor, timestamp, item, relatedItem } = entry;

  // Skip rendering if this is a parent comment that will be shown in its reply
  if (item.type === 'comment' && !item.parent && entry.hasReply) {
    return null;
  }

  // Common header section for all feed items
  const Header = () => (
    <div className="flex items-start gap-2">
      <img 
        src={actor.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
        alt={actor.fullName} 
        className="w-8 h-8 rounded-full"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{actor.fullName}</span>
          <span className="text-gray-500">{getActionText(action, actor)}</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-500">{timestamp}</span>
        </div>
        {relatedItem && relatedItem.type === 'paper' && (
          <div className="text-sm text-gray-600 mt-1">
            RE: {relatedItem.title}
          </div>
        )}
      </div>
    </div>
  );

  // Metrics display component
  const Metrics = ({ metrics }: { metrics: any }) => {
    if (!metrics) return null;
    
    return (
      <div className="flex gap-4 text-sm text-gray-600 mt-2">
        {metrics?.votes !== undefined && (
          <button className="flex items-center gap-1 hover:text-blue-600">
            <ArrowUpCircle className="w-4 h-4" />
            <span>{metrics.votes}</span>
          </button>
        )}
        {metrics?.comments !== undefined && (
          <button className="flex items-center gap-1 hover:text-blue-600">
            <MessageCircle className="w-4 h-4" />
            <span>{metrics.comments}</span>
          </button>
        )}
        {metrics?.reposts !== undefined && (
          <button className="flex items-center gap-1 hover:text-blue-600">
            <Share2 className="w-4 h-4" />
            <span>{metrics.reposts}</span>
          </button>
        )}
        {metrics?.saves !== undefined && (
          <button className="flex items-center gap-1 hover:text-blue-600">
            <Bookmark className="w-4 h-4" />
            <span>{metrics.saves}</span>
          </button>
        )}
      </div>
    );
  };

  // Related item component
  const RelatedItem = ({ item }: { item: any }) => (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
      <div className="flex items-center gap-1 text-gray-600 mb-1">
        <ChevronRight className="w-4 h-4" />
        <span>Related {item.type}</span>
      </div>
      <div className="font-medium">{item.title}</div>
      {item.type === 'paper' && item.authors && (
        <div className="mt-1 text-gray-600">
          {item.authors.map(a => a.name).join(', ')}
        </div>
      )}
    </div>
  );

  // Comment-specific component
  const CommentContent = ({ comment }: { comment: any }) => (
    <div className="space-y-3">
      {/* Main comment content */}
      <div className="flex items-start gap-2">
        <div className="relative">
          <img 
            src={actor.avatar} 
            alt={actor.fullName} 
            className="w-8 h-8 rounded-full"
          />
          {comment.parent && (
            <div className="absolute left-1/2 top-8 bottom-0 w-0.5 bg-gray-200 transform -translate-x-1/2" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{actor.fullName}</span>
              <span className="text-gray-500">{getActionText(action, actor)}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">{timestamp}</span>
            </div>
            {relatedItem && relatedItem.type === 'paper' && (
              <div className="text-sm text-gray-600">
                RE: {relatedItem.title}
              </div>
            )}
          </div>
          <div className="mt-2">
            <p className="text-gray-800">{comment.content}</p>
          </div>
        </div>
      </div>

      {/* Parent comment */}
      {comment.parent && (
        <div className="ml-10">
          <div className="flex items-start gap-2">
            <img 
              src={comment.parent.user.avatar} 
              alt={comment.parent.user.fullName}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <span className="font-medium">{comment.parent.user.fullName}</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">{comment.parent.timestamp}</span>
              </div>
              <p className="text-gray-700">{comment.parent.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* Show metrics only once at the bottom of the thread */}
      <div className="mt-2">
        <Metrics metrics={comment.metrics} />
      </div>
    </div>
  );

  // Funding/Reward amount display
  const AmountDisplay = ({ amount, goalAmount, progress }: { amount: number, goalAmount?: number, progress?: number }) => (
    <div className="flex items-center gap-2 text-sm">
      <Coins className="w-4 h-4 text-yellow-500" />
      <span className="font-medium">{amount.toLocaleString()} RSC</span>
      {goalAmount && (
        <>
          <span className="text-gray-500">of {goalAmount.toLocaleString()} RSC</span>
          <div className="w-20 h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="p-4 border-b hover:bg-gray-50 transition-colors">
      <Header />
      
      <div className="mt-3 ml-13">
        {/* Scientific Work */}
        {item.type === 'paper' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{item.title}</span>
            </div>
            {item.authors && (
              <div className="text-sm text-gray-600 mt-1 mb-2">
                {item.authors.map(a => a.name).join(', ')}
              </div>
            )}
            <p className="text-sm text-gray-600">{item.description}</p>
            {item.metrics && <Metrics metrics={item.metrics} />}
          </div>
        )}

        {/* Comment */}
        {item.type === 'comment' && (
          <div>
            <CommentContent comment={item} />
            {item.metrics && <Metrics metrics={item.metrics} />}
          </div>
        )}

        {/* Reward */}
        {item.type === 'reward' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="font-medium">{item.title}</span>
            </div>
            <p className="text-sm text-gray-600">{item.description}</p>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <AmountDisplay amount={item.amount} />
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{item.deadline}</span>
              </div>
            </div>
            {item.metrics && <Metrics metrics={item.metrics} />}
          </div>
        )}

        {/* Grant */}
        {item.type === 'grant' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-green-500" />
              <span className="font-medium">{item.title}</span>
            </div>
            <p className="text-sm text-gray-600">{item.description}</p>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <AmountDisplay amount={item.amount} />
              {item.applicants && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{item.applicants.length} applicants</span>
                </div>
              )}
            </div>
            {item.metrics && <Metrics metrics={item.metrics} />}
          </div>
        )}

        {/* Funding Request */}
        {item.type === 'funding_request' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{item.title}</span>
            </div>
            <p className="text-sm text-gray-600">{item.description}</p>
            <div className="mt-2">
              <AmountDisplay 
                amount={item.amount} 
                goalAmount={item.goalAmount} 
                progress={item.progress} 
              />
            </div>
            {item.contributors && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {item.contributors.slice(0, 3).map((contributor, i) => (
                    <img 
                      key={i}
                      src={contributor.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                      alt={contributor.fullName}
                      className="w-6 h-6 rounded-full border-2 border-white"
                    />
                  ))}
                </div>
                {item.contributors.length > 3 && (
                  <span className="text-sm text-gray-600">
                    +{item.contributors.length - 3} more
                  </span>
                )}
              </div>
            )}
            {item.metrics && <Metrics metrics={item.metrics} />}
          </div>
        )}

        {/* Contribution */}
        {item.type === 'contribution' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{item.title}</span>
            </div>
            <p className="text-sm text-gray-600">{item.description}</p>
            <AmountDisplay amount={item.amount} />
            {item.metrics && <Metrics metrics={item.metrics} />}
          </div>
        )}
      </div>

      {/* Show related item at the bottom */}
      {relatedItem && item.type !== 'comment' && (
        <div className="mt-3">
          <RelatedItem item={relatedItem} />
        </div>
      )}
    </div>
  );
};

const Feed2: FC = () => {
  return (
    <div className="max-w-2xl mx-auto divide-y">
      {feedEntries.map(entry => (
        <FeedItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
};

export default Feed2; 