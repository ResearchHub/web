import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { BookOpen, Users, Hash } from 'lucide-react';
import { InterestSkeleton } from '@/components/skeletons/InterestSkeleton';
import { InterestCard } from './InterestCard';
import { HubService } from '@/services/hub.service';
import { AuthorService } from '@/services/author.service';
import { JournalService } from '@/services/journal.service';

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

  const descriptions = {
    journal: 'Select journals to stay updated with the latest research in your field',
    person: 'Follow leading researchers and stay updated with their work',
    topic: "Choose topics you're interested in to get personalized recommendations",
  };

  const capitalizeWords = (str: string) => {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const fetchInterests = async (type: 'journal' | 'person' | 'topic'): Promise<Interest[]> => {
    try {
      if (type === 'journal') {
        const journals = await HubService.getHubs('journal');
        return journals.map((journal) => ({
          id: journal.id,
          name: capitalizeWords(journal.name),
          type: 'journal',
          imageUrl: journal.imageUrl,
          description: journal.description,
        }));
      }

      if (type === 'topic') {
        const hubs = await HubService.getHubs();
        return hubs.map((hub) => ({
          id: hub.id,
          name: capitalizeWords(hub.name),
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

  const handleFollowToggle = async (interestId: number, isFollowing: boolean) => {
    if (isFollowing) {
      setFollowedIds((prev) => prev.filter((id) => id !== interestId));
    } else {
      setFollowedIds((prev) => [...prev, interestId]);
    }
  };

  return (
    <div className="max-w-4xl">
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
