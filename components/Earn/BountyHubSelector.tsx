'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  MultiSelectOption,
  SearchableMultiSelect,
} from '@/components/ui/form/SearchableMultiSelect';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown, Filter } from 'lucide-react';
import { BaseMenu } from '@/components/ui/form/BaseMenu';
import { BountyService } from '@/services/bounty.service';
import { Topic } from '@/types/topic';
import { IHub } from '@/types/hub';
import { hubsToOptions, optionsToHubs, topicsToHubs } from '@/utils/hubs';

interface BountyHubSelectorProps {
  selectedHubs: IHub[];
  onChange: (hubs: IHub[]) => void;
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuContentRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when menu opens
  useEffect(() => {
    if (menuOpen) {
      // Longer delay to ensure input is rendered and accessible
      setTimeout(() => {
        // Try to find the input in the document - this works even with portals
        const input = document.querySelector('.SearchableMultiSelect-input');
        if (input instanceof HTMLInputElement) {
          input.focus();
        } else {
          // Fallback to searching entire document for any input in our component
          const inputs = document.querySelectorAll('input');
          inputs.forEach((input) => {
            // Find inputs that are descendants of elements with our component classes
            if (input.closest('.overflow-visible.shadow-lg')) {
              input.focus();
            }
          });
        }
      }, 150);
    }
  }, [menuOpen]);

  // fetch all hubs at mount
  useEffect(() => {
    (async () => {
      const hubs = await BountyService.getBountyHubs();
      setAllHubs(hubs);
    })();
  }, []);

  const allHubOptions = hubsToOptions(topicsToHubs(allHubs));

  // Local search within allHubs
  const filterHubs = useCallback(
    async (query: string): Promise<MultiSelectOption[]> => {
      if (!query) {
        return hubsToOptions(topicsToHubs(allHubs));
      }
      const lowered = query.toLowerCase();
      const filtered = allHubs.filter((hub) => hub.name.toLowerCase().includes(lowered));
      return hubsToOptions(topicsToHubs(filtered));
    },
    [allHubs, selectedHubs]
  );

  const handleChange = (options: MultiSelectOption[]) => {
    onChange(optionsToHubs(options, selectedHubs));
    if (displayCountOnly) {
      setMenuOpen(false);
    }
  };

  const CustomSelectedItems = () => (
    <div className="flex flex-wrap gap-2 mt-2">
      {selectedHubs.map((hub) => (
        <Badge
          key={hub.id}
          variant="default"
          className="flex items-center gap-1 px-3 py-1 rounded-sm text-sm cursor-pointer hover:bg-gray-200"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange(selectedHubs.filter((h) => h.id !== hub.id));
            if (displayCountOnly) {
              setMenuOpen(false);
            }
          }}
        >
          {hub.color && (
            <div className="h-2 w-2 rounded-sm mr-1" style={{ backgroundColor: hub.color }} />
          )}
          <span>{hub.name}</span>
        </Badge>
      ))}
    </div>
  );

  if (displayCountOnly) {
    const trigger = (
      <button
        className="flex items-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-1.5 text-sm w-full"
        type="button"
      >
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-gray-700">Topics</span>
        {selectedHubs.length > 0 && (
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full px-1.5">
            {selectedHubs.length}
          </span>
        )}
        <ChevronDown className="h-4 w-4 text-gray-500 ml-auto" />
      </button>
    );

    return (
      <BaseMenu
        trigger={trigger}
        align="start"
        sideOffset={5}
        className="overflow-visible border-none p-0 shadow-lg !w-[300px] max-w-[90vw]"
        open={menuOpen}
        onOpenChange={setMenuOpen}
      >
        <div className="p-2 w-full" ref={menuContentRef}>
          <SearchableMultiSelect
            value={hubsToOptions(selectedHubs)}
            onChange={handleChange}
            onAsyncSearch={filterHubs}
            options={allHubOptions}
            placeholder="Search for topics..."
            minSearchLength={0}
            error={error || undefined}
            className="w-full border-0 SearchableMultiSelect-input"
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
          onAsyncSearch={filterHubs}
          options={allHubOptions}
          label="Search topics"
          placeholder="Search for topics..."
          minSearchLength={0}
          error={error || undefined}
        />
        {selectedHubs.length > 0 && !hideSelectedItems && <CustomSelectedItems />}
      </div>
    </div>
  );
}
