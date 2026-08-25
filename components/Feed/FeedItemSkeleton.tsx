import { FC } from 'react';
import { PaperPostSkeleton } from './skeletons/PaperPostSkeleton';
import { GrantSkeleton } from './skeletons/GrantSkeleton';
import { FundraiseSkeleton } from './skeletons/FundraiseSkeleton';
import { BountySkeleton } from './skeletons/BountySkeleton';
import { RegisteredReportSkeleton } from './skeletons/RegisteredReportSkeleton';
import { ProposalWorkSkeleton } from './skeletons/ProposalWorkSkeleton';

export type FeedSkeletonVariant =
  | 'paper'
  | 'grant'
  | 'fundraise'
  | 'bounty'
  | 'registeredReport'
  | 'proposalWork';

interface FeedItemSkeletonProps {
  variant?: FeedSkeletonVariant;
  hideActions?: boolean;
  showHeader?: boolean;
  showGrantApplyCta?: boolean;
}

export const FeedItemSkeleton: FC<FeedItemSkeletonProps> = ({
  variant = 'paper',
  hideActions = false,
  showHeader = true,
  showGrantApplyCta = true,
}) => {
  switch (variant) {
    case 'grant':
      return <GrantSkeleton showApplyCta={showGrantApplyCta} />;
    case 'fundraise':
      return <FundraiseSkeleton hideActions={hideActions} />;
    case 'bounty':
      return <BountySkeleton />;
    case 'registeredReport':
      return <RegisteredReportSkeleton />;
    case 'proposalWork':
      return <ProposalWorkSkeleton />;
    case 'paper':
    default:
      return <PaperPostSkeleton hideActions={hideActions} showHeader={showHeader} />;
  }
};
