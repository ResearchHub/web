'use client';

import { useEffect, useState } from 'react';
import { ShieldOff } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { AuthService } from '@/services/auth.service';
import { ApiError } from '@/services/types/api';

interface DisableMfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DisableMfaModal({ isOpen, onClose, onSuccess }: Readonly<DisableMfaModalProps>) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleDisable = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError('Enter the 6-digit code from your authenticator app');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await AuthService.deactivateMfa({ code: trimmedCode });
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const errorValues = Object.values(err.errors as Record<string, string[]>)?.[0];
        setError(Array.isArray(errorValues) ? errorValues[0] : err.message || 'Invalid code');
      } else {
        setError('Failed to disable MFA');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <ShieldOff className="h-5 w-5" />
          Disable two-factor authentication
        </span>
      }
      size="md"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outlined" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            form="disable-mfa-form"
            disabled={isSubmitting}
            variant="destructive"
            className="flex-1"
          >
            {isSubmitting ? 'Disabling…' : 'Disable'}
          </Button>
        </div>
      }
    >
      <form id="disable-mfa-form" onSubmit={handleDisable} className="space-y-4">
        <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-lg text-sm">
          Disabling two-factor authentication will make your account less secure.
        </div>

        <div>
          <label
            htmlFor="disable-mfa-code"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Enter a code from your authenticator app to confirm
          </label>
          <input
            id="disable-mfa-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            autoComplete="one-time-code"
            inputMode="numeric"
            autoFocus
          />
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      </form>
    </BaseModal>
  );
}
