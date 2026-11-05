import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export function useXConnectCallback() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isXConnected = searchParams.get('x_connected') === 'true';

  useEffect(() => {
    if (!isXConnected) return;

    toast.success('X connected', { id: 'x-success' });

    const params = new URLSearchParams(searchParams.toString());
    params.delete('x_connected');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [isXConnected, pathname, searchParams, router]);
}
