import { useState, useEffect, useCallback } from 'react';
import { EditorService } from '@/services/editor.service';
import { Hub } from '@/types/hub';

interface UseHubsReturn {
  hubs: Hub[];
  isLoading: boolean;
  error: string | null;
  fetchHubSuggestions: (query: string) => Promise<Hub[]>;
}

export function useHubs(): UseHubsReturn {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHubs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await EditorService.fetchHubs();
      setHubs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hubs');
      console.error('Error fetching hubs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchHubSuggestions = useCallback(async (query: string): Promise<Hub[]> => {
    try {
      return await EditorService.fetchHubSuggestions(query);
    } catch (err) {
      console.error('Error fetching hub suggestions:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchHubs();
  }, [fetchHubs]);

  return {
    hubs,
    isLoading,
    error,
    fetchHubSuggestions,
  };
}
