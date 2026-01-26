import { Check, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { cn } from '@/utils/styles';
import type { EntityType } from '@/types/search';

// Available entity types for filtering
export const AVAILABLE_INDICES: EntityType[] = ['paper', 'post', 'hub', 'user'];

// Entity type labels for display
export const ENTITY_LABELS: Record<EntityType, string> = {
  paper: 'Papers',
  user: 'Users',
  hub: 'Topics',
  post: 'Posts',
  author: 'Authors',
};

interface SearchSuggestionFiltersProps {
  selectedIndices: EntityType[];
  useExternalSearch: boolean;
  onIndicesChange: (indices: EntityType[]) => void;
  onExternalSearchChange: (enabled: boolean) => void;
}

export function SearchSuggestionFilters({
  selectedIndices,
  useExternalSearch,
  onIndicesChange,
  onExternalSearchChange,
}: SearchSuggestionFiltersProps) {
  const noneSelected = selectedIndices.length === 0;

  // Handle index selection toggle
  const handleIndexToggle = (index: EntityType) => {
    if (selectedIndices.includes(index)) {
      // Remove index - if removing the last one, this will make noneSelected true
      const newIndices = selectedIndices.filter((i) => i !== index);
      onIndicesChange(newIndices);
    } else {
      // Add index
      onIndicesChange([...selectedIndices, index]);
    }
  };

  // Handle "All" selection - clear all selections (show "All" as selected)
  const handleSelectAll = () => {
    onIndicesChange([]);
  };

  return (
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 min-h-0">
      {/* Index Selection Badges */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-hide">
        {/* Show "All" badge - only selected when noneSelected is true */}
        <Badge
          variant={noneSelected ? 'primary' : 'default'}
          className={cn(
            'cursor-pointer rounded-full px-3 py-1 flex items-center gap-1.5 transition-colors flex-shrink-0',
            noneSelected ? 'hover:bg-primary-200' : 'hover:bg-gray-200'
          )}
          onClick={handleSelectAll}
        >
          <span>All</span>
        </Badge>

        {/* Individual index badges - always visible, show selected state based on selectedIndices */}
        {AVAILABLE_INDICES.map((index) => {
          const isSelected = selectedIndices.includes(index);

          return (
            <Badge
              key={index}
              variant={isSelected ? 'primary' : 'default'}
              className={cn(
                'cursor-pointer rounded-full px-3 py-1 flex items-center gap-1.5 transition-colors flex-shrink-0',
                isSelected ? 'hover:bg-primary-200' : 'hover:bg-gray-200'
              )}
              onClick={() => handleIndexToggle(index)}
            >
              <span>{ENTITY_LABELS[index]}</span>
            </Badge>
          );
        })}
      </div>

      {/* External Search Checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={useExternalSearch}
          onCheckedChange={onExternalSearchChange}
          label="Use external sources for search"
          id="external-search-checkbox"
          className="flex items-center gap-2"
        />
        <Tooltip
          content={<div className="text-sm">We will search papers outside of our platform</div>}
          position="top"
          width="w-64"
          className="!z-[10000]"
        >
          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
        </Tooltip>
      </div>
    </div>
  );
}
