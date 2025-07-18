import { useFormContext } from 'react-hook-form';
import { Tag } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { SearchableMultiSelect } from '@/components/ui/form/SearchableMultiSelect';
import { useCallback } from 'react';
import { HubService } from '@/services/hub.service';
import { getFieldErrorMessage } from '@/utils/form';

export function TopicsSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const topics = watch('topics') || [];

  const handleSearch = useCallback(async (query: string) => {
    const results = await HubService.suggestTopics(query);
    return results.map((topic) => ({
      value: topic.id.toString(),
      label: topic.name,
    }));
  }, []);

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Tag}>Topics</SectionHeader>
      <SearchableMultiSelect
        value={topics}
        onChange={(newTopics) => setValue('topics', newTopics, { shouldValidate: true })}
        onAsyncSearch={handleSearch}
        placeholder="Search topics..."
        debounceMs={500}
        error={getFieldErrorMessage(errors.topics, 'Invalid topics')}
      />
    </div>
  );
}
