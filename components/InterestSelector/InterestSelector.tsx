import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { BookOpen, Hash } from 'lucide-react';
import { InterestSkeleton } from '@/components/skeletons/InterestSkeleton';
import { InterestCard } from './InterestCard';
import { HubService } from '@/services/hub.service';
import { SearchService } from '@/services/search.service';
import { Topic, transformTopic } from '@/types/topic';
import { EntityType, SearchSuggestion } from '@/types/search';
import { toast } from 'react-hot-toast';
import debounce from 'lodash-es/debounce';

type TopicType = 'journal' | 'topic';

// Switch order: Topics first
const interestTypes = [
  { id: 'topic' as TopicType, label: 'Topics', icon: Hash },
  { id: 'journal' as TopicType, label: 'Journals', icon: BookOpen },
] as const;

interface InterestSelectorProps {
  mode: 'onboarding' | 'preferences';
  showToastOnSuccess?: boolean;
  onSaveComplete?: () => void; // Kept for potential future use, though not strictly needed for auto-save
}

export function InterestSelector({
  mode,
  onSaveComplete,
  showToastOnSuccess = true,
}: InterestSelectorProps) {
  const [activeType, setActiveType] = useState<TopicType>('topic'); // Default to 'topic'
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false); // Loading state specifically for search
  const [topics, setTopics] = useState<Topic[]>([]);
  const [followedIds, setFollowedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const descriptions = {
    journal: 'Select journals to stay updated with the latest research in your field',
    topic: 'Choose topics to get personalized recommendations',
  };

  // Fetch initial list of topics/journals (not search results)
  const fetchInitialTopics = async (type: TopicType): Promise<Topic[]> => {
    try {
      if (type === 'journal') {
        return await HubService.getHubs({ namespace: 'journal' });
      }
      if (type === 'topic') {
        // Assuming 'hub' without namespace=journal means topics
        return await HubService.getHubs({ excludeJournals: true });
      }
      return [];
    } catch (error) {
      console.error(`Error fetching initial ${type}s:`, error);
      toast.error(`Failed to load ${type}s.`);
      return [];
    }
  };

  // Fetch search suggestions
  const fetchSearchSuggestions = async (query: string, type: TopicType): Promise<Topic[]> => {
    if (!query) return [];
    setIsSearching(true);
    try {
      // Use 'hub' index for both topics and journals as API returns entity_type 'hub'
      const index: EntityType = 'hub';
      const suggestions: SearchSuggestion[] = await SearchService.getSuggestions(query, index);

      // Map SearchSuggestion (for hubs/journals) back to Topic type
      return suggestions
        .map((suggestion): Topic | null => {
          // We only care about 'hub' type suggestions from the search
          if (suggestion.entityType === 'hub') {
            // Map available SearchSuggestion fields back to Topic fields
            return {
              id: suggestion.id,
              name: suggestion.displayName,
              slug: suggestion.slug || '',
              // Optional fields from SearchSuggestion if available
              description: suggestion.description || '',
              paperCount: suggestion.paperCount || 0,
              imageUrl: suggestion.imageUrl,
              // Add defaults for other optional Topic fields if needed by InterestCard
              // namespace: type === 'journal' ? 'journal' : 'topic', // We could infer namespace here
            };
          }
          return null;
        })
        .filter((t): t is Topic => t !== null); // Filter out nulls and assert type
    } catch (error) {
      console.error(`Error searching ${type}s:`, error);
      toast.error(`Failed to search ${type}s.`);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Effect to load data based on activeType and searchQuery
  useEffect(() => {
    // Sort topics only if there is no active search query
    const sortTopics = (searchQuery: string, topics: Topic[], followedIds: number[]) =>
      searchQuery
        ? topics // If searching, display results as is (already filtered by API)
        : [...topics].sort((a, b) => {
            const aIsFollowed = followedIds.includes(Number(a.id));
            const bIsFollowed = followedIds.includes(Number(b.id));
            if (aIsFollowed && !bIsFollowed) return -1;
            if (!aIsFollowed && bIsFollowed) return 1;
            return a.name.localeCompare(b.name);
          });

    const loadData = async () => {
      setIsLoading(true);
      setTopics([]); // Clear topics before loading new ones

      try {
        let fetchedTopics: Topic[] = [];
        // Fetch followed IDs regardless of search
        const followedItemsPromise = HubService.getFollowedHubs();

        if (searchQuery) {
          fetchedTopics = await fetchSearchSuggestions(searchQuery, activeType);
        } else {
          fetchedTopics = await fetchInitialTopics(activeType);
        }

        const followedItems = await followedItemsPromise;

        const sortedTopics = sortTopics(searchQuery, fetchedTopics, followedItems);
        setTopics(sortedTopics);

        setFollowedIds(followedItems);
      } catch (error) {
        // Error handling is done within fetch functions
        console.error('Error loading data:', error);
        setTopics([]);
        setFollowedIds([]); // Ensure consistency on error
      } finally {
        setIsLoading(false);
      }
    };

    // Debounced search triggers loadData directly
    if (searchQuery) {
      loadData(); // No debounce needed here as fetchSearchSuggestions handles loading state
    } else {
      // Load initial data immediately on type change or initial load
      loadData();
    }
  }, [activeType, searchQuery]); // Depend on searchQuery

  // Debounced handler for search input changes
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300), // 300ms debounce delay
    [activeType] // Recreate debounce if activeType changes, though likely not necessary
  );

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleTypeChange = (type: TopicType) => {
    setSearchQuery(''); // Clear search when changing type
    setActiveType(type);
  };

  const handleFollowToggle = async (topicId: number, isCurrentlyFollowing: boolean) => {
    const originalFollowedIds = [...followedIds];

    // Optimistic UI update
    setFollowedIds((prev) => {
      const newFollowedIds = new Set(prev);
      if (isCurrentlyFollowing) {
        newFollowedIds.delete(topicId);
      } else {
        newFollowedIds.add(topicId);
      }
      return Array.from(newFollowedIds);
    });

    try {
      if (isCurrentlyFollowing) {
        await HubService.unfollowHub(topicId);
        if (showToastOnSuccess) toast.success('Unfollowed successfully');
      } else {
        await HubService.followHub(topicId);
        if (showToastOnSuccess) toast.success('Followed successfully');
      }
      // Optional: Call onSaveComplete if needed for external state updates - REMOVED
      // onSaveComplete?.();
    } catch (error) {
      console.error('Error updating follow status:', error);
      if (showToastOnSuccess) toast.error('Failed to update follow status. Please try again.');
      // Revert UI on error
      setFollowedIds(originalFollowedIds);
    }
  };

  const maxCols = mode === 'onboarding' ? 2 : 3;
  const gridClass = `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${maxCols} gap-4`;

  return (
    <div className="max-w-4xl relative pb-10">
      {' '}
      {/* Add padding-bottom */}
      {/* Search bar at the top */}
      <div className="mb-6">
        <input
          type="search"
          placeholder={`Search ${activeType}s...`}
          className="w-full px-4 py-2 border rounded-lg"
          onChange={handleSearchInputChange} // Use the debounced handler indirectly
          // We don't set the value directly to searchQuery to avoid laggy input
          // The actual search is triggered by the debounced function updating searchQuery state
        />
      </div>
      <div className="space-y-6">
        <p className="text-gray-600">{descriptions[activeType]}</p>

        {/* Interest type selector */}
        <div className="flex gap-4">
          {interestTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                variant={activeType === type.id ? 'default' : 'secondary'}
                onClick={() => handleTypeChange(type.id)}
                className="flex items-center gap-2"
                disabled={isLoading || isSearching} // Disable while loading anything
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </Button>
            );
          })}
        </div>

        {/* Topic grid */}
        <div>
          {isLoading || isSearching ? (
            <div className={gridClass}>
              {[...Array(6)].map((_, i) => (
                <InterestSkeleton key={i} />
              ))}
            </div>
          ) : (
            <TopicGrid
              topics={topics}
              followedIds={followedIds}
              onFollowToggle={handleFollowToggle}
              searchQuery={searchQuery}
              gridClass={gridClass}
            />
          )}
        </div>
      </div>
      {/* Removed Sticky Save Bar */}
    </div>
  );
}

interface TopicGridProps {
  topics: Topic[];
  followedIds: number[];
  onFollowToggle: (topicId: number, isFollowing: boolean) => void;
  searchQuery: string;
  gridClass: string;
}

function TopicGrid({
  topics,
  followedIds,
  onFollowToggle,
  searchQuery,
  gridClass,
}: TopicGridProps) {
  if (!topics || topics.length === 0) {
    return (
      <p className="text-gray-500 italic">
        No {searchQuery ? 'results found' : 'items available'}.
      </p>
    );
  }

  return (
    // Removed Search bar div
    <div className={gridClass}>
      {topics.map((topic) => (
        <InterestCard
          key={topic.id}
          topic={topic}
          isFollowing={followedIds.includes(Number(topic.id))}
          onFollowToggle={onFollowToggle}
        />
      ))}
    </div>
  );
}
