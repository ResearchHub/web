'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { Comment } from '@/types/comment';
import type { ContentType } from '@/types/work';
import { extractUserMentions } from '../lib/commentUtils';
import type { CommentContent } from '../lib/types';
import { CommentService } from '@/services/comment.service';

type ComposerState = { mode: 'create' } | { mode: 'edit'; comment: Comment } | null;

interface UseAuthorPostComposerArgs {
  documentId: number;
  contentType: ContentType;
}

export interface AuthorPostComposer {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  editingComment?: Comment;
  onSubmit: (payload: { content: CommentContent }) => Promise<boolean>;
  open: () => void;
  openForEdit: (comment: Comment) => void;
}

/**
 * Encapsulates the create/edit lifecycle for the AUTHOR_UPDATE composer:
 * tracks which mode the modal is in, handles the API call, surfaces toasts,
 * and triggers a router refresh on success so SSR-rendered post lists
 * pick up the change.
 */
export function useAuthorPostComposer({
  documentId,
  contentType,
}: UseAuthorPostComposerArgs): AuthorPostComposer {
  const router = useRouter();
  const [composer, setComposer] = useState<ComposerState>(null);

  const onSubmit = async (payload: { content: CommentContent }): Promise<boolean> => {
    if (!composer) return false;
    const isEdit = composer.mode === 'edit';
    const toastId = toast.loading(isEdit ? 'Saving…' : 'Posting…');
    try {
      const apiContent =
        typeof payload.content === 'string' ? payload.content : JSON.stringify(payload.content);
      const mentions =
        payload.content && typeof payload.content === 'object' && 'content' in payload.content
          ? extractUserMentions(payload.content as any)
          : [];

      if (isEdit) {
        await CommentService.updateComment({
          commentId: composer.comment.id,
          documentId,
          contentType,
          content: apiContent,
          contentFormat: 'TIPTAP',
          mentions,
        });
      } else {
        // Backed by the AUTHOR_UPDATE comment type — kept for backend compat.
        await CommentService.createComment({
          workId: documentId,
          contentType,
          content: apiContent,
          contentFormat: 'TIPTAP',
          commentType: 'AUTHOR_UPDATE',
          mentions,
        });
      }

      toast.success(isEdit ? 'Post saved!' : 'Post shared!', { id: toastId });
      setComposer(null);
      router.refresh();
      return true;
    } catch (err) {
      console.error(isEdit ? 'Failed to save author post:' : 'Failed to publish author post:', err);
      toast.error(
        isEdit
          ? 'Failed to save post. Please try again.'
          : 'Failed to publish post. Please try again.',
        { id: toastId }
      );
      return false;
    }
  };

  return {
    isOpen: composer !== null,
    onClose: () => setComposer(null),
    documentId,
    editingComment: composer?.mode === 'edit' ? composer.comment : undefined,
    onSubmit,
    open: () => setComposer({ mode: 'create' }),
    openForEdit: (comment: Comment) => setComposer({ mode: 'edit', comment }),
  };
}
