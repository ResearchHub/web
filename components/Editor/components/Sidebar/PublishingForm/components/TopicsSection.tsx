import { useFormContext } from 'react-hook-form';
import { Tag } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import {
  MultiSelectOption,
  SearchableMultiSelect,
} from '@/components/ui/form/SearchableMultiSelect';
import { useCallback, useEffect } from 'react';
import { HubService } from '@/services/hub.service';
import { getFieldErrorMessage } from '@/utils/form';
import { useNotebookPublish } from '@/contexts/NotebookPublishContext';

export function TopicsSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  // const { note } = useNotebookPublish();

  // Now topics directly contains the objects with value and label
  const topics = watch('topics') || [];

  // // Initialize from note data when available
  // useEffect(() => {
  //   if (note?.post?.topics && note.post.topics.length > 0 && topics.length === 0) {
  //     const topicOptions = note.post.topics.map((topic) => ({
  //       value: topic.id.toString(),
  //       label: topic.name,
  //     }));
  //     setValue('topics', topicOptions);
  //   }
  // }, [note?.post?.topics, topics.length, setValue]);

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
        onChange={(newTopics) => setValue('topics', newTopics)}
        onSearch={handleSearch}
        placeholder="Search topics..."
        debounceMs={500}
        error={getFieldErrorMessage(errors.topics, 'Invalid topics')}
      />
    </div>
  );
}
