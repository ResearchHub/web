'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useEndaoment } from '@/contexts/EndaomentContext';
import { EndaomentConnectButton } from './EndaomentConnectButton';
import { ID } from '@/types/root';

interface EndaomentPaymentButtonProps {
  /** Fundraise ID for the contribution */
  readonly fundraiseId: ID;
  /** Amount in USD (total due including fees) */
  readonly amountInUsd: number;
  /** Whether a payment is currently being processed */
  readonly isProcessing?: boolean;
}

/**
 * Smart Endaoment payment button that adapts to the user's connection state:
 * - Not connected: shows the EndaomentConnectButton (OAuth flow)
 * - Loading: shows a disabled button with spinner
 * - Connected: shows a disabled "Confirm & Pay" button (DAF fund selection required first)
 */
export function EndaomentPaymentButton({
  fundraiseId,
  amountInUsd,
  isProcessing = false,
}: EndaomentPaymentButtonProps) {
  const { connected, isLoading } = useEndaoment();

  // While checking connection status, show a loading state
  if (isLoading) {
    return (
      <Button type="button" variant="default" disabled className="w-full h-12 text-base">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking Endaoment...
      </Button>
    );
  }

  // Not connected: show the connect button to initiate OAuth
  if (!connected) {
    return <EndaomentConnectButton variant="default" className="w-full h-12 text-base" />;
  }

  // Connected: show disabled pay button (DAF fund selection not yet implemented)
  return (
    <Button type="button" variant="default" disabled className="w-full h-12 text-base">
      {isProcessing ? 'Processing...' : 'Confirm & Pay'}
    </Button>
  );
}
