import { FC } from 'react';
import { PaperPostSkeleton } from './skeletons/PaperPostSkeleton';
import { GrantSkeleton } from './skeletons/GrantSkeleton';
import { FundraiseSkeleton } from './skeletons/FundraiseSkeleton';
import { BountySkeleton } from './skeletons/BountySkeleton';
import { GrantComprehensiveSkeleton } from './skeletons/GrantComprehensiveSkeleton';

export type FeedSkeletonVariant = 'paper' | 'grant' | 'fundraise' | 'bounty' | 'comprehensive';

interface FeedItemSkeletonProps {
  variant?: FeedSkeletonVariant;
  hideActions?: boolean;
  showHeader?: boolean;
}

export const FeedItemSkeleton: FC<FeedItemSkeletonProps> = ({
  variant = 'paper',
  hideActions = false,
  showHeader = true,
}) => {
  switch (variant) {
    case 'grant':
      return <GrantSkeleton />;
    case 'fundraise':
      return <FundraiseSkeleton hideActions={hideActions} />;
    case 'bounty':
      return <BountySkeleton />;
    case 'comprehensive':
      return <GrantComprehensiveSkeleton />;
    case 'paper':
    default:
      return <PaperPostSkeleton hideActions={hideActions} showHeader={showHeader} />;
  }
};
