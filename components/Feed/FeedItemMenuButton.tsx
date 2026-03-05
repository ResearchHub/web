'use client';

import { FC, useState, useContext } from 'react';
import { MoreHorizontal, Flag, Trash2, CheckCircle, XCircle } from 'lucide-react';
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
import { useUser } from '@/contexts/UserContext';
import { useGrantModeration } from '@/hooks/useGrantModeration';
import { DeclineGrantModal } from '@/components/Moderators/DeclineGrantModal';
import { ID } from '@/types/root';
import { GrantStatus } from '@/types/grant';

interface FeedItemMenuButtonProps {
  feedContentType: FeedContentType;
  relatedDocumentContentType?: ContentType;
  relatedDocumentId?: string;
  votableEntityId: number;
  actionLabel?: string;
  relatedDocumentUnifiedDocumentId?: string;
  grantId?: ID;
  grantStatus?: GrantStatus;
}

export const FeedItemMenuButton: FC<FeedItemMenuButtonProps> = ({
  feedContentType,
  votableEntityId,
  relatedDocumentId,
  relatedDocumentContentType,
  actionLabel = 'Report',
  relatedDocumentUnifiedDocumentId,
  grantId,
  grantStatus,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isOpen, contentToFlag, openFlagModal, closeFlagModal } = useFlagModal();
  const { user } = useUser();
  const {
    moderationAction,
    isDeclineModalOpen,
    openDeclineModal,
    closeDeclineModal,
    approveGrant,
    declineGrant,
  } = useGrantModeration(grantId);

  const isModerator = !!user?.isModerator;
  const isGrantPending = feedContentType === 'GRANT' && grantStatus === 'PENDING' && !!grantId;
  const isModerating = moderationAction !== null;

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

  const handleApproveGrant = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMenuOpen(false);
    await approveGrant();
  };

  const handleDeclineGrant = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMenuOpen(false);
    openDeclineModal();
  };

  const handleReport = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    executeAuthenticatedAction(() => {
      setIsMenuOpen(false);

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
        commentId = votableEntityId.toString();
      } else if (feedContentType === 'COMMENT') {
        contentType = relatedDocumentContentType || 'post';
        commentId = votableEntityId.toString();
      } else {
        contentType = 'post';
      }

      openFlagModal(
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

        {isModerator && isGrantPending && (
          <>
            <BaseMenuItem
              onClick={handleApproveGrant}
              className="flex items-center gap-2"
              disabled={isModerating}
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>{moderationAction === 'approving' ? 'Approving...' : 'Approve RFP'}</span>
            </BaseMenuItem>
            <BaseMenuItem
              onClick={handleDeclineGrant}
              className="flex items-center gap-2"
              disabled={isModerating}
            >
              <XCircle className="w-4 h-4 text-red-600" />
              <span>Decline RFP</span>
            </BaseMenuItem>
          </>
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

      {isDeclineModalOpen && (
        <DeclineGrantModal
          isOpen={isDeclineModalOpen}
          onClose={closeDeclineModal}
          onConfirm={declineGrant}
          isSubmitting={moderationAction === 'declining'}
        />
      )}
    </>
  );
};
