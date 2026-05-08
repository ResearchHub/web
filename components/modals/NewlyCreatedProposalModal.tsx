'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { ArrowLeft, ArrowRight, PartyPopper, Play, X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTiktok, faXTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { useUser } from '@/contexts/UserContext';

type Step = 1 | 2;

interface NewlyCreatedProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Step the modal opens on (resets each time the modal is reopened). Defaults to 1. */
  initialStep?: Step;
  /** Personalises the in-phone caption with the proposal's title. */
  proposalTitle?: string;
}

interface PlatformTile {
  name: string;
  href: string;
  icon: typeof faYoutube;
  iconClassName: string;
  iconStyle?: React.CSSProperties;
  ariaLabel: string;
}

const PLATFORM_TILES: PlatformTile[] = [
  {
    name: 'YouTube',
    href: 'https://youtube.com/upload',
    icon: faYoutube,
    iconClassName: 'bg-red-600',
    ariaLabel: 'Open YouTube in a new tab to upload your video',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: faInstagram,
    iconClassName: '',
    iconStyle: {
      background: 'linear-gradient(45deg, #feda77, #f58529, #dd2a7b, #8134af)',
    },
    ariaLabel: 'Open Instagram in a new tab to upload your video',
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com/upload',
    icon: faTiktok,
    iconClassName: 'bg-black',
    ariaLabel: 'Open TikTok in a new tab to upload your video',
  },
  {
    name: 'X',
    href: 'https://x.com/compose/post',
    icon: faXTwitter,
    iconClassName: 'bg-black',
    ariaLabel: 'Open X in a new tab to share your video',
  },
];

const OUTLINE = [
  {
    title: 'Hook / problem',
    description: 'What problem does this solve, and why does it matter?',
    time: '10-30s',
  },
  {
    title: 'Your approach',
    description: 'What are you proposing to do, and why is it novel?',
    time: '30-60s',
  },
  {
    title: 'Why you',
    description: 'What makes you or your team uniquely positioned?',
    time: '20-40s',
  },
  {
    title: 'The ask',
    description: "What funding do you need, and what's the deliverable?",
    time: '15-40s',
  },
];

export const NewlyCreatedProposalModal = ({
  isOpen,
  onClose,
  initialStep = 1,
  proposalTitle,
}: NewlyCreatedProposalModalProps) => {
  const [step, setStep] = useState<Step>(initialStep);

  // Re-sync to the requested initial step every time the modal reopens so a
  // consumer can deep-link to a specific step (e.g. "Show me how" → step 2).
  useEffect(() => {
    if (isOpen) setStep(initialStep);
  }, [isOpen, initialStep]);

  const handleClose = () => {
    onClose();
  };

  const footer =
    step === 1 ? (
      <div className="flex items-center justify-end gap-2.5">
        <Button
          variant="ghost"
          onClick={handleClose}
          className="h-[42px] px-5 text-sm font-semibold"
        >
          Maybe later
        </Button>
        <Button
          variant="default"
          onClick={() => setStep(2)}
          className="h-[42px] gap-2 px-5 text-sm font-semibold"
        >
          Show me how
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    ) : (
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          onClick={handleClose}
          className="h-[42px] px-5 text-sm font-semibold"
        >
          Close
        </Button>
      </div>
    );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton={false}
      padding="p-0"
      maxWidth="md:!max-w-[620px]"
      footer={footer}
    >
      <div className="relative">
        {step === 2 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="absolute top-4 left-4 z-10 inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Back to previous step"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {step === 1 ? <Step1 proposalTitle={proposalTitle} /> : <Step2 />}
      </div>
    </BaseModal>
  );
};

const Step1 = ({ proposalTitle }: { proposalTitle?: string }) => {
  return (
    <>
      <Dialog.Title as="div" className="sr-only">
        Now show funders who you are
      </Dialog.Title>
      <div className="grid grid-cols-[132px_1fr] items-center gap-6 px-9 pb-6 pt-9">
        <PhonePreview proposalTitle={proposalTitle} />
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-[13px] font-semibold text-rhBlue-600">
            <PartyPopper className="h-3.5 w-3.5" />
            <span>Congratulations on posting your proposal</span>
          </div>
          <h2 className="mb-1.5 text-[22px] font-bold leading-[1.25] tracking-[-0.01em] text-gray-900">
            Now show funders who you are.
          </h2>
          <p className="m-0 text-sm leading-[1.55] text-gray-600">
            Post a 1-3 minute pitch video and{' '}
            <span className="font-semibold text-gray-800">earn $50 towards your proposal</span>.
            Authors who share videos are significantly more likely to get funded.
          </p>
        </div>
      </div>

      <div className="mx-9 mb-6 flex items-center justify-center gap-2.5 rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5">
        <PayoutStep num={1} label="Post video" />
        <ArrowRight className="h-2.5 w-2.5 shrink-0 text-gray-400" />
        <PayoutStep num={2} label="Share link in Updates" />
        <ArrowRight className="h-2.5 w-2.5 shrink-0 text-gray-400" />
        <PayoutStep num={3} label="Get $50" />
      </div>
    </>
  );
};

const Step2 = () => {
  return (
    <>
      <div className="px-9 pb-4 pt-11 text-center">
        <Dialog.Title
          as="h2"
          className="m-0 mb-2 text-[26px] font-bold leading-[1.2] tracking-[-0.015em] text-gray-900"
        >
          A{' '}
          <span className="bg-gradient-to-r from-rhBlue-500 via-rhBlue-400 to-rhBlue-300 bg-clip-text font-bold text-transparent">
            1–3 minute
          </span>{' '}
          outline
        </Dialog.Title>
        <p className="m-0 mx-auto max-w-[420px] text-sm leading-[1.5] text-gray-500">
          A suggested structure to help you tell your story.
        </p>
      </div>

      <div className="mx-9 mt-2 mb-2 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {OUTLINE.map((row, i) => (
          <div
            key={row.title}
            className={cn(
              'grid grid-cols-[36px_1fr_auto] items-center gap-3.5 px-4 py-3.5',
              i > 0 && 'border-t border-gray-100'
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rhBlue-50 text-[13px] font-semibold text-rhBlue-500">
              {i + 1}
            </div>
            <div>
              <div className="mb-0.5 text-sm font-semibold text-gray-900">{row.title}</div>
              <div className="text-[13px] leading-[1.45] text-gray-500">{row.description}</div>
            </div>
            <div className="whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
              {row.time}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
          <span className="text-xs text-gray-500">4 sections · suggested outline</span>
          <span className="text-[13px] font-semibold text-gray-700">Total: 1–3 min</span>
        </div>
      </div>

      <div className="mx-9 mt-5 mb-1 text-center">
        <div className="text-[13px] font-semibold text-gray-900">Where to post your video</div>
      </div>

      <div className="mx-9 mt-3 mb-6 grid grid-cols-4 gap-2.5">
        {PLATFORM_TILES.map((tile) => (
          <a
            key={tile.name}
            href={tile.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tile.ariaLabel}
            className="group flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-3.5 transition-all duration-150 hover:-translate-y-px hover:border-rhBlue-300 hover:shadow-md"
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-[10px] text-white',
                tile.iconClassName
              )}
              style={tile.iconStyle}
            >
              <FontAwesomeIcon icon={tile.icon} className="text-[18px]" />
            </div>
            <div className="text-xs font-medium text-gray-700">{tile.name}</div>
          </a>
        ))}
      </div>
    </>
  );
};

const PayoutStep = ({ num, label }: { num: number; label: string }) => (
  <div className="flex shrink-0 items-center gap-2">
    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] border-gray-300 bg-white text-xs font-semibold text-gray-600">
      {num}
    </div>
    <div className="whitespace-nowrap text-[13px] font-medium text-gray-700">{label}</div>
  </div>
);

interface PhonePreviewProps {
  /** Title of the proposal — shown as the in-phone caption. Falls back to a placeholder. */
  proposalTitle?: string;
  className?: string;
}

/**
 * Decorative phone mock used in the new-proposal modal hero and the
 * PostVideoCallout. When a user is signed in, the bottom caption is
 * personalised with their avatar + name and the proposal's title; otherwise
 * it falls back to the original placeholder copy so the asset still reads
 * as a generic example (e.g. for marketing screenshots / SSR hydration).
 */
export const PhonePreview = ({ proposalTitle, className }: PhonePreviewProps = {}) => {
  const { user } = useUser();

  const displayName =
    user?.fullName?.trim() ||
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
    '@your_lab';
  const avatarUrl = user?.authorProfile?.profileImage;
  const displayTitle = proposalTitle?.trim() || 'Why we need to fund this…';

  return (
    <div
      className={cn(
        'relative aspect-[9/16] w-[132px] rounded-[22px] bg-gradient-to-br from-gray-800 to-gray-900 p-1.5 shadow-lg',
        className
      )}
    >
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[17px] p-3 text-white"
        style={{
          background:
            'linear-gradient(180deg, rgba(57,113,255,0) 0%, rgba(57,113,255,0.5) 100%), radial-gradient(circle at 30% 30%, #3971ff 0%, #1e3a8a 60%, #0b1530 100%)',
        }}
      >
        {/* Notch — absolute so screen p-3 doesn't push it down. */}
        <span
          className="absolute left-1/2 top-2 h-[5px] w-[50px] -translate-x-1/2 rounded-full bg-black opacity-50"
          aria-hidden
        />

        {/* Play button takes the middle space; caption row sits at the bottom of the padded area. */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-white/40 bg-white/20 text-white backdrop-blur-sm">
            <Play className="h-4 w-4 fill-white" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[9px] leading-[1.3]">
          {avatarUrl ? (
            // Decorative avatar inside the mock; img with empty alt so it's
            // skipped by AT (the surrounding mock isn't user content).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-3.5 w-3.5 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="h-3.5 w-3.5 shrink-0 rounded-full bg-white/30" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{displayName}</div>
            <div className="truncate opacity-85">{displayTitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
