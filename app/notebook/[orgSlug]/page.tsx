'use client';

import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';
import proposalTemplate from '@/components/Editor/lib/data/proposalTemplate';
import { getInitialContent, initialContent } from '@/components/Editor/lib/data/initialContent';
import grantTemplate from '@/components/Editor/lib/data/grantTemplate';
import {
  getDocumentTitle,
  getTemplatePlainText,
} from '@/components/Editor/lib/utils/documentTitle';
import { useCreateNote, useNoteContent } from '@/hooks/useNote';
import { NoteCreationPopover } from '@/components/Notebook/NoteCreationPopover';
import { NotePaperSkeleton } from '@/components/Notebook/NotePaperSkeleton';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';
import { BaseModal } from '@/components/ui/BaseModal';
import { detectImportFormat, importDocumentToTiptap } from '@/components/Editor/lib/convert';

// An empty document for the "Start blank" funding-opportunity path.
const BLANK_DOCUMENT = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
} as typeof grantTemplate;

// Accepted import formats for the grant upload flow. Mirrors NoteCreationModal.
const UPLOAD_ACCEPT_ATTR = [
  '.docx',
  '.odt',
  '.md',
  '.markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'text/markdown',
].join(',');

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;

export default function OrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const { refreshNotes } = useNotebookContext();

  const [{ isLoading: isCreatingNote }, createNote] = useCreateNote();
  const [{ isLoading: isUpdatingContent }, updateNoteContent] = useNoteContent();
  const [isImporting, setIsImporting] = useState(false);

  const isNewFunding = searchParams.get('newFunding') === 'true';
  const isNewResearch = searchParams.get('newResearch') === 'true';
  const isNewGrant = searchParams.get('newGrant') === 'true';
  const grantSource = searchParams.get('grantSource');

  const [showFundingModal, setShowFundingModal] = useState(false);
  const [showGrantUpload, setShowGrantUpload] = useState(false);
  const [grantUploadError, setGrantUploadError] = useState<string | null>(null);
  const grantFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isNewFunding) setShowFundingModal(true);
  }, [isNewFunding]);

  const stripQueryParam = (key: string) => {
    const url = new URL(globalThis.window.location.href);
    url.searchParams.delete(key);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const createNoteWithContent = async (
    orgSlug: string,
    {
      template,
      queryParam,
      queryValue,
      documentType,
    }: {
      template: typeof proposalTemplate | typeof initialContent | typeof grantTemplate;
      queryParam?: string;
      queryValue?: string;
      documentType?: string;
    }
  ) => {
    try {
      const title = getDocumentTitle(template) || 'Untitled';
      const newNote = await createNote({
        organizationSlug: orgSlug,
        title,
        grouping: 'WORKSPACE',
        documentType,
      });

      if (newNote) {
        await updateNoteContent({
          note: newNote.id,
          fullJson: JSON.stringify(template),
          plainText: getTemplatePlainText(template),
        });

        const queryString = queryParam && queryValue ? `?${queryParam}=${queryValue}` : '';
        refreshNotes();
        router.replace(`/notebook/${orgSlug}/${newNote.id}${queryString}`);
      }
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  useEffect(() => {
    if (!selectedOrg) return;

    if (isNewResearch) {
      createNoteWithContent(selectedOrg.slug, {
        template: getInitialContent('research'),
        queryParam: 'newResearch',
        queryValue: 'true',
        documentType: 'DISCUSSION',
      });
    } else if (isNewGrant) {
      if (grantSource === 'upload') {
        // Defer note creation until the user picks a document to import.
        setShowGrantUpload(true);
      } else {
        createNoteWithContent(selectedOrg.slug, {
          template: grantSource === 'blank' ? BLANK_DOCUMENT : grantTemplate,
          queryParam: 'newGrant',
          queryValue: 'true',
          documentType: 'GRANT',
        });
      }
    }
  }, [selectedOrg, isNewResearch, isNewGrant, grantSource]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartFromTemplate = async () => {
    if (!selectedOrg) return;
    await createNoteWithContent(selectedOrg.slug, {
      template: proposalTemplate,
      queryParam: 'template',
      queryValue: 'preregistration',
      documentType: 'PREREGISTRATION',
    });
  };

  const handleUploadFile = async (file: File, documentType: string = 'PREREGISTRATION') => {
    if (!selectedOrg) return;
    setIsImporting(true);
    try {
      const result = await importDocumentToTiptap(file);
      const newNote = await createNote({
        organizationSlug: selectedOrg.slug,
        title: result.title,
        grouping: 'WORKSPACE',
        documentType,
      });

      if (newNote) {
        await updateNoteContent({
          note: newNote.id,
          fullSrc: result.html,
          fullJson: JSON.stringify(result.json),
          plainText: result.plainText,
        });
        refreshNotes();
        router.replace(`/notebook/${selectedOrg.slug}/${newNote.id}`);
      }
    } catch (error) {
      console.error('Failed to import proposal document:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to import document. Please try a different file.';
      toast.error(message, { style: { width: '320px' } });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFundingModalClose = () => {
    setShowFundingModal(false);
    stripQueryParam('newFunding');
  };

  const openGrantFilePicker = () => {
    setGrantUploadError(null);
    grantFileInputRef.current?.click();
  };

  const handleGrantFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] ?? null;
    event.target.value = ''; // allow re-selecting the same file
    if (!picked) return;

    if (!detectImportFormat(picked)) {
      setGrantUploadError('Only .docx, .odt, and .md files are supported.');
      return;
    }
    if (picked.size > MAX_UPLOAD_SIZE) {
      setGrantUploadError('That file is larger than 25 MB. Try a smaller document.');
      return;
    }

    setGrantUploadError(null);
    void handleUploadFile(picked, 'GRANT');
  };

  const handleGrantUploadClose = () => {
    if (isImporting) return;
    setShowGrantUpload(false);
    stripQueryParam('newGrant');
  };

  if (isLoadingOrg) {
    return <NotePaperSkeleton />;
  }

  const isProposalProcessing = isCreatingNote || isUpdatingContent || isImporting;

  return (
    <>
      <NoteCreationPopover isOpen={isCreatingNote || isUpdatingContent} />
      <FundingTimelineModal
        isOpen={showFundingModal}
        onClose={handleFundingModalClose}
        onStartFromTemplate={handleStartFromTemplate}
        onUploadFile={handleUploadFile}
        isProcessing={isProposalProcessing}
      />

      <BaseModal
        isOpen={showGrantUpload}
        onClose={handleGrantUploadClose}
        title="Upload your funding opportunity"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Import a Word, OpenDocument, or Markdown file to start your funding opportunity.
          </p>
          <button
            type="button"
            onClick={openGrantFilePicker}
            disabled={isImporting}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">
              {isImporting ? 'Importing your document...' : 'Click to upload a document'}
            </div>
            <div className="text-xs text-gray-500">Word, OpenDocument, or Markdown · max 25 MB</div>
          </button>
          {grantUploadError && (
            <p className="text-xs text-red-600" role="alert">
              {grantUploadError}
            </p>
          )}
          <input
            ref={grantFileInputRef}
            type="file"
            accept={UPLOAD_ACCEPT_ATTR}
            onChange={handleGrantFileChange}
            className="hidden"
          />
        </div>
      </BaseModal>
    </>
  );
}
