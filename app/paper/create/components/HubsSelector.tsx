'use client';

import { useCallback, useState } from 'react';
import {
  MultiSelectOption,
  SearchableMultiSelect,
} from '@/components/ui/form/SearchableMultiSelect';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { HubService } from '@/services/hub.service';
import { Topic } from '@/types/topic';

export interface Hub {
  id: string | number;
  name: string;
  description?: string;
  color?: string;
}

interface HubsSelectorProps {
  selectedHubs: Hub[];
  onChange: (hubs: Hub[]) => void;
  error?: string | null;
}

export function HubsSelector({ selectedHubs, onChange, error }: HubsSelectorProps) {
  // Convert hubs to the format expected by SearchableMultiSelect
  const hubsToOptions = (hubs: Hub[]): MultiSelectOption[] => {
    return hubs.map((hub) => ({
      value: String(hub.id),
      label: hub.name,
    }));
  };

  // Convert Topic to Hub
  const topicsToHubs = (topics: Topic[]): Hub[] => {
    return topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description,
    }));
  };

  // Convert MultiSelectOption back to Hub objects
  const optionsToHubs = (options: MultiSelectOption[]): Hub[] => {
    return options.map((option) => {
      // Find the original hub in the selectedHubs array
      const existingHub = selectedHubs.find((hub) => String(hub.id) === option.value);

      // If found, return it, otherwise create a minimal hub
      return (
        existingHub || {
          id: option.value,
          name: option.label,
        }
      );
    });
  };

  const fetchHubs = useCallback(
    async (query: string): Promise<MultiSelectOption[]> => {
      try {
        const topics = await HubService.suggestTopics(query);
        const hubs = topicsToHubs(topics);
        return hubsToOptions(hubs);
      } catch (error) {
        console.error('Error fetching topics:', error);
        return [];
      }
    },
    [selectedHubs]
  );

  const handleChange = (options: MultiSelectOption[]) => {
    const hubs = optionsToHubs(options);
    onChange(hubs);
  };

  // Create a custom component for displaying selected hubs with colors
  const CustomSelectedItems = () => (
    <div className="flex flex-wrap gap-2 mt-2">
      {selectedHubs.map((hub) => (
        <Badge key={hub.id} variant="default" className="flex items-center gap-1 pr-1">
          {hub.color && (
            <div className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: hub.color }} />
          )}
          <span>{hub.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 rounded-full text-gray-400 hover:text-gray-500"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(selectedHubs.filter((h) => h.id !== hub.id));
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Topics</h3>
        <p className="text-sm text-gray-500 mb-4">Select topics that best describe your research</p>
      </div>

      <div className="relative">
        <SearchableMultiSelect
          value={hubsToOptions(selectedHubs)}
          onChange={handleChange}
          onAsyncSearch={fetchHubs}
          label="Search topics"
          placeholder="Search for topics..."
          minSearchLength={1}
          error={error || undefined}
        />
        {selectedHubs.length > 0 && <CustomSelectedItems />}
      </div>
    </div>
  );
}
