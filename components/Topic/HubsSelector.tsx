'use client';

import { useCallback } from 'react';
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
  hideSelectedItems?: boolean;
}

export function HubsSelector({
  selectedHubs,
  onChange,
  error,
  displayCountOnly = false,
  hideSelectedItems = false,
}: HubsSelectorProps) {
  const hubsToOptions = (hubs: Hub[]): MultiSelectOption[] =>
    hubs.map((hub) => ({ value: String(hub.id), label: hub.name }));

  const topicsToHubs = (topics: Topic[]): Hub[] =>
    topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description,
    }));

  const optionsToHubs = (options: MultiSelectOption[]): Hub[] =>
    options.map(
      (option) =>
        selectedHubs.find((hub) => String(hub.id) === option.value) ?? {
          id: option.value,
          name: option.label,
        }
    );

  const fetchHubs = useCallback(async (query: string): Promise<MultiSelectOption[]> => {
    try {
      return hubsToOptions(topicsToHubs(await HubService.suggestTopics(query)));
    } catch (error) {
      console.error('Error fetching topics:', error);
      return [];
    }
  }, []);

  const handleChange = (options: MultiSelectOption[]) => onChange(optionsToHubs(options));

  const selectedItems = (
    <div className="mt-2 flex flex-wrap gap-2">
      {selectedHubs.map((hub) => (
        <Badge key={hub.id} variant="default" className="flex items-center gap-1 pr-1">
          {hub.color && (
            <div className="mr-1 h-2 w-2 rounded-full" style={{ backgroundColor: hub.color }} />
          )}
          <span>{hub.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-4 w-4 rounded-full text-gray-400 hover:text-gray-500"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onChange(selectedHubs.filter((hubItem) => hubItem.id !== hub.id));
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );

  if (displayCountOnly) {
    return (
      <BaseMenu
        trigger={
          <button
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm hover:bg-gray-100"
            type="button"
          >
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Topics</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
            {selectedHubs.length > 0 && (
              <span className="ml-1 rounded-full bg-indigo-100 px-1.5 text-xs font-semibold text-indigo-700">
                {selectedHubs.length}
              </span>
            )}
          </button>
        }
        align="start"
        sideOffset={5}
        className="w-80 max-w-full overflow-visible border-none p-0 shadow-lg"
      >
        <div className="w-72 p-2">
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
        {selectedHubs.length > 0 && !hideSelectedItems && selectedItems}
      </div>
    </div>
  );
}
