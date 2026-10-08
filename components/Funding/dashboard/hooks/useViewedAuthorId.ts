'use client';

import { useEffect, useState } from 'react';
import { UserService } from '@/services/user.service';

interface UseViewedAuthorIdResult {
  /** The viewed user's author profile; undefined when they have none or it is still loading. */
  readonly authorId: number | undefined;
  readonly isLoading: boolean;
}

/**
 * The author profile behind the page's user, which their proposals, updates
 * and reviews are filed under. On their own page it is already known; for
 * the user a moderator is viewing, it comes from the moderator's user details.
 */
export function useViewedAuthorId({
  viewedUserId,
  isOwnPage,
  ownAuthorId,
}: {
  readonly viewedUserId: number | undefined;
  readonly isOwnPage: boolean;
  readonly ownAuthorId: number | undefined;
}): UseViewedAuthorIdResult {
  const lookUp = isOwnPage ? undefined : viewedUserId;
  const [found, setFound] = useState<{ userId: number; authorId: number | undefined }>();

  useEffect(() => {
    if (lookUp === undefined) return;
    let cancelled = false;
    UserService.fetchUserDetails(String(lookUp))
      .then((details) => {
        if (!cancelled)
          setFound({ userId: lookUp, authorId: details.authorProfileId ?? undefined });
      })
      .catch(() => {
        // Without it the page still shows what the user gave and their RFPs.
        if (!cancelled) setFound({ userId: lookUp, authorId: undefined });
      });
    return () => {
      cancelled = true;
    };
  }, [lookUp]);

  if (lookUp === undefined)
    return { authorId: isOwnPage ? ownAuthorId : undefined, isLoading: false };
  return {
    authorId: found?.userId === lookUp ? found.authorId : undefined,
    isLoading: found?.userId !== lookUp,
  };
}
