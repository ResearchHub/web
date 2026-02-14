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
  Activity,
  Clock,
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
          <span className="text-gray-600">
            submitted a review
            {activity.reviewScore && (
              <span className="ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold">
                <Star size={10} className="fill-current" />
                {activity.reviewScore}/10
              </span>
            )}
          </span>
        );
      case 'comment':
        return <span className="text-gray-600">left a comment</span>;
      case 'project_update':
        return (
          <span className="text-gray-600">
            posted an update
            {activity.updateTitle && (
              <span className="block text-gray-400 text-[10px] mt-0.5 line-clamp-1 font-medium italic">
                "{activity.updateTitle}"
              </span>
            )}
          </span>
        );
      case 'funding_contribution':
        return (
          <span className="text-gray-600">
            contributed{' '}
            <span className="font-bold text-emerald-600">
              {showUSD
                ? `$${formatAmount(activity.contributionAmount?.usd || 0)}`
                : `${formatAmount(activity.contributionAmount?.rsc || 0)} RSC`}
            </span>
          </span>
        );
      default:
        return <span className="text-gray-600">performed an action</span>;
    }
  };

  return (
    <div className="flex gap-4 py-4 group/item">
      {/* Icon - Minimal Circle */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-gray-100 bg-white shadow-sm transition-colors group-hover/item:border-primary-200'
        )}
      >
        <IconComponent size={14} className="text-gray-400 group-hover/item:text-primary-500" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Actor and action */}
        <div className="text-sm leading-snug">
          <AuthorTooltip authorId={activity.actor.id}>
            <span className="font-bold text-gray-900 hover:text-primary-600 cursor-pointer transition-colors">
              {activity.actor.fullName}
            </span>
          </AuthorTooltip>{' '}
          {getActivityDescription()}
        </div>

        {/* Target (proposal title) */}
        <Link
          href={`/fund/${activity.targetId}`}
          className="text-[11px] text-gray-400 hover:text-primary-500 line-clamp-1 mt-1 font-bold uppercase tracking-wider transition-colors"
        >
          {activity.targetTitle}
        </Link>

        {/* Comment preview */}
        {activity.type === 'comment' && activity.commentPreview && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg border-l-2 border-gray-200">
            <p className="text-xs text-gray-500 line-clamp-2 italic leading-relaxed">
              "{activity.commentPreview}"
            </p>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-1 mt-2">
          <Clock size={10} className="text-gray-300" />
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">
            {formatTimeAgo(activity.createdDate)}
          </span>
        </div>
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
    <div className={cn('bg-white rounded-2xl p-6 shadow-sm border border-gray-100', className)}>
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500">
            <Activity size={16} />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Activity Feed</h3>
        </div>
        {selectedGrantTitle && (
          <div className="mt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-500 bg-primary-50 px-2 py-0.5 rounded">
              {selectedGrantTitle}
            </span>
          </div>
        )}
      </div>

      {/* Activity List */}
      {isLoading ? (
        <ActivityFeedSkeleton />
      ) : displayedActivities.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-1">
          {displayedActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}

      {/* Show more link */}
      {!isLoading && displayedActivities.length > 0 && activities.length > maxItems && (
        <div className="pt-4 mt-2">
          <button className="text-xs text-primary-600 hover:text-primary-700 font-bold w-full py-2 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors">
            View all {activities.length} updates
          </button>
        </div>
      )}
    </div>
  );
};
