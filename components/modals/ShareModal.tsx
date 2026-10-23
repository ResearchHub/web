'use client';

import { useRef, useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { PartyPopper, Copy, Share } from 'lucide-react';
import SocialShareButtons from '@/components/SocialShareButtons';
import SharePostPreview from '@/components/SharePostPreview';
import { SidePanel } from '@/components/ui/SidePanel';
import { FULL_DRAWER_HEIGHT, SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGeneratedSharePost } from '@/hooks/useGeneratedSharePost';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';

export type ShareAction =
  | 'USER_OPENED_PROPOSAL'
  | 'USER_PEER_REVIEWED'
  | 'USER_FUNDED_PROPOSAL'
  | 'USER_SHARED_DOCUMENT';

interface ShareConfig {
  title: (docTitle: string, url: string) => React.ReactNode;
  description: (docTitle: string) => React.ReactNode;
  socialText: (docTitle: string) => string;
  IconComponent: React.ElementType;
}

export const SHARE_CONFIGS: Record<ShareAction, ShareConfig> = {
  USER_OPENED_PROPOSAL: {
    IconComponent: PartyPopper,
    title: (docTitle, url) => <>Congratulations on opening a proposal</>,
    description: (docTitle) => (
      <>
        Share a link to your proposal on social media to get more eyes on your work, including
        potential funders.
      </>
    ),
    socialText: (docTitle) => `New experiment proposal: ${docTitle}\n\n`,
  },
  USER_PEER_REVIEWED: {
    IconComponent: PartyPopper,
    title: (docTitle, url) => <>Thank you for your review</>,
    description: (docTitle) => (
      <>
        Thank you for reviewing{' '}
        <span className="font-semibold text-blue-600" title={docTitle}>
          {docTitle}
        </span>
        .{` `}Share your review with others.
      </>
    ),
    socialText: (docTitle) => `I just peer reviewed: ${docTitle} on ResearchHub!`,
  },
  USER_FUNDED_PROPOSAL: {
    IconComponent: PartyPopper,
    title: (docTitle, url) => <>You're a Research Champion!</>,
    description: (docTitle) => (
      <>
        Thank you for funding{' '}
        <span className="font-semibold text-blue-600" title={docTitle}>
          {docTitle}
        </span>
        .{` `}Your support is vital. Help us spread the word.
      </>
    ),
    socialText: (docTitle) => `I just funded: ${docTitle} on ResearchHub!`,
  },
  USER_SHARED_DOCUMENT: {
    IconComponent: Share,
    title: (docTitle, url) => {
      const getShareType = (url: string): string => {
        if (url.includes('/post/')) return 'Preprint';
        if (url.includes('/proposal/')) return 'Proposal';
        if (url.includes('/rfp/')) return 'Request for Proposal';
        if (url.includes('/report/')) return 'Registered Report';
        return '';
      };
      const type = getShareType(url);
      return <>Share {type}</>;
    },
    description: (docTitle: string) => (
      <>
        Help others discover{' '}
        <span className="font-semibold text-primary-600" title={docTitle}>
          {docTitle}
        </span>{' '}
        by sharing it on social media.
      </>
    ),
    socialText: (docTitle: string) => `${docTitle}`,
  },
};

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  docTitle: string;
  url: string;
  action: ShareAction;
  shouldShowConfetti?: boolean;
  /** Post id of a proposal or RFP; swaps the description for an AI-written post preview. */
  aiPostId?: number;
  /** The image the shared link's card shows on social sites. */
  previewImageUrl?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  docTitle,
  url,
  action,
  shouldShowConfetti = true,
  aiPostId,
  previewImageUrl,
}: ShareModalProps) {
  const config = SHARE_CONFIGS[action];
  const hasAiPost = aiPostId != null;
  const fallbackText = config.socialText(docTitle).trim();
  const generated = useGeneratedSharePost(isOpen ? aiPostId : null);
  const [draft, setDraft] = useState<string | null>(null);
  // While the draft is being written the preview shows a placeholder, but the
  // buttons still share the title so a quick click is never a dead end.
  const previewText = draft ?? generated.text ?? (generated.failed ? fallbackText : null);
  const [displayData, setDisplayData] = useState<{
    title: React.ReactNode;
    description: React.ReactNode;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalDimensions, setModalDimensions] = useState({ width: 0, height: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasOpened(true);
      setDraft(null);
      setDisplayData({
        title: config.title(docTitle, url),
        description: config.description(docTitle),
      });

      AnalyticsService.logEvent(LogEvent.SHARE_MODAL_OPENED, {
        action,
        docTitle,
        url,
      });
      setShowConfetti(shouldShowConfetti);
      const timeout = setTimeout(() => {
        if (modalRef.current) {
          const width = modalRef.current.offsetWidth;
          const height = modalRef.current.offsetHeight;
          setModalDimensions({ width, height });
        }
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setShowConfetti(false);
    }
  }, [isOpen, action, docTitle, url, shouldShowConfetti, config]);

  const handleCopy = () => {
    const urlWithUtm = new URL(url, window.location.origin);
    urlWithUtm.searchParams.set('utm_source', 'copy_url');
    urlWithUtm.searchParams.set('utm_medium', 'social_share');
    // Proposals and RFPs share their bare /<route>/<id> link as is.
    const finalUrl = hasAiPost ? url : urlWithUtm.toString();

    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    AnalyticsService.logEvent(LogEvent.CLICKED_SHARE_VIA_URL, {
      action,
      docTitle,
      url: finalUrl,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    AnalyticsService.logEvent(LogEvent.SHARE_MODAL_CLOSED, {
      action,
      docTitle,
      url,
    });
    onClose();
  };

  const copyLinkRow = (
    <div className="mt-1 flex rounded-md shadow-sm">
      <input
        type="text"
        name="share-url"
        id="share-url"
        className="focus:ring-blue-500 focus:border-blue-500 flex-1 rounded-none rounded-l-md text-sm border border-gray-300 bg-gray-50 p-2"
        value={url}
        readOnly
      />
      <button
        onClick={handleCopy}
        className="relative -ml-px inline-flex items-center space-x-2 px-4 py-2 rounded-r-md border border-gray-300 bg-rhBlue-500 text-white text-sm font-medium hover:bg-rhBlue-600 focus:outline-none focus:ring-1 focus:ring-rhBlue-500 focus:border-rhBlue-500"
      >
        <Copy size={16} />
        <span>Copy</span>
        {copied && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded">
            Copied!
          </span>
        )}
      </button>
    </div>
  );

  const confetti = showConfetti && modalDimensions.width > 0 && (
    <Confetti
      width={modalDimensions.width}
      height={modalDimensions.height}
      gravity={0.2}
      recycle={false}
      numberOfPieces={100}
      colors={['#f97316', '#3971ff']}
    />
  );

  // The same content in the phone's drawer and the desktop's side panel. Both
  // headers carry the title, so the body starts on the description.
  const shareContent = (
    <>
      {displayData && !hasAiPost && <p className="mb-6 text-gray-500">{displayData.description}</p>}

      {hasAiPost ? (
        <>
          <SharePostPreview
            text={previewText}
            isGenerated={generated.text !== null}
            docTitle={docTitle}
            url={url}
            imageUrl={previewImageUrl}
            onChange={setDraft}
          />

          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 text-center">Share on:</p>
            <SocialShareButtons
              action={action}
              docTitle={docTitle}
              url={url}
              text={previewText ?? fallbackText}
              addUtm={false}
            />
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 text-center">Or copy the link:</p>
            {copyLinkRow}
          </div>
        </>
      ) : (
        <>
          {copyLinkRow}

          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 text-center">Or share directly on:</p>
            <SocialShareButtons action={action} docTitle={docTitle} url={url} />
          </div>
        </>
      )}
    </>
  );

  // Phones get the whole screen, as a sheet that swipes down to close. Every
  // page carries this modal, so the drawer mounts on the first share only.
  if (isMobile) {
    if (!hasOpened) return null;
    return (
      <SwipeableDrawer
        isOpen={isOpen}
        onClose={handleClose}
        height={FULL_DRAWER_HEIGHT}
        header={
          <div className="border-b border-gray-200 pb-3 pr-10">
            <span className="text-lg font-semibold text-gray-900">
              {displayData?.title ?? 'Share'}
            </span>
          </div>
        }
      >
        <div ref={modalRef} className="relative pb-4">
          {confetti}
          {shareContent}
        </div>
      </SwipeableDrawer>
    );
  }

  // From the phone breakpoint up it slides in from the right, full height,
  // like the Fund panel, rather than opening over the middle of the page.
  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      widthClassName="w-full tablet:max-w-[440px]"
      title={
        <span className="flex min-w-0 items-center gap-2">
          <config.IconComponent className="h-5 w-5 flex-shrink-0 text-primary-500" aria-hidden />
          {displayData?.title ?? 'Share'}
        </span>
      }
    >
      <div ref={modalRef} className="relative min-h-full p-6">
        {confetti}
        {shareContent}
      </div>
    </SidePanel>
  );
}
