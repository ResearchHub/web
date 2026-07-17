import { Editor } from '@tiptap/react';
import { ImageUploadModal } from '../ImageUploadModal';
import { LinkEditModal } from '../lib/LinkEditModal';
import { LinkMenu } from '../lib/LinkMenu';

export interface SelectedLink {
  url: string;
  text: string;
  /** `'link'` = plain link mark, `'richLink'` = chip atom node. */
  kind: 'link' | 'richLink';
  /** Doc position of the chip atom (only set when `kind === 'richLink'`). */
  pos?: number;
}

interface EditorModalsProps {
  editor: Editor | null;
  isImageModalOpen: boolean;
  setIsImageModalOpen: (isOpen: boolean) => void;
  isLinkModalOpen: boolean;
  setIsLinkModalOpen: (isOpen: boolean) => void;
  linkMenuPosition: { x: number; y: number } | null;
  setLinkMenuPosition: (position: { x: number; y: number } | null) => void;
  selectedLink: SelectedLink | null;
  setSelectedLink: (link: SelectedLink | null) => void;
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

      {/* Link menu — anchored to the clicked link in viewport coords. We use
          `position: fixed` so the coords don't have to be reinterpreted
          against whatever positioned ancestor happens to wrap the editor. */}
      {linkMenuPosition && editor && selectedLink && (
        <div
          style={{
            position: 'fixed',
            left: `${linkMenuPosition.x}px`,
            top: `${linkMenuPosition.y}px`,
          }}
        >
          <LinkMenu
            editor={editor}
            url={selectedLink.url}
            kind={selectedLink.kind}
            pos={selectedLink.pos}
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
