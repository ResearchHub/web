'use client';

import { useCallback, useEffect, useState } from 'react';
import { OAuthService } from '@/services/oauth.service';
import { ApiError } from '@/services/types';
import type { OAuthConsentRequest } from '@/types/oauth';

// A 400 means the client or its redirect URI is invalid, so the error stays on
// the page instead of going back to the client.
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 400) {
    const description = (error.errors as Record<string, unknown> | undefined)?.error_description;
    if (typeof description === 'string') return description;
    return 'This app sent an invalid authorization request.';
  }
  return 'Something went wrong. Please try again.';
}

/**
 * Loads a client's authorization request for the consent page and sends the
 * user back to the client with their decision.
 */
export function useOAuthConsent(query: string) {
  const [request, setRequest] = useState<OAuthConsentRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    OAuthService.getConsentRequest(query)
      .then((result) => {
        if (cancelled) return;
        if (result.kind === 'redirect') {
          window.location.assign(result.url);
          return;
        }
        setRequest(result.request);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const decide = useCallback(
    async (allow: boolean) => {
      setIsSubmitting(true);
      try {
        window.location.assign(await OAuthService.decide(query, allow));
      } catch (err) {
        setError(getErrorMessage(err));
        setIsSubmitting(false);
      }
    },
    [query]
  );

  return { request, error, isSubmitting, decide };
}
