import { Icon } from '@/components/ui/icons/Icon';
import { AuthorSummaryStats } from '@/types/authorProfile';
import { User } from '@/types/user';

interface AuthorHeaderKeyStatsProps {
  summaryStats: AuthorSummaryStats;
  profile: User;
}

export default function AuthorHeaderKeyStats({ summaryStats, profile }: AuthorHeaderKeyStatsProps) {
  return (
    <div className="flex flex-col gap-2.5 text-sm">
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
