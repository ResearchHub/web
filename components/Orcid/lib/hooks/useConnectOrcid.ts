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
    const url = new URL(pathname, window.location.origin);
    const query = searchParams.toString();
    if (query) {
      url.search = query;
    }

    try {
      setIsConnecting(true);
      await connectOrcidAccount(url.toString());
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to connect to ORCID'));
    } finally {
      setIsConnecting(false);
    }
  }, [pathname, searchParams]);

  return { connect, isConnecting };
}
