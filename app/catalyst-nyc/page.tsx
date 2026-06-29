import type { Metadata } from 'next';
import { CatalystFlow } from '@/components/events/catalyst/CatalystFlow';
import { CATALYST_NYC_EVENT } from '@/components/events/catalyst/constants';

export const metadata: Metadata = {
  title: CATALYST_NYC_EVENT.metadata.title,
  description: CATALYST_NYC_EVENT.metadata.description,
  // Event-specific QR landing; keep it out of search results.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Catalyst NYC landing: full-screen mobile flow for QR scans; desktop uses
 * PageLayout with a standard auth modal on Claim.
 */
export default function CatalystNycPage() {
  return <CatalystFlow />;
}
