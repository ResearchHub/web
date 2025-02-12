import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LinkEditModalProps {
  initialUrl: string;
  initialText?: string;
  onSave: (url: string, text?: string) => void;
  onClose: () => void;
}

const normalizeUrl = (url: string): string => {
  if (!url) return url;

  // If URL already has a protocol, return as is
  if (url.match(/^[a-zA-Z]+:\/\//)) return url;

  // If it's a valid URL with no protocol, add https://
  return `https://${url}`;
};

export const LinkEditModal = ({ initialUrl, initialText, onSave, onClose }: LinkEditModalProps) => {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(normalizeUrl(url), text || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave(normalizeUrl(url), text || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Edit Link</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
              Text (optional)
            </label>
            <input
              type="text"
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Link text"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button onClick={onClose} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
