import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { CheckCircle } from 'lucide-react';

interface TaxDeductibleBadgeProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'xs';
  showTooltip?: boolean;
  variant?: 'default' | 'icon-only';
}

export const TaxDeductibleBadge = ({
  className = '',
  size = 'default',
  showTooltip = true,
  variant = 'default',
}: TaxDeductibleBadgeProps) => {
  // Determine styling based on variant
  const getBadgeStyles = () => {
    switch (variant) {
      case 'icon-only':
        return 'border-green-200 bg-green-50 text-green-700 cursor-pointer px-2';
      case 'default':
      default:
        return 'border-green-200 bg-green-50 text-green-700 cursor-pointer';
    }
  };

  const badge = (
    <Badge
      variant="default"
      size={size}
      className={cn('gap-1.5 py-1', getBadgeStyles(), className)}
    >
      <CheckCircle className="w-4 h-4" />
      {variant !== 'icon-only' && <span>Tax-Deductible</span>}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip
      content={
        <div className="flex items-start gap-3 text-left">
          <div className="bg-green-100 p-2 rounded-md flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
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
