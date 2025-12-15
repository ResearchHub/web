import { useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

export function useOrcidCallback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const orcidSuccess = searchParams.get('orcid_connected') === 'true';
  const orcidError = searchParams.get('orcid_error');

  useEffect(() => {
    if (!orcidSuccess && !orcidError) return;

    if (orcidSuccess) {
      toast.success('ORCID connected', { id: 'orcid-success' });
    } else if (orcidError) {
      toast.error(decodeURIComponent(orcidError), { id: 'orcid-error' });
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete('orcid_connected');
    params.delete('orcid_error');
    const query = params.toString();
    window.history.replaceState(null, '', `${pathname}${query ? `?${query}` : ''}`);
  }, [orcidSuccess, orcidError, pathname, searchParams]);
}
