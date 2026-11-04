'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  buildGoogleAuthUrl,
  clearGmailOAuthSession,
  defaultGmailRedirectUri,
  generateOAuthState,
  peekGmailOAuthRedirectUri,
  peekGmailOAuthState,
  storeGmailOAuthSession,
} from '@/app/expert-finder/lib/gmailOAuth';
import { MailboxDailyUsageCard } from '@/app/expert-finder/settings/components/MailboxDailyUsageCard';
import { useDisconnectMailbox, useMailboxStatus } from '@/hooks/useExpertFinder';
import { ExpertFinderMailboxService } from '@/services/expertFinderMailbox.service';
import { extractApiErrorMessage, getApiErrorCode } from '@/services/lib/serviceUtils';

const MAILBOX_NOT_ALLOWED_MESSAGE =
  'Only personal @gmail.com or @googlemail.com accounts can be connected.';
const OAUTH_CANCELLED_MESSAGE = 'Gmail connection was cancelled or failed. Please try again.';
const OAUTH_STATE_MISMATCH_MESSAGE =
  'Unable to verify Gmail connection. Please try connecting again.';

type OAuthReturnResult = { ok: true } | { ok: false; message: string };

/**
 * Shared across Strict Mode remounts so the authorization code is exchanged once
 * and every mount can observe the same result.
 */
let oauthReturnFlightKey: string | null = null;
let oauthReturnPromise: Promise<OAuthReturnResult> | null = null;

function getMailboxConnectErrorMessage(err: unknown): string {
  if (getApiErrorCode(err) === 'mailbox_not_allowed') {
    return MAILBOX_NOT_ALLOWED_MESSAGE;
  }
  return extractApiErrorMessage(err, 'Failed to connect Gmail. Please try again.');
}

export function SettingsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [{ status, isLoading: isStatusLoading, error: statusError }, refreshStatus] =
    useMailboxStatus();
  const [{ isLoading: isDisconnecting }, disconnectMailbox] = useDisconnectMailbox();

  const [actionError, setActionError] = useState<string | null>(null);
  const [isStartingOAuth, setIsStartingOAuth] = useState(false);
  const [isHandlingOAuthReturn, setIsHandlingOAuthReturn] = useState(false);

  const clearOAuthQueryParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('code');
    params.delete('state');
    params.delete('error');
    params.delete('scope');
    params.delete('authuser');
    params.delete('prompt');
    params.delete('hd');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  // Handle Google OAuth return (?code= / ?error=) on mount.
  useEffect(() => {
    const oauthError = searchParams.get('error');
    const code = searchParams.get('code');
    const returnedState = searchParams.get('state');

    if (!oauthError && !code) return;

    const flightKey = oauthError ? `error:${oauthError}` : `code:${code}`;

    if (!oauthReturnPromise || oauthReturnFlightKey !== flightKey) {
      oauthReturnFlightKey = flightKey;
      oauthReturnPromise = (async (): Promise<OAuthReturnResult> => {
        if (oauthError) {
          clearGmailOAuthSession();
          return { ok: false, message: OAUTH_CANCELLED_MESSAGE };
        }

        const expectedState = peekGmailOAuthState();
        if (!code || !returnedState || !expectedState || returnedState !== expectedState) {
          clearGmailOAuthSession();
          return { ok: false, message: OAUTH_STATE_MISMATCH_MESSAGE };
        }

        const redirectUri = peekGmailOAuthRedirectUri() || defaultGmailRedirectUri();
        clearGmailOAuthSession();

        try {
          await ExpertFinderMailboxService.connect({ code, redirectUri });
          return { ok: true };
        } catch (err: unknown) {
          return { ok: false, message: getMailboxConnectErrorMessage(err) };
        }
      })();
    }

    let cancelled = false;
    setIsHandlingOAuthReturn(true);
    setActionError(null);

    void oauthReturnPromise.then(async (result) => {
      if (cancelled) return;
      if (result.ok) {
        await refreshStatus();
      } else {
        setActionError(result.message);
      }
      setIsHandlingOAuthReturn(false);
      clearOAuthQueryParams();
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams, clearOAuthQueryParams, refreshStatus]);

  const startGoogleOAuth = useCallback(async () => {
    setActionError(null);
    setIsStartingOAuth(true);
    try {
      const config = await ExpertFinderMailboxService.getConnectConfig();
      const redirectUri = config.redirectUri?.trim() || defaultGmailRedirectUri();
      if (!config.clientId?.trim()) {
        throw new Error('Gmail connect is not configured. Missing client ID.');
      }
      if (!config.scopes.length) {
        throw new Error('Gmail connect is not configured. Missing scopes.');
      }

      const state = generateOAuthState();
      storeGmailOAuthSession(state, redirectUri);
      const authUrl = buildGoogleAuthUrl({ ...config, redirectUri }, state);
      window.location.assign(authUrl);
    } catch (err: unknown) {
      if (getApiErrorCode(err) === 'mailbox_not_allowed') {
        setActionError(MAILBOX_NOT_ALLOWED_MESSAGE);
      } else {
        setActionError(
          extractApiErrorMessage(err, 'Unable to start Gmail connection. Please try again.')
        );
      }
      setIsStartingOAuth(false);
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    setActionError(null);
    try {
      await disconnectMailbox();
      await refreshStatus();
    } catch (err: unknown) {
      setActionError(extractApiErrorMessage(err, 'Failed to disconnect Gmail. Please try again.'));
    }
  }, [disconnectMailbox, refreshStatus]);

  const error = actionError || statusError;
  const needsReauth = status?.status === 'needs_reauth';
  const isConnected = Boolean(status?.connected);
  const isBusy = isStartingOAuth || isDisconnecting || isHandlingOAuthReturn || isStatusLoading;

  const showInitialSkeleton = isStatusLoading && !status && !isHandlingOAuthReturn;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Breadcrumbs items={[{ label: 'Settings' }]} className="mb-2" />
      </div>

      {error && (
        <div>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <section className="space-y-4">
        <div>
          <p className="mt-1 text-sm text-gray-600">Only personal Gmail addresses are supported.</p>
        </div>

        {showInitialSkeleton || isHandlingOAuthReturn ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading Gmail connection">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-10 w-40" />
            {isHandlingOAuthReturn && (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Completing Gmail connection...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {needsReauth && (
              <Alert variant="warning">
                Your Gmail connection needs to be reauthorized before you can send outreach.
              </Alert>
            )}

            {isConnected && status?.email && (
              <Input
                label={needsReauth ? 'Previously connected as' : 'Connected as'}
                value={status.email}
                readOnly
                className="bg-gray-50 max-w-md"
              />
            )}

            {isConnected && !needsReauth && !status?.email && (
              <p className="text-sm text-gray-800">Connected as your Gmail account</p>
            )}

            {!isConnected && !needsReauth && (
              <p className="text-sm text-gray-700">
                No Gmail account connected. Connect to enable Send and Send preview from outreach
                drafts.
              </p>
            )}

            {status?.lastError && (
              <p className="text-sm text-red-700">Last error: {status.lastError}</p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {!isConnected || needsReauth ? (
                <Button
                  variant="default"
                  size="md"
                  onClick={() => void startGoogleOAuth()}
                  disabled={isBusy}
                  className="gap-2"
                >
                  {isStartingOAuth && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  {needsReauth ? 'Reconnect Gmail' : 'Connect Gmail'}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  size="md"
                  onClick={() => void handleDisconnect()}
                  disabled={isBusy}
                  className="gap-2"
                >
                  {isDisconnecting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        )}
      </section>

      {isConnected && (
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Daily send usage</h2>
            <p className="mt-1 text-sm text-gray-600 max-w-2xl">
              There is a daily cap across Expert Finder outreach.
            </p>
          </div>

          {showInitialSkeleton || isHandlingOAuthReturn ? (
            <div className="space-y-3 rounded-xl border border-gray-200 p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-56" />
            </div>
          ) : status ? (
            <MailboxDailyUsageCard status={status} />
          ) : null}
        </section>
      )}
    </div>
  );
}
