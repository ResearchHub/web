'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import AuthModal from '@/components/modals/Auth/AuthModal';
import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthModalContextType {
  showAuthModal: (onSuccess?: () => void) => void;
  hideAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function useAuthModalContext() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModalContext must be used within AuthModalProvider');
  }
  return context;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | undefined>();

  const showAuthModal = useCallback((onSuccess?: () => void) => {
    setIsOpen(true);
    setPendingAction(() => onSuccess);
  }, []);

  const hideAuthModal = useCallback(() => {
    setIsOpen(false);
    setPendingAction(undefined);
  }, []);

  const handleSuccess = useCallback(() => {
    if (pendingAction) {
      pendingAction();
    }
    hideAuthModal();
  }, [pendingAction, hideAuthModal]);

  return (
    <AuthModalContext.Provider value={{ showAuthModal, hideAuthModal }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={hideAuthModal} onSuccess={handleSuccess} />
    </AuthModalContext.Provider>
  );
}

export function useAuthenticatedAction() {
  const { data: session } = useSession();
  const authModal = useContext(AuthModalContext);

  if (!authModal) {
    throw new Error('useAuthenticatedAction must be used within AuthModalProvider');
  }

  const executeAuthenticatedAction = useCallback(
    (action: () => void) => {
      if (session) {
        action();
      } else {
        authModal.showAuthModal(action);
      }
    },
    [session, authModal]
  );

  return { executeAuthenticatedAction };
}

interface AuthenticatedContentProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AuthenticatedContent = ({ children, fallback = null }: AuthenticatedContentProps) => {
  const { status } = useSession();

  if (status !== 'authenticated') {
    return fallback;
  }

  return <>{children}</>;
};
