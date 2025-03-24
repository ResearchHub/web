import { CheckCircle } from 'lucide-react';
import { cn } from '@/utils/styles';

interface TaxDeductibleBadgeProps {
  className?: string;
}

export const TaxDeductibleBadge = ({ className }: TaxDeductibleBadgeProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium',
        className
      )}
    >
      <CheckCircle size={16} className="text-green-600" />
      <span>Tax Deductible</span>
    </div>
  );
};
