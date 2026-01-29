'use client';

import { useCallback } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';

// Import RSC deposit view
import { DepositRSCView } from '@/components/modals/DepositRSCView';

interface DepositOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSuccess?: () => void;
  /** Context identifier for analytics and UI variations */
  context?: 'wallet' | 'fundraise';
}

/**
 * Deposit modal that directly shows RSC deposit view.
 * Previously showed multiple deposit options, now simplified to RSC only.
 */
export function DepositOptionsModal({
  isOpen,
  onClose,
  currentBalance,
  onSuccess,
}: DepositOptionsModalProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSuccess = useCallback(() => {
    onSuccess?.();
    handleClose();
  }, [onSuccess, handleClose]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Deposit RSC"
      padding="p-6"
      className="md:!w-[480px]"
    >
      <DepositRSCView currentBalance={currentBalance} onSuccess={handleSuccess} />
    </BaseModal>
  );
}
