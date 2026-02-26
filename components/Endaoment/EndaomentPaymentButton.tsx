'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useEndaoment } from '@/contexts/EndaomentContext';
import { EndaomentConnectButton } from './EndaomentConnectButton';
import type { EndaomentFund } from '@/services/endaoment.service';

interface EndaomentPaymentButtonProps {
  /** Whether a payment is currently being processed */
  readonly isProcessing?: boolean;
  /** The selected Endaoment fund to pay from */
  readonly selectedFund: EndaomentFund | null;
  /** Callback when user confirms payment */
  readonly onConfirm: () => void;
}

/**
 * Smart Endaoment payment button that adapts to the user's connection state:
 * - Not connected: shows the EndaomentConnectButton (OAuth flow)
 * - Loading: shows a disabled button with spinner
 * - Connected without fund selected: shows disabled "Confirm & Pay" button
 * - Connected with fund selected: shows enabled "Confirm & Pay" button
 */
export function EndaomentPaymentButton({
  isProcessing = false,
  selectedFund,
  onConfirm,
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

  // Connected: enable button only when a fund is selected
  const isDisabled = isProcessing || !selectedFund;

  return (
    <Button
      type="button"
      variant="default"
      disabled={isDisabled}
      className="w-full h-12 text-base"
      onClick={onConfirm}
    >
      {isProcessing ? 'Processing...' : 'Confirm & Pay'}
    </Button>
  );
}
