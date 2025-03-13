import { PaperIcon } from '@/components/ui/icons';
import { HandCoins } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/styles';

interface ContentTypeBadgeProps {
  type: 'paper' | 'funding';
  className?: string;
}

export const ContentTypeBadge = ({ type, className = '' }: ContentTypeBadgeProps) => {
  if (type === 'paper') {
    return (
      <Badge variant="default" className={cn('gap-1.5 py-1 border-gray-300', className)}>
        <PaperIcon width={13} height={16} className="text-gray-500" />
        <span>Paper</span>
      </Badge>
    );
  }

  if (type === 'funding') {
    return (
      <Badge variant="default" className={cn('gap-1.5 py-1 border-gray-300', className)}>
        <HandCoins size={16} className="text-gray-500" />
        <span>Funding</span>
      </Badge>
    );
  }

  return null;
};
