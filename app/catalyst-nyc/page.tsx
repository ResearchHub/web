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
 * Standalone full-screen mobile flow for the Catalyst NYC QR code. Renders
 * outside the app chrome (no PageLayout) so the designed arrival/auth screens
 * own the full viewport.
 */
export default function CatalystNycPage() {
  return <CatalystFlow />;
}
