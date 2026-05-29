'use client';

import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import { ArrowRight, Award, Users, X } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import Icon from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';

interface OpenFundingOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
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

export const OpenFundingOpportunityModal = ({
  isOpen,
  onClose,
  onConfirm,
}: OpenFundingOpportunityModalProps) => {
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
        <div className="relative flex flex-shrink-0 flex-col justify-center overflow-hidden bg-[linear-gradient(135deg,#3971ff,#4a7fff_55%,#5b8dff)] px-8 py-10 md:w-[340px] md:px-9 md:py-11">
          {/* Mobile close button (lives in the title section on small screens) */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 md:hidden"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          {/* Soft glow blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full opacity-55 blur-[34px]"
            style={{ background: '#a9c4ff' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full opacity-55 blur-[34px]"
            style={{ background: '#7aa4ff' }}
          />
          {/* Grid texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '38px 38px',
              opacity: 0.16,
              WebkitMaskImage: 'radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%)',
              maskImage: 'radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 78%)',
            }}
          />
          <div className="relative z-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25 bg-white/15 backdrop-blur-sm">
              <Icon name="fund" size={34} color="#ffffff" />
            </div>
            <Dialog.Title
              as="h2"
              className="mt-7 text-[32px] font-bold leading-[1.08] tracking-[-0.02em] text-white"
            >
              Open a funding opportunity
            </Dialog.Title>
            <p className="mt-3.5 text-base leading-[1.5] text-white/80">
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

          <div className="mt-1.5 flex flex-col gap-5">
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

                  {benefit.learnMoreHref && (
                    <Link
                      href={benefit.learnMoreHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-rhBlue-600 transition-colors hover:text-rhBlue-700"
                    >
                      Learn more
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="-mx-6 mt-8 border-t border-gray-200 px-6 pt-8 md:-mx-10 md:px-10">
            <div className="flex items-center justify-end">
              <Button
                variant="default"
                onClick={onConfirm}
                className="h-[46px] gap-2 px-5 text-sm font-semibold"
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
