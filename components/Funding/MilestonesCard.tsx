import { Target, TrendingUp, Users, Zap, LucideIcon } from 'lucide-react';
import { formatUsdValue } from '@/utils/number';
import { FundingMilestones } from '@/types/fundingImpactData';

interface MilestoneItemConfig {
  label: string;
  current: number;
  target: number;
  isCurrency: boolean;
  barColor: string;
  icon: LucideIcon;
  iconColor: string;
}

interface MilestonesCardProps {
  milestones: FundingMilestones;
}

function formatValue(value: number, isCurrency: boolean): string {
  return isCurrency ? formatUsdValue(value.toString(), 0, false, 0) : String(value);
}

function formatRemaining(remaining: number, isCurrency: boolean): string {
  return isCurrency
    ? `${formatUsdValue(remaining.toString(), 0, false, 0)} to next milestone`
    : `${remaining} more to next milestone`;
}

export function MilestonesCard({ milestones }: MilestonesCardProps) {
  const items: MilestoneItemConfig[] = [
    {
      label: 'Funding contributed',
      ...milestones.fundingContributed,
      isCurrency: true,
      barColor: 'bg-orange-400',
      icon: TrendingUp,
      iconColor: 'text-blue-500',
    },
    {
      label: 'Researchers supported',
      ...milestones.researchersSupported,
      isCurrency: false,
      barColor: 'bg-green-500',
      icon: Users,
      iconColor: 'text-green-500',
    },
    {
      label: 'Matched funding',
      ...milestones.matchedFunding,
      isCurrency: true,
      barColor: 'bg-orange-400',
      icon: Zap,
      iconColor: 'text-yellow-500',
    },
  ];

  return (
    <section className="rounded-xl p-6 border border-gray-200 bg-gradient-to-r from-blue-50/80 via-white to-teal-50/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Target className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Your milestones</h3>
          <p className="text-sm text-gray-500">Progress toward your next funding achievements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => {
          const percent = item.target > 0 ? Math.min((item.current / item.target) * 100, 100) : 0;
          const remaining = item.target - item.current;
          const Icon = item.icon;

          return (
            <div key={item.label}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${item.iconColor}`} />
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatValue(item.current, item.isCurrency)}
                <span className="text-base font-normal text-gray-400 ml-1">
                  / {formatValue(item.target, item.isCurrency)}
                </span>
              </p>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${item.barColor} rounded-full`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatRemaining(remaining, item.isCurrency)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
