import { Target, TrendingUp, Users, Zap, LucideIcon } from 'lucide-react';
import { formatUsdValue } from '@/utils/number';
import { FundingMilestones } from '@/types/fundingImpactData';

function formatCurrency(value: number): string {
  return formatUsdValue(value.toString(), 0, false, 0).replace(' USD', '');
}

interface MilestoneItemConfig {
  label: string;
  current: number;
  target: number;
  format: (value: number) => string;
  remainingSuffix: string;
  barColor: string;
  icon: LucideIcon;
  iconColor: string;
}

interface MilestonesCardProps {
  readonly milestones: FundingMilestones;
}

export function MilestonesCard({ milestones }: MilestonesCardProps) {
  const items: MilestoneItemConfig[] = [
    {
      label: 'Funding contributed',
      ...milestones.fundingContributed,
      format: formatCurrency,
      remainingSuffix: 'to next milestone',
      barColor: 'bg-orange-400',
      icon: TrendingUp,
      iconColor: 'text-blue-500',
    },
    {
      label: 'Researchers supported',
      ...milestones.researchersSupported,
      format: String,
      remainingSuffix: 'more to next milestone',
      barColor: 'bg-green-500',
      icon: Users,
      iconColor: 'text-green-500',
    },
    {
      label: 'Matched funding',
      ...milestones.matchedFunding,
      format: formatCurrency,
      remainingSuffix: 'to next milestone',
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
                {item.format(item.current)}
                <span className="text-base font-normal text-gray-400 ml-1">
                  / {item.format(item.target)}
                </span>
              </p>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${item.barColor} rounded-full`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {item.format(remaining)} {item.remainingSuffix}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
