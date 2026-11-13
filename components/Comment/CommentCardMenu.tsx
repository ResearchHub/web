'use client';

import { FC } from 'react';
import { Flag, Pen, Trash2 } from 'lucide-react';
import { getFlagTarget } from '@/components/Feed/lib/flagTarget';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { OverflowMenu, type OverflowMenuItem } from '@/components/ui/OverflowMenu';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useFlagModal } from '@/hooks/useFlagging';
import type { ContentType } from '@/types/work';

interface CommentCardMenuProps {
  commentId: number;
  /** The document the comment is on, which a flag is filed against. */
  relatedDocumentId?: string;
  relatedDocumentContentType?: ContentType;
  /** Offered to the comment's author only. */
  onEdit?: () => void;
  /** Offered to the comment's author only. */
  onDelete?: () => void;
}

/**
 * A comment row's ⋯ menu, in its top-right corner: Edit and Delete for its author,
 * Flag content for everyone, as on the homepage cards.
 */
export const CommentCardMenu: FC<CommentCardMenuProps> = ({
  commentId,
  relatedDocumentId,
  relatedDocumentContentType,
  onEdit,
  onDelete,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { isOpen, contentToFlag, openFlagModal, closeFlagModal } = useFlagModal();

  const flag = () =>
    executeAuthenticatedAction(() => {
      const {
        documentId,
        contentType,
        commentId: flaggedCommentId,
      } = getFlagTarget({
        feedContentType: 'COMMENT',
        votableEntityId: commentId,
        relatedDocumentId,
        relatedDocumentContentType,
      });
      openFlagModal(documentId, contentType, flaggedCommentId);
    });

  const items: OverflowMenuItem[] = [
    ...(onEdit
      ? [{ key: 'edit', label: 'Edit', icon: <Pen className="h-4 w-4" />, onSelect: onEdit }]
      : []),
    ...(onDelete
      ? [
          {
            key: 'delete',
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onSelect: onDelete,
          },
        ]
      : []),
    { key: 'flag', label: 'Flag content', icon: <Flag className="h-4 w-4" />, onSelect: flag },
  ];

  return (
    <>
      <OverflowMenu items={items} />
      {isOpen && contentToFlag && (
        <FlagContentModal
          isOpen={isOpen}
          onClose={closeFlagModal}
          documentId={contentToFlag.documentId}
          workType={contentToFlag.contentType}
          commentId={contentToFlag.commentId}
        />
      )}
    </>
  );
};
