import { PaperIcon } from '@/components/ui/icons';
import { HandCoins, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/styles';

interface ContentTypeBadgeProps {
  type: 'paper' | 'funding' | 'bounty';
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'xs';
}

export const ContentTypeBadge = ({
  type,
  className = '',
  size = 'default',
}: ContentTypeBadgeProps) => {
  if (type === 'paper') {
    return (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1.5 py-1 border-gray-300', className)}
      >
        <PaperIcon width={13} height={16} className="text-gray-500" />
        <span>Paper</span>
      </Badge>
    );
  }

  if (type === 'funding') {
    return (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1.5 py-1 border-gray-300', className)}
      >
        <HandCoins size={16} className="text-gray-500" />
        <span>Funding</span>
      </Badge>
    );
  }

  if (type === 'bounty') {
    return (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1.5 py-1 border-gray-300', className)}
      >
        <Coins size={16} className="text-gray-500" />
        <span>Bounty</span>
      </Badge>
    );
  }

  return null;
};
