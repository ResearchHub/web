'use client';

import { Plus } from 'lucide-react';
import { NewDraftMenu } from '@/components/Funding/NewDraftMenu';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

/**
 * The phone top bar's "+", beside the avatar: the sidebar's Publish button in
 * one tap, the same RFP-or-proposal choice leading to a new draft in the
 * workspace. A visitor signs in first.
 */
export function TopBarPublishButton() {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { startNew } = useFundingDrafting();

  const startDraft = (intent: FundingIntent) => executeAuthenticatedAction(() => startNew(intent));

  return (
    <NewDraftMenu
      align="end"
      onSelect={startDraft}
      trigger={
        <button
          type="button"
          aria-label="Publish"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 data-[state=open]:bg-gray-800"
        >
          <Plus size={20} strokeWidth={2.25} aria-hidden="true" />
        </button>
      }
    />
  );
}
