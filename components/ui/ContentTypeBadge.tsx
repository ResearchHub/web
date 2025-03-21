import { PaperIcon } from '@/components/ui/icons';
import { HandCoins, Coins, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';

interface ContentTypeBadgeProps {
  type: 'paper' | 'funding' | 'bounty' | 'review';
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'xs';
  score?: number;
  maxScore?: number;
}

export const ContentTypeBadge = ({
  type,
  className = '',
  size = 'default',
  score,
  maxScore = 5,
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
      <Tooltip
        content={
          <div className="flex items-start gap-3 text-left">
            <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
              <Coins size={24} className="text-gray-700" />
            </div>
            <div>A bounty is an earning opportunity. Earn ResearchCoin for completing a task.</div>
          </div>
        }
        position="top"
        width="w-[360px]"
      >
        <Badge
          variant="default"
          size={size}
          className={cn('gap-1.5 py-1 border-gray-300 cursor-pointer', className)}
        >
          <Coins size={16} className="text-gray-500" />
          <span>Bounty</span>
        </Badge>
      </Tooltip>
    );
  }

  if (type === 'review') {
    return (
      <Tooltip
        content={
          <div className="flex items-start gap-3 text-left">
            <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
              <Star size={24} className="text-gray-700" />
            </div>
            <div>Peer reviews help the community evaluate the quality of research.</div>
          </div>
        }
        position="top"
        width="w-[360px]"
      >
        <Badge
          variant="default"
          size={size}
          className={cn('gap-1.5 py-1 border-gray-300 cursor-pointer', className)}
        >
          <Star size={16} className="text-gray-500" />
          <span>Review {score !== undefined ? `${score}/${maxScore}` : ''}</span>
        </Badge>
      </Tooltip>
    );
  }

  return null;
};
