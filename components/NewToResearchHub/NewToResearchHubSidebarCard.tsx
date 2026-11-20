'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { useUser } from '@/contexts/UserContext';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { cn } from '@/utils/styles';
import { HowItWorksSteps } from './HowItWorksSteps';

export const NEW_TO_RESEARCHHUB_FEATURE = 'new_to_researchhub';

/** Set once the visitor has opened the menu the card lives in, which clears the menu dot. */
const MENU_SEEN_KEY = 'new_to_researchhub_menu_seen';

const TITLE = 'New to ResearchHub?';

/** Shown to signed-out visitors until they dismiss it. */
function useNewToResearchHub() {
  const { user, isLoading } = useUser();
  const { isDismissed, dismissFeature, dismissStatus } = useDismissableFeature(
    NEW_TO_RESEARCHHUB_FEATURE
  );
  return {
    isEligible: !isLoading && !user && dismissStatus === 'checked' && !isDismissed,
    dismiss: dismissFeature,
  };
}

/**
 * How ResearchHub works, in the left sidebar above Help & resources, so every
 * page has it without making room for it. In the desktop column it is a tinted
 * row that opens the steps in a popover beside the column; in the slide-in menu
 * on smaller screens the steps show in place.
 */
export function NewToResearchHubSidebarCard({ inMenu = false }: { readonly inMenu?: boolean }) {
  const { isEligible, dismiss } = useNewToResearchHub();
  const [isOpen, setIsOpen] = useState(false);

  if (!isEligible) return null;

  if (inMenu) {
    return (
      <section
        aria-label={TITLE}
        className="relative mx-2 mb-2 rounded-xl bg-[#eef2ff] px-3.5 pb-1 pt-3 text-[#0b1530]"
      >
        <DismissButton onDismiss={dismiss} />
        <div className="flex items-center gap-2.5 pr-7">
          <Mark />
          <h2 className="text-[15px] font-bold">{TITLE}</h2>
        </div>
        <HowItWorksSteps className="mt-1 divide-[#dfe5fb]" />
        <LearnMore />
      </section>
    );
  }

  return (
    <div className="px-2 pb-1">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl bg-[#eef2ff] px-2 py-2 text-left text-[#0b1530] transition-colors hover:bg-[#e3e9ff] data-[state=open]:bg-[#e3e9ff]"
          >
            <Mark small />
            <span className="min-w-0 flex-1">
              <span className="block whitespace-nowrap text-[13px] font-semibold leading-5">
                {TITLE}
              </span>
              <span className="block text-xs leading-4 text-gray-600">See how it works</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent side="right" align="end" sideOffset={12} className="w-[360px] p-4 pt-3.5">
          <DismissButton
            onDismiss={() => {
              setIsOpen(false);
              dismiss();
            }}
          />
          <div className="flex items-center gap-2.5 pr-7">
            <Mark />
            <h2 className="text-[15px] font-bold text-gray-900">{TITLE}</h2>
          </div>
          <HowItWorksSteps className="mt-1" />
          <LearnMore />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * A dot on the top bar's menu button, below 1240px where the sidebar is a
 * slide-in menu, pointing at the card inside it until the menu is opened once.
 */
export function NewToResearchHubMenuDot({ isMenuOpen }: { readonly isMenuOpen: boolean }) {
  const { isEligible } = useNewToResearchHub();
  const [hasSeen, setHasSeen] = useState(true);

  useEffect(() => {
    try {
      setHasSeen(window.localStorage.getItem(MENU_SEEN_KEY) === '1');
    } catch {
      // Storage can be unavailable (private mode); no dot then.
    }
  }, []);

  useEffect(() => {
    if (!isMenuOpen || !isEligible) return;
    setHasSeen(true);
    try {
      window.localStorage.setItem(MENU_SEEN_KEY, '1');
    } catch {
      // Not remembered; the dot comes back next visit.
    }
  }, [isMenuOpen, isEligible]);

  if (!isEligible || hasSeen) return null;

  return (
    <span
      aria-hidden
      className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary-500 ring-2 ring-white"
    />
  );
}

function Mark({ small = false }: { readonly small?: boolean }) {
  const logo = small ? 24 : 28;
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-white',
        small ? 'h-8 w-8' : 'h-9 w-9'
      )}
    >
      <Logo noText size={{ height: logo, width: logo }} />
    </span>
  );
}

function DismissButton({ onDismiss }: { readonly onDismiss: () => void }) {
  return (
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss"
      className="absolute right-1.5 top-1.5 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
    >
      <X className="h-4 w-4" />
    </button>
  );
}

function LearnMore({ className }: { readonly className?: string }) {
  return (
    <Link
      href="/about"
      className={cn(
        'inline-flex items-center gap-1 py-2 text-sm font-semibold text-gray-900 transition-colors hover:text-primary-600',
        className
      )}
    >
      Learn more
      <ChevronRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}
