'use client';

import { useCallback, useState } from 'react';
import {
  MultiSelectOption,
  SearchableMultiSelect,
} from '@/components/ui/form/SearchableMultiSelect';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { X, ChevronDown, Filter } from 'lucide-react';
import { BaseMenu } from '@/components/ui/form/BaseMenu';
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
  displayCountOnly?: boolean;
}

export function HubsSelector({
  selectedHubs,
  onChange,
  error,
  displayCountOnly = false,
}: HubsSelectorProps) {
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

  if (displayCountOnly) {
    // Compact mode: show trigger with count badge
    const trigger = (
      <button
        className="flex items-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-1.5 text-sm"
        type="button"
      >
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-gray-700">Topics</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
        {selectedHubs.length > 0 && (
          <span className="ml-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full px-1.5">
            {selectedHubs.length}
          </span>
        )}
      </button>
    );

    return (
      <BaseMenu
        trigger={trigger}
        align="start"
        sideOffset={5}
        className="overflow-visible border-none p-0 shadow-lg w-80 max-w-full"
      >
        <div className="p-2 w-72">
          <SearchableMultiSelect
            value={hubsToOptions(selectedHubs)}
            onChange={handleChange}
            onAsyncSearch={fetchHubs}
            placeholder="Search for topics..."
            minSearchLength={1}
            error={error || undefined}
            className="w-full border-0"
          />
        </div>
      </BaseMenu>
    );
  }

  return (
    <div className="space-y-4">
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
