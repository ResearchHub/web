'use client';

import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StickyActionBar } from '@/components/work/StickyActionBar';
import { FundButton } from '@/components/Funding/FundButton';
import { useGrantPage } from '@/components/Funding/GrantPageContent';

/** Apply and Fund, for the RFP page wherever its pool card is hidden. */
export function GrantActionBar() {
  const { grantId, isActive, isPoolOpen, setIsApplyPanelOpen } = useGrantPage();

  // Contributions need the RFP open too, so with nothing to apply to there is nothing to fund.
  if (!grantId || !isActive) return null;

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
