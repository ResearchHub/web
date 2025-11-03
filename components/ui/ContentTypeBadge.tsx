import { PaperIcon } from '@/components/ui/icons';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { Coins, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import Icon from '@/components/ui/icons/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentsQuestion } from '@fortawesome/pro-light-svg-icons';

interface ContentTypeBadgeProps {
  type:
    | 'paper'
    | 'funding'
    | 'bounty'
    | 'review'
    | 'article'
    | 'preprint'
    | 'published'
    | 'grant'
    | 'question';
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
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    return (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1.5 border border-gray-200', className)}
      >
        <Icon name="workType" size={iconSize} color="#374151" />
        <span>Paper</span>
      </Badge>
    );
  }

  if (type === 'preprint') {
    const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;
    const badge = (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1 border border-gray-200 cursor-pointer', className)}
      >
        <Icon name="preprint" size={iconSize} color="#6B7280" />
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
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    const badge = (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1.5 border border-gray-200 cursor-pointer', className)}
      >
        <Icon name="verify1" size={iconSize} color="#10B981" />
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
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    return (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1.5 border border-gray-200', className)}
      >
        <Icon name="workType" size={iconSize} color="#374151" />
        <span>Article</span>
      </Badge>
    );
  }

  if (type === 'grant') {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    const badge = (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1.5 border border-gray-200 cursor-pointer', className)}
      >
        <Icon name="fund" size={iconSize} color="#374151" />
        <span>Request for Proposal</span>
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
            <div>Request for proposals inviting researchers to apply for funding.</div>
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
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    return (
      <Tooltip
        content={
          <div className="flex items-start gap-3 text-left">
            <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
              <Icon name="createBounty" size={24} color="#374151" />
            </div>
            <div>Proposals seeking funding for future research.</div>
          </div>
        }
        position="top"
        width="w-[360px]"
      >
        <Badge
          variant="default"
          size={size}
          className={cn('gap-1.5 border border-gray-200 cursor-pointer', className)}
        >
          <Icon name="createBounty" size={iconSize} color="#374151" />
          <span>Proposal</span>
        </Badge>
      </Tooltip>
    );
  }

  if (type === 'bounty') {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
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
          className={cn('gap-1.5 border border-gray-200 cursor-pointer', className)}
        >
          <Icon name="earn1" size={iconSize} color="#6B7280" />
          <span>Bounty</span>
        </Badge>
      </Tooltip>
    );
  }

  if (type === 'review') {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
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
          className={cn('gap-1.5 border border-gray-200 cursor-pointer', className)}
        >
          <Icon name="peerReview1" size={iconSize} color="#6B7280" />
          <span>Peer Review</span>
        </Badge>
      </Tooltip>
    );
  }

  if (type === 'question') {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    const badge = (
      <Badge
        variant="default"
        size={size}
        className={cn('gap-1.5 border border-gray-200 cursor-pointer', className)}
      >
        <FontAwesomeIcon icon={faCommentsQuestion} fontSize={iconSize} className="text-gray-600" />
        <span>Question</span>
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
              <FontAwesomeIcon icon={faCommentsQuestion} fontSize={24} className="text-gray-900" />
            </div>
            <div>Questions and discussions to engage with the research community.</div>
          </div>
        }
        position="top"
        width="w-[360px]"
      >
        {badge}
      </Tooltip>
    );
  }

  return null;
};
