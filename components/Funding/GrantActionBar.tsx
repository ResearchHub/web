'use client';

import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StickyActionBar } from '@/components/ui/StickyActionBar';
import { FundButton } from '@/components/Funding/FundButton';
import { useGrantPage } from '@/components/Funding/GrantPageContext';

/** Apply and Fund, for the RFP page wherever its pool card is hidden. */
export function GrantActionBar() {
  const { canApply, isPoolOpen, setIsApplyPanelOpen } = useGrantPage();

  // Contributions need the RFP open too, so with nothing to apply to there is nothing to fund.
  if (!canApply) return null;

  return (
    <StickyActionBar>
      <Button
        variant="outlined"
        size="lg"
        onClick={() => setIsApplyPanelOpen(true)}
        className="flex-1 gap-2"
      >
        <FileUp className="h-4 w-4" />
        Apply
      </Button>
      {isPoolOpen && (
        <FundButton size="lg" className="flex-1">
          Fund
        </FundButton>
      )}
    </StickyActionBar>
  );
}
