'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import {
  SearchableMultiSelect,
  MultiSelectOption,
} from '@/components/ui/form/SearchableMultiSelect';
import { EDITOR_TYPES, EditorType } from '@/types/editor';
import { HubService } from '@/services/hub.service';
import { z } from 'zod';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/styles';

interface CreateEditorFormProps {
  onSubmit: (params: {
    editorEmail: string;
    editorType: EditorType;
    selectedHubId: number;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface CreateEditorFormData {
  email: string;
  topic: MultiSelectOption | null;
  editorType: SelectOption | null;
}

interface SelectOption {
  value: string;
  label: string;
}

// Zod schema for validation
const createEditorSchema = z.object({
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
  editorType: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: 'Editor type is required',
    }),
});

export function CreateEditorForm({ onSubmit, onCancel, isLoading = false }: CreateEditorFormProps) {
  const [formData, setFormData] = useState<CreateEditorFormData>({
    email: '',
    topic: null,
    editorType: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      createEditorSchema.parse(formData);
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
        editorType: formData.editorType!.value as EditorType,
        selectedHubId: parseInt(formData.topic!.value),
      });

      // Success - toast will be shown by the parent component
    } catch (error) {
      // Error - toast will be shown by the parent component
      // Don't close modal on error
    }
  };

  const handleInputChange = (field: keyof Pick<CreateEditorFormData, 'email'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleEditorTypeChange = (option: SelectOption) => {
    setFormData((prev) => ({ ...prev, editorType: option }));
    // Clear error when user selects an option
    if (errors.editorType) {
      setErrors((prev) => ({ ...prev, editorType: '' }));
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

  const editorTypeOptions: SelectOption[] = [
    { value: EDITOR_TYPES.ASSISTANT_EDITOR, label: 'Assistant Editor' },
    { value: EDITOR_TYPES.ASSOCIATE_EDITOR, label: 'Associate Editor' },
    { value: EDITOR_TYPES.SENIOR_EDITOR, label: 'Senior Editor' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Dropdown
          trigger={
            <Button
              type="button"
              variant="outlined"
              size="default"
              disabled={isLoading}
              className={cn(
                'w-full justify-between',
                errors.editorType &&
                  'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20'
              )}
            >
              <span className={formData.editorType ? 'text-gray-900' : 'text-gray-500'}>
                {formData.editorType ? formData.editorType.label : 'Select editor type'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          }
          label="Editor Type"
          required
          error={errors.editorType}
        >
          {editorTypeOptions.map((option) => (
            <DropdownItem key={option.value} onClick={() => handleEditorTypeChange(option)}>
              {option.label}
            </DropdownItem>
          ))}
        </Dropdown>
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

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outlined" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          Create Editor
        </Button>
      </div>
    </form>
  );
}
