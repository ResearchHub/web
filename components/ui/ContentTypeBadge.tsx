import { PaperIcon } from '@/components/ui/icons';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { Coins, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import Icon from '@/components/ui/icons/Icon';

interface ContentTypeBadgeProps {
  type: 'paper' | 'funding' | 'bounty' | 'review' | 'article' | 'preprint' | 'published' | 'grant';
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'xs';
  score?: number;
  maxScore?: number;
  showTooltip?: boolean;
}

export const ContentTypeBadge = ({
  type,
  className = '',
  size = 'default',
  score,
  maxScore = 5,
  showTooltip = true,
}: ContentTypeBadgeProps) => {
  if (type === 'paper') {
    return (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1.5 py-1 border-gray-300', className)}
      >
        <Icon name="workType" size={16} color="#374151" />
        <span>Paper</span>
      </Badge>
    );
  }

  if (type === 'preprint') {
    const badge = (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1 py-1 border-gray-300 cursor-pointer', className)}
      >
        <Icon name="preprint" size={12} color="#6B7280" />
        <span>Preprint</span>
      </Badge>
    );

    if (!showTooltip) {
      return badge;
    }

    return (
      <Tooltip
        content={
          <div className="flex items-start gap-3 text-left">
            <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
              <Icon name="preprint" size={24} color="#374151" />
            </div>
            <div>Preprints are research papers that have not yet undergone formal peer review.</div>
          </div>
        }
        position="top"
        width="w-[360px]"
      >
        {badge}
      </Tooltip>
    );
  }

  if (type === 'published') {
    const badge = (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1.5 py-1 border-gray-300 cursor-pointer', className)}
      >
        <Icon name="verify1" size={16} color="#10B981" />
        <span>Published</span>
      </Badge>
    );

    if (!showTooltip) {
      return badge;
    }

    return (
      <Tooltip
        content={
          <div className="flex items-start gap-3 text-left">
            <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
              <Icon name="verify1" size={24} color="#10B981" />
            </div>
            <div>Published papers have undergone peer review and been formally published.</div>
          </div>
        }
        position="top"
        width="w-[360px]"
      >
        {badge}
      </Tooltip>
    );
  }

  if (type === 'article') {
    return (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1.5 py-1 border-gray-300', className)}
      >
        <Icon name="workType" size={16} color="#374151" />
        <span>Article</span>
      </Badge>
    );
  }

  if (type === 'grant') {
    const badge = (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1.5 py-1 border-gray-300 cursor-pointer', className)}
      >
        <Icon name="fund" size={16} color="#374151" />
        <span>Grant</span>
      </Badge>
    );

    if (!showTooltip) {
      return badge;
    }

    return (
      <Tooltip
        content={
          <div className="flex items-start gap-3 text-left">
            <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
              <Icon name="fund" size={24} color="#059669" />
            </div>
            <div>Available funding opportunities for researchers to apply for grants.</div>
          </div>
        }
        position="top"
        width="w-[360px]"
      >
        {badge}
      </Tooltip>
    );
  }

  if (type === 'funding') {
    return (
      <Tooltip
        content={
          <div className="flex items-start gap-3 text-left">
            <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
              <Icon name="createBounty" size={24} color="#374151" />
            </div>
            <div>Preregistrations seeking funding for future research.</div>
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
          <Icon name="createBounty" size={16} color="#374151" />
          <span>Preregistration</span>
        </Badge>
      </Tooltip>
    );
  }

  if (type === 'bounty') {
    return (
      <Tooltip
        content={
          <div className="flex items-start gap-3 text-left">
            <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
              <Icon name="earn1" size={24} color="#374151" />
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
          <Icon name="earn1" size={16} color="#6B7280" />
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
              <Icon name="peerReview1" size={24} color="#374151" />
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
          <Icon name="peerReview1" size={16} color="#6B7280" />
          <span>Peer Review</span>
        </Badge>
      </Tooltip>
    );
  }

  return null;
};
