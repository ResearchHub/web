import { Fundraise } from '@/types/funding';

interface FundraiseStatsProps {
  fundraise: Fundraise;
}

export function FundraiseStats({ fundraise }: FundraiseStatsProps) {
  const progress = (fundraise.amountRaised.usd / fundraise.goalAmount.usd) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">${fundraise.amountRaised.usd.toLocaleString()}</span>
          <span className="text-gray-600">${fundraise.goalAmount.usd.toLocaleString()}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Contributors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Contributors</span>
          <span className="text-sm font-medium text-gray-900">
            {fundraise.contributors.numContributors}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Status</span>
        <span className="text-sm font-medium text-gray-900">{fundraise.status}</span>
      </div>
    </div>
  );
}
