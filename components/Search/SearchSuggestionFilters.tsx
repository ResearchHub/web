import { Badge } from '@/components/ui/Badge';
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
  onIndicesChange: (indices: EntityType[]) => void;
}

export function SearchSuggestionFilters({
  selectedIndices,
  onIndicesChange,
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
    <div className="min-h-0 mt-2">
      {/* Index Selection Badges */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
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
    </div>
  );
}
