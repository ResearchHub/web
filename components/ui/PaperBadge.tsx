import { PaperIcon } from '@/components/ui/icons';
import { Badge } from '@/components/ui/Badge';

interface PaperBadgeProps {
  className?: string;
}

export const PaperBadge = ({ className = '' }: PaperBadgeProps) => {
  return (
    <Badge variant="default" className={`gap-1.5 py-1 border-gray-300 ${className}`}>
      <PaperIcon width={13} height={16} className="text-gray-500" />
      <span>Paper</span>
    </Badge>
  );
};
