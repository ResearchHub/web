'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import { ArrowRight, ArrowUpRight, CalendarClock, LayoutDashboard, X } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button, buttonVariants } from '@/components/ui/Button';
import { FundingTimeline } from '@/components/Funding/FundingTimeline';
import AnimatedGlobe from '@/components/Globe/AnimatedGlobe';
import { cn } from '@/utils/styles';

export type FundingOpportunityCreationMethod = 'template' | 'upload' | 'blank';

interface OpenFundingOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: FundingOpportunityCreationMethod) => void;
}

const WHITE_GLOVE_BOOKING_URL = 'https://cal.com/tyler-diorio/15min';
// Hidden for now; flip to bring the "Schedule 15 minute call" CTA back.
const SHOW_BOOKING_CTA = false;

export const OpenFundingOpportunityModal = ({
  isOpen,
  onClose,
  onConfirm,
}: OpenFundingOpportunityModalProps) => {
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  // A blank note rather than the template: the assistant drafts from nothing,
  // and its first move on an empty note is exactly that.
  const handleGetStarted = () => {
    startTransition(() => {
      onConfirm('blank');
    });
  };

  return (
    <BaseModal
      isOpen={isOpen || isPending}
      onClose={handleClose}
      showCloseButton={false}
      padding="p-0"
      className="md:!w-auto md:!h-auto md:!max-h-[88vh] md:!max-w-[860px] md:!rounded-2xl"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left gradient rail: a full panel with the globe on desktop, a short
            header band without it on phones. */}
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

          <div className="pr-10 md:mt-2">
            <h3 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl">
              How funding works
            </h3>
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
            <div className="flex flex-col-reverse gap-2.5 md:flex-row md:justify-end [&>*]:whitespace-nowrap">
              {SHOW_BOOKING_CTA && (
                <a
                  href={WHITE_GLOVE_BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  className={cn(
                    buttonVariants({ variant: 'outlined' }),
                    'h-[46px] w-full gap-2 px-4 text-sm font-semibold md:w-auto'
                  )}
                >
                  <CalendarClock className="h-4 w-4 hidden" aria-hidden="true" />
                  Schedule 15 minute call with team
                </a>
              )}
              <Button
                variant="default"
                onClick={handleGetStarted}
                disabled={isPending}
                className="h-[46px] w-full gap-2 px-4 text-sm font-semibold md:w-auto"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
