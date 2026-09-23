'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Editor } from '@tiptap/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getDocumentTitleFromEditor,
  setDocumentTitle,
} from '@/components/Editor/lib/utils/documentTitle';
import { ConfirmPublishModal } from '@/components/modals/ConfirmPublishModal';
import { NonprofitConfirmModal } from '@/components/Nonprofit';
import { usePublishingHost } from '@/contexts/PublishingHostContext';
import { useUser } from '@/contexts/UserContext';
import { isChangelogNote, isRegisteredReportNote, type NoteWithContent } from '@/types/note';
import {
  applyGrantDefaults,
  autoAddCurrentUser,
  buildNoteDetailsUpdate,
  FORM_DEFAULTS,
  mapDocumentTypeToArticleType,
  populateFormFromNoteDetails,
  populateFromPost,
  populateRegisteredReportPrefill,
  resolveArticleType,
  saveSelectedNonprofit,
} from './formMapping';
import { publishingFormSchema, type ArticleType, type PublishingFormData } from './schema';
import {
  CHANGELOG_PUBLISH_ERROR_MESSAGE,
  usePublishAction,
  type PublishAction,
} from './usePublishAction';

export interface PublishingController extends PublishAction {
  readonly note: NoteWithContent | null;
  readonly editor: Editor | null;
  /** The form can be read but not changed or published. */
  readonly readOnly: boolean;
  readonly articleType: ArticleType | undefined;
  /** Set once the note has been published, and on the work it became. */
  readonly workId: string | undefined;
  readonly isPublished: boolean;
  readonly isChangelog: boolean;
  /** A declined Request for Proposal: shown, but no longer editable. */
  readonly isDeclined: boolean;
  /** Publishing is allowed right now; the footer button follows this. */
  readonly canPublish: boolean;
  /** Why publishing is refused, when the reason is worth showing next to the button. */
  readonly blockedMessage: string | null;
}

const PublishingControllerContext = createContext<PublishingController | null>(null);

interface PublishingFormProviderProps {
  readonly readOnly?: boolean;
  readonly children: ReactNode;
}

/**
 * Owns the publishing form for the note the host provides: its values, how
 * they load from the note and save back to it, and the publish flow. Anything
 * that reads or drives the form — the form body, a publish button placed
 * elsewhere, a single section shown on its own — renders inside it and asks
 * `usePublishingController()`.
 */
export function PublishingFormProvider({
  readOnly = false,
  children,
}: PublishingFormProviderProps) {
  const { note, editor, saveDetailsSoon, saveDetailsNow, onPublished } = usePublishingHost();
  const { user: currentUser } = useUser();
  const searchParams = useSearchParams();

  const methods = useForm<PublishingFormData>({
    defaultValues: FORM_DEFAULTS,
    resolver: zodResolver(publishingFormSchema),
    mode: 'onChange',
  });

  const noteId = note?.id;
  const isPublished = Boolean(note?.post);

  useEffect(() => {
    if (!note) return;

    methods.reset(FORM_DEFAULTS);
    const isRegisteredReport = isRegisteredReportNote(note);

    if (note.post) {
      populateFromPost(note.post, methods.setValue);
    } else {
      populateFormFromNoteDetails(note, methods.setValue);

      if (isRegisteredReport) {
        populateRegisteredReportPrefill(note, methods.getValues, methods.setValue);
      }

      const articleType =
        (note.documentType ? mapDocumentTypeToArticleType(note.documentType) : null) ??
        resolveArticleType(searchParams) ??
        null;

      if (articleType) {
        methods.setValue('articleType', articleType);
      }
    }

    if (isRegisteredReport) {
      methods.setValue('articleType', 'registered_report');
    }

    applyGrantDefaults(methods.getValues, methods.setValue);

    // Hydration runs with the watcher detached, so a default the form generates
    // has to be saved here or the draft would never record who is on it.
    const defaultedField = autoAddCurrentUser(methods.getValues, methods.setValue, currentUser);
    const defaults = defaultedField && buildNoteDetailsUpdate(defaultedField, methods.getValues());
    if (defaults && !isPublished) saveDetailsSoon(defaults);

    // A proposal answering a private Request for Proposal cannot be public.
    if (methods.getValues('selectedGrant')?.applicationVisibility === 'PRIVATE') {
      methods.setValue('isPublic', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  // Declared after the effect above so React unsubscribes before it hydrates,
  // which is what keeps loading a note from saving it straight back.
  useEffect(() => {
    if (!noteId || isPublished) return;

    const subscription = methods.watch((_values, { name }) => {
      if (!name) return;

      const values = methods.getValues();
      if (name === 'selectedNonprofit') {
        void saveSelectedNonprofit(values.selectedNonprofit, saveDetailsSoon, methods.getValues);
        return;
      }

      const update = buildNoteDetailsUpdate(name, values);
      if (update) saveDetailsSoon(update);
    });

    return () => subscription.unsubscribe();
  }, [noteId, isPublished, methods, saveDetailsSoon]);

  const { watch, clearErrors } = methods;
  const articleType = watch('articleType');
  const workId = watch('workId');
  const selectedNonprofit = watch('selectedNonprofit');
  const isPublicValue = watch('isPublic');
  const selectedGrantValue = watch('selectedGrant');

  useEffect(() => {
    clearErrors();
  }, [articleType, clearErrors]);

  const isDeclined = note?.post?.grant?.status === 'DECLINED';
  const isModerator = !!currentUser?.isModerator;
  const isChangelog = isChangelogNote(note);
  const isNewPreprint = articleType === 'discussion' && !workId && !isChangelog;
  const canPublishChangelog = !isChangelog || isModerator;
  const canPublishRegisteredReport = articleType !== 'registered_report' || isModerator;
  const isLockedPrivate = selectedGrantValue?.applicationVisibility === 'PRIVATE';
  const showPrivateWarning = !isLockedPrivate && isPublicValue === false && !selectedGrantValue;

  const action = usePublishAction({
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
  });

  const canPublish =
    Boolean(articleType) &&
    !readOnly &&
    !isNewPreprint &&
    canPublishChangelog &&
    !action.isPublishing &&
    !isDeclined &&
    !showPrivateWarning &&
    canPublishRegisteredReport &&
    // Publishing reads the document from the editor; without one it would
    // publish an empty work.
    editor != null;

  const blockedMessage = !canPublishRegisteredReport
    ? 'Only moderators can publish Registered Reports.'
    : !canPublishChangelog
      ? CHANGELOG_PUBLISH_ERROR_MESSAGE
      : null;

  const controller: PublishingController = {
    ...action,
    note,
    editor,
    readOnly,
    articleType,
    workId,
    isPublished,
    isChangelog,
    isDeclined,
    canPublish,
    blockedMessage,
  };

  return (
    <PublishingControllerContext.Provider value={controller}>
      <FormProvider {...methods}>
        {children}

        {action.pendingConfirmation === 'nonprofit' && selectedNonprofit && (
          <NonprofitConfirmModal
            isOpen
            onClose={action.dismissConfirmation}
            onConfirm={action.acceptNonprofit}
            nonprofitName={selectedNonprofit.name}
            ein={selectedNonprofit.ein}
          />
        )}

        {action.pendingConfirmation === 'publish' && (
          <ConfirmPublishModal
            isOpen
            onClose={action.dismissConfirmation}
            onConfirm={action.confirmPublish}
            title={
              getDocumentTitleFromEditor(editor) ||
              (isChangelog ? 'Untitled ChangeLog' : 'Untitled Research')
            }
            isPublishing={action.isPublishing}
            isUpdate={Boolean(workId)}
            onTitleChange={(title) => setDocumentTitle(editor, title)}
            variant={articleType === 'grant' ? 'rfp' : 'default'}
            documentLabel={isChangelog ? 'ChangeLog entry' : undefined}
          />
        )}
      </FormProvider>
    </PublishingControllerContext.Provider>
  );
}

export function usePublishingController(): PublishingController {
  const controller = useContext(PublishingControllerContext);
  if (!controller) {
    throw new Error('usePublishingController must be used within a PublishingFormProvider');
  }
  return controller;
}
