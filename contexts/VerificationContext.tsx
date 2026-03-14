'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { VerifyIdentityModal } from '@/components/modals/VerifyIdentityModal';
import { useUser } from '@/contexts/UserContext';

export type VerificationModalContext = 'publish' | null;

interface VerificationContextType {
  openVerificationModal: (options?: {
    onVerified?: () => void;
    context?: VerificationModalContext;
  }) => void;
  closeVerificationModal: () => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<VerificationModalContext>(null);
  const pendingCallbackRef = useRef<(() => void) | null>(null);
  const { refreshUser } = useUser();

  const openVerificationModal = useCallback(
    (options?: { onVerified?: () => void; context?: VerificationModalContext }) => {
      pendingCallbackRef.current = options?.onVerified ?? null;
      setModalContext(options?.context ?? null);
      setIsModalOpen(true);
    },
    []
  );

  const closeVerificationModal = useCallback(async () => {
    setIsModalOpen(false);
    const freshUser = await refreshUser();
    if (freshUser?.isVerified && pendingCallbackRef.current) {
      pendingCallbackRef.current();
    }
    pendingCallbackRef.current = null;
  }, [refreshUser]);

  return (
    <VerificationContext.Provider value={{ openVerificationModal, closeVerificationModal }}>
      {children}
      <VerifyIdentityModal
        isOpen={isModalOpen}
        onClose={closeVerificationModal}
        context={modalContext}
      />
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
