import { Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

type BannerVariant = 'cooldown' | 'review-info';

interface CommentEditorBannerProps {
  readonly variant: BannerVariant;
  readonly onDismiss: () => void;
  readonly formattedTimeRemaining?: string | null;
  readonly isMobile?: boolean;
}

const CooldownTooltipContent = (
  <div className="text-left">
    <div className="font-semibold text-sm text-gray-900 leading-tight">Review Cooldown</div>
    <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
      After submitting a review, users have a 4 day cooldown period before they can submit another.
    </div>
  </div>
);

const BANNER_CONFIG = {
  cooldown: {
    container: 'bg-red-50 border-red-200 text-red-800',
    button: 'bg-red-100 hover:bg-red-200 text-red-800',
  },
  'review-info': {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
  },
} as const;

export function CommentEditorBanner({
  variant,
  onDismiss,
  formattedTimeRemaining,
  isMobile,
}: CommentEditorBannerProps) {
  const config = BANNER_CONFIG[variant];

  return (
    <div
      className={`mb-3 flex items-center justify-between gap-3 border rounded-md p-2 sm:!p-3 text-xs sm:!text-sm ${config.container}`}
    >
      <div className="flex items-center gap-1.5">
        {variant === 'cooldown' ? (
          <>
            <span className="flex flex-col sm:!block">
              <span>You can write a Peer Review again in</span>
              <span className="font-semibold sm:!ml-1">{formattedTimeRemaining}</span>
            </span>
            {!isMobile && (
              <Tooltip content={CooldownTooltipContent} position="top" width="w-72">
                <Info className="h-4 w-4 cursor-help flex-shrink-0 text-red-600" />
              </Tooltip>
            )}
          </>
        ) : (
          <p>
            <span className="font-semibold">Add your review.</span> Be sure to view bounty
            description in the bounties tab before reviewing.
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notice"
        className={`flex-shrink-0 inline-flex items-center px-3 py-1.5 rounded text-xs font-medium ${config.button}`}
      >
        Got it
      </button>
    </div>
  );
}
