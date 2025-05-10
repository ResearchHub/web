'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { VerifyIdentityModal } from '@/components/modals/VerifyIdentityModal';

interface VerificationContextType {
  openVerificationModal: () => void;
  closeVerificationModal: () => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openVerificationModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeVerificationModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <VerificationContext.Provider value={{ openVerificationModal, closeVerificationModal }}>
      {children}
      <VerifyIdentityModal isOpen={isModalOpen} onClose={closeVerificationModal} />
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
}
