'use client';

import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StickyActionBar } from '@/components/ui/StickyActionBar';
import { FundButton } from '@/components/Funding/FundButton';
import { useGrantPage } from '@/components/Funding/GrantPageContext';
import {
  actionButtonProps,
  getApplyUnavailableReason,
  getPoolUnavailableReason,
} from '@/components/Funding/lib/unavailableAction';
import { cn } from '@/utils/styles';

/**
 * Apply and Fund, for the RFP page wherever its pool card is hidden. Once the
 * RFP closes they stay, grayed out with the reason on hover, as on the card.
 */
export function GrantActionBar() {
  const { grantId, canApply, isPending, isPoolOpen, fundingPool, setIsApplyPanelOpen } =
    useGrantPage();

  if (!grantId) return null;

  const apply = actionButtonProps(
    () => setIsApplyPanelOpen(true),
    getApplyUnavailableReason({ canApply, isPending })
  );

  return (
    <StickyActionBar>
      <Button
        variant="outlined"
        size="lg"
        {...apply}
        className={cn('flex-1 gap-2', apply.className)}
      >
        <FileUp className="h-4 w-4" />
        Apply
      </Button>
      {fundingPool && (
        <FundButton
          size="lg"
          className="flex-1"
          unavailableReason={getPoolUnavailableReason({ isPoolOpen, isPending })}
        >
          Fund
        </FundButton>
      )}
    </StickyActionBar>
  );
}
