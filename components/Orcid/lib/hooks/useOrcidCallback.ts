import { useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const ORCID_MESSAGES = {
  success: 'ORCID connected',
  error: 'Unable to connect to ORCID',
  already_linked: 'This ORCID ID is already linked',
} as const;

interface UseOrcidCallbackOptions {
  readonly onSuccess?: () => void;
}

export function useOrcidCallback(options?: UseOrcidCallbackOptions) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { onSuccess } = options || {};

  const orcidSuccess = searchParams.get('orcid_connected') === 'true';
  const orcidError = searchParams.get('orcid_error');

  useEffect(() => {
    if (!orcidSuccess && !orcidError) return;

    if (orcidSuccess) {
      toast.success(ORCID_MESSAGES.success, { id: 'orcid-success' });
      onSuccess?.();
    } else if (orcidError) {
      const errorMessage =
        ORCID_MESSAGES[orcidError as keyof typeof ORCID_MESSAGES] || decodeURIComponent(orcidError);
      toast.error(errorMessage, { id: 'orcid-error' });
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete('orcid_connected');
    params.delete('orcid_error');
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.replace(url);
  }, [orcidSuccess, orcidError, pathname, searchParams, router, onSuccess]);
}
