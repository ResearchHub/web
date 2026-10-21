'use client';

import { Coins, FileUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GrantFundingPoolWidget } from '@/components/work/WorkHeader/GrantFundingPoolWidget';
import { useGrantTab } from '@/components/Funding/GrantPageContent';
import { useFundPanel } from '@/components/Funding/FundPanelContext';
import { useUser } from '@/contexts/UserContext';
import type { FundingPool, FundingPoolAmount, GrantApplicationVisibility } from '@/types/grant';
import { ID } from '@/types/root';
import { cn } from '@/utils/styles';

interface GrantPoolCardProps {
  grantId?: string;
  organization?: string;
  /** The grant's own amount, before any community contributions. */
  grantAmount: FundingPoolAmount | null;
  fundingPool: FundingPool | null;
  isActive: boolean;
  applicationVisibility?: GrantApplicationVisibility;
  grantCreatedByUserId: ID | null;
  className?: string;
}

/**
 * The RFP's funding pool with Add to pool and Apply. It sits above
 * the right sidebar, and in the main column where there is no sidebar. Grants
 * without a pool get the two plain buttons instead.
 */
export function GrantPoolCard({
  grantId,
  organization,
  grantAmount,
  fundingPool: fundingPoolProp,
  isActive,
  applicationVisibility,
  grantCreatedByUserId,
  className,
}: GrantPoolCardProps) {
  const { user } = useUser();
  const { fundingPool: contextPool, setIsApplyModalOpen } = useGrantTab();
  const { openFundPanel } = useFundPanel();

  const fundingPool = contextPool ?? fundingPoolProp;
  const isPoolOpen = !!grantId && isActive && fundingPool?.status === 'OPEN';
  const canApply = !!grantId && isActive;
  const requiresPrivateApplications = applicationVisibility === 'PRIVATE';

  const isGrantCreator =
    user?.id != null &&
    grantCreatedByUserId != null &&
    Number(user.id) === Number(grantCreatedByUserId);
  const canManagePool = isGrantCreator || !!user?.isModerator;

  if (fundingPool && grantAmount) {
    return (
      <div className={cn('flex w-full flex-col', className)}>
        <GrantFundingPoolWidget
          organization={organization ?? ''}
          grantAmount={grantAmount}
          fundingPool={fundingPool}
          isOpen={isPoolOpen}
          canApply={canApply}
          canManagePool={canManagePool}
          onApply={() => setIsApplyModalOpen(true)}
          onContribute={openFundPanel}
        />
      </div>
    );
  }

  if (!canApply) return null;

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {isPoolOpen && (
        <Button
          data-testid="grant-contribute"
          variant="outlined"
          size="lg"
          onClick={openFundPanel}
          className="w-full gap-2"
        >
          <Coins className="h-5 w-5" />
          Contribute
        </Button>
      )}
      <Button
        data-testid="grant-submit-proposal"
        variant="default"
        size="lg"
        onClick={() => setIsApplyModalOpen(true)}
        className="w-full gap-2"
      >
        Apply
        <FileUp className="h-5 w-5" />
      </Button>
      {requiresPrivateApplications && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
          <Lock className="h-3 w-3 shrink-0" />
          <span>Your proposal will be submitted privately</span>
        </div>
      )}
    </div>
  );
}
