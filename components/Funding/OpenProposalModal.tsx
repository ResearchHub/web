'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { ArrowLeft, ArrowRight, File, FileText, Globe, Lock, Upload, Users, X } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import AnimatedProposal from '@/components/Proposal/AnimatedProposal';
import { DocumentUploadStep } from '@/components/Funding/DocumentUploadStep';

export type ProposalCreationMethod = 'template' | 'upload' | 'blank';

interface OpenProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: ProposalCreationMethod) => void;
}

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const BENEFITS: Benefit[] = [
  {
    id: 'community',
    title: 'Reach a global community',
    description: 'Put your proposal in front of thousands of funders who care about your field.',
    icon: <Globe className="h-[22px] w-[22px] text-rhBlue-600" />,
  },
  {
    id: 'matching',
    title: 'Community matching',
    description: 'Your proposal is eligible for funding from institutions or community members.',
    icon: <Users className="h-[22px] w-[22px] text-rhBlue-600" />,
  },
  {
    id: 'open',
    title: 'Stay open & in control',
    description: 'You can control whether your proposal is public or visible to funders only.',
    icon: <Lock className="h-[22px] w-[22px] text-rhBlue-600" />,
  },
];

interface CreationOption {
  id: ProposalCreationMethod;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const CREATION_OPTIONS: CreationOption[] = [
  {
    id: 'template',
    title: 'From a template',
    description: 'Start with our guided proposal template',
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

type Step = 'benefits' | 'method' | 'upload';

export const OpenProposalModal = ({ isOpen, onClose, onConfirm }: OpenProposalModalProps) => {
  const [step, setStep] = useState<Step>('benefits');

  // Reset to the first step whenever the modal is reopened so a returning user
  // always starts from the benefits pitch rather than a stale method step.
  useEffect(() => {
    if (!isOpen) setStep('benefits');
  }, [isOpen]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      padding="p-0"
      className="md:!w-auto md:!h-auto md:!max-h-[88vh] md:!max-w-[860px] md:!rounded-2xl"
    >
      <div className="flex h-full flex-col md:flex-row">
        {/* Left visual rail */}
        <div className="relative flex flex-shrink-0 flex-col justify-center overflow-hidden bg-[linear-gradient(135deg,#f8fbff,#eef4ff_60%,#e7eeff)] px-8 py-8 md:w-[360px] md:px-9 md:py-8">
          {/* Mobile close button */}
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
            {/* AnimatedProposal scales via CSS transform, which keeps its full
                natural layout height (~367px) reserved. We pin the container to
                the *visual* height so the left rail doesn't tower over the
                right column and leave whitespace below the CTA. */}
            <div className="mb-2 flex h-[230px] items-center justify-center">
              <AnimatedProposal scale={0.66} />
            </div>
            <Dialog.Title
              as="h2"
              className="text-[26px] font-bold leading-[1.12] tracking-[-0.02em] text-gray-900"
            >
              Open a Proposal
            </Dialog.Title>
            <p className="mt-3 text-base leading-[1.5] text-gray-600">
              Turn your proposal into funded science.
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
              <div className="pr-10">
                <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                  Why publish on ResearchHub
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
                <div className="flex items-center justify-end">
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
                <h3 className="text-lg font-semibold text-gray-900">
                  How do you want to start your proposal?
                </h3>
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
            </>
          ) : (
            <DocumentUploadStep
              title="Upload your document"
              description="Import a Word, OpenDocument, or Markdown file and we'll set up your proposal from it."
              documentType="PREREGISTRATION"
              onBack={() => setStep('method')}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </BaseModal>
  );
};
