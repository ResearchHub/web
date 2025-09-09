'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { invalidateOrcidCache } from '@/hooks/useOrcid';

export function OrcidSyncToastListener() {
  const search = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const flag = search.get('orcid_sync');
    if (!flag) return;

    if (flag === 'ok') {
      toast.success("Sync started! We'll refresh your authorship shortly.");
      // Invalidate ORCID cache after successful sync
      invalidateOrcidCache();
    } else if (flag === 'fail') {
      // Check if there's a specific error message in the URL
      const errorMessage = search.get('error');
      if (errorMessage) {
        // Decode the URL-encoded error message
        const decodedError = decodeURIComponent(errorMessage);
        toast.error(decodedError);
      } else {
        toast.error('ORCID sync failed.');
      }
      // Also invalidate cache on failure to refresh status
      invalidateOrcidCache();
    }

    // strip the orcid_sync and error params
    const entries = Array.from(search.entries()).filter(
      ([k]) => k !== 'orcid_sync' && k !== 'error'
    );
    const clean =
      pathname +
      (entries.length
        ? '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
        : '');
    router.replace(clean || pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
