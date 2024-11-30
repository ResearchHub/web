import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/Button';
import { BadgeCheck } from 'lucide-react';
import { fetchInterests } from './mockData';

interface Interest {
  id: string;
  name: string;
  type: 'journal' | 'person' | 'topic';
  imageUrl?: string;
  description?: string;
  followers?: number;
  verified?: boolean;
}

interface InterestSelectorProps {
  mode: 'onboarding' | 'preferences';
  activeTab: 'journal' | 'person' | 'topic';
  onComplete: (selectedInterests: Interest[]) => void;
}

export function InterestSelector({ mode, activeTab, onComplete }: InterestSelectorProps) {
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  
  const descriptions = {
    journal: 'Select journals to stay updated with the latest research in your field',
    person: 'Follow leading researchers and stay updated with their work',
    topic: 'Choose topics you\'re interested in to get personalized recommendations'
  };

  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-gray-600 mb-8">{descriptions[activeTab]}</p>

      {/* Interest grid */}
      <div className="mb-8">
        <InterestGrid
          type={activeTab}
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
      </div>

      {/* Action buttons */}
      <div className="flex justify-end">
        <Button onClick={() => onComplete(selectedInterests)}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

interface InterestGridProps {
  type: Interest['type'];
  selectedInterests: Interest[];
  onSelect: (interest: Interest) => void;
}

function InterestGrid({ type, selectedInterests, onSelect }: InterestGridProps) {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch interests based on type
    fetchInterests(type).then(setInterests);
  }, [type]);

  const filteredInterests = interests.filter(interest =>
    interest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6">
        <input
          type="search"
          placeholder={`Search ${type}s...`}
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

interface InterestCardProps {
  interest: Interest;
  selected: boolean;
  onSelect: () => void;
}

function InterestCard({ interest, selected, onSelect }: InterestCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-lg border transition-all duration-200 text-left w-full
        ${selected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <div className="flex items-center gap-3">
        {interest.imageUrl ? (
          <img 
            src={interest.imageUrl} 
            alt="" 
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xl text-gray-500">
              {interest.name.charAt(0)}
            </span>
          </div>
        )}
        
        <div>
          <div className="flex items-center gap-1">
            <h3 className="font-medium">{interest.name}</h3>
            {interest.verified && (
              <BadgeCheck className="w-4 h-4 text-blue-500" />
            )}
          </div>
          {interest.followers && (
            <p className="text-sm text-gray-500">
              {interest.followers.toLocaleString()} followers
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
