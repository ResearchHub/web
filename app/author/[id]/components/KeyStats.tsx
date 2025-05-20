import { Icon } from '@/components/ui/icons/Icon';
import { AuthorSummaryStats } from '@/types/authorProfile';
import { User } from '@/types/user';

export function KeyStatsSkeleton() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      {/* Upvotes received */}
      <div className="flex items-center gap-1.5">
        <span className="font-medium bg-gray-200 rounded w-28 h-4 animate-pulse" />
        <span className="bg-gray-200 rounded w-10 h-4 animate-pulse" />
      </div>
      {/* Publications */}
      <div className="flex items-center gap-1.5">
        <span className="font-medium bg-gray-200 rounded w-20 h-4 animate-pulse" />
        <span className="bg-gray-200 rounded w-16 h-4 animate-pulse" />
      </div>
      {/* Cited by */}
      <div className="flex items-center gap-1.5">
        <span className="font-medium bg-gray-200 rounded w-16 h-4 animate-pulse" />
        <span className="bg-gray-200 rounded w-10 h-4 animate-pulse" />
      </div>
      {/* h-index / i10-index */}
      <div className="flex items-center gap-1.5">
        <span className="font-medium bg-gray-200 rounded w-12 h-4 animate-pulse" />
        <span className="bg-gray-200 rounded w-8 h-4 animate-pulse" />
        <span className="text-gray-400 bg-gray-200 rounded w-4 h-4 animate-pulse" />
        <span className="font-medium bg-gray-200 rounded w-14 h-4 animate-pulse" />
        <span className="bg-gray-200 rounded w-8 h-4 animate-pulse" />
      </div>
      {/* Amount funded */}
      <div className="flex items-center gap-1.5">
        <span className="font-medium bg-gray-200 rounded w-24 h-4 animate-pulse" />
        <span className="flex items-center gap-1">
          <span className="bg-gray-200 rounded-full w-5 h-5 animate-pulse" />
          <span className="bg-gray-200 rounded w-12 h-4 animate-pulse" />
        </span>
      </div>
    </div>
  );
}

interface KeyStatsProps {
  summaryStats: AuthorSummaryStats;
  profile: User;
  isLoading: boolean;
}

export default function KeyStats({ summaryStats, profile, isLoading }: KeyStatsProps) {
  if (isLoading) {
    return <KeyStatsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-1.5">
        <span className="font-medium">Upvotes received:</span>
        <span>{summaryStats.upvotesReceived}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="font-medium">Publications:</span>
        <span>
          {summaryStats.worksCount.toLocaleString()}
          {summaryStats.worksCount > 0 && (
            <span className="text-gray-500 ml-1">({summaryStats.openAccessPct}% Open Access)</span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="font-medium">Cited by:</span>
        <span>{summaryStats.citationCount.toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="font-medium">h-index:</span>
        <span>{profile.authorProfile?.hIndex || 0}</span>
        <span className="text-gray-400">/</span>
        <span className="font-medium">i10-index:</span>
        <span>{profile.authorProfile?.i10Index || 0}</span>
      </div>

      {summaryStats.amountFunded > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="font-medium">Amount funded:</span>
          <span className="flex items-center gap-1">
            <Icon name="gold2" size={18} />
            {summaryStats.amountFunded.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
