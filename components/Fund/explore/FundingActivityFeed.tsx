'use client';

import { FC } from 'react';
import { FundingActivity, FundingActivityType } from '@/types/fundingActivity';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { cn } from '@/utils/styles';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatTimeAgo } from '@/utils/date';
import { 
  MessageCircle, 
  Star, 
  FileText, 
  DollarSign,
  Activity
} from 'lucide-react';
import Link from 'next/link';

// ─── Activity Type Config ────────────────────────────────────────────────
const activityConfig: Record<FundingActivityType, {
  icon: typeof MessageCircle;
  label: string;
  iconColor: string;
  bgColor: string;
}> = {
  peer_review: {
    icon: Star,
    label: 'Peer Review',
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  comment: {
    icon: MessageCircle,
    label: 'Comment',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  project_update: {
    icon: FileText,
    label: 'Project Update',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  funding_contribution: {
    icon: DollarSign,
    label: 'Contribution',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
};

// ─── Activity Item Component ─────────────────────────────────────────────
interface ActivityItemProps {
  activity: FundingActivity;
}

const ActivityItem: FC<ActivityItemProps> = ({ activity }) => {
  const { showUSD } = useCurrencyPreference();
  const config = activityConfig[activity.type];
  const IconComponent = config.icon;

  const formatAmount = (amount: number) => {
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toLocaleString();
  };

  const getActivityDescription = () => {
    switch (activity.type) {
      case 'peer_review':
        return (
          <span>
            submitted a review
            {activity.reviewScore && (
              <span className="ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                <Star size={10} className="fill-current" />
                {activity.reviewScore}/10
              </span>
            )}
          </span>
        );
      case 'comment':
        return 'left a comment';
      case 'project_update':
        return (
          <span>
            posted an update
            {activity.updateTitle && (
              <span className="block text-gray-600 text-xs mt-0.5 line-clamp-1">
                "{activity.updateTitle}"
              </span>
            )}
          </span>
        );
      case 'funding_contribution':
        return (
          <span>
            contributed{' '}
            <span className="font-semibold text-emerald-600">
              {showUSD
                ? `$${formatAmount(activity.contributionAmount?.usd || 0)}`
                : `${formatAmount(activity.contributionAmount?.rsc || 0)} RSC`}
            </span>
          </span>
        );
      default:
        return 'performed an action';
    }
  };

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
        config.bgColor
      )}>
        <IconComponent size={14} className={config.iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Actor and action */}
        <div className="text-sm">
          <AuthorTooltip authorId={activity.actor.id}>
            <span className="font-medium text-gray-900 hover:text-primary-600 cursor-pointer">
              {activity.actor.fullName}
            </span>
          </AuthorTooltip>
          {' '}
          <span className="text-gray-600">
            {getActivityDescription()}
          </span>
        </div>

        {/* Target (proposal title) */}
        <Link 
          href={`/fund/${activity.targetId}`}
          className="text-xs text-primary-600 hover:text-primary-700 line-clamp-1 mt-0.5 font-medium"
        >
          {activity.targetTitle}
        </Link>

        {/* Comment preview */}
        {activity.type === 'comment' && activity.commentPreview && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">
            "{activity.commentPreview}"
          </p>
        )}

        {/* Timestamp */}
        <span className="text-xs text-gray-400 mt-1 block">
          {formatTimeAgo(activity.createdDate)}
        </span>
      </div>
    </div>
  );
};

// ─── Activity Feed Skeleton ──────────────────────────────────────────────
const ActivityFeedSkeleton: FC = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-3 py-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-2.5 bg-gray-100 rounded w-1/2" />
          <div className="h-2 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Empty State ─────────────────────────────────────────────────────────
const EmptyState: FC = () => (
  <div className="py-8 text-center">
    <Activity size={32} className="mx-auto text-gray-300 mb-3" />
    <p className="text-sm text-gray-500">No recent activity</p>
    <p className="text-xs text-gray-400 mt-1">
      Activity will appear here as proposals receive reviews, comments, and contributions
    </p>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────
interface FundingActivityFeedProps {
  activities: FundingActivity[];
  isLoading?: boolean;
  selectedGrantTitle?: string | null;
  maxItems?: number;
  className?: string;
}

export const FundingActivityFeed: FC<FundingActivityFeedProps> = ({
  activities,
  isLoading = false,
  selectedGrantTitle,
  maxItems = 10,
  className,
}) => {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className={cn('bg-white rounded-xl', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-primary-500" />
          <h3 className="font-semibold text-gray-900 text-sm">
            Funding Updates
          </h3>
        </div>
        {selectedGrantTitle && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-[120px]">
            {selectedGrantTitle}
          </span>
        )}
      </div>

      {/* Activity List */}
      {isLoading ? (
        <ActivityFeedSkeleton />
      ) : displayedActivities.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="divide-y divide-gray-100">
          {displayedActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}

      {/* Show more link */}
      {!isLoading && displayedActivities.length > 0 && activities.length > maxItems && (
        <div className="pt-3 border-t border-gray-100 mt-3">
          <button className="text-xs text-primary-600 hover:text-primary-700 font-medium w-full text-center">
            View all {activities.length} updates
          </button>
        </div>
      )}
    </div>
  );
};
