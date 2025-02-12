import { Editor } from '@tiptap/react';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';

interface LinkMenuProps {
  editor: Editor;
  url: string;
  onEdit: () => void;
  onClose: () => void;
}

export const LinkMenu = ({ editor, url, onEdit, onClose }: LinkMenuProps) => {
  const handleRemove = () => {
    editor.chain().focus().unsetLink().run();
    onClose();
  };

  const handleOpen = () => {
    window.open(url, '_blank');
  };

  return (
    <div className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 px-3 flex gap-2">
      <button
        onClick={handleOpen}
        className="p-1 hover:bg-gray-100 rounded text-gray-700 hover:text-gray-900"
        title="Open link"
      >
        <ExternalLink className="h-4 w-4" />
      </button>
      <button
        onClick={onEdit}
        className="p-1 hover:bg-gray-100 rounded text-gray-700 hover:text-gray-900"
        title="Edit link"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={handleRemove}
        className="p-1 hover:bg-gray-100 rounded text-gray-700 hover:text-gray-900"
        title="Remove link"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
