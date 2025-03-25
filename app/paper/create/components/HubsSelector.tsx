'use client';

import { useCallback, useState } from 'react';
import {
  MultiSelectOption,
  SearchableMultiSelect,
} from '@/components/ui/form/SearchableMultiSelect';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

export interface Hub {
  id: string;
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
      value: hub.id,
      label: hub.name,
    }));
  };

  // Convert MultiSelectOption back to Hub objects
  const optionsToHubs = (options: MultiSelectOption[]): Hub[] => {
    return options.map((option) => {
      // Find the original hub in the selectedHubs array
      const existingHub = selectedHubs.find((hub) => hub.id === option.value);

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
      // This would be replaced with an actual API call to fetch hubs
      // For now, let's mock the response with some sample data
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

      const mockHubs: Hub[] = [
        { id: '1', name: 'Biology', description: 'Life sciences', color: '#4caf50' },
        { id: '2', name: 'Chemistry', description: 'Chemical sciences', color: '#f44336' },
        { id: '3', name: 'Physics', description: 'Physical sciences', color: '#2196f3' },
        {
          id: '4',
          name: 'Computer Science',
          description: 'Computing and information technology',
          color: '#ff9800',
        },
        { id: '5', name: 'Mathematics', description: 'Mathematical sciences', color: '#9c27b0' },
        { id: '6', name: 'Medicine', description: 'Medical sciences', color: '#00bcd4' },
        { id: '7', name: 'Psychology', description: 'Psychological sciences', color: '#795548' },
        { id: '8', name: 'Economics', description: 'Economic sciences', color: '#607d8b' },
        { id: '9', name: 'Sociology', description: 'Social sciences', color: '#8bc34a' },
        { id: '10', name: 'Neuroscience', description: 'Neural sciences', color: '#e91e63' },
      ];

      const filtered = query
        ? mockHubs.filter(
            (hub) =>
              hub.name.toLowerCase().includes(query.toLowerCase()) ||
              hub.description?.toLowerCase().includes(query.toLowerCase())
          )
        : mockHubs;

      return hubsToOptions(filtered);
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
          onSearch={fetchHubs}
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
