'use client';

import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import type { MfaStatusApiResponse } from '@/services/types';
import { formatDate } from '@/utils/date';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/contexts/UserContext';
import { EnableMfaModal } from './EnableMfaModal';
import { DisableMfaModal } from './DisableMfaModal';

export function SecuritySection() {
  const { user } = useUser();
  const isGoogleAccount = user?.authProvider === 'google';
  const [status, setStatus] = useState<MfaStatusApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnableOpen, setIsEnableOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await AuthService.getMfaStatus();
      setStatus(data);
      setError(null);
    } catch {
      setError('Failed to load security settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <header className="rounded-t-lg border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <ShieldCheck className="h-5 w-5" />
          Security
        </h2>
      </header>

      <div className="p-6">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Two-factor authentication</h3>
            <p className="text-sm text-gray-500">
              Add an extra layer of security by requiring a one-time code at sign-in.
            </p>
            {isGoogleAccount && (
              <p className="mt-1 text-sm italic text-gray-400">
                Not yet available for Google accounts.
              </p>
            )}
          </div>
          {!isLoading && !error && !status?.mfa_enabled && !isGoogleAccount && (
            <Button onClick={() => setIsEnableOpen(true)}>Enable</Button>
          )}
          {!isLoading && !error && status?.mfa_enabled && (
            <Button variant="outlined" onClick={() => setIsDisableOpen(true)}>
              Disable
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : status?.mfa_enabled ? (
          <div className="flex items-center gap-2 text-sm">
            <Badge className="border-green-700 bg-white text-green-700">Enabled</Badge>
            {status.created_at && (
              <span className="text-gray-400">Registered on {formatDate(status.created_at)}</span>
            )}
            {status.last_used_at && (
              <span className="text-gray-400">
                | Last used on {formatDate(status.last_used_at)}
              </span>
            )}
          </div>
        ) : (
          <Badge className="border-red-700 bg-white text-red-700">Not enabled</Badge>
        )}
      </div>

      <EnableMfaModal
        isOpen={isEnableOpen}
        onClose={() => setIsEnableOpen(false)}
        onSuccess={fetchStatus}
      />

      <DisableMfaModal
        isOpen={isDisableOpen}
        onClose={() => setIsDisableOpen(false)}
        onSuccess={fetchStatus}
      />
    </section>
  );
}
