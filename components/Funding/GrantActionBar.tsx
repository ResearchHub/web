'use client';

import { Coins, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StickyActionBar } from '@/components/work/StickyActionBar';
import { useGrantTab } from '@/components/Funding/GrantPageContent';
import { useFundPanel } from '@/components/Funding/FundPanelContext';
import type { FundingPool } from '@/types/grant';

interface GrantActionBarProps {
  grantId?: string;
  fundingPool: FundingPool | null;
  isActive: boolean;
}

/** Apply and Fund, for the RFP page wherever its pool card is hidden. */
export function GrantActionBar({
  grantId,
  fundingPool: fundingPoolProp,
  isActive,
}: GrantActionBarProps) {
  const { fundingPool: contextPool, setIsApplyModalOpen } = useGrantTab();
  const { openFundPanel } = useFundPanel();

  const fundingPool = contextPool ?? fundingPoolProp;
  const canApply = !!grantId && isActive;
  const canFund = canApply && fundingPool?.status === 'OPEN';

  if (!canApply && !canFund) return null;

  return (
    <StickyActionBar>
      {canApply && (
        <Button
          variant="outlined"
          size="lg"
          onClick={() => setIsApplyModalOpen(true)}
          className="flex-1 gap-2"
        >
          <FileUp className="h-4 w-4" />
          Apply
        </Button>
      )}
      {canFund && (
        <Button variant="default" size="lg" onClick={openFundPanel} className="flex-1 gap-2">
          <Coins className="h-4 w-4" />
          Fund
        </Button>
      )}
    </StickyActionBar>
  );
}
