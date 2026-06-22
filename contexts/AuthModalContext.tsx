'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import AuthModal from '@/components/modals/Auth/AuthModal';
import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';

/** Cosmetic theming for the auth modal. 'catalyst' co-brands it for Catalyst NYC. */
export type AuthModalVariant = 'default' | 'catalyst';

interface ShowAuthModalOptions {
  variant?: AuthModalVariant;
}

interface AuthModalContextType {
  showAuthModal: (onSuccess?: () => void, options?: ShowAuthModalOptions) => void;
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
  const [variant, setVariant] = useState<AuthModalVariant>('default');
  const [pendingAction, setPendingAction] = useState<(() => void) | undefined>();

  const showAuthModal = useCallback((onSuccess?: () => void, options?: ShowAuthModalOptions) => {
    setIsOpen(true);
    setVariant(options?.variant ?? 'default');
    AnalyticsService.logEvent(LogEvent.AUTH_MODAL_OPENED);
    setPendingAction(() => onSuccess);
  }, []);

  const hideAuthModal = useCallback(() => {
    setIsOpen(false);
    setVariant('default');
    setPendingAction(undefined);
    AnalyticsService.logEvent(LogEvent.AUTH_MODAL_CLOSED);
  }, []);

  const handleSuccess = useCallback(() => {
    if (typeof pendingAction === 'function') {
      pendingAction();
    }
    hideAuthModal();
  }, [pendingAction, hideAuthModal]);

  return (
    <AuthModalContext.Provider value={{ showAuthModal, hideAuthModal }}>
      {children}
      <AuthModal
        isOpen={isOpen}
        onClose={hideAuthModal}
        onSuccess={handleSuccess}
        variant={variant}
      />
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
