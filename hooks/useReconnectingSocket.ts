'use client';

import { useEffect, useRef, useState } from 'react';
import { getSession } from 'next-auth/react';
import { ApiClient } from '@/services/client';

const MAX_RECONNECT_DELAY_MS = 30_000;
/**
 * How long a connection must survive before the backoff counter resets.
 * Resetting in `onopen` directly would turn accept-then-close flapping into a
 * reconnect loop at the minimum delay that never backs off.
 */
const STABLE_CONNECTION_MS = 10_000;

export type SocketStatus = 'idle' | 'connecting' | 'open' | 'closed';

interface UseReconnectingSocketOptions {
  /** Full ws(s) URL, or null while the target isn't known yet. */
  url: string | null;
  /** Connect only while the subscription is wanted. */
  enabled: boolean;
  /**
   * Server-defined close codes that mean reconnecting is pointless (access
   * denied, target gone). REST remains the fallback for every socket built on
   * this hook, so a fatal close degrades to polling, never to wrong data.
   */
  fatalCloseCodes: ReadonlySet<number>;
  /**
   * A parsed JSON frame arrived. Frames carry identifiers, never state — the
   * only correct reaction to any kind is a (debounced) refetch, which the
   * caller owns.
   */
  onMessage: (data: unknown) => void;
  /** Socket re-opened after a drop — refetch immediately, events were missed. */
  onReconnect: () => void;
}

async function getAuthToken(): Promise<string | null> {
  const cached = ApiClient.getGlobalAuthToken();
  if (cached) return cached;
  try {
    const session = await getSession();
    return session?.authToken ?? null;
  } catch {
    return null;
  }
}

/**
 * The shared core of the notebook nudge sockets: one WebSocket per target,
 * authenticated by the backend's subprotocol pattern (the token rides in the
 * subprotocols array and the server accepts by echoing `Token`).
 *
 * Reconnects with exponential backoff on any non-fatal close; never reconnects
 * on the caller's fatal codes. The socket is a latency optimization — every
 * failure mode here degrades to polling, never to wrong data.
 */
export function useReconnectingSocket({
  url,
  enabled,
  fatalCloseCodes,
  onMessage,
  onReconnect,
}: UseReconnectingSocketOptions): SocketStatus {
  const [status, setStatus] = useState<SocketStatus>('idle');

  // Keep callbacks (and the code set) in refs so handler identity never
  // forces a resubscribe.
  const onMessageRef = useRef(onMessage);
  const onReconnectRef = useRef(onReconnect);
  const fatalCloseCodesRef = useRef(fatalCloseCodes);
  onMessageRef.current = onMessage;
  onReconnectRef.current = onReconnect;
  fatalCloseCodesRef.current = fatalCloseCodes;

  useEffect(() => {
    if (!enabled || url == null) {
      setStatus('idle');
      return;
    }

    let disposed = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let stableTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let hasOpenedBefore = false;

    const scheduleReconnect = () => {
      if (disposed) return;
      attempts += 1;
      const delay = Math.min(1000 * 2 ** (attempts - 1), MAX_RECONNECT_DELAY_MS);
      reconnectTimer = setTimeout(connect, delay);
    };

    const connect = async () => {
      if (disposed) return;
      setStatus('connecting');

      const token = await getAuthToken();
      if (disposed) return;
      if (!token) {
        // No session to authenticate with; a later remount (login) retries.
        setStatus('closed');
        return;
      }

      try {
        ws = new WebSocket(url, ['Token', token]);
      } catch {
        setStatus('closed');
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        if (disposed) return;
        stableTimer = setTimeout(() => {
          attempts = 0;
        }, STABLE_CONNECTION_MS);
        setStatus('open');
        if (hasOpenedBefore) {
          onReconnectRef.current();
        }
        hasOpenedBefore = true;
      };

      ws.onmessage = (event) => {
        if (disposed) return;
        try {
          const data = JSON.parse(event.data);
          if (data && typeof data === 'object') {
            onMessageRef.current(data);
          }
        } catch {
          // Malformed frame — ignore; the poll fallback keeps state correct.
        }
      };

      ws.onclose = (event) => {
        ws = null;
        if (stableTimer) {
          clearTimeout(stableTimer);
          stableTimer = null;
        }
        if (disposed) return;
        setStatus('closed');
        if (fatalCloseCodesRef.current.has(event.code)) {
          return;
        }
        scheduleReconnect();
      };

      // Errors are always followed by close; reconnect is handled there.
      ws.onerror = () => {};
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (stableTimer) clearTimeout(stableTimer);
      if (ws) {
        // Detach handlers before closing so the unmount close doesn't schedule work.
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        try {
          ws.close(1000, 'subscription closed');
        } catch {
          // Already closing.
        }
      }
      setStatus('idle');
    };
  }, [url, enabled]);

  return status;
}
