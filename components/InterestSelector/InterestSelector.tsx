import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { BookOpen, Hash, Save } from 'lucide-react';
import { InterestSkeleton } from '@/components/skeletons/InterestSkeleton';
import { InterestCard } from './InterestCard';
import { HubService } from '@/services/hub.service';
import { Topic } from '@/types/topic';
import { toast } from 'react-hot-toast';

type TopicType = 'journal' | 'topic';

const interestTypes = [
  { id: 'journal' as TopicType, label: 'Journals', icon: BookOpen },
  { id: 'topic' as TopicType, label: 'Topics', icon: Hash },
] as const;

interface InterestSelectorProps {
  mode: 'onboarding' | 'preferences';
  onSaveComplete?: () => void;
}

export function InterestSelector({ mode, onSaveComplete }: InterestSelectorProps) {
  const [activeType, setActiveType] = useState<TopicType>('journal');
  const [isLoading, setIsLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [followedIds, setFollowedIds] = useState<number[]>([]);
  const [pendingChangesByType, setPendingChangesByType] = useState<
    Record<TopicType, Map<number, boolean>>
  >({
    journal: new Map(),
    topic: new Map(),
  });
  const [isSaving, setIsSaving] = useState(false);

  const pendingChanges = pendingChangesByType[activeType] || new Map();

  const descriptions = {
    journal: 'Select journals to stay updated with the latest research in your field',
    topic: "Choose topics you're interested in to get personalized recommendations",
  };

  const fetchTopics = async (type: TopicType): Promise<Topic[]> => {
    try {
      if (type === 'journal') {
        return await HubService.getHubs({ namespace: 'journal' });
      }

      if (type === 'topic') {
        return await HubService.getHubs({ excludeJournals: true });
      }

      return [];
    } catch (error) {
      console.error(`Error fetching ${type}s:`, error);
      return [];
    }
  };

  useEffect(() => {
    const loadTopics = async () => {
      setIsLoading(true);
      try {
        const [data, followedItems] = await Promise.all([
          fetchTopics(activeType),
          HubService.getFollowedHubs(),
        ]);
        setTopics(data);
        setFollowedIds(followedItems);
      } catch (error) {
        console.error('Error loading topics:', error);
        setTopics([]);
        setFollowedIds([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopics();
  }, [activeType]);

  const handleTypeChange = (type: TopicType) => {
    setActiveType(type);
  };

  const handleFollowToggle = (topicId: number, isFollowing: boolean) => {
    setPendingChangesByType((prev) => {
      const newChanges = new Map(prev[activeType] || new Map());
      if (newChanges.has(topicId)) {
        newChanges.delete(topicId);
      } else {
        newChanges.set(topicId, !isFollowing);
      }
      return {
        ...prev,
        [activeType]: newChanges,
      };
    });

    setFollowedIds((prev) => {
      const newFollowedIds = new Set(prev);
      if (isFollowing) {
        newFollowedIds.delete(topicId);
      } else {
        newFollowedIds.add(topicId);
      }
      return Array.from(newFollowedIds);
    });
  };

  const handleSaveChanges = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const allPromises = Object.entries(pendingChangesByType).flatMap(([type, changes]) => {
        return Array.from(changes.entries()).map(([topicId, shouldFollow]) => {
          return shouldFollow ? HubService.followHub(topicId) : HubService.unfollowHub(topicId);
        });
      });

      await Promise.all(allPromises);
      setPendingChangesByType({
        journal: new Map(),
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

        {/* Topic grid */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <InterestSkeleton key={i} />
              ))}
            </div>
          ) : (
            <TopicGrid
              topics={topics}
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

interface TopicGridProps {
  topics: Topic[];
  followedIds: number[];
  onFollowToggle: (topicId: number, isFollowing: boolean) => void;
}

function TopicGrid({ topics, followedIds, onFollowToggle }: TopicGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        {filteredTopics.map((topic) => (
          <InterestCard
            key={topic.id}
            topic={topic}
            isFollowing={followedIds.includes(Number(topic.id))}
            onFollowToggle={onFollowToggle}
          />
        ))}
      </div>
    </div>
  );
}
