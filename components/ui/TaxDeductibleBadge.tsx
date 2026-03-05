import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { CheckCircle } from 'lucide-react';

interface TaxDeductibleBadgeProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'xs';
  showTooltip?: boolean;
  variant?: 'default' | 'overlay';
}

const sizeStyles = {
  xs: 'text-[9px] px-1.5 py-0.5 gap-1',
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  default: 'text-xs px-2 py-0.5 gap-1.5',
  lg: 'text-sm px-2.5 py-1 gap-1.5',
} as const;

const iconSizes = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  default: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
} as const;

export const TaxDeductibleBadge = ({
  className = '',
  size = 'default',
  showTooltip = true,
  variant = 'default',
}: TaxDeductibleBadgeProps) => {
  const isOverlay = variant === 'overlay';

  const badge = (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium cursor-default whitespace-nowrap',
        sizeStyles[size],
        isOverlay
          ? 'bg-black/50 text-white backdrop-blur-sm border border-white/20'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        className
      )}
    >
      <CheckCircle
        className={cn(iconSizes[size], isOverlay ? 'text-emerald-300' : 'text-emerald-500')}
      />
      <span>Tax-Deductible</span>
    </span>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip
      content={
        <div className="flex items-start gap-3 text-left">
          <div className="bg-emerald-100 p-2 rounded-md flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Tax-Deductible Donations</h3>
            <p className="mt-1 text-sm">
              Donations to this project are tax-deductible. Donors who contribute $500 or more
              receive a tax receipt.
            </p>
          </div>
        </div>
      }
      position="top"
      width="w-[360px]"
    >
      {badge}
    </Tooltip>
  );
};
