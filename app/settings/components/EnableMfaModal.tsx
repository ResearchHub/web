'use client';

import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { AuthService } from '@/services/auth.service';
import { ApiError } from '@/services/types/api';
import type { MfaTotpActivateInitApiResponse } from '@/services/types';

interface EnableMfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'setup' | 'recovery';

export function EnableMfaModal({ isOpen, onClose, onSuccess }: EnableMfaModalProps) {
  const [step, setStep] = useState<Step>('setup');
  const [setupData, setSetupData] = useState<MfaTotpActivateInitApiResponse | null>(null);
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [isInitLoading, setIsInitLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('setup');
      setSetupData(null);
      setCode('');
      setRecoveryCodes([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsInitLoading(true);
    (async () => {
      try {
        const data = await AuthService.initMfaSetup();
        if (!cancelled) setSetupData(data);
      } catch {
        if (!cancelled) setError('Failed to start MFA setup. Please try again.');
      } finally {
        if (!cancelled) setIsInitLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleVerify = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!setupData) return;

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError('Enter the 6-digit code from your authenticator app');
      return;
    }

    setIsVerifying(true);
    setError(null);
    try {
      const response = await AuthService.activateMfa({
        activation_token: setupData.activation_token,
        code: trimmedCode,
      });
      setRecoveryCodes(response.recovery_codes);
      setStep('recovery');
    } catch (err) {
      if (err instanceof ApiError) {
        const errorValues = Object.values(err.errors as Record<string, string[]>)?.[0];
        setError(Array.isArray(errorValues) ? errorValues[0] : err.message || 'Invalid code');
      } else {
        setError('Verification failed');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDone = () => {
    onSuccess();
    onClose();
  };

  const copyRecoveryCodes = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      toast.success('Recovery codes copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'setup' ? 'Enable two-factor authentication' : 'Save your recovery codes'}
      size="md"
      footer={
        step === 'setup' ? (
          <Button
            type="submit"
            form="enable-mfa-form"
            disabled={isVerifying || isInitLoading || !setupData}
            className="w-full"
          >
            {isVerifying ? 'Verifying…' : 'Verify and enable'}
          </Button>
        ) : (
          <Button onClick={handleDone} className="w-full">
            Done
          </Button>
        )
      }
    >
      {step === 'setup' ? (
        <form id="enable-mfa-form" onSubmit={handleVerify} className="space-y-4">
          <p className="text-sm text-gray-600">
            Use an authenticator app to scan the QR code, then enter the 6-digit code below.
          </p>

          <div className="flex justify-center py-2">
            {isInitLoading ? (
              <div className="h-[192px] w-[192px] bg-gray-100 rounded animate-pulse" />
            ) : setupData ? (
              <div className="p-3 bg-white border border-gray-200 rounded">
                <QRCodeSVG value={setupData.totp_url} size={192} />
              </div>
            ) : null}
          </div>

          {setupData && (
            <div className="text-xs text-gray-500 text-center">
              Can't scan? You can use this setup key to manually configure your authenticator app:{' '}
              <span className="font-mono text-gray-700 break-all">{setupData.secret}</span>
            </div>
          )}

          <div>
            <label htmlFor="mfa-code" className="block text-sm font-medium text-gray-700 mb-1">
              Verify code from the authenticator app
            </label>
            <input
              id="mfa-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full p-3 border rounded"
              autoComplete="one-time-code"
              inputMode="numeric"
              autoFocus
            />
          </div>

          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-lg text-sm">
            Save these recovery codes in a safe place. Each code can be used once to sign in if you
            lose access to your authenticator app. You won't be able to see them again.
          </div>

          <div className="relative bg-gray-50 border border-gray-200 rounded p-4 font-mono text-sm">
            <button
              type="button"
              onClick={copyRecoveryCodes}
              className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
              aria-label="Copy recovery codes"
            >
              <Copy className="h-4 w-4" />
            </button>
            <div className="grid grid-cols-2 gap-2 pr-8">
              {recoveryCodes.map((rc) => (
                <div key={rc} className="text-gray-800">
                  {rc}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
