'use client';

import { AuthorSummaryStats } from '@/types/authorProfile';
import { User } from '@/types/user';
import { Icon } from '@/components/ui/icons/Icon';

interface ProfileStatsStripProps {
  summaryStats: AuthorSummaryStats;
  profile: User;
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="text-lg font-semibold text-gray-900 leading-none">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

/**
 * Compact stats block (StackOverflow style): large number on top, small label below.
 * Items hide when value is 0.
 */
export function ProfileStatsStrip({ summaryStats, profile }: ProfileStatsStripProps) {
  const hIndex = profile.authorProfile?.hIndex ?? 0;
  const i10 = profile.authorProfile?.i10Index ?? 0;

  const items: React.ReactNode[] = [];

  if (summaryStats.upvotesReceived > 0) {
    items.push(
      <Stat key="upvotes" value={summaryStats.upvotesReceived.toLocaleString()} label="upvotes" />
    );
  }
  if (summaryStats.worksCount > 0) {
    items.push(
      <Stat key="works" value={summaryStats.worksCount.toLocaleString()} label="publications" />
    );
  }
  if (summaryStats.citationCount > 0) {
    items.push(
      <Stat key="citations" value={summaryStats.citationCount.toLocaleString()} label="citations" />
    );
  }
  if (hIndex > 0 || i10 > 0) {
    items.push(<Stat key="h-index" value={`${hIndex} / ${i10}`} label="h / i10 index" />);
  }
  if (summaryStats.amountFunded > 0) {
    items.push(
      <Stat
        key="funded"
        value={
          <span className="flex items-center gap-1">
            <Icon name="gold2" size={16} />
            {summaryStats.amountFunded.toLocaleString()}
          </span>
        }
        label="funded"
      />
    );
  }

  if (items.length === 0) return null;

  return <div className="flex flex-wrap gap-x-6 gap-y-4">{items}</div>;
}
