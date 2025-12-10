'use client';

import { FC, useState, useContext } from 'react';
import { MoreHorizontal, Flag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useFlagModal } from '@/hooks/useFlagging';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { FeedContentType } from '@/types/feed';
import { ContentType } from '@/types/work';
import { ListDetailContext } from '@/components/UserList/lib/user-list';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';

interface FeedItemMenuButtonProps {
  feedContentType: FeedContentType;
  relatedDocumentContentType?: ContentType;
  relatedDocumentId?: string;
  votableEntityId: number;
  actionLabel?: string;
  relatedDocumentUnifiedDocumentId?: string;
}

export const FeedItemMenuButton: FC<FeedItemMenuButtonProps> = ({
  feedContentType,
  votableEntityId,
  relatedDocumentId,
  relatedDocumentContentType,
  actionLabel = 'Report',
  relatedDocumentUnifiedDocumentId,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isOpen, contentToFlag, openFlagModal, closeFlagModal } = useFlagModal();

  const listDetailContext = useContext(ListDetailContext);

  const handleRemoveFromList = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (!listDetailContext || !relatedDocumentUnifiedDocumentId) {
      return;
    }

    setIsMenuOpen(false);

    try {
      await listDetailContext.onRemoveItem(Number.parseInt(relatedDocumentUnifiedDocumentId));
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to remove from list'));
    }
  };

  const handleReport = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    executeAuthenticatedAction(() => {
      // Close the dropdown menu before opening the modal
      setIsMenuOpen(false);

      // Map feedContentType to ContentType
      let contentType: ContentType;
      let commentId: string | undefined;

      if (feedContentType === 'PAPER') {
        contentType = 'paper';
      } else if (feedContentType === 'POST' || feedContentType === 'PREREGISTRATION') {
        contentType = 'post';
      } else if (feedContentType === 'GRANT') {
        contentType = relatedDocumentContentType || 'funding_request';
      } else if (feedContentType === 'BOUNTY' && relatedDocumentContentType) {
        contentType = relatedDocumentContentType;
        commentId = votableEntityId.toString(); // Use votableEntityId as commentId for bounties
      } else if (feedContentType === 'COMMENT') {
        contentType = relatedDocumentContentType || 'post';
        commentId = votableEntityId.toString();
      } else {
        contentType = 'post'; // Default fallback
      }

      openFlagModal(
        // For comments and bounties, use relatedDocumentId as the documentId
        (feedContentType === 'COMMENT' || feedContentType === 'BOUNTY') && relatedDocumentId
          ? relatedDocumentId.toString()
          : votableEntityId.toString(),
        contentType,
        commentId
      );
    });
  };

  return (
    <>
      <BaseMenu
        trigger={
          <Button
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            variant="ghost"
            size="sm"
            className="flex items-center text-gray-400 hover:text-gray-600"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        }
        align="end"
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
      >
        {listDetailContext && relatedDocumentUnifiedDocumentId && (
          <BaseMenuItem onClick={handleRemoveFromList} className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Remove from list</span>
          </BaseMenuItem>
        )}

        <BaseMenuItem onClick={handleReport} className="flex items-center gap-2">
          <Flag className="w-4 h-4" />
          <span>{actionLabel}</span>
        </BaseMenuItem>
      </BaseMenu>

      {contentToFlag && (
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
