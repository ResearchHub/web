import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook for copying an address to clipboard with toast notifications
 */
export function useCopyAddress() {
  const [isCopied, setIsCopied] = useState(false);

  const copyAddress = useCallback((address: string | null | undefined) => {
    if (!address) return;

    navigator.clipboard.writeText(address).then(
      () => {
        setIsCopied(true);
        toast.success('Address copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error('Failed to copy address: ', err);
        toast.error('Failed to copy address.');
      }
    );
  }, []);

  return { isCopied, copyAddress };
}
