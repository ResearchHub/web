import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { BookOpen, Users, Hash, Save } from 'lucide-react';
import { InterestSkeleton } from '@/components/skeletons/InterestSkeleton';
import { InterestCard } from './InterestCard';
import { HubService } from '@/services/hub.service';
import { AuthorService } from '@/services/author.service';
import { toast } from 'react-hot-toast';

export interface Interest {
  id: number;
  name: string;
  type: 'journal' | 'person' | 'topic';
  imageUrl?: string;
  description?: string;
}

interface InterestSelectorProps {
  mode: 'onboarding' | 'preferences';
  onSaveComplete?: () => void;
}

const interestTypes = [
  { id: 'journal', label: 'Journals', icon: BookOpen },
  { id: 'topic', label: 'Topics', icon: Hash },
] as const;

export function InterestSelector({ mode, onSaveComplete }: InterestSelectorProps) {
  const [activeType, setActiveType] = useState<'journal' | 'person' | 'topic'>('journal');
  const [isLoading, setIsLoading] = useState(true);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [followedIds, setFollowedIds] = useState<number[]>([]);
  const [pendingChangesByType, setPendingChangesByType] = useState<
    Record<string, Map<number, boolean>>
  >({
    journal: new Map(),
    person: new Map(),
    topic: new Map(),
  });
  const [isSaving, setIsSaving] = useState(false);

  const pendingChanges = pendingChangesByType[activeType] || new Map();

  const descriptions = {
    journal: 'Select journals to stay updated with the latest research in your field',
    person: 'Follow leading researchers and stay updated with their work',
    topic: "Choose topics you're interested in to get personalized recommendations",
  };

  const fetchInterests = async (type: 'journal' | 'person' | 'topic'): Promise<Interest[]> => {
    try {
      if (type === 'journal') {
        const journals = await HubService.getHubs('journal');
        return journals.map((journal) => ({
          id: journal.id,
          name: journal.name,
          type: 'journal',
          imageUrl: journal.imageUrl,
          description: journal.description,
        }));
      }

      if (type === 'topic') {
        const hubs = await HubService.getHubs();
        return hubs.map((hub) => ({
          id: hub.id,
          name: hub.name,
          type: 'topic',
          imageUrl: hub.imageUrl,
          description: hub.description,
        }));
      }

      if (type === 'person') {
        const authors = await AuthorService.getAuthors();
        return authors.map((author) => ({
          id: author.id,
          name: author.name,
          type: 'person',
          imageUrl: author.imageUrl,
          description: author.description,
        }));
      }

      return [];
    } catch (error) {
      console.error(`Error fetching ${type}s:`, error);
      return [];
    }
  };

  useEffect(() => {
    const loadInterests = async () => {
      setIsLoading(true);
      try {
        const [data, followedItems] = await Promise.all([
          fetchInterests(activeType),
          activeType === 'person'
            ? AuthorService.getFollowedAuthors()
            : HubService.getFollowedHubs(),
        ]);
        setInterests(data);
        setFollowedIds(followedItems);
      } catch (error) {
        console.error('Error loading interests:', error);
        setInterests([]);
        setFollowedIds([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInterests();
  }, [activeType]);

  const handleTypeChange = (type: typeof activeType) => {
    setActiveType(type);
  };

  const handleFollowToggle = (interestId: number, isFollowing: boolean) => {
    setPendingChangesByType((prev) => {
      const newChanges = new Map(prev[activeType] || new Map());
      if (newChanges.has(interestId)) {
        newChanges.delete(interestId);
      } else {
        newChanges.set(interestId, !isFollowing);
      }
      return {
        ...prev,
        [activeType]: newChanges,
      };
    });

    setFollowedIds((prev) => {
      const newFollowedIds = new Set(prev);
      if (isFollowing) {
        newFollowedIds.delete(interestId);
      } else {
        newFollowedIds.add(interestId);
      }
      return Array.from(newFollowedIds);
    });
  };

  const handleSaveChanges = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const allPromises = Object.entries(pendingChangesByType).flatMap(([type, changes]) => {
        return Array.from(changes.entries()).map(([interestId, shouldFollow]) => {
          if (type === 'person') {
            return shouldFollow
              ? AuthorService.followAuthor(interestId)
              : AuthorService.unfollowAuthor(interestId);
          } else {
            return shouldFollow
              ? HubService.followHub(interestId)
              : HubService.unfollowHub(interestId);
          }
        });
      });

      await Promise.all(allPromises);
      setPendingChangesByType({
        journal: new Map(),
        person: new Map(),
        topic: new Map(),
      });
      toast.success('Changes saved successfully');
      onSaveComplete?.();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save some changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalPendingChanges = Object.values(pendingChangesByType).reduce(
    (total, changes) => total + changes.size,
    0
  );

  return (
    <div className="max-w-4xl relative">
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
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </Button>
            );
          })}
        </div>

        {/* Interest grid */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <InterestSkeleton key={i} />
              ))}
            </div>
          ) : (
            <InterestGrid
              interests={interests}
              followedIds={followedIds}
              onFollowToggle={handleFollowToggle}
            />
          )}
        </div>
      </div>

      {/* Sticky Save Bar */}
      {totalPendingChanges > 0 && (
        <div className="sticky bottom-0 bg-white border-t shadow-lg p-4 mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {totalPendingChanges} unsaved {totalPendingChanges === 1 ? 'change' : 'changes'}
          </div>
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}

interface InterestGridProps {
  interests: Interest[];
  followedIds: number[];
  onFollowToggle: (interestId: number, isFollowing: boolean) => void;
}

function InterestGrid({ interests, followedIds, onFollowToggle }: InterestGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInterests = interests.filter((interest) =>
    interest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div>
      {/* Search bar */}
      <div className="mb-6">
        <input
          type="search"
          placeholder="Search..."
          className="w-full px-4 py-2 border rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInterests.map((interest) => (
          <InterestCard
            key={interest.id}
            interest={interest}
            isFollowing={followedIds.includes(Number(interest.id))}
            onFollowToggle={onFollowToggle}
          />
        ))}
      </div>
    </div>
  );
}
