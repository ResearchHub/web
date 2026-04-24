'use client';

import { useEffect, useState } from 'react';
import { AuthService } from '@/services/auth.service';
import type { MfaStatusApiResponse } from '@/services/types';
import { formatDate } from '@/utils/date';
import { Badge } from '@/components/ui/Badge';

export function SecuritySection() {
  const [status, setStatus] = useState<MfaStatusApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await AuthService.getMfaStatus();
        if (!cancelled) {
          setStatus(data);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load security settings');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Two-factor authentication</h2>
        <p className="text-sm text-gray-500">
          Add an extra layer of security by requiring a one-time code at sign-in.
        </p>
      </header>

      {isLoading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : status?.mfa_enabled ? (
        <div className="flex items-center gap-2 text-sm">
          <Badge className="border-green-700 bg-white text-green-700">Enabled</Badge>
          {status.created_at && (
            <span className="text-gray-400">Registered on {formatDate(status.created_at)}</span>
          )}
          {status.last_used_at && (
            <span className="text-gray-400">| Last used on {formatDate(status.last_used_at)}</span>
          )}
        </div>
      ) : (
        <Badge className="border-red-700 bg-white text-red-700">Not enabled</Badge>
      )}
    </section>
  );
}
