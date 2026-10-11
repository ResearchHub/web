import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBullhorn, faFileSignature } from '@fortawesome/pro-light-svg-icons';

export type FundingKind = 'rfp' | 'proposal';

/** Shared document icons for publishing, thumbnails, and funding dashboards. */
export const FUNDING_KIND_ICON: Record<FundingKind, IconDefinition> = {
  rfp: faBullhorn,
  proposal: faFileSignature,
};
