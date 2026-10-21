'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { NonprofitLink } from '@/types/nonprofit';
import type { ID } from '@/types/root';

/** Who a proposal's money goes to, as its cover and byline name it. */
export interface WorkInstitution {
  name: string;
  /** Its page on Endaoment, which takes the donations. */
  href?: string;
  /**
   * Nonprofits only for now. Author profiles carry no current affiliation:
   * their `university` is never set and their education is where they studied.
   */
  kind: 'nonprofit';
  /** The lab or department the money is designated for, when the author named one. */
  note?: string;
}

interface WorkNonprofit {
  /** The fundraise the page looked it up for. */
  fundraiseId: ID;
  /** Its nonprofit, or null when the money goes to the researcher directly. */
  link: NonprofitLink | null;
}

const WorkNonprofitContext = createContext<WorkNonprofit | null>(null);

/**
 * Hands the nonprofit the proposal page loaded on the server to everything on
 * the page that names it, so none of them looks it up again. Without a
 * fundraise id (none, or the lookup failed) the hooks read as outside it.
 */
export function WorkInstitutionProvider({
  fundraiseId,
  nonprofit,
  children,
}: {
  fundraiseId?: ID;
  nonprofit: NonprofitLink | null;
  children: ReactNode;
}) {
  const value = useMemo(
    () => (fundraiseId == null ? null : { fundraiseId, link: nonprofit }),
    [fundraiseId, nonprofit]
  );
  return <WorkNonprofitContext.Provider value={value}>{children}</WorkNonprofitContext.Provider>;
}

/** The nonprofit the page loaded for a fundraise; undefined when it didn't load one for it. */
export function useWorkNonprofit(fundraiseId: ID | undefined): NonprofitLink | null | undefined {
  const loaded = useContext(WorkNonprofitContext);
  if (!loaded || fundraiseId == null || String(loaded.fundraiseId) !== String(fundraiseId)) {
    return undefined;
  }
  return loaded.link;
}

/** The nonprofit a proposal's money goes to, or null without one or outside the proposal page. */
export function useWorkInstitution(): WorkInstitution | null {
  const link = useContext(WorkNonprofitContext)?.link;
  return useMemo(() => {
    if (!link) return null;
    const { name, endaomentOrgId } = link.nonprofitDetails;
    return {
      name,
      // Endaoment's page for the org; its id redirects to the EIN's address.
      href: endaomentOrgId ? `https://app.endaoment.org/orgs/${endaomentOrgId}` : undefined,
      kind: 'nonprofit',
      note: link.note || undefined,
    };
  }, [link]);
}
