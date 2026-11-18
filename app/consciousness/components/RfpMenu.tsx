'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { MoreHorizontal, Share } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { BaseMenu } from '@/components/ui/form/BaseMenu';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useIsInList } from '@/components/UserList/lib/hooks/useIsInList';
import { useAddToList } from '@/components/UserList/lib/UserListsContext';
import { useWorkPermissions } from '@/components/work/WorkHeader/WorkHeaderHooks';
import { useWorkHeaderMenuItems } from '@/components/work/WorkHeader/useWorkHeaderMenu';
import { WorkHeaderModals } from '@/components/work/WorkHeader/WorkHeaderModals';
import { getWorkShareImageUrl } from '@/lib/metadata-helpers';
import { buildPublicSharePath, getPublicShareBlockReason, usesAiSharePost } from '@/utils/share';
import type { Work } from '@/types/work';
import type { WorkMetadata } from '@/services/metadata.service';
import { cn } from '@/utils/styles';

/** A round, quiet icon button that sits beside the hero's two calls to action. */
const ICON_BTN =
  'flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--o-line-2)] text-[var(--o-soft)] transition-colors hover:bg-[rgb(var(--o-text-rgb)/0.07)] hover:text-[var(--o-text)] disabled:opacity-50';

/**
 * The RFP page's Share, Save and More (edit, invite experts, close RFP...)
 * as three quiet round buttons after the hero's calls to action. With no
 * RFP on ResearchHub yet, only Share shows, and it shares this page.
 */
export function RfpMenu({ work, metadata }: { work: Work | null; metadata: WorkMetadata | null }) {
  if (work && metadata) return <LiveRfpMenu work={work} metadata={metadata} />;
  return <SharePageButton />;
}

function SharePageButton() {
  const { showShareModal } = useShareModalContext();
  return (
    <button
      type="button"
      aria-label="Share"
      className={ICON_BTN}
      onClick={() =>
        showShareModal({
          url: globalThis.location.href.split('?')[0],
          docTitle: 'How does consciousness arise? Request for proposals',
          action: 'USER_SHARED_DOCUMENT',
          shouldShowConfetti: false,
        })
      }
    >
      <Share className="h-[18px] w-[18px]" />
    </button>
  );
}

function LiveRfpMenu({ work, metadata }: { work: Work; metadata: WorkMetadata }) {
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);

  const { showShareModal } = useShareModalContext();
  const { isInList } = useIsInList(work.unifiedDocumentId);
  const { isTogglingDefaultList, handleAddToList } = useAddToList({
    unifiedDocumentId: work.unifiedDocumentId,
    isInList,
    onOpenModal: () => setIsAddToListModalOpen(true),
  });
  const permissions = useWorkPermissions(work);
  const menu = useWorkHeaderMenuItems({
    work,
    metadata,
    permissions,
    onOpenFlagModal: () => setIsFlagModalOpen(true),
  });

  const shareBlockReason = getPublicShareBlockReason(work);
  const share = () => {
    if (shareBlockReason) return;
    const useAiPost = usesAiSharePost(work.contentType);
    showShareModal({
      url: `${globalThis.location.origin}${buildPublicSharePath(work)}`,
      docTitle: work.title,
      action: 'USER_SHARED_DOCUMENT',
      shouldShowConfetti: false,
      aiPostId: useAiPost ? work.id : undefined,
      previewImageUrl: useAiPost ? getWorkShareImageUrl(work) : undefined,
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={share}
        aria-disabled={!!shareBlockReason}
        aria-label={shareBlockReason ?? 'Share'}
        className={cn(ICON_BTN, shareBlockReason && 'cursor-not-allowed opacity-50')}
      >
        <Share className="h-[18px] w-[18px]" />
      </button>
      <button
        type="button"
        onClick={handleAddToList}
        disabled={isTogglingDefaultList}
        aria-label={isInList ? 'Saved' : 'Save'}
        className={cn(ICON_BTN, isInList && 'text-[var(--o-gold)]')}
      >
        <FontAwesomeIcon
          icon={isInList ? faBookmarkSolid : faBookmark}
          className="h-[17px] w-[17px]"
        />
      </button>
      <BaseMenu
        align="start"
        trigger={
          <button type="button" aria-label="More options" className={ICON_BTN}>
            <MoreHorizontal className="h-5 w-5" />
          </button>
        }
      >
        {menu.menuItems}
      </BaseMenu>

      <WorkHeaderModals
        work={work}
        isFlagModalOpen={isFlagModalOpen}
        onCloseFlagModal={() => setIsFlagModalOpen(false)}
        isTipModalOpen={isTipModalOpen}
        onCloseTipModal={() => setIsTipModalOpen(false)}
        onTipSuccess={(amount) => {
          toast.success(`Successfully tipped ${amount} RSC`);
          setIsTipModalOpen(false);
        }}
        isAddToListModalOpen={isAddToListModalOpen}
        onCloseAddToListModal={() => setIsAddToListModalOpen(false)}
        showFundraiseActionModal={menu.showFundraiseActionModal}
        onCloseFundraiseModal={menu.closeFundraiseModal}
        onConfirmFundraise={menu.confirmFundraiseAction}
        fundraiseModalConfig={menu.fundraiseModalConfig}
        showReopenModal={menu.showReopenModal}
        onCloseReopenModal={menu.closeReopenModal}
        onConfirmReopen={menu.confirmReopenFundraise}
        isReopeningFundraise={menu.isReopeningFundraise}
        showCloseGrantModal={menu.showCloseGrantModal}
        onCloseCloseGrantModal={menu.closeCloseGrantModal}
        onConfirmCloseGrant={menu.confirmCloseGrant}
        isClosingGrant={menu.isClosingGrant}
        showInviteExpertsModal={menu.showInviteExpertsModal}
        onCloseInviteExpertsModal={menu.closeInviteExpertsModal}
        inviteExpertsGrantId={menu.inviteExpertsGrantId}
      />
    </>
  );
}
