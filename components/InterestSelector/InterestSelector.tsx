import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { BookOpen, Users, Hash, Save } from 'lucide-react';
import { InterestSkeleton } from '@/components/skeletons/InterestSkeleton';
import { InterestCard } from './InterestCard';
import { HubService } from '@/services/hub.service';
import { AuthorService } from '@/services/author.service';
import { JournalService } from '@/services/journal.service';
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
}

const interestTypes = [
  { id: 'journal', label: 'Journals', icon: BookOpen },
  { id: 'person', label: 'People', icon: Users },
  { id: 'topic', label: 'Topics', icon: Hash },
] as const;

export function InterestSelector({ mode }: InterestSelectorProps) {
  const [activeType, setActiveType] = useState<'journal' | 'person' | 'topic'>('journal');
  const [isLoading, setIsLoading] = useState(true);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [followedIds, setFollowedIds] = useState<number[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Map<number, boolean>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

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
      } finally {
        setIsLoading(false);
      }
    };

    loadInterests();
  }, [activeType]);

  const handleFollowToggle = (interestId: number, isFollowing: boolean) => {
    setPendingChanges((prev) => {
      const newChanges = new Map(prev);
      newChanges.set(interestId, !isFollowing);
      return newChanges;
    });

    // Update UI immediately
    if (!isFollowing) {
      setFollowedIds((prev) => [...prev, interestId]);
    } else {
      setFollowedIds((prev) => prev.filter((id) => id !== interestId));
    }
  };

  const handleSaveChanges = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const changes = Array.from(pendingChanges.entries());
      const promises = changes.map(([interestId, shouldFollow]) => {
        const interest = interests.find((i) => i.id === interestId);
        if (!interest) return Promise.resolve();

        if (interest.type === 'person') {
          return shouldFollow
            ? AuthorService.followAuthor(interestId)
            : AuthorService.unfollowAuthor(interestId);
        } else {
          return shouldFollow
            ? HubService.followHub(interestId)
            : HubService.unfollowHub(interestId);
        }
      });

      await Promise.all(promises);
      setPendingChanges(new Map());
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save some changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl pb-20">
      <p className="text-gray-600 mb-6">{descriptions[activeType]}</p>

      {/* Interest type selector */}
      <div className="flex gap-4 mb-8">
        {interestTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Button
              key={type.id}
              variant={activeType === type.id ? 'default' : 'secondary'}
              onClick={() => setActiveType(type.id)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </Button>
          );
        })}
      </div>

      {/* Interest grid */}
      <div className="mb-8">
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

      {/* Sticky Save Bar */}
      {pendingChanges.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {pendingChanges.size} unsaved {pendingChanges.size === 1 ? 'change' : 'changes'}
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
