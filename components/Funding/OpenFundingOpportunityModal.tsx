'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  File,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button, buttonVariants } from '@/components/ui/Button';
import Icon from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import AnimatedGlobe from '@/components/Globe/AnimatedGlobe';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useCreateNote, useNoteContent } from '@/hooks/useNote';
import { detectImportFormat, importDocumentToTiptap } from '@/components/Editor/lib/convert';
import { cn } from '@/utils/styles';

export type FundingOpportunityCreationMethod = 'template' | 'upload' | 'blank';

interface OpenFundingOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: FundingOpportunityCreationMethod) => void;
}

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  learnMoreHref?: string;
}

const BENEFITS: Benefit[] = [
  {
    id: 'scientists',
    title: 'The best scientists within reach',
    description:
      'We source the best scientists in the world to apply for your funding opportunity.',
    icon: <Award className="h-[22px] w-[22px] text-rhBlue-600" />,
    learnMoreHref: '/give',
  },
  {
    id: 'turnaround',
    title: 'Fastest turnaround',
    description: 'Quality proposals and peer-reviews delivered in days, not months.',
    icon: <Icon name="lightening" size={22} color="#2563eb" />,
  },
  {
    id: 'community',
    title: 'Community matching',
    description: 'With our community, every dollar you put in is stretched further.',
    icon: <Users className="h-[22px] w-[22px] text-rhBlue-600" />,
  },
  {
    id: 'credits',
    title: 'Use your Funding Credits',
    description: 'Earned by holding ResearchCoin or peer reviewing.',
    icon: <ResearchCoinIcon size={22} color="#2563eb" outlined />,
    learnMoreHref: '/endowments',
  },
];

interface CreationOption {
  id: FundingOpportunityCreationMethod;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const CREATION_OPTIONS: CreationOption[] = [
  {
    id: 'template',
    title: 'From a template',
    description: 'Start with our funding opportunity template',
    icon: <FileText className="h-[22px] w-[22px] text-rhBlue-600" />,
  },
  {
    id: 'upload',
    title: 'Upload a document',
    description: 'Import a Word, Markdown, or OpenDocument file',
    icon: <Upload className="h-[22px] w-[22px] text-rhBlue-600" />,
  },
  {
    id: 'blank',
    title: 'Start blank',
    description: 'Begin with an empty page',
    icon: <File className="h-[22px] w-[22px] text-rhBlue-600" />,
  },
];

const WHITE_GLOVE_BOOKING_URL = 'https://cal.com/tyler-diorio/15min';

// Accepted import formats for the funding-opportunity upload flow.
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

type Step = 'benefits' | 'method' | 'upload';

export const OpenFundingOpportunityModal = ({
  isOpen,
  onClose,
  onConfirm,
}: OpenFundingOpportunityModalProps) => {
  const [step, setStep] = useState<Step>('benefits');

  const router = useRouter();
  const { selectedOrg } = useOrganizationContext();
  const [, createNote] = useCreateNote();
  const [, updateNoteContent] = useNoteContent();
  const [isImporting, setIsImporting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset to the first step whenever the modal is reopened so a returning user
  // always starts from the benefits pitch rather than a stale step.
  useEffect(() => {
    if (!isOpen) {
      setStep('benefits');
      setUploadError(null);
      setIsImporting(false);
      setIsDragging(false);
    }
  }, [isOpen]);

  const importFundingDocument = async (file: File) => {
    if (!selectedOrg || isImporting) return;
    setIsImporting(true);
    try {
      const result = await importDocumentToTiptap(file);
      const newNote = await createNote({
        organizationSlug: selectedOrg.slug,
        title: result.title,
        grouping: 'WORKSPACE',
        documentType: 'GRANT',
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
    void importFundingDocument(file);
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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      padding="p-0"
      className="md:!w-auto md:!h-auto md:!max-h-[88vh] md:!max-w-[860px] md:!rounded-2xl"
    >
      <div className="flex h-full flex-col md:flex-row">
        {/* Left gradient rail */}
        <div className="relative flex flex-shrink-0 flex-col justify-center overflow-hidden bg-[linear-gradient(135deg,#f8fbff,#eef4ff_60%,#e7eeff)] px-8 py-10 md:w-[340px] md:px-9 md:py-11">
          {/* Mobile close button (lives in the title section on small screens) */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-gray-500 transition-colors hover:bg-black/10 hover:text-gray-700 md:hidden"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          {/* Soft glow blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full opacity-50 blur-[40px]"
            style={{ background: '#ffd9b0' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full opacity-50 blur-[40px]"
            style={{ background: '#bcd2ff' }}
          />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-4 flex h-[235px] items-center justify-center">
              <AnimatedGlobe size={235} />
            </div>
            <Dialog.Title
              as="h2"
              className="text-[28px] font-bold leading-[1.12] tracking-[-0.02em] text-gray-900"
            >
              Open a funding opportunity
            </Dialog.Title>
            <p className="mt-3 text-base leading-[1.5] text-gray-600">
              The most efficient way to fund science.
            </p>
          </div>
        </div>

        {/* Right content */}
        <div className="relative flex flex-1 flex-col p-6 md:p-10">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 hidden h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 md:inline-flex"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {step === 'benefits' ? (
            <>
              <div className="mt-2 pr-10 md:mt-4">
                <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
                  Why fund on ResearchHub
                </h3>
              </div>

              <div className="mt-6 flex flex-col gap-5">
                {BENEFITS.map((benefit) => (
                  <div key={benefit.id} className="flex items-start gap-4">
                    <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                      {benefit.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold leading-[1.3] text-gray-900">
                        {benefit.title}
                      </div>
                      <div className="mt-0.5 text-sm leading-[1.5] text-gray-500">
                        {benefit.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="-mx-6 mt-8 border-t border-gray-200 px-6 pt-8 md:-mx-10 md:px-10">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href="/give"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: 'outlined' }),
                      'h-[46px] px-5 text-sm font-semibold'
                    )}
                  >
                    Learn more
                  </Link>
                  <Button
                    variant="default"
                    onClick={() => setStep('method')}
                    className="h-[46px] gap-2 px-5 text-sm font-semibold"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : step === 'method' ? (
            <>
              <button
                type="button"
                onClick={() => setStep('benefits')}
                className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="mt-5">
                <h3 className="text-lg font-semibold text-gray-900">How do you want to start?</h3>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                {CREATION_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      option.id === 'upload' ? setStep('upload') : onConfirm(option.id)
                    }
                    className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-rhBlue-300 hover:bg-blue-50/50"
                  >
                    <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                      {option.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold leading-[1.3] text-gray-900">
                        {option.title}
                      </div>
                      <div className="mt-0.5 text-sm leading-[1.5] text-gray-500">
                        {option.description}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-rhBlue-500" />
                  </button>
                ))}
              </div>

              <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                <span className="h-px flex-1 bg-gray-200" />
                or
                <span className="h-px flex-1 bg-gray-200" />
              </div>

              <a
                href={WHITE_GLOVE_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="group flex w-full items-center gap-4 rounded-xl border border-rhBlue-200 bg-blue-50/60 px-4 py-3.5 text-left transition-colors hover:border-rhBlue-300 hover:bg-blue-50"
              >
                <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-2xl bg-rhBlue-600">
                  <Sparkles className="h-[22px] w-[22px] text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold leading-[1.3] text-gray-900">
                    White-glove setup
                  </div>
                  <div className="mt-0.5 text-sm leading-[1.5] text-gray-500">
                    Book a 15-minute call and our team will set it up with you.
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-rhBlue-400 transition-colors group-hover:text-rhBlue-600" />
              </a>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('method')}
                disabled={isImporting}
                className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="mt-5">
                <h3 className="text-lg font-semibold text-gray-900">Upload your document</h3>
                <p className="mt-1 text-sm leading-[1.5] text-gray-500">
                  Import a Word, OpenDocument, or Markdown file and we&apos;ll set up your funding
                  opportunity from it.
                </p>
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
                  {isImporting
                    ? 'Importing your document\u2026'
                    : 'Click to upload or drag and drop'}
                </div>
                <div className="text-xs text-gray-500">
                  Word, OpenDocument, or Markdown · max 25 MB
                </div>
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
          )}
        </div>
      </div>
    </BaseModal>
  );
};
