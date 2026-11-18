'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeftLong } from '@fortawesome/pro-solid-svg-icons';
import { useSmartBack } from '@/hooks/useSmartBack';

/**
 * Back, beside the logo: the app top bar's arrow and behaviour
 * (`useSmartBack`: the previous page when there is one, else the home page),
 * in the page's own colours.
 */
export function BackButton() {
  const goBack = useSmartBack();
  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Back"
      className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--o-text)] transition-colors hover:bg-[rgb(var(--o-text-rgb)/0.08)]"
    >
      <FontAwesomeIcon icon={faArrowLeftLong} fontSize={20} />
    </button>
  );
}
