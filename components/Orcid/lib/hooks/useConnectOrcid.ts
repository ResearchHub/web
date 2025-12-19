import { useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { connectOrcidAccount } from '@/components/Orcid/lib/services/orcid.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import toast from 'react-hot-toast';

export function useConnectOrcid() {
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
    const result = await connectOrcidAccount(url.toString());

    if (result.success) {
      globalThis.location.href = result.authUrl;
    } else {
      toast.error(extractApiErrorMessage(result.error, 'Unable to connect to ORCID.'));
      setIsConnecting(false);
    }
  }, [pathname, searchParams]);

  return { connect, isConnecting };
}
