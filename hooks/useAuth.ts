'use client';

import { useState } from 'react';
import { AuthService } from '@/services/auth.service';

interface UsePasswordResetReturn {
  resetPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

export const usePasswordReset = (): UsePasswordResetReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await AuthService.resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    resetPassword,
    isLoading,
    error,
    success,
    reset,
  };
};

interface UsePasswordResetConfirmReturn {
  confirmPasswordReset: (data: {
    uid: string;
    token: string;
    newPassword1: string;
    newPassword2: string;
  }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

export const usePasswordResetConfirm = (): UsePasswordResetConfirmReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const confirmPasswordReset = async (data: {
    uid: string;
    token: string;
    newPassword1: string;
    newPassword2: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await AuthService.confirmPasswordReset({
        uid: data.uid,
        token: data.token,
        new_password1: data.newPassword1,
        new_password2: data.newPassword2,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    confirmPasswordReset,
    isLoading,
    error,
    success,
    reset,
  };
};
