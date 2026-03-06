import { cn } from '@/utils/styles';

type EarnTab = 'awards' | 'reviews';

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd)}`;
}

interface EarnSectionCardsProps {
  activeTab: EarnTab;
  onTabChange: (tab: EarnTab) => void;
  openGrantCount: number;
  totalFundingUsd: number;
  bountyTotal: number;
}

export function EarnSectionCards({
  activeTab,
  onTabChange,
  openGrantCount,
  totalFundingUsd,
  bountyTotal,
}: EarnSectionCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 mb-10">
      <button
        onClick={() => onTabChange('awards')}
        className={cn(
          'rounded-xl border p-4 text-left transition-all',
          activeTab === 'awards'
            ? 'border-indigo-300 bg-indigo-50/40 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-base">🏆</span>
            <h3 className="text-[15px] font-semibold text-gray-900">Awards</h3>
          </div>
          {openGrantCount > 0 && (
            <span className="text-xs font-medium text-green-700 bg-green-50 rounded-full px-2 py-0.5">
              {openGrantCount} open
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-2">
          Submit proposals to compete for pooled community funding
        </p>
        {totalFundingUsd > 0 && (
          <p className="text-lg font-bold font-mono text-gray-900">
            {formatCompactAmount(totalFundingUsd)}
            <span className="text-xs font-normal text-gray-400 font-sans ml-1">pooled</span>
          </p>
        )}
      </button>

      <button
        onClick={() => onTabChange('reviews')}
        className={cn(
          'rounded-xl border p-4 text-left transition-all',
          activeTab === 'reviews'
            ? 'border-amber-300 bg-amber-50/40 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-base">📝</span>
            <h3 className="text-[15px] font-semibold text-gray-900">Peer Reviews</h3>
          </div>
          {bountyTotal > 0 && (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
              {bountyTotal} available
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-2">Review papers in your area of expertise</p>
        <p className="text-lg font-bold font-mono text-gray-900">
          $150+
          <span className="text-xs font-normal text-gray-400 font-sans ml-1">per review</span>
        </p>
      </button>
    </div>
  );
}
