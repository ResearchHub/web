import { useState, useEffect } from 'react';
import { Hub, HubService } from '@/services/hub.service';

export function useHub(slug: string | null) {
  const [hub, setHub] = useState<Hub | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchHub = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const hubData = await HubService.getHubBySlug(slug);
        setHub(hubData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch hub'));
        console.error('Error fetching hub:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHub();
  }, [slug]);

  return { hub, isLoading, error };
}
