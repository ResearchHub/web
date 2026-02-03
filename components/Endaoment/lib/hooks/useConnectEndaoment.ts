import { useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { connectEndaomentAccount } from '@/services/endaoment.service';
import toast from 'react-hot-toast';

/**
 * This hook provides a function to initiate the connection process to Endaoment.
 * It returns a function that can be called to start the connection flow by obtaining
 * an authorization URL and redirecting the user to it.
 */
export function useConnectEndaoment() {
  const [isConnecting, setIsConnecting] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const connect = useCallback(async () => {
    const url = new URL(pathname, globalThis.location.origin);
    const query = searchParams.toString();
    if (query) {
      url.search = query;
    }

    setIsConnecting(true);
    try {
      const authUrl = await connectEndaomentAccount(url.toString());
      globalThis.location.href = authUrl;
    } catch {
      toast.error('Unable to connect to Endaoment.');
      setIsConnecting(false);
    }
  }, [pathname, searchParams]);

  return { connect, isConnecting };
}
