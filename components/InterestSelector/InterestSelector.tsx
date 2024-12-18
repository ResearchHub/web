import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { BookOpen, Users, Hash } from 'lucide-react';
import { fetchInterests, Interest } from '@/store/interestStore';
import { InterestSkeleton } from '@/components/skeletons/InterestSkeleton';
import { InterestCard } from './InterestCard';
import { InterestSelectorFooter } from './InterestSelectorFooter';

interface InterestSelectorProps {
  mode: 'onboarding' | 'preferences';
  onComplete: (selectedInterests: Interest[]) => void;
}

const interestTypes = [
  { id: 'journal', label: 'Journals', icon: BookOpen },
  { id: 'person', label: 'People', icon: Users },
  { id: 'topic', label: 'Topics', icon: Hash },
] as const;

export function InterestSelector({ mode, onComplete }: InterestSelectorProps) {
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [activeType, setActiveType] = useState<'journal' | 'person' | 'topic'>('journal');
  const [isLoading, setIsLoading] = useState(true);
  const [interests, setInterests] = useState<Interest[]>([]);
  
  const descriptions = {
    journal: 'Select journals to stay updated with the latest research in your field',
    person: 'Follow leading researchers and stay updated with their work',
    topic: 'Choose topics you\'re interested in to get personalized recommendations'
  };

  useEffect(() => {
    const loadInterests = async () => {
      setIsLoading(true);
      const data = await fetchInterests(activeType);
      setInterests(data as Interest[]);
      setIsLoading(false);
    };

    loadInterests();
  }, [activeType]);

  return (
    <div className="relative pb-24">
      <div className="max-w-4xl">
        <p className="text-gray-600 mb-6">{descriptions[activeType]}</p>

        {/* Interest type selector */}
        <div className="flex gap-4 mb-8">
          {interestTypes.map(type => {
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
              selectedInterests={selectedInterests}
              onSelect={(interest) => {
                setSelectedInterests(prev => {
                  const exists = prev.find(i => i.id === interest.id);
                  if (exists) {
                    return prev.filter(i => i.id !== interest.id);
                  }
                  return [...prev, interest];
                });
              }}
            />
          )}
        </div>
      </div>

      <InterestSelectorFooter
        selectedInterests={selectedInterests}
        onCancel={() => onComplete([])}
        onComplete={onComplete}
      />
    </div>
  );
}

interface InterestGridProps {
  interests: Interest[];
  selectedInterests: Interest[];
  onSelect: (interest: Interest) => void;
}

function InterestGrid({ interests, selectedInterests, onSelect }: InterestGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInterests = interests.filter(interest =>
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
        {filteredInterests.map(interest => (
          <InterestCard
            key={interest.id}
            interest={interest}
            selected={selectedInterests.some(i => i.id === interest.id)}
            onSelect={() => onSelect(interest)}
          />
        ))}
      </div>
    </div>
  );
}
