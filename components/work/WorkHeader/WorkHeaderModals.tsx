'use client';

import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { TipContentModal } from '@/components/modals/TipContentModal';
import { AddToListModal } from '@/components/UserList/AddToListModal';
import { WorkEditModal } from '../WorkEditModal';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';
import { ReopenFundraiseModal } from '@/components/modals/ReopenFundraiseModal';

export interface FundraiseModalConfig {
  title: string;
  message: string;
  confirmText: string;
  confirmButtonClass: string;
  isLoading: boolean;
}

export interface WorkHeaderModalsProps {
  work: Work;
  metadata: WorkMetadata;
  isFlagModalOpen: boolean;
  onCloseFlagModal: () => void;
  isTipModalOpen: boolean;
  onCloseTipModal: () => void;
  onTipSuccess: (amount: number) => void;
  isAddToListModalOpen: boolean;
  onCloseAddToListModal: () => void;
  isWorkEditModalOpen: boolean;
  onCloseWorkEditModal: () => void;
  showFundraiseActionModal: boolean;
  onCloseFundraiseModal: () => void;
  onConfirmFundraise: () => void;
  fundraiseModalConfig: FundraiseModalConfig;
  isApplyToGrantModalOpen?: boolean;
  onCloseApplyToGrantModal?: () => void;
  grantId?: string;
  grantAmountUsd?: number;
  grantOrganization?: string;
  showReopenModal?: boolean;
  onCloseReopenModal?: () => void;
  onConfirmReopen?: (durationDays: number) => void;
  isReopeningFundraise?: boolean;
  isExtendFundraise?: boolean;
}

export function WorkHeaderModals({
  work,
  metadata,
  isFlagModalOpen,
  onCloseFlagModal,
  isTipModalOpen,
  onCloseTipModal,
  onTipSuccess,
  isAddToListModalOpen,
  onCloseAddToListModal,
  isWorkEditModalOpen,
  onCloseWorkEditModal,
  showFundraiseActionModal,
  onCloseFundraiseModal,
  onConfirmFundraise,
  fundraiseModalConfig,
  isApplyToGrantModalOpen = false,
  onCloseApplyToGrantModal,
  grantId,
  grantAmountUsd,
  grantOrganization,
  showReopenModal = false,
  onCloseReopenModal,
  onConfirmReopen,
  isReopeningFundraise = false,
  isExtendFundraise = false,
}: WorkHeaderModalsProps) {
  return (
    <>
      <FlagContentModal
        isOpen={isFlagModalOpen}
        onClose={onCloseFlagModal}
        documentId={work.id.toString()}
        workType={work.contentType}
      />
      <TipContentModal
        isOpen={isTipModalOpen}
        onClose={onCloseTipModal}
        contentId={work.id}
        feedContentType={work.contentType === 'paper' ? 'PAPER' : 'POST'}
        onTipSuccess={onTipSuccess}
      />
      {work.unifiedDocumentId && (
        <AddToListModal
          isOpen={isAddToListModalOpen}
          onClose={onCloseAddToListModal}
          unifiedDocumentId={work.unifiedDocumentId}
        />
      )}
      {work.contentType === 'paper' && (
        <WorkEditModal
          isOpen={isWorkEditModalOpen}
          onClose={onCloseWorkEditModal}
          work={work}
          metadata={metadata}
        />
      )}
      <ConfirmModal
        isOpen={showFundraiseActionModal}
        onClose={onCloseFundraiseModal}
        onConfirm={onConfirmFundraise}
        title={fundraiseModalConfig.title}
        message={fundraiseModalConfig.message}
        confirmText={fundraiseModalConfig.confirmText}
        cancelText="Cancel"
        confirmButtonClass={fundraiseModalConfig.confirmButtonClass}
        cancelButtonClass="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
      />
      {onCloseReopenModal && onConfirmReopen && (
        <ReopenFundraiseModal
          isOpen={showReopenModal}
          onClose={onCloseReopenModal}
          onConfirm={onConfirmReopen}
          isLoading={isReopeningFundraise}
          isExtend={isExtendFundraise}
        />
      )}
      {grantId && onCloseApplyToGrantModal && (
        <ApplyToGrantModal
          isOpen={isApplyToGrantModalOpen}
          onClose={onCloseApplyToGrantModal}
          onUseSelected={onCloseApplyToGrantModal}
          grantId={grantId}
          grantTitle={work.title}
          grantAmountUsd={grantAmountUsd}
          grantOrganization={grantOrganization}
        />
      )}
    </>
  );
}
