import { useFormContext } from 'react-hook-form';
import { Tag } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { SearchableMultiSelect } from '@/components/ui/form/SearchableMultiSelect';
import { useTopicSuggestions } from '@/hooks/useSearchSuggestions';
import { useCallback } from 'react';

export function TopicsSection() {
  const { register, watch, setValue } = useFormContext();
  const topics = watch('topics') || [];
  const { data, isLoading, fetch } = useTopicSuggestions();

  const handleSearch = useCallback(
    async (query: string) => {
      await fetch(query);
      return data.map((topic) => ({
        value: topic.id.toString(),
        label: topic.name,
      }));
    },
    [fetch, data]
  );

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Tag}>Topics</SectionHeader>
      <SearchableMultiSelect
        value={topics}
        onChange={(newTopics) => setValue('topics', newTopics)}
        onSearch={handleSearch}
        placeholder="Search topics..."
        debounceMs={500}
      />
    </div>
  );
}
