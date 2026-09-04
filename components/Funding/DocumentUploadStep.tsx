'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useCreateNote, useNoteContent } from '@/hooks/useNote';
import { detectImportFormat, importDocumentToTiptap } from '@/components/Editor/lib/convert';
import { cn } from '@/utils/styles';

// Accepted import formats for the document upload flow.
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

interface DocumentUploadStepProps {
  /** Heading shown above the dropzone. */
  title: string;
  /** Supporting copy shown under the heading. */
  description: string;
  /** Note document type to create, e.g. 'GRANT' or 'PREREGISTRATION'. */
  documentType: string;
  /** Invoked when the user wants to return to the previous step. */
  onBack: () => void;
  /** Invoked once a note is created (used to close the host modal). */
  onClose: () => void;
}

/**
 * In-modal "upload a document" step shared by the funding-opportunity and
 * proposal modals. Imports a Word/OpenDocument/Markdown file, creates a note
 * from it, and navigates to the new note in the notebook.
 */
export const DocumentUploadStep = ({
  title,
  description,
  documentType,
  onBack,
  onClose,
}: DocumentUploadStepProps) => {
  const router = useRouter();
  const { selectedOrg } = useOrganizationContext();
  const [, createNote] = useCreateNote();
  const [, updateNoteContent] = useNoteContent();
  const [isImporting, setIsImporting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const importDocument = async (file: File) => {
    if (!selectedOrg || isImporting) return;
    setIsImporting(true);
    try {
      const result = await importDocumentToTiptap(file);
      const newNote = await createNote({
        organizationSlug: selectedOrg.slug,
        title: result.title,
        grouping: 'WORKSPACE',
        documentType,
      });
      await updateNoteContent({
        note: newNote.id,
        fullSrc: result.html,
        fullJson: JSON.stringify(result.json),
        plainText: result.plainText,
      });
      onClose();
      router.push(`/notebook/${selectedOrg.slug}/${newNote.id}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to import document. Please try a different file.';
      toast.error(message, { style: { width: '320px' } });
      setIsImporting(false);
    }
  };

  const validateAndImport = (file: File | null) => {
    if (!file) return;
    if (!detectImportFormat(file)) {
      setUploadError('Only .docx, .odt, and .md files are supported.');
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      setUploadError('That file is larger than 25 MB. Try a smaller document.');
      return;
    }
    setUploadError(null);
    void importDocument(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] ?? null;
    event.target.value = ''; // allow re-selecting the same file
    validateAndImport(picked);
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isImporting) return;
    validateAndImport(event.dataTransfer.files?.[0] ?? null);
  };

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        disabled={isImporting}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mt-5">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm leading-[1.5] text-gray-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => {
          setUploadError(null);
          fileInputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isImporting) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        disabled={isImporting || !selectedOrg}
        className={cn(
          'mt-5 flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-12 text-center transition-colors',
          isDragging
            ? 'border-rhBlue-400 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-rhBlue-300 hover:bg-blue-50/50',
          (isImporting || !selectedOrg) && 'cursor-not-allowed opacity-60'
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white">
          {isImporting ? (
            <Loader2 className="h-6 w-6 animate-spin text-rhBlue-600" />
          ) : (
            <Upload className="h-6 w-6 text-rhBlue-600" />
          )}
        </div>
        <div className="text-sm font-semibold text-gray-900">
          {isImporting ? 'Importing your document\u2026' : 'Click to upload or drag and drop'}
        </div>
        <div className="text-xs text-gray-500">Word, OpenDocument, or Markdown · max 25 MB</div>
      </button>

      {uploadError && (
        <p className="mt-3 text-xs text-red-600" role="alert">
          {uploadError}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={UPLOAD_ACCEPT_ATTR}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};
