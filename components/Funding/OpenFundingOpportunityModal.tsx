'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  File,
  LayoutDashboard,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { FundingTimeline } from '@/components/Funding/FundingTimeline';
import dynamic from 'next/dynamic';
import AnimatedGlobe from '@/components/Globe/AnimatedGlobe';
import { cn } from '@/utils/styles';

const DocumentUploadStep = dynamic(
  () => import('@/components/Funding/DocumentUploadStep').then((mod) => mod.DocumentUploadStep),
  { ssr: false }
);

export type FundingOpportunityCreationMethod = 'template' | 'upload' | 'blank';

interface OpenFundingOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: FundingOpportunityCreationMethod) => void;
  /**
   * Render a compact, single-column modal that jumps straight to the creation
   * method picker — no overview step and no decorative left rail. Used by entry
   * points (e.g. the notebook) where the user has already committed to opening
   * a funding opportunity.
   */
  minimal?: boolean;
}

interface CreationOption {
  id: FundingOpportunityCreationMethod;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const CREATION_OPTIONS: CreationOption[] = [
  {
    // A blank note rather than the template: the assistant drafts from
    // nothing, and its first move on an empty note is exactly that.
    id: 'blank',
    title: 'Start from scratch',
    description: 'Open a new RFP in your notebook',
    icon: <File className="h-[22px] w-[22px] text-rhBlue-600" />,
  },
  {
    id: 'upload',
    title: 'Upload a document',
    description: 'Import a Word, Markdown, or OpenDocument file',
    icon: <Upload className="h-[22px] w-[22px] text-rhBlue-600" />,
  },
];

const WHITE_GLOVE_BOOKING_URL = 'https://cal.com/tyler-diorio/15min';

type Step = 'overview' | 'method' | 'upload';

export const OpenFundingOpportunityModal = ({
  isOpen,
  onClose,
  onConfirm,
  minimal = false,
}: OpenFundingOpportunityModalProps) => {
  const initialStep: Step = minimal ? 'method' : 'overview';
  const [step, setStep] = useState<Step>(initialStep);
  const [pendingMethod, setPendingMethod] = useState<FundingOpportunityCreationMethod | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleConfirmMethod = (method: FundingOpportunityCreationMethod) => {
    setPendingMethod(method);
    startTransition(() => {
      onConfirm(method);
    });
  };

  // Reset to the first step whenever the modal is reopened so a returning user
  // always starts from the configured entry step rather than a stale step.
  // Skip while a route transition is pending so the method step doesn't flash
  // back to the initial step before navigation completes.
  useEffect(() => {
    if (!isOpen && !isPending) {
      setStep(initialStep);
      setPendingMethod(null);
    }
  }, [isOpen, initialStep, isPending]);

  return (
    <BaseModal
      isOpen={isOpen || isPending}
      onClose={handleClose}
      showCloseButton={false}
      padding="p-0"
      className={cn(
        'md:!w-auto md:!h-auto md:!max-h-[88vh] md:!rounded-2xl',
        minimal ? 'md:!max-w-[520px]' : 'md:!max-w-[860px]'
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* Left gradient rail: a full panel with the globe on desktop, a short
            header band without it on phones. */}
        {!minimal && (
          <div className="relative flex flex-shrink-0 flex-col justify-center overflow-hidden bg-[linear-gradient(135deg,#f8fbff,#eef4ff_60%,#e7eeff)] px-6 pb-6 pt-7 md:w-[340px] md:px-9 md:py-11">
            {/* Mobile close button (lives in the title section on small screens) */}
            <button
              type="button"
              onClick={handleClose}
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
            <div className="relative z-10 flex flex-col items-start pr-10 text-left md:items-center md:pr-0 md:text-center">
              <div className="mb-4 hidden h-[235px] w-[235px] items-center justify-center md:flex">
                <AnimatedGlobe size={235} />
              </div>
              <Dialog.Title
                as="h2"
                className="text-2xl font-bold leading-[1.15] tracking-[-0.02em] text-gray-900 md:text-[28px] md:leading-[1.12]"
              >
                Open a request for proposal
              </Dialog.Title>
              <p className="mt-1.5 text-[15px] leading-[1.5] text-gray-600 md:mt-3 md:text-base">
                The most efficient way to fund science.
              </p>
            </div>
          </div>
        )}

        {/* Right content */}
        <div className="relative flex flex-1 flex-col p-6 md:p-10">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 hidden h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 md:inline-flex"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {step === 'overview' ? (
            <>
              <div className="pr-10 md:mt-2">
                <h3 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl">
                  How funding works
                </h3>
                <p className="mt-1 text-sm leading-[1.5] text-gray-500 md:mt-1.5">
                  From your call for proposals to funded research.
                </p>
              </div>

              <FundingTimeline className="mt-5 md:mt-6" />

              <div className="mt-5 flex items-center gap-3.5 rounded-xl border border-rhBlue-200 bg-rhBlue-50 px-4 py-3.5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-rhBlue-100 bg-white text-rhBlue-600">
                  <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-[1.3] text-gray-900">
                    Track it all from your funder dashboard
                  </div>
                  <div className="mt-0.5 text-[13px] leading-[1.5] text-gray-600">
                    Proposals received, peer reviews, and payouts in one place.
                  </div>
                </div>
                <Link
                  href="/my-funding"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden flex-shrink-0 items-center gap-1 whitespace-nowrap text-[13px] font-semibold text-rhBlue-600 transition-colors hover:text-rhBlue-700 md:inline-flex"
                >
                  See it
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="-mx-6 mt-8 border-t border-gray-200 px-6 pt-5 md:-mx-10 md:px-10 md:pt-8">
                <div className="flex justify-end">
                  <Button
                    variant="default"
                    onClick={() => setStep('method')}
                    className="h-[46px] w-full gap-2 px-5 text-sm font-semibold md:w-auto"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : step === 'method' ? (
            <>
              {!minimal && (
                <button
                  type="button"
                  onClick={() => setStep('overview')}
                  className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              <div className={minimal ? 'mt-2 pr-10' : 'mt-5'}>
                <h3 className="text-lg font-semibold text-gray-900">How do you want to start?</h3>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                {CREATION_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      option.id === 'upload' ? setStep('upload') : handleConfirmMethod(option.id)
                    }
                    disabled={pendingMethod === option.id}
                    className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-rhBlue-300 hover:bg-blue-50/50 disabled:pointer-events-none disabled:opacity-60"
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
                onClick={handleClose}
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
            <DocumentUploadStep
              title="Upload your document"
              description="Import a Word, OpenDocument, or Markdown file and we'll set up your RFP from it."
              documentType="GRANT"
              onBack={() => setStep('method')}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </BaseModal>
  );
};
