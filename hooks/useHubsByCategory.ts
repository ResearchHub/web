import { useState, useEffect } from 'react';
import { Topic, groupTopicsByCategory } from '@/types/topic';
import { HubService } from '@/services/hub.service';

interface UseHubsByCategoryResult {
  topics: Topic[];
  groupedTopics: Record<string, Topic[]>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHubsByCategory(): UseHubsByCategoryResult {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [groupedTopics, setGroupedTopics] = useState<Record<string, Topic[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await HubService.getHubsByCategory();
      setTopics(data);
      const grouped = groupTopicsByCategory(data);
      setGroupedTopics(grouped);
    } catch (err) {
      setError('Failed to load topics');
      console.error('Error fetching topics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  return {
    topics,
    groupedTopics,
    isLoading,
    error,
    refetch: fetchTopics,
  };
}
