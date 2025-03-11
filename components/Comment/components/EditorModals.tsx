import { Editor } from '@tiptap/react';
import { ImageUploadModal } from '../ImageUploadModal';
import { LinkEditModal } from '../lib/LinkEditModal';
import { LinkMenu } from '../lib/LinkMenu';

interface EditorModalsProps {
  editor: Editor | null;
  isImageModalOpen: boolean;
  setIsImageModalOpen: (isOpen: boolean) => void;
  isLinkModalOpen: boolean;
  setIsLinkModalOpen: (isOpen: boolean) => void;
  linkMenuPosition: { x: number; y: number } | null;
  setLinkMenuPosition: (position: { x: number; y: number } | null) => void;
  selectedLink: { url: string; text: string } | null;
  setSelectedLink: (link: { url: string; text: string } | null) => void;
  handleImageEmbed: (imageUrl: string) => void;
  handleLinkSave: (url: string, text?: string) => void;
}

export const EditorModals = ({
  editor,
  isImageModalOpen,
  setIsImageModalOpen,
  isLinkModalOpen,
  setIsLinkModalOpen,
  linkMenuPosition,
  setLinkMenuPosition,
  selectedLink,
  setSelectedLink,
  handleImageEmbed,
  handleLinkSave,
}: EditorModalsProps) => {
  return (
    <>
      {/* Image upload modal */}
      {isImageModalOpen && (
        <ImageUploadModal
          onClose={() => setIsImageModalOpen(false)}
          onImageEmbed={handleImageEmbed}
        />
      )}

      {/* Link edit modal */}
      {isLinkModalOpen && (
        <LinkEditModal
          initialUrl={selectedLink?.url || ''}
          initialText={selectedLink?.text || ''}
          onClose={() => setIsLinkModalOpen(false)}
          onSave={handleLinkSave}
        />
      )}

      {/* Link menu */}
      {linkMenuPosition && editor && selectedLink && (
        <div
          style={{
            position: 'absolute',
            left: `${linkMenuPosition.x}px`,
            top: `${linkMenuPosition.y}px`,
          }}
        >
          <LinkMenu
            editor={editor}
            url={selectedLink.url}
            onEdit={() => setIsLinkModalOpen(true)}
            onClose={() => {
              setLinkMenuPosition(null);
              setSelectedLink(null);
            }}
          />
        </div>
      )}
    </>
  );
};
