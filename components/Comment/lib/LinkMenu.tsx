import { Editor } from '@tiptap/react';
import { useMemo } from 'react';
import { ExternalLink, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { classifyUrl } from '@/utils/url';

interface LinkMenuProps {
  editor: Editor;
  url: string;
  /**
   * Whether the bubble is anchored to a richLink atom (chip) or a regular
   * link mark. The two share Open / Remove but diverge on Edit (only links
   * have editable anchor text) and on the convert button (chip ⇄ link).
   */
  kind: 'link' | 'richLink';
  /** Required for `kind === 'richLink'`: doc position of the chip atom. */
  pos?: number;
  onEdit: () => void;
  onClose: () => void;
}

export const LinkMenu = ({ editor, url, kind, pos, onEdit, onClose }: LinkMenuProps) => {
  const isChip = kind === 'richLink';
  // Whether the URL is "card-able" — i.e. promoting a plain link mark into a
  // chip would actually produce a meaningful preview. classifyUrl returns a
  // value for any well-formed URL (falling back to `webpage`), so this is
  // really a URL-validity gate more than a feature gate.
  const canShowAsCard = useMemo(() => !isChip && classifyUrl(url) != null, [isChip, url]);

  const handleRemove = () => {
    if (isChip && pos != null) {
      const node = editor.state.doc.nodeAt(pos);
      const size = node?.nodeSize ?? 1;
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + size })
        .run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    onClose();
  };

  const handleOpen = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleConvert = () => {
    if (isChip && pos != null) {
      editor.chain().focus().convertRichLinkToLink(pos).run();
    } else {
      editor.chain().focus().convertLinkToRichLink().run();
    }
    onClose();
  };

  return (
    <div className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 px-3 flex gap-2 items-center">
      <button
        onClick={handleOpen}
        className="p-1 hover:bg-gray-100 rounded text-gray-700 hover:text-gray-900"
        title="Open link"
      >
        <ExternalLink className="h-4 w-4" />
      </button>
      {!isChip && (
        <button
          onClick={onEdit}
          className="p-1 hover:bg-gray-100 rounded text-gray-700 hover:text-gray-900"
          title="Edit link"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
      {(isChip || canShowAsCard) && (
        <>
          <span className="h-4 w-px bg-gray-200" aria-hidden />
          <button
            onClick={handleConvert}
            className="px-2 py-0.5 hover:bg-gray-100 rounded text-gray-700 hover:text-gray-900 inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap"
            title={isChip ? 'Hide rich preview for this link' : 'Show rich preview for this link'}
          >
            {isChip ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                Hide preview
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                Show preview
              </>
            )}
          </button>
          <span className="h-4 w-px bg-gray-200" aria-hidden />
        </>
      )}
      <button
        onClick={handleRemove}
        className="p-1 hover:bg-gray-100 rounded text-gray-700 hover:text-gray-900"
        title={isChip ? 'Remove preview' : 'Remove link'}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
