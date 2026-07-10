import { FC } from 'react';
import {
  SkeletonAuthorRow,
  SkeletonCardShell,
  SkeletonFeedItemActionsFooter,
  SkeletonImageLeftColumn,
  SkeletonMobileImageBleed,
  SkeletonPrimaryActionPanel,
} from './shared';

interface FundraiseSkeletonProps {
  hideActions?: boolean;
}

export const FundraiseSkeleton: FC<FundraiseSkeletonProps> = ({ hideActions = false }) => (
  <SkeletonCardShell>
    <div className="md:!flex md:!flex-row">
      <SkeletonImageLeftColumn />
      <div className="flex-1 min-w-0">
        <div className="p-4">
          <SkeletonMobileImageBleed />
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-1" />
          <SkeletonAuthorRow />
          <SkeletonPrimaryActionPanel buttonWidth="w-16" />
        </div>
      </div>
    </div>
    {!hideActions && <SkeletonFeedItemActionsFooter />}
  </SkeletonCardShell>
);
