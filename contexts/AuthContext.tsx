'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import AuthModal from '@/components/modals/Auth/AuthModal';

interface AuthContextType {
  showAuthModal: () => void;
  requireAuth: (callback: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const showAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const requireAuth = useCallback((callback: () => void) => {
    setPendingCallback(() => callback);
    setIsAuthModalOpen(true);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setIsAuthModalOpen(false);
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  }, [pendingCallback]);

  return (
    <AuthContext.Provider value={{ showAuthModal, requireAuth }}>
      {children}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingCallback(null);
        }}
        onSuccess={handleAuthSuccess}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
