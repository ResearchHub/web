'use client';

import { FC } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { CommentEditor } from '@/components/Comment/CommentEditor';
import type { Comment } from '@/types/comment';
import type { CommentContent } from '../lib/types';

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  /** When provided, the modal opens in edit mode for this comment. */
  editingComment?: Comment;
  onSubmit: (payload: { content: CommentContent }) => Promise<boolean>;
}

export const PostComposerModal: FC<PostComposerModalProps> = ({
  isOpen,
  onClose,
  documentId,
  editingComment,
  onSubmit,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingComment ? 'Edit post' : 'New post'}
      maxWidth="md:!max-w-[640px]"
      padding="p-4 sm:p-6"
    >
      <CommentEditor
        autoFocus
        commentType="AUTHOR_UPDATE"
        placeholder="Share something with your audience. Paste a YouTube, TikTok, X or LinkedIn link to embed it."
        storageKey={
          editingComment
            ? `author-post-edit-${editingComment.id}`
            : `author-post-composer-${documentId}`
        }
        initialContent={editingComment?.content}
        editing={!!editingComment}
        onSubmit={onSubmit}
        onCancel={onClose}
        isAuthor
      />
    </BaseModal>
  );
};
