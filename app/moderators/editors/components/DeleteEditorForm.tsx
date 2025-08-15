'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import {
  SearchableMultiSelect,
  MultiSelectOption,
} from '@/components/ui/form/SearchableMultiSelect';
import { HubService } from '@/services/hub.service';
import { z } from 'zod';

interface DeleteEditorFormProps {
  onSubmit: (params: { editorEmail: string; selectedHubId: number }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface DeleteEditorFormData {
  email: string;
  topic: MultiSelectOption | null;
}

// Zod schema for validation
const deleteEditorSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  topic: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: 'Topic is required',
    }),
});

export function DeleteEditorForm({ onSubmit, onCancel, isLoading = false }: DeleteEditorFormProps) {
  const [formData, setFormData] = useState<DeleteEditorFormData>({
    email: '',
    topic: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      deleteEditorSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        editorEmail: formData.email.trim(),
        selectedHubId: parseInt(formData.topic!.value),
      });

      // Success - toast will be shown by the parent component
    } catch (error) {
      // Error - toast will be shown by the parent component
      // Don't close modal on error
    }
  };

  const handleInputChange = (field: keyof Pick<DeleteEditorFormData, 'email'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleTopicChange = (options: MultiSelectOption[]) => {
    // For single selection, take the latest selected topic
    const selectedTopic = options.length > 0 ? options[options.length - 1] : null;
    setFormData((prev) => ({ ...prev, topic: selectedTopic }));
    // Clear error when user selects an option
    if (errors.topic) {
      setErrors((prev) => ({ ...prev, topic: '' }));
    }
  };

  const handleTopicSearch = useCallback(async (query: string): Promise<MultiSelectOption[]> => {
    try {
      const topics = await HubService.suggestTopics(query);
      return topics.map((topic) => ({
        value: topic.id.toString(),
        label: topic.name,
      }));
    } catch (error) {
      console.error('Error fetching topic suggestions:', error);
      return [];
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          label="Email"
          required
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="editor@example.com"
          error={errors.email}
          disabled={isLoading}
        />
      </div>

      <div>
        <SearchableMultiSelect
          value={formData.topic ? [formData.topic] : []}
          onChange={handleTopicChange}
          onAsyncSearch={handleTopicSearch}
          label="Topic"
          required
          placeholder="Search topics..."
          debounceMs={500}
          error={errors.topic}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outlined" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="destructive" disabled={isLoading}>
          Delete Editor
        </Button>
      </div>
    </form>
  );
}
