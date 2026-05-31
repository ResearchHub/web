'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { ArrowLeft, File, FileText, Loader2, Upload, X as XIcon } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import Icon from '@/components/ui/icons/Icon';
import { cn } from '@/utils/styles';
import { detectImportFormat } from '@/components/Editor/lib/convert';

export type NoteCreationSource = 'template' | 'upload' | 'blank';

export type NoteCreationType = 'preregistration' | 'grant' | 'research' | 'other';

interface SourceOption {
  id: NoteCreationSource;
  title: string;
  description: string;
  icon: ReactNode;
}

interface TypeOption {
  id: NoteCreationType;
  title: string;
  description: string;
  icon: ReactNode;
}

const SOURCE_OPTIONS: SourceOption[] = [
  {
    id: 'template',
    title: 'From a template',
    description: 'Pick a template to start with (proposal, preprint, ...)',
    icon: <FileText className="h-6 w-6 text-blue-600" />,
  },
  {
    id: 'upload',
    title: 'Upload a document',
    description: 'Import a Word, Markdown, or OpenDocument',
    icon: <Upload className="h-6 w-6 text-blue-600" />,
  },
  {
    id: 'blank',
    title: 'Start blank',
    description: 'Begin with an empty page',
    icon: <File className="h-6 w-6 text-blue-600" />,
  },
];

// Type options when the user is in the template flow. "Other" is intentionally
// omitted because there's no generic scaffold; pick a type or go back.
const TYPE_OPTIONS_FOR_TEMPLATE: TypeOption[] = [
  {
    id: 'preregistration',
    title: 'Proposal',
    description: 'Crowdfund your research',
    icon: <FundingIcon size={24} color="#2563eb" />,
  },
  {
    id: 'grant',
    title: 'Funding Opportunity',
    description: 'Fund specific research you care about',
    icon: <Icon name="fund" size={24} color="#2563eb" />,
  },
  {
    id: 'research',
    title: 'Preprint',
    description: 'Publish your research as a preprint',
    icon: <Icon name="submit1" size={24} color="#2563eb" />,
  },
];

// Type options for the upload flow include "Other" so an arbitrary import
// still has a home when it doesn't fit a typed publishing workflow.
const TYPE_OPTIONS_FOR_UPLOAD: TypeOption[] = [
  ...TYPE_OPTIONS_FOR_TEMPLATE,
  {
    id: 'other',
    title: 'Other',
    description: 'General document with no specific publishing type',
    icon: <File className="h-6 w-6 text-blue-600" />,
  },
];

/** Maximum upload size in bytes (25 MB). Mirrors the server-side cap in convert.ts. */
const MAX_FILE_SIZE = 25 * 1024 * 1024;

// File-picker accept hint. Both MIME and extension are listed because OSes
// inconsistently report MIME for these formats (especially .md, which often
// arrives as `text/plain` or with no MIME at all).
const ACCEPT_ATTR = [
  '.docx',
  '.odt',
  '.md',
  '.markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'text/markdown',
].join(',');

interface NoteCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFromTemplate: (type: 'preregistration' | 'grant' | 'research') => Promise<void> | void;
  onCreateBlank: () => Promise<void> | void;
  onCreateFromUpload: (params: { file: File; type: NoteCreationType }) => Promise<void> | void;
  /** External processing flag from the parent (e.g. createNote pending). */
  isProcessing?: boolean;
}

// Wizard step the modal is showing. The upload flow has its own sub-step
// (file picker first, then type tiles) because we don't want to ask users
// "what type?" until we know they actually have a file to import.
type Step =
  | { kind: 'source' }
  | { kind: 'template-type' }
  | { kind: 'upload-file' }
  | { kind: 'upload-type'; file: File };

export const NoteCreationModal = ({
  isOpen,
  onClose,
  onCreateFromTemplate,
  onCreateBlank,
  onCreateFromUpload,
  isProcessing = false,
}: NoteCreationModalProps) => {
  const [step, setStep] = useState<Step>({ kind: 'source' });
  const [type, setType] = useState<NoteCreationType | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep({ kind: 'source' });
      setType(null);
      setFileError(null);
    }
  }, [isOpen]);

  const handleSourceSelect = (next: NoteCreationSource) => {
    setType(null);
    setFileError(null);

    if (next === 'blank') {
      // No second step for blank — fire-and-forget; the parent owns the
      // loading state and closes the modal when the create flow resolves.
      void onCreateBlank();
      return;
    }

    if (next === 'template') {
      setStep({ kind: 'template-type' });
      return;
    }

    setStep({ kind: 'upload-file' });
  };

  const handleBack = () => {
    if (step.kind === 'upload-type') {
      // Going back from type selection should land on the file picker, not
      // the source list — the user explicitly chose "upload" and shouldn't
      // be forced to re-select that.
      setStep({ kind: 'upload-file' });
      setType(null);
      return;
    }
    setStep({ kind: 'source' });
    setType(null);
    setFileError(null);
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] ?? null;
    event.target.value = ''; // allow re-selecting the same file
    if (!picked) return;

    if (!detectImportFormat(picked)) {
      setFileError('Only .docx, .odt, and .md files are supported.');
      return;
    }

    if (picked.size > MAX_FILE_SIZE) {
      setFileError('That file is larger than 25 MB. Try a smaller document.');
      return;
    }

    setFileError(null);
    setStep({ kind: 'upload-type', file: picked });
  };

  const handleChangeFile = () => {
    setStep({ kind: 'upload-file' });
    setType(null);
  };

  const handleCreate = async () => {
    if (step.kind === 'template-type') {
      if (!type || type === 'other') return;
      await onCreateFromTemplate(type);
      return;
    }

    if (step.kind === 'upload-type') {
      if (!type) return;
      await onCreateFromUpload({ file: step.file, type });
    }
  };

  const canSubmit =
    !isProcessing &&
    ((step.kind === 'template-type' && type !== null && type !== 'other') ||
      (step.kind === 'upload-type' && type !== null));

  const showBackArrow = step.kind !== 'source';

  const titleNode = (
    <div className="flex items-center gap-2">
      {showBackArrow && (
        <Button
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="-ml-2 text-gray-500"
          aria-label="Back"
          disabled={isProcessing}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <span>Create note</span>
    </div>
  );

  const showFooter = step.kind === 'template-type' || step.kind === 'upload-type';

  const footerNode = showFooter ? (
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs text-gray-500 truncate min-w-0">
        {step.kind === 'template-type' && !type && <>Pick a document type to continue.</>}
        {step.kind === 'upload-type' && !type && <>Pick a document type for the import.</>}
        {step.kind === 'upload-type' && type && isProcessing && (
          <>Converting your document — this can take a few seconds...</>
        )}
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="outlined" onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={!canSubmit}>
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {step.kind === 'upload-type' ? 'Importing' : 'Creating'}
            </>
          ) : step.kind === 'upload-type' ? (
            'Import & create'
          ) : (
            'Create note'
          )}
        </Button>
      </div>
    </div>
  ) : undefined;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={titleNode}
      size="md"
      footer={footerNode}
      padding="p-4"
    >
      {step.kind === 'source' && (
        <div className="space-y-2">
          <p className="px-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            How do you want to start?
          </p>
          <div className="space-y-2">
            {SOURCE_OPTIONS.map((option) => (
              <OptionTile
                key={option.id}
                title={option.title}
                description={option.description}
                icon={option.icon}
                disabled={isProcessing}
                isLoading={isProcessing && option.id === 'blank'}
                onClick={() => handleSourceSelect(option.id)}
              />
            ))}
          </div>
        </div>
      )}

      {step.kind === 'template-type' && (
        <div className="space-y-2">
          <p className="px-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            Which template do you want to use?
          </p>
          <div className="space-y-2">
            {TYPE_OPTIONS_FOR_TEMPLATE.map((option) => (
              <OptionTile
                key={option.id}
                title={option.title}
                description={option.description}
                icon={option.icon}
                selected={type === option.id}
                disabled={isProcessing}
                onClick={() => setType(option.id)}
              />
            ))}
          </div>
        </div>
      )}

      {step.kind === 'upload-file' && (
        <div className="space-y-3">
          <p className="px-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            Choose a document
          </p>
          <button
            type="button"
            onClick={openFilePicker}
            className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-200">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">Click to upload a document</div>
            <div className="text-xs text-gray-500">Word, OpenDocument, or Markdown · max 25 MB</div>
          </button>
          {fileError && (
            <p className="px-2 text-xs text-red-600" role="alert">
              {fileError}
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {step.kind === 'upload-type' && (
        <div className="space-y-3">
          <div className="px-2">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
              Selected file
            </p>
            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-gray-200">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{step.file.name}</div>
                <div className="text-xs text-gray-500">{(step.file.size / 1024).toFixed(0)} KB</div>
              </div>
              <Button
                onClick={handleChangeFile}
                variant="ghost"
                size="icon"
                disabled={isProcessing}
                aria-label="Choose a different file"
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="px-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              What type of document is this?
            </p>
            <div className="space-y-2">
              {TYPE_OPTIONS_FOR_UPLOAD.map((option) => (
                <OptionTile
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  selected={type === option.id}
                  disabled={isProcessing}
                  onClick={() => setType(option.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
};

interface OptionTileProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

const OptionTile = ({
  title,
  description,
  icon,
  onClick,
  selected = false,
  disabled = false,
  isLoading = false,
}: OptionTileProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'w-full flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors',
      selected
        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
        : 'border-gray-200 bg-white hover:bg-gray-50',
      disabled && 'cursor-not-allowed opacity-60'
    )}
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> : icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-md font-medium tracking-[0.02em] text-gray-900">{title}</div>
      <div className="text-xs text-gray-600 mt-0.5">{description}</div>
    </div>
  </button>
);
