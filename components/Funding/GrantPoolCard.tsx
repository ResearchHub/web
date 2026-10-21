'use client';

import { FileUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GrantFundingPoolWidget } from '@/components/Funding/GrantFundingPoolWidget';
import { useGrantPage } from '@/components/Funding/GrantPageContent';
import { canManageGrantPool } from '@/components/Funding/lib/canManageGrantPool';
import { useUser } from '@/contexts/UserContext';

/**
 * The RFP's funding pool with Add to pool and Apply, at the top of its right
 * sidebar. An RFP without a pool gets a plain Apply button instead.
 */
export function GrantPoolCard() {
  const { user } = useUser();
  const {
    grantId,
    organization,
    grantAmount,
    applicationVisibility,
    isActive,
    isPoolOpen,
    fundingPool,
    grantCreatedByUserId,
    setIsApplyPanelOpen,
  } = useGrantPage();

  const canApply = !!grantId && isActive;

  if (fundingPool && grantAmount) {
    return (
      <GrantFundingPoolWidget
        organization={organization ?? ''}
        grantAmount={grantAmount}
        fundingPool={fundingPool}
        isOpen={isPoolOpen}
        canApply={canApply}
        canManagePool={canManageGrantPool(user, grantCreatedByUserId)}
        onApply={() => setIsApplyPanelOpen(true)}
      />
    );
  }

  if (!canApply) return null;

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        data-testid="grant-submit-proposal"
        variant="default"
        size="lg"
        onClick={() => setIsApplyPanelOpen(true)}
        className="w-full gap-2"
      >
        Apply
        <FileUp className="h-5 w-5" />
      </Button>
      {applicationVisibility === 'PRIVATE' && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
          <Lock className="h-3 w-3 shrink-0" />
          <span>Your proposal will be submitted privately</span>
        </div>
      )}
    </div>
  );
}
