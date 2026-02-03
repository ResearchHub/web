import { useEffect, useRef } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const ENDAOMENT_MESSAGES = {
  success: 'Endaoment connected',
  error: 'Unable to connect to Endaoment',
  already_linked: 'This Endaoment account is already linked',
} as const;

interface UseEndaomentCallbackOptions {
  readonly onSuccess?: () => void;
}

/**
 * This hook handles the callback from Endaoment after an attempt to connect the user's account.
 * It checks for success or error parameters in the URL and displays appropriate toast notifications.
 * After handling, it cleans up the URL by removing these parameters.
 *
 * @param onSuccess Optional callback to be invoked on successful connection.
 */
export function useEndaomentCallback({ onSuccess }: UseEndaomentCallbackOptions = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const endaomentSuccess = searchParams.get('endaoment_connected') === 'true';
  const endaomentError = searchParams.get('endaoment_error');

  useEffect(() => {
    if (!endaomentSuccess && !endaomentError) return;

    if (endaomentSuccess) {
      toast.success(ENDAOMENT_MESSAGES.success, { id: 'endaoment-success' });
      onSuccessRef.current?.();
    } else if (endaomentError) {
      const errorMessage =
        ENDAOMENT_MESSAGES[endaomentError as keyof typeof ENDAOMENT_MESSAGES] ||
        decodeURIComponent(endaomentError);
      toast.error(errorMessage, { id: 'endaoment-error' });
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete('endaoment_connected');
    params.delete('endaoment_error');
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.replace(url);
  }, [endaomentSuccess, endaomentError, pathname, searchParams, router]);
}
