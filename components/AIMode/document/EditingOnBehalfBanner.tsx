'use client';

import { Shield } from 'lucide-react';
import { usePublishingController } from '@/components/Notebook/PublishingForm';
import { cn } from '@/utils/styles';

interface EditingOnBehalfBannerProps {
  readonly className?: string;
}

/**
 * Shown when a hub editor or moderator is editing a proposal or RFP they are
 * not listed on. Keeps the override visible in the workspace without changing
 * the published page chrome.
 */
export function EditingOnBehalfBanner({ className }: EditingOnBehalfBannerProps) {
  const { isEditingOnBehalf, articleType } = usePublishingController();
  if (!isEditingOnBehalf) return null;

  const copy =
    articleType === 'grant'
      ? 'Editing as editor — changes update this RFP on the funder’s behalf.'
      : 'Editing as editor — changes update this proposal on the author’s behalf.';

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-2.5 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2.5 text-sm text-primary-900',
        className
      )}
    >
      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
      <p className="min-w-0 font-medium leading-snug">{copy}</p>
    </div>
  );
}
