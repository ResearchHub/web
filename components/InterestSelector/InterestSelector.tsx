import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
// import { BookOpen, Hash, Users } from 'lucide-react'; // No longer needed
import { InterestSkeleton } from '@/components/skeletons/InterestSkeleton';
// import { InterestCard } from './InterestCard'; // No longer needed
import { AuthorSuggestionCard } from './AuthorSuggestionCard';
// import { HubService } from '@/services/hub.service'; // No longer needed
// import { SearchService } from '@/services/search.service'; // No longer needed
import { UserService } from '@/services/user.service'; // Keep for potential follow API
// import { Topic, transformTopic } from '@/types/topic'; // No longer needed
// import { EntityType, SearchSuggestion } from '@/types/search'; // No longer needed
// import { AuthorProfile } from '@/types/authorProfile'; // No longer needed (using AuthorSuggestion)
import { toast } from 'react-hot-toast';
// import debounce from 'lodash-es/debounce'; // No longer needed
import { authors as mockAuthors, AuthorSuggestion } from '@/store/authorStore'; // Import mock data and type

// Define the possible interest types - REMOVED
// type InterestEntityType = 'topic' | 'author' | 'hub';

// Placeholder Author type - REMOVED
// export interface SuggestedAuthor extends AuthorProfile {
//   suggestionReason?: string;
//   followerCount?: number;
//   hIndex?: number;
//   worksCount?: number;
// }

// Update interest types array - REMOVED
// const interestTypes = [
//   { id: 'topic' as InterestEntityType, label: 'Topics', icon: Hash },
//   { id: 'author' as InterestEntityType, label: 'Authors', icon: Users },
//   { id: 'hub' as InterestEntityType, label: 'Hubs', icon: BookOpen },
// ] as const;

interface InterestSelectorProps {
  mode: 'onboarding' | 'preferences';
  showToastOnSuccess?: boolean;
  onSaveComplete?: () => void; // Keep for potential future use
}

export function InterestSelector({
  mode, // mode might still be useful for layout (e.g., grid cols)
  onSaveComplete,
  showToastOnSuccess = true,
}: InterestSelectorProps) {
  // const [activeType, setActiveType] = useState<InterestEntityType>('topic'); // REMOVED
  const [isLoading, setIsLoading] = useState(true); // Keep for initial load simulation
  // const [isSearching, setIsSearching] = useState(false); // REMOVED
  // State to hold different types of data - Simplified
  // const [topics, setTopics] = useState<Topic[]>([]); // REMOVED
  const [authors, setAuthors] = useState<AuthorSuggestion[]>([]); // Use AuthorSuggestion type
  // const [hubs, setHubs] = useState<Topic[]>([]); // REMOVED
  // State for followed IDs - Simplified
  // const [followedTopicIds, setFollowedTopicIds] = useState<number[]>([]); // REMOVED
  const [followedAuthorIds, setFollowedAuthorIds] = useState<number[]>([]);
  // const [followedHubIds, setFollowedHubIds] = useState<number[]>([]); // REMOVED

  // const [searchQuery, setSearchQuery] = useState(''); // REMOVED

  const description = 'Follow authors to see their latest work and activity'; // Simplified description

  // Fetch initial list - REMOVED
  // const fetchInitialData = async (type: InterestEntityType): Promise<any[]> => { ... };

  // Fetch search suggestions - REMOVED
  // const fetchSearchSuggestions = async ( ... ) => { ... };

  // Effect to load mock data on mount
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call delay for loading state
    const timer = setTimeout(() => {
      setAuthors(mockAuthors);
      // TODO: Fetch actual followed author IDs if needed for initial state
      // For now, assume none are followed initially
      setFollowedAuthorIds([]);
      setIsLoading(false);
    }, 500); // 500ms delay simulation

    return () => clearTimeout(timer); // Cleanup timer
  }, []); // Run only once on mount

  // Debounced handler for search input changes - REMOVED
  // const debouncedSearch = useCallback( ... );

  // Handle search input change - REMOVED
  // const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... };

  // Handle type change - REMOVED
  // const handleTypeChange = (type: InterestEntityType) => { ... };

  // Simplified Follow Toggle Handler for Authors only
  const handleFollowToggle = async (authorId: number, isCurrentlyFollowing: boolean) => {
    const originalFollowedIds = [...followedAuthorIds];

    // Optimistic UI update
    setFollowedAuthorIds((prev) => {
      const newFollowedIds = new Set(prev);
      if (isCurrentlyFollowing) {
        newFollowedIds.delete(authorId);
      } else {
        newFollowedIds.add(authorId);
      }
      return Array.from(newFollowedIds);
    });

    try {
      let successMessage = '';
      // Placeholder for author follow/unfollow API calls
      if (isCurrentlyFollowing) {
        // await UserService.unfollowAuthor(authorId); // Hypothetical
        console.log('TODO: Unfollow Author API Call', authorId);
        successMessage = 'Unfollowed author';
      } else {
        // await UserService.followAuthor(authorId); // Hypothetical
        console.log('TODO: Follow Author API Call', authorId);
        successMessage = 'Followed author';
      }

      if (showToastOnSuccess) toast.success(successMessage);
    } catch (error) {
      console.error(`Error updating follow status for author ${authorId}:`, error);
      if (showToastOnSuccess) toast.error(`Failed to update follow status. Please try again.`);
      // Revert UI on error
      setFollowedAuthorIds(originalFollowedIds);
    }
  };

  const maxCols = mode === 'onboarding' ? 2 : 3; // Keep mode for grid layout
  // Grid class for authors
  const gridClass = `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${maxCols} gap-4`;

  // Simplified check for author follow status
  const isFollowing = (id: number): boolean => {
    return followedAuthorIds.includes(id);
  };

  // --- Simplified Render Logic ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={gridClass}>
          {[...Array(mockAuthors.length || 6)].map(
            (
              _,
              i // Show skeleton count based on mock data
            ) => (
              <InterestSkeleton key={i} />
            )
          )}
        </div>
      );
    }

    // Always render authors
    return authors.length > 0 ? (
      <div className={gridClass}>
        {authors.map((author) => (
          <AuthorSuggestionCard
            key={author.id}
            author={author}
            isFollowing={isFollowing(author.id)}
            onFollowToggle={handleFollowToggle} // Directly pass the simplified handler
          />
        ))}
      </div>
    ) : (
      <p>No authors found.</p> // Should not happen with mock data unless empty
    );
  };

  return (
    <div className="max-w-4xl relative pb-10">
      {/* Search bar - REMOVED */}
      {/* <div className="mb-6"> ... </div> */}
      <div className="space-y-6">
        <p className="text-gray-600">{description}</p>

        {/* Interest type selector - REMOVED */}
        {/* <div className="flex gap-4 border-b pb-4 mb-4"> ... </div> */}

        <div>{renderContent()}</div>
      </div>
      {/* Removed Sticky Save Bar */}
    </div>
  );
}
