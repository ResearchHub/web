'use client';

import Link from 'next/link';
import { ArrowRight, Sprout, X } from 'lucide-react';
import { memo } from 'react';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';

/**
 * Shared because the banner changes the layout around it: it renders above the
 * TopBar on mobile, so anything positioning itself against the top of the
 * screen has to know whether it is showing.
 */
export const ENDOWMENT_PROMO_BANNER_FEATURE = 'endowment_promo_banner';

const EndowmentPromoBannerComponent: React.FC = () => {
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(
    ENDOWMENT_PROMO_BANNER_FEATURE
  );

  if (dismissStatus !== 'checked' || isDismissed) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismissFeature();
  };

  return (
    <Link
      href="/endowment"
      className="tablet:!hidden relative flex items-center gap-3 px-4 py-2.5
        bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] text-white
        border-b border-[rgba(255,255,255,0.18)]
        active:opacity-90 transition-opacity"
      aria-label="ResearchHub Endowment - learn more"
    >
      <Sprout className="w-5 h-5 text-white flex-shrink-0" strokeWidth={2.2} aria-hidden />

      <span className="flex-1 min-w-0 leading-tight">
        <span className="block font-semibold text-[13px] truncate">ResearchHub Endowment</span>
        <span className="block text-[11px] text-white/85 truncate">
          Earn daily Funding Credits to fund science
        </span>
      </span>

      <ArrowRight className="w-4 h-4 text-white/90 flex-shrink-0" aria-hidden />

      <button
        type="button"
        onClick={handleDismiss}
        className="flex-shrink-0 -mr-1 p-1.5 rounded-full text-white/80 hover:text-white
          hover:bg-white/15 active:bg-white/25 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </Link>
  );
};

export const EndowmentPromoBanner = memo(EndowmentPromoBannerComponent);
