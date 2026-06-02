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
  const proposalSource = searchParams.get('proposalSource');

  const [showProposalUpload, setShowProposalUpload] = useState(false);
  const [proposalUploadError, setProposalUploadError] = useState<string | null>(null);
  const proposalFileInputRef = useRef<HTMLInputElement | null>(null);

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
    } else if (isNewFunding) {
      if (proposalSource === 'upload') {
        // Defer note creation until the user picks a document to import.
        setShowProposalUpload(true);
      } else if (proposalSource === 'blank') {
        createNoteWithContent(selectedOrg.slug, {
          template: BLANK_DOCUMENT,
          documentType: 'PREREGISTRATION',
        });
      } else {
        // Default: start from the proposal template.
        handleStartFromTemplate();
      }
    } else if (isNewGrant) {
      // The "upload a document" path is handled inline in
      // OpenFundingOpportunityModal, so here we only create from template/blank.
      createNoteWithContent(selectedOrg.slug, {
        template: grantSource === 'blank' ? BLANK_DOCUMENT : grantTemplate,
        queryParam: 'newGrant',
        queryValue: 'true',
        documentType: 'GRANT',
      });
    }
  }, [selectedOrg, isNewResearch, isNewFunding, isNewGrant, grantSource, proposalSource]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const openProposalFilePicker = () => {
    setProposalUploadError(null);
    proposalFileInputRef.current?.click();
  };

  const handleProposalFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] ?? null;
    event.target.value = ''; // allow re-selecting the same file
    if (!picked) return;

    if (!detectImportFormat(picked)) {
      setProposalUploadError('Only .docx, .odt, and .md files are supported.');
      return;
    }
    if (picked.size > MAX_UPLOAD_SIZE) {
      setProposalUploadError('That file is larger than 25 MB. Try a smaller document.');
      return;
    }

    setProposalUploadError(null);
    void handleUploadFile(picked, 'PREREGISTRATION');
  };

  const handleProposalUploadClose = () => {
    if (isImporting) return;
    setShowProposalUpload(false);
    stripQueryParam('newFunding');
    stripQueryParam('proposalSource');
  };

  if (isLoadingOrg) {
    return <NotePaperSkeleton />;
  }

  return (
    <>
      <NoteCreationPopover isOpen={isCreatingNote || isUpdatingContent} />

      <BaseModal
        isOpen={showProposalUpload}
        onClose={handleProposalUploadClose}
        title="Upload your proposal"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Import a Word, OpenDocument, or Markdown file to start your proposal.
          </p>
          <button
            type="button"
            onClick={openProposalFilePicker}
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
          {proposalUploadError && (
            <p className="text-xs text-red-600" role="alert">
              {proposalUploadError}
            </p>
          )}
          <input
            ref={proposalFileInputRef}
            type="file"
            accept={UPLOAD_ACCEPT_ATTR}
            onChange={handleProposalFileChange}
            className="hidden"
          />
        </div>
      </BaseModal>
    </>
  );
}
