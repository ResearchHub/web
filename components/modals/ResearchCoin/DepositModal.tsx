'use client';

import { BaseModal } from '@/components/ui/BaseModal';
import { DepositRscPanel } from './DepositRscPanel';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Deposit RSC"
      padding="p-8"
      className="md:!w-[460px]"
    >
      <DepositRscPanel isActive={isOpen} />
    </BaseModal>
  );
}
