'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import {
  SearchableMultiSelect,
  MultiSelectOption,
} from '@/components/ui/form/SearchableMultiSelect';
import { EDITOR_TYPES, EditorType, TransformedEditorData } from '@/types/editor';
import { HubService } from '@/services/hub.service';
import { z } from 'zod';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/styles';

interface EditorFormProps {
  onSubmit: (params: {
    editorEmail: string;
    editorType: EditorType;
    selectedHubIds: number[];
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  selectedEditor?: TransformedEditorData;
  onUpdate?: (params: {
    editorEmail: string;
    hubsToAdd: number[];
    hubsToRemove: number[];
    editorType: EditorType;
  }) => Promise<void>;
}

interface EditorFormData {
  email: string;
  topics: MultiSelectOption[];
  editorType: SelectOption | null;
}

interface SelectOption {
  value: string;
  label: string;
}

// Zod schema for validation
const createEditorSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  topics: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .min(1, 'Please select at least one topic'),
  editorType: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .refine((val) => val && Object.values(EDITOR_TYPES).includes(val.value as EditorType), {
      message: 'Please select an editor type',
    }),
});

export function EditorForm({
  onSubmit,
  onCancel,
  isLoading = false,
  selectedEditor,
  onUpdate,
}: EditorFormProps) {
  const isUpdateMode = selectedEditor !== undefined;
  const [formData, setFormData] = useState<EditorFormData>({
    email: '',
    topics: [],
    editorType: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalTopics, setOriginalTopics] = useState<MultiSelectOption[]>([]);

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
      const validatedData = createEditorSchema.parse(formData);

      if (isUpdateMode && onUpdate) {
        const currentHubIds = new Set(formData.topics.map((topic) => parseInt(topic.value)));
        const originalHubIds = new Set(originalTopics.map((topic) => parseInt(topic.value)));

        const hubsToAdd = Array.from(currentHubIds).filter((id) => !originalHubIds.has(id));
        const hubsToRemove = Array.from(originalHubIds).filter((id) => !currentHubIds.has(id));

        await onUpdate({
          editorEmail: validatedData.email,
          hubsToAdd,
          hubsToRemove,
          editorType: validatedData.editorType.value as EditorType,
        });
      } else {
        const selectedHubIds = validatedData.topics.map((topic) => parseInt(topic.value));

        await onSubmit({
          editorEmail: validatedData.email,
          editorType: validatedData.editorType.value as EditorType,
          selectedHubIds,
        });
      }

      // Reset form on success
      setFormData({
        email: '',
        topics: [],
        editorType: null,
      });
      setErrors({});
      setOriginalTopics([]);
    } catch (error) {
      // Error - toast will be shown by the parent component
      // Don't close modal on error
    }
  };

  const handleInputChange = (field: keyof Pick<EditorFormData, 'email'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleEditorTypeChange = (option: SelectOption) => {
    setFormData((prev) => ({ ...prev, editorType: option }));
    if (errors.editorType) {
      setErrors((prev) => ({ ...prev, editorType: '' }));
    }
  };

  const handleTopicsChange = (options: MultiSelectOption[]) => {
    setFormData((prev) => ({ ...prev, topics: options }));
    if (errors.topics) {
      setErrors((prev) => ({ ...prev, topics: '' }));
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
      console.error('Error searching topics:', error);
      return [];
    }
  }, []);

  const editorTypeOptions: SelectOption[] = [
    { value: EDITOR_TYPES.ASSISTANT_EDITOR, label: 'Assistant Editor' },
    { value: EDITOR_TYPES.ASSOCIATE_EDITOR, label: 'Associate Editor' },
    { value: EDITOR_TYPES.SENIOR_EDITOR, label: 'Senior Editor' },
  ];

  useEffect(() => {
    if (selectedEditor) {
      const editorTopics =
        selectedEditor.authorProfile.editorOfHubs?.map((hub) => ({
          value: hub.id.toString(),
          label: hub.name,
        })) || [];

      setFormData({
        editorType:
          editorTypeOptions.find((option) => option.value === selectedEditor.editorType) || null,
        email: selectedEditor.authorProfile.user?.email || '',
        topics: editorTopics,
      });

      setOriginalTopics(editorTopics);
    }
  }, [selectedEditor]);

  const hasChanges = () => {
    if (!isUpdateMode || !selectedEditor) return false;

    const currentHubIds = new Set(formData.topics.map((topic) => parseInt(topic.value)));
    const originalHubIds = new Set(originalTopics.map((topic) => parseInt(topic.value)));

    const hasAdditions = Array.from(currentHubIds).some((id) => !originalHubIds.has(id));
    const hasRemovals = Array.from(originalHubIds).some((id) => !currentHubIds.has(id));

    return hasAdditions || hasRemovals;
  };

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
              {formData.editorType?.label || 'Select editor type'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          }
          label="Editor Type"
          required
          error={errors.editorType}
        >
          {editorTypeOptions.map((option) => (
            <DropdownItem
              key={option.value}
              onClick={() => handleEditorTypeChange(option)}
              className={
                formData.editorType?.value === option.value ? 'bg-slate-50 font-semibold' : ''
              }
            >
              {option.label}
            </DropdownItem>
          ))}
        </Dropdown>
      </div>

      <div>
        <SearchableMultiSelect
          value={formData.topics}
          onChange={handleTopicsChange}
          onAsyncSearch={handleTopicSearch}
          label="Topic"
          required
          placeholder="Search topics..."
          debounceMs={500}
          error={errors.topics}
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
          helperText={
            isUpdateMode
              ? 'The email address is required to identify and update the editor.'
              : undefined
          }
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outlined" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || (isUpdateMode && !hasChanges())}>
          {isUpdateMode ? 'Update Editor' : 'Create Editor'}
        </Button>
      </div>
    </form>
  );
}
