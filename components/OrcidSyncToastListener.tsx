'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export function OrcidSyncToastListener() {
  const search = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const flag = search.get('orcid_sync');
    if (!flag) return;

    if (flag === 'ok') toast.success('Sync started! We’ll refresh your authorship shortly.');
    else toast.error('ORCID sync failed.');

    // strip the param
    const entries = Array.from(search.entries()).filter(([k]) => k !== 'orcid_sync');
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
