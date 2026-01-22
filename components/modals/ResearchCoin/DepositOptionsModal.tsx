'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';

// Import shared deposit options view and inline views
import { DepositOptionsView, type DepositOptionType } from '@/components/modals/DepositOptionsView';
import { DepositRSCView } from '@/components/modals/DepositRSCView';
import { WireTransferView } from '@/components/modals/WireTransferView';
import { BankAccountView } from '@/components/modals/BankAccountView';

type ModalView = 'options' | 'rsc' | 'bank' | 'wire';

interface DepositOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSuccess?: () => void;
  /** Context identifier for analytics and UI variations */
  context?: 'wallet' | 'fundraise';
}

export function DepositOptionsModal({
  isOpen,
  onClose,
  currentBalance,
  onSuccess,
}: DepositOptionsModalProps) {
  const [currentView, setCurrentView] = useState<ModalView>('options');

  const handleOptionSelect = useCallback((optionId: DepositOptionType) => {
    setCurrentView(optionId);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentView('options');
  }, []);

  const handleClose = useCallback(() => {
    setCurrentView('options');
    onClose();
  }, [onClose]);

  const handleSuccess = useCallback(() => {
    onSuccess?.();
    handleClose();
  }, [onSuccess, handleClose]);

  // Get title based on current view
  const getTitle = () => {
    switch (currentView) {
      case 'options':
        return 'Add Funds';
      case 'rsc':
        return 'Deposit RSC';
      case 'bank':
        return 'Bank Account';
      case 'wire':
        return 'Wire Transfer';
      default:
        return 'Add Funds';
    }
  };

  // Render back button for header
  const renderHeaderAction = () => {
    if (currentView === 'options') return undefined;

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="text-gray-400 hover:text-gray-600 -ml-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    );
  };

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'rsc':
        return <DepositRSCView currentBalance={currentBalance} onSuccess={handleSuccess} />;

      case 'bank':
        return <BankAccountView />;

      case 'wire':
        return <WireTransferView />;

      case 'options':
      default:
        return <DepositOptionsView onSelect={handleOptionSelect} />;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      headerAction={renderHeaderAction()}
      padding="p-6"
      className="md:!w-[480px]"
    >
      {renderContent()}
    </BaseModal>
  );
}

// Re-export the type for convenience
export type { DepositOptionType };
