'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Textarea } from '@/components/ui/form/Textarea';
import { Alert } from '@/components/ui/Alert';
import { AlertCircle, X, Plus } from 'lucide-react';
import type { UserList, UpdateUserListParams, ListVisibility } from '@/types/userList';

interface EditListFormProps {
  list: UserList;
  onSave: (data: UpdateUserListParams) => Promise<void>;
}

export const EditListForm = ({ list, onSave }: EditListFormProps) => {
  const [title, setTitle] = useState(list.title);
  const [description, setDescription] = useState(list.description || '');
  const [visibility, setVisibility] = useState<ListVisibility>(list.visibility);
  const [tags, setTags] = useState<string[]>(list.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updateData: UpdateUserListParams = {
        title,
        description: description || undefined,
        visibility,
        tags: tags.length > 0 ? tags : undefined,
      };

      await onSave(updateData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <div className="text-sm font-medium">{error}</div>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
            Title *
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter list title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your list (optional)"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="visibility" className="block text-sm font-semibold text-gray-700 mb-1">
            Visibility
          </label>
          <div className="relative">
            <select
              id="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ListVisibility)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
            >
              <option value="PRIVATE">Private - Only you can see this list</option>
              <option value="SHARED">Shared - Only people you invite can see this list</option>
              <option value="PUBLIC">Public - Anyone can see this list</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tags</label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                variant="outlined"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting || !title.trim()} className="flex-1">
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
