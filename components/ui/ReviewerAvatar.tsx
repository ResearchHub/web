'use client';

import { FC, ReactNode } from 'react';
import { Avatar } from './Avatar';
import { cn } from '@/utils/styles';
import { Tooltip } from './Tooltip';
import { CheckCircle, AlertCircle, HelpCircle, XCircle, Clock } from 'lucide-react';
import { ReviewStatus } from '@/store/authorStore';

interface ReviewerAvatarProps {
  src?: string | null;
  name: string;
  status: ReviewStatus;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | number;
  authorId?: number;
  tooltipContent?: ReactNode;
}

export const ReviewerAvatar: FC<ReviewerAvatarProps> = ({
  src,
  name,
  status,
  size = 'sm',
  authorId,
  tooltipContent,
}) => {
  // Get the status icon and color based on the review status
  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-full h-full" />,
          bgColor: 'bg-green-500',
          borderColor: 'border-white',
        };
      case 'needs_changes':
        return {
          icon: <AlertCircle className="w-full h-full" />,
          bgColor: 'bg-amber-500',
          borderColor: 'border-white',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-full h-full" />,
          bgColor: 'bg-red-500',
          borderColor: 'border-white',
        };
      case 'pending':
        return {
          icon: <Clock className="w-full h-full" />,
          bgColor: 'bg-blue-500',
          borderColor: 'border-white',
        };
      case 'unassigned':
      default:
        return {
          icon: <HelpCircle className="w-full h-full" />,
          bgColor: 'bg-gray-400',
          borderColor: 'border-white',
        };
    }
  };

  const { icon, bgColor, borderColor } = getStatusIcon();

  // Size calculations for the status badge
  const getStatusBadgeSize = () => {
    if (typeof size === 'number') {
      return Math.max(size / 2.5, 16); // Increase minimum size to 16px and make ratio larger
    }

    switch (size) {
      case 'md':
        return 18;
      case 'sm':
        return 16;
      case 'xs':
        return 14;
      case 'xxs':
        return 12;
      default:
        return 16;
    }
  };

  const statusBadgeSize = getStatusBadgeSize();

  const avatarElement = (
    <div className="relative inline-block">
      <Avatar src={src} alt={name} size={size} authorId={authorId} />

      {/* Status indicator badge */}
      <div
        className={cn(
          'absolute rounded-full text-white flex items-center justify-center border-2',
          bgColor,
          borderColor
        )}
        style={{
          width: `${statusBadgeSize}px`,
          height: `${statusBadgeSize}px`,
          top: '-2px',
          right: '-2px',
          fontSize: `${statusBadgeSize / 2}px`,
        }}
      >
        {icon}
      </div>
    </div>
  );

  // Wrap with tooltip if content is provided
  if (tooltipContent) {
    return <Tooltip content={tooltipContent}>{avatarElement}</Tooltip>;
  }

  return avatarElement;
};
