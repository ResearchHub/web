'use client';

import { useState, useCallback, ReactNode } from 'react';
import {
  Edit,
  Flag,
  FileUp,
  Octagon,
  CheckCircle,
  Download,
  Search,
  RotateCcw,
} from 'lucide-react';
import { BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Icon } from '@/components/ui/icons/Icon';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useRouter } from 'next/navigation';
import { useCloseFundraise, useCompleteFundraise, useReopenFundraise } from '@/hooks/useFundraise';
import { PaperService } from '@/services/paper.service';
import { handleDownload } from '@/utils/download';
import { FundraiseModalConfig } from './WorkHeaderModals';
import toast from 'react-hot-toast';

interface UseWorkHeaderMenuItemsOptions {
  work: Work;
  metadata: WorkMetadata;
  permissions: {
    user: any;
    selectedOrg: any;
    isModerator: boolean;
    isHubEditor: boolean;
    isAuthor: boolean;
    canEdit: boolean;
  };
  onOpenFlagModal: () => void;
  onOpenWorkEditModal: () => void;
}

export function useWorkHeaderMenuItems({
  work,
  metadata,
  permissions,
  onOpenFlagModal,
  onOpenWorkEditModal,
}: UseWorkHeaderMenuItemsOptions) {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const router = useRouter();

  const { user, selectedOrg, isModerator, isHubEditor, isAuthor, canEdit } = permissions;

  const [isPublishing, setIsPublishing] = useState(false);
  const [showFundraiseActionModal, setShowFundraiseActionModal] = useState(false);
  const [fundraiseAction, setFundraiseAction] = useState<'close' | 'complete' | null>(null);
  const [showReopenModal, setShowReopenModal] = useState(false);

  const latestVersion = work.versions?.find((v) => v.isLatest);
  const isPublished = latestVersion?.publicationStatus === 'PUBLISHED';
  const pdfFormat = work.formats?.find((format) => format.type === 'PDF');

  const handleEdit = useCallback(() => {
    if (work.contentType === 'paper' && (isModerator || isHubEditor)) {
      onOpenWorkEditModal();
    } else if (selectedOrg && work.note) {
      router.push(`/notebook/${work.note.organization.slug}/${work.note.id}`);
    } else {
      toast.error('Unable to edit');
    }
  }, [
    work.contentType,
    work.note,
    selectedOrg,
    router,
    isModerator,
    isHubEditor,
    onOpenWorkEditModal,
  ]);

  const handlePublish = useCallback(async () => {
    if (isPublished) return;
    setIsPublishing(true);
    try {
      await PaperService.publishPaper(work.id);
      toast.success('Paper published to ResearchHub Journal');
      router.refresh();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to publish paper. Please try again.'
      );
    } finally {
      setIsPublishing(false);
    }
  }, [work.id, isPublished, router]);

  const handleAddVersion = useCallback(() => {
    if (!user) return;
    let latestPaperId = work.id;
    if (work.versions?.length) {
      const latest = work.versions.find((v) => v.isLatest);
      latestPaperId = latest
        ? latest.paperId
        : [...work.versions].sort(
            (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
          )[0].paperId;
    }
    router.push(`/paper/${latestPaperId}/create/version`);
  }, [work.id, work.versions, user, router]);

  const [{ isLoading: isClosingFundraise }, closeFundraise] = useCloseFundraise();
  const [{ isLoading: isCompletingFundraise }, completeFundraise] = useCompleteFundraise();
  const [{ isLoading: isReopeningFundraise }, reopenFundraise] = useReopenFundraise();

  const confirmFundraiseAction = useCallback(async () => {
    if (!metadata.fundraising?.id) {
      toast.error('No fundraise found');
      return;
    }
    try {
      if (fundraiseAction === 'close') {
        await closeFundraise(metadata.fundraising.id);
        toast.success('Fundraise closed successfully');
      } else if (fundraiseAction === 'complete') {
        await completeFundraise(metadata.fundraising.id);
        toast.success('Fundraise completed successfully');
      }
      router.refresh();
    } catch (error: any) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${fundraiseAction} fundraise. Please try again.`
      );
    }
  }, [metadata.fundraising?.id, fundraiseAction, closeFundraise, completeFundraise, router]);

  const confirmReopenFundraise = useCallback(
    async (durationDays: number) => {
      if (!metadata.fundraising?.id) {
        toast.error('No fundraise found');
        return;
      }
      try {
        await reopenFundraise(metadata.fundraising.id, durationDays);
        toast.success('Fundraise reopened successfully');
        setShowReopenModal(false);
        router.refresh();
      } catch (error: any) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to reopen fundraise. Please try again.'
        );
      }
    },
    [metadata.fundraising?.id, reopenFundraise, router]
  );

  const canReopenFundraise = (() => {
    const fundraise = metadata.fundraising;
    if (!fundraise) return false;
    if (fundraise.status === 'COMPLETED') return false;
    return fundraise.status === 'CLOSED' || fundraise.status === 'OPEN';
  })();

  const fundraiseModalConfig: FundraiseModalConfig = (() => {
    if (fundraiseAction === 'close')
      return {
        title: 'Close fundraise & refund contributors',
        message:
          'Are you sure you want to close this fundraise? This will immediately refund all contributions to contributors and close the fundraise permanently. This action cannot be undone.',
        confirmText: 'Close fundraise & refund contributors',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700',
        isLoading: isClosingFundraise,
      };
    if (fundraiseAction === 'complete')
      return {
        title: 'Complete fundraise',
        message:
          'Are you sure you want to complete this fundraise? This will distribute the funds to the researcher. This action cannot be undone.',
        confirmText: 'Complete fundraise',
        confirmButtonClass: 'bg-green-600 hover:bg-green-700',
        isLoading: isCompletingFundraise,
      };
    return { title: '', message: '', confirmText: '', confirmButtonClass: '', isLoading: false };
  })();

  const menuItems: ReactNode = (
    <>
      {canEdit && (
        <BaseMenuItem onSelect={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          <span>Edit</span>
        </BaseMenuItem>
      )}
      {isAuthor && (
        <BaseMenuItem onSelect={() => executeAuthenticatedAction(handleAddVersion)}>
          <FileUp className="h-4 w-4 mr-2" />
          <span>Upload New Version</span>
        </BaseMenuItem>
      )}
      {!isPublished && isModerator && work.contentType !== 'preregistration' && (
        <BaseMenuItem
          disabled={isPublishing}
          onSelect={() => executeAuthenticatedAction(handlePublish)}
        >
          <Icon name="rhJournal1" size={16} className="mr-2" />
          <span>Publish to Journal</span>
        </BaseMenuItem>
      )}
      {isModerator && work.contentType === 'preregistration' && metadata.fundraising?.id && (
        <>
          <BaseMenuItem
            disabled={isClosingFundraise}
            onSelect={() =>
              executeAuthenticatedAction(() => {
                setFundraiseAction('close');
                setShowFundraiseActionModal(true);
              })
            }
          >
            <Octagon className="h-4 w-4 mr-2" />
            <span>Close fundraise & refund</span>
          </BaseMenuItem>
          <BaseMenuItem
            disabled={isCompletingFundraise}
            onSelect={() =>
              executeAuthenticatedAction(() => {
                setFundraiseAction('complete');
                setShowFundraiseActionModal(true);
              })
            }
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>Complete fundraise</span>
          </BaseMenuItem>
          {canReopenFundraise && (
            <BaseMenuItem
              disabled={isReopeningFundraise}
              onSelect={() =>
                executeAuthenticatedAction(() => {
                  setShowReopenModal(true);
                })
              }
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              <span>Reopen fundraise</span>
            </BaseMenuItem>
          )}
        </>
      )}
      {pdfFormat && (
        <BaseMenuItem onSelect={() => handleDownload(pdfFormat.url, 'document.pdf')}>
          <Download className="h-4 w-4 mr-2" />
          <span>Download PDF</span>
        </BaseMenuItem>
      )}
      {(isModerator || isHubEditor) && work.unifiedDocumentId != null && (
        <BaseMenuItem
          onSelect={() =>
            router.push(`/expert-finder/library/new?unifiedDocumentId=${work.unifiedDocumentId}`)
          }
        >
          <Search className="h-4 w-4 mr-2" />
          <span>Find experts</span>
        </BaseMenuItem>
      )}
      <BaseMenuItem onSelect={() => executeAuthenticatedAction(onOpenFlagModal)}>
        <Flag className="h-4 w-4 mr-2" />
        <span>Flag Content</span>
      </BaseMenuItem>
    </>
  );

  return {
    menuItems,
    showFundraiseActionModal,
    closeFundraiseModal: () => {
      setShowFundraiseActionModal(false);
      setFundraiseAction(null);
    },
    confirmFundraiseAction,
    fundraiseModalConfig,
    showReopenModal,
    closeReopenModal: () => setShowReopenModal(false),
    confirmReopenFundraise,
    isReopeningFundraise,
  };
}
