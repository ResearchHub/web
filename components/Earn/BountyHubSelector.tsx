'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Filter, X, Search, Check } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { BountyService } from '@/services/bounty.service';
import { Topic } from '@/types/topic';
import { Input } from '@/components/ui/form/Input';

export interface Hub {
  id: string | number;
  name: string;
  description?: string;
  color?: string;
}

interface BountyHubSelectorProps {
  selectedHubs: Hub[];
  onChange: (hubs: Hub[]) => void;
  error?: string | null;
  displayCountOnly?: boolean;
  hideSelectedItems?: boolean;
}

export function BountyHubSelector({
  selectedHubs,
  onChange,
  error,
  displayCountOnly = false,
  hideSelectedItems = false,
}: BountyHubSelectorProps) {
  const [allHubs, setAllHubs] = useState<Topic[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedHubs, setTempSelectedHubs] = useState<Hub[]>(selectedHubs);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync temp selection with actual selection when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTempSelectedHubs(selectedHubs);
      setSearchQuery('');
    }
  }, [isModalOpen, selectedHubs]);

  // fetch all hubs at mount
  useEffect(() => {
    (async () => {
      const hubs = await BountyService.getBountyHubs();
      setAllHubs(hubs);
    })();
  }, []);

  // Convert topics to hubs
  const topicsToHubs = (topics: Topic[]): Hub[] =>
    topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description,
    }));

  // Filter hubs based on search query
  const filteredHubs = allHubs.filter((hub) =>
    hub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle hub selection
  const toggleHub = (hub: Topic) => {
    const hubData = topicsToHubs([hub])[0];
    const isSelected = tempSelectedHubs.some((h) => h.id === hub.id);

    if (isSelected) {
      setTempSelectedHubs(tempSelectedHubs.filter((h) => h.id !== hub.id));
    } else {
      setTempSelectedHubs([...tempSelectedHubs, hubData]);
    }
  };

  const handleApply = () => {
    onChange(tempSelectedHubs);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setTempSelectedHubs(selectedHubs);
    setIsModalOpen(false);
  };

  const TopicBadge = ({
    topic,
    isSelected,
    onToggle,
  }: {
    topic: Topic;
    isSelected: boolean;
    onToggle: () => void;
  }) => (
    <button onClick={onToggle} className="cursor-pointer">
      <Badge
        variant={isSelected ? 'primary' : 'default'}
        size="lg"
        className={`
          transition-all
          ${
            isSelected
              ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
              : 'hover:bg-gray-100 hover:border-gray-300'
          }
        `}
      >
        <span className="opacity-70">#</span>
        <span>{topic.name}</span>
        {isSelected && <Check className="h-3 w-3 ml-0.5" />}
      </Badge>
    </button>
  );

  if (displayCountOnly) {
    return (
      <>
        <button
          className="flex items-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-1.5 text-sm w-full"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-gray-700">Topics</span>
          {selectedHubs.length > 0 && (
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full px-1.5">
              {selectedHubs.length}
            </span>
          )}
        </button>

        <BaseModal
          isOpen={isModalOpen}
          onClose={handleCancel}
          title="Filter by Topics"
          maxWidth="max-w-2xl"
          showCloseButton={true}
          footer={
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {tempSelectedHubs.length} topic{tempSelectedHubs.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-2">
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="default" onClick={handleApply}>
                  Apply Filters
                </Button>
              </div>
            </div>
          }
        >
          <div className="md:w-[600px] max-w-2xl">
            <div className="space-y-4">
              {/* Selected Topics */}
              {tempSelectedHubs.length > 0 && (
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {tempSelectedHubs.map((hub) => (
                      <Badge
                        key={hub.id}
                        size="lg"
                        className="bg-blue-500 text-white border-blue-500 cursor-default"
                      >
                        <span className="opacity-80">#</span>
                        <span>{hub.name}</span>
                        <X
                          className="h-3 w-3 ml-0.5 cursor-pointer hover:opacity-80"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTempSelectedHubs(tempSelectedHubs.filter((h) => h.id !== hub.id));
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Topics */}
              <div className="max-h-[350px] overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {filteredHubs.map((topic) => (
                    <TopicBadge
                      key={topic.id}
                      topic={topic}
                      isSelected={tempSelectedHubs.some((h) => h.id === topic.id)}
                      onToggle={() => toggleHub(topic)}
                    />
                  ))}
                </div>
                {filteredHubs.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No topics found matching "{searchQuery}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </BaseModal>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          label="Search topics"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="max-h-[300px] overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          {filteredHubs.map((topic) => {
            const hub = topicsToHubs([topic])[0];
            const isSelected = selectedHubs.some((h) => h.id === topic.id);
            return (
              <TopicBadge
                key={topic.id}
                topic={topic}
                isSelected={isSelected}
                onToggle={() => {
                  if (isSelected) {
                    onChange(selectedHubs.filter((h) => h.id !== hub.id));
                  } else {
                    onChange([...selectedHubs, hub]);
                  }
                }}
              />
            );
          })}
        </div>
        {filteredHubs.length === 0 && (
          <p className="text-center text-gray-500 py-8">No topics found matching "{searchQuery}"</p>
        )}
      </div>
    </div>
  );
}
