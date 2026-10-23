'use client';

import { FileUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GrantFundingPoolWidget } from '@/components/Funding/GrantFundingPoolWidget';
import { useGrantPage } from '@/components/Funding/GrantPageContext';
import { canManageGrantPool } from '@/components/Funding/lib/canManageGrantPool';
import {
  actionButtonProps,
  getApplyUnavailableReason,
} from '@/components/Funding/lib/unavailableAction';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';

/**
 * The RFP's funding pool with Add to pool and Apply, at the top of its right
 * sidebar. An RFP without a pool gets a plain Apply button instead. Once the
 * RFP closes, its buttons stay, grayed out with the reason on hover.
 */
export function GrantPoolCard() {
  const { user } = useUser();
  const {
    organization,
    grantAmount,
    applicationVisibility,
    canApply,
    isPending,
    isPoolOpen,
    fundingPool,
    grantCreatedByUserId,
    setIsApplyPanelOpen,
  } = useGrantPage();

  if (fundingPool && grantAmount) {
    return (
      <GrantFundingPoolWidget
        organization={organization ?? ''}
        grantAmount={grantAmount}
        fundingPool={fundingPool}
        isOpen={isPoolOpen}
        canApply={canApply}
        isPending={isPending}
        isPrivate={applicationVisibility === 'PRIVATE'}
        canManagePool={canManageGrantPool(user, grantCreatedByUserId)}
        onApply={() => setIsApplyPanelOpen(true)}
      />
    );
  }

  const apply = actionButtonProps(
    () => setIsApplyPanelOpen(true),
    getApplyUnavailableReason({ canApply, isPending })
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        data-testid="grant-submit-proposal"
        variant="default"
        size="lg"
        {...apply}
        className={cn('w-full gap-2', apply.className)}
      >
        Apply
        <FileUp className="h-5 w-5" />
      </Button>
      {canApply && applicationVisibility === 'PRIVATE' && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
          <Lock className="h-3 w-3 shrink-0" />
          <span>Your proposal will be submitted privately</span>
        </div>
      )}
    </div>
  );
}
