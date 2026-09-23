import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Editor } from '@tiptap/react';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { setDocumentTitle } from '@/components/Editor/lib/utils/documentTitle';
import { useAssetUpload } from '@/hooks/useAssetUpload';
import { useUpsertPost } from '@/hooks/useDocument';
import { useNonprofitLink } from '@/hooks/useNonprofitLink';
import type { NoteDetailsSaver } from '@/hooks/useNoteDetailsSaver';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { ARTICLE_TYPE_API_MAP } from '@/services/post.service';
import { ApiError } from '@/services/types';
import type { NoteWithContent } from '@/types/note';
import { getFieldErrorMessage } from '@/utils/form';
import { mergeRegisteredReportPrefill } from '@/utils/registeredReportPrefill';
import { DEFAULT_FUNDRAISE_END_DAYS, getWorkPath, mapOptionsToIds } from './formMapping';
import type { PublishingFormData } from './schema';

export const CHANGELOG_PUBLISH_ERROR_MESSAGE = 'Cannot publish changelog';
const REGISTERED_REPORT_MODERATOR_MESSAGE = 'Only moderators can publish Registered Reports.';
const PREPRINT_MESSAGE = 'Preprints can no longer be created in the notebook.';

const PUBLISH_LABEL: Record<string, string> = {
  preregistration: 'Proposal',
  grant: 'Request for Proposal',
  registered_report: 'Registered Report',
};

/** Which confirmation, if any, is waiting on the user before the work is published. */
export type PendingConfirmation = 'nonprofit' | 'publish' | null;

interface PublishActionOptions {
  readonly methods: UseFormReturn<PublishingFormData>;
  readonly note: NoteWithContent | null;
  readonly editor: Editor | null;
  readonly saveDetailsNow: NoteDetailsSaver['saveDetailsNow'];
  /** Runs once the work is published, right before the app leaves for its page. */
  readonly onPublished?: () => void;
  readonly readOnly: boolean;
  readonly isNewPreprint: boolean;
  readonly isChangelog: boolean;
  readonly canPublishChangelog: boolean;
  readonly canPublishRegisteredReport: boolean;
}

export interface PublishAction {
  /** Validates the form and, if it passes, asks the user to confirm. */
  readonly requestPublish: () => Promise<void>;
  readonly pendingConfirmation: PendingConfirmation;
  readonly dismissConfirmation: () => void;
  /** The nonprofit was confirmed; the publish confirmation comes next. */
  readonly acceptNonprofit: () => void;
  /** Publishes under the title the user confirmed. */
  readonly confirmPublish: (title: string) => Promise<void>;
  /** Any step of publishing is in flight. */
  readonly isPublishing: boolean;
  /** The image upload or the post itself is being written. */
  readonly isUpserting: boolean;
  readonly isLinkingNonprofit: boolean;
  readonly isRedirecting: boolean;
}

/**
 * The publish flow: validate, confirm (the nonprofit first when one is
 * selected), then write the work from the editor and the form and leave for
 * its page. Errors surface as toasts; the caller only renders the modals.
 */
export function usePublishAction({
  methods,
  note,
  editor,
  saveDetailsNow,
  onPublished,
  readOnly,
  isNewPreprint,
  isChangelog,
  canPublishChangelog,
  canPublishRegisteredReport,
}: PublishActionOptions): PublishAction {
  const router = useRouter();
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [{ loading: isUploadingImage }, uploadAsset] = useAssetUpload();
  const [{ isLoading: isLoadingUpsert }, upsertPost] = useUpsertPost();
  const { linkNonprofitToFundraise, isLoading: isLinkingNonprofit } = useNonprofitLink();

  const dismissConfirmation = useCallback(() => setPendingConfirmation(null), []);
  const acceptNonprofit = useCallback(() => setPendingConfirmation('publish'), []);

  const requestPublish = useCallback(async () => {
    if (readOnly) return;

    if (isNewPreprint) {
      toast.error(PREPRINT_MESSAGE);
      return;
    }

    if (!canPublishRegisteredReport) {
      toast.error(REGISTERED_REPORT_MODERATOR_MESSAGE);
      return;
    }

    const result = await methods.trigger();

    if (!result) {
      const errors = methods.formState.errors;

      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, error]) => {
          const errorMessage = getFieldErrorMessage(error, `Invalid ${field}`);
          if (errorMessage) {
            toast.error(errorMessage, {
              style: { width: '300px' },
            });
          }
        });
      } else {
        toast.error('Unable to publish. Please check all fields and try again.', {
          style: { width: '300px' },
        });
      }
      return;
    }

    const { articleType, selectedNonprofit } = methods.getValues();
    if (
      articleType !== 'preregistration' &&
      articleType !== 'discussion' &&
      articleType !== 'grant' &&
      articleType !== 'registered_report'
    ) {
      return;
    }

    setPendingConfirmation(selectedNonprofit ? 'nonprofit' : 'publish');
  }, [readOnly, isNewPreprint, canPublishRegisteredReport, methods]);

  const uploadCoverImage = useCallback(
    async (formData: PublishingFormData): Promise<string | null | false> => {
      const needsImage =
        formData.articleType === 'preregistration' ||
        formData.articleType === 'grant' ||
        formData.articleType === 'registered_report';
      if (!needsImage) return null;

      const file = formData.coverImage?.file;
      if (!file) return formData.coverImage?.key ?? null;

      try {
        const result = await uploadAsset(file, 'post');
        return result.objectKey;
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image. Please try again.');
        return false;
      }
    },
    [uploadAsset]
  );

  const tryLinkNonprofit = useCallback(
    async (
      formData: PublishingFormData,
      fundraiseId: string | number | undefined
    ): Promise<boolean> => {
      if (
        !formData.selectedNonprofit ||
        !fundraiseId ||
        formData.articleType !== 'preregistration'
      ) {
        return true;
      }

      try {
        await linkNonprofitToFundraise(
          {
            name: formData.selectedNonprofit.name,
            ein: formData.selectedNonprofit.ein,
            endaomentOrgId:
              formData.selectedNonprofit.endaomentOrgId || formData.selectedNonprofit.id,
            baseWalletAddress: formData.selectedNonprofit.baseWalletAddress,
          },
          fundraiseId,
          formData.departmentLabName || ''
        );
        return true;
      } catch (error: unknown) {
        console.error('Error linking nonprofit:', error);
        if (error instanceof Error && error.message.includes('Fundraise not found')) {
          toast.error('The fundraise was not found. Please try publishing again.');
          return false;
        }
        toast.error('Nonprofit organization was not linked successfully.');
        return true;
      }
    },
    [linkNonprofitToFundraise]
  );

  const confirmPublish = useCallback(
    async (editedTitle: string) => {
      if (readOnly || !note) return;

      if (isNewPreprint) {
        toast.error(PREPRINT_MESSAGE);
        return;
      }

      if (!canPublishChangelog) {
        toast.error(CHANGELOG_PUBLISH_ERROR_MESSAGE);
        return;
      }

      try {
        setDocumentTitle(editor, editedTitle);

        // Drain the queue now: publishing supersedes the draft, and the API
        // rejects Details on a published note.
        await saveDetailsNow();

        const text = editor?.getText();
        const json = editor?.getJSON() ?? { type: 'doc', content: [] };
        const html = editor?.getHTML();
        const formData = methods.getValues();

        if (formData.articleType === 'registered_report' && editedTitle.trim().length < 20) {
          toast.error('Registered Report titles must be at least 20 characters.');
          return;
        }

        if (formData.articleType === 'registered_report' && (text?.trim().length ?? 0) < 50) {
          toast.error('Registered Report content must be at least 50 characters.');
          return;
        }

        const imagePath = await uploadCoverImage(formData);
        if (imagePath === false) return;

        let budgetValue = '0';
        if (formData.articleType === 'preregistration' || formData.articleType === 'grant') {
          budgetValue = formData.budget || '0';
        }

        const isNewProposal = formData.articleType === 'preregistration' && !formData.workId;
        const grantId = isNewProposal ? (formData.selectedGrant?.id ?? null) : null;
        const proposalId = note.proposalId;

        if (formData.articleType === 'registered_report' && proposalId == null) {
          toast.error('This Registered Report draft is missing its proposal link.');
          return;
        }

        const fullJSON = JSON.stringify(
          formData.articleType === 'registered_report'
            ? mergeRegisteredReportPrefill(json, proposalId)
            : json
        );

        const response = await upsertPost(
          {
            budget: budgetValue,
            rewardFunders: formData.rewardFunders,
            nftSupply: formData.nftSupply || '1000',
            title: editedTitle,
            noteId: note.id.toString(),
            proposalId,
            renderableText: text || '',
            fullJSON,
            fullSrc: html || '',
            assignDOI: !formData.workId,
            authors: mapOptionsToIds(formData.authors),
            contacts: mapOptionsToIds(formData.contacts),
            articleType: ARTICLE_TYPE_API_MAP[formData.articleType] ?? 'DISCUSSION',
            image: imagePath,
            previewImg:
              formData.articleType === 'registered_report' && !formData.coverImage?.file
                ? (formData.coverImage?.url ?? note.previewImage ?? null)
                : undefined,
            editorType: formData.articleType === 'registered_report' ? 'CK_EDITOR' : undefined,
            organization: formData.organization,
            description: formData.shortDescription,
            applicationDeadline: (() => {
              if (formData.articleType === 'grant') return new Date('2029-12-31');
              if (isNewProposal) {
                const days = parseInt(formData.fundraiseEndDays ?? DEFAULT_FUNDRAISE_END_DAYS, 10);
                const date = new Date();
                date.setDate(date.getDate() + days);
                return date;
              }
              return formData.applicationDeadline;
            })(),
            grantId,
            applicationVisibility:
              formData.articleType === 'grant' ? formData.applicationVisibility : undefined,
            isPublic: isNewProposal ? formData.isPublic : undefined,
          },
          formData.workId
        );

        const fundraiseId = response.fundraiseId || note.post?.fundraise?.id || undefined;
        const linked = await tryLinkNonprofit(formData, fundraiseId);
        if (!linked) {
          setIsRedirecting(false);
          return;
        }

        setIsRedirecting(true);
        const publishLabel = isChangelog
          ? 'ChangeLog'
          : (PUBLISH_LABEL[formData.articleType] ?? 'Post');
        const isNewGrant = formData.articleType === 'grant' && !formData.workId;
        const isNewGrantPending = isNewGrant && response.note?.post?.grant?.status !== 'OPEN';

        if (isNewGrantPending) {
          toast.success(
            'Your Request for Proposal has been submitted and is pending moderator review.',
            {
              duration: 5000,
            }
          );
        } else if (!isNewGrant && response.moderationStatus === 'PENDING') {
          toast.success(
            `Your ${publishLabel} has been submitted and is pending moderator review.`,
            {
              duration: 5000,
            }
          );
        } else {
          toast.success(`${publishLabel} published successfully!`);
        }
        onPublished?.();
        router.push(getWorkPath(formData.articleType, String(response.id), response.slug));
      } catch (error: unknown) {
        const fallback = 'Error publishing. Please try again.';
        if (
          error instanceof ApiError &&
          methods.getValues('articleType') === 'registered_report' &&
          (error.status === 401 || error.status === 403)
        ) {
          toast.error(REGISTERED_REPORT_MODERATOR_MESSAGE);
        } else if (error instanceof ApiError) {
          const errorData = error.errors as Record<string, any> | undefined;
          toast.error(
            errorData?.msg || errorData?.message || extractApiErrorMessage(error, fallback)
          );
        } else {
          toast.error(fallback);
        }
        console.error('Error publishing:', error);
      } finally {
        setPendingConfirmation(null);
      }
    },
    [
      readOnly,
      note,
      isNewPreprint,
      canPublishChangelog,
      editor,
      saveDetailsNow,
      onPublished,
      methods,
      uploadCoverImage,
      upsertPost,
      tryLinkNonprofit,
      isChangelog,
      router,
    ]
  );

  const isUpserting = isLoadingUpsert || isUploadingImage;

  return {
    requestPublish,
    pendingConfirmation,
    dismissConfirmation,
    acceptNonprofit,
    confirmPublish,
    isPublishing: isUpserting || isRedirecting || isLinkingNonprofit,
    isUpserting,
    isLinkingNonprofit,
    isRedirecting,
  };
}
