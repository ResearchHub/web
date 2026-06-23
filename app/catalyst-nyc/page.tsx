import type { Metadata } from 'next';
import { CatalystFlow } from '@/components/catalyst/CatalystFlow';

export const metadata: Metadata = {
  title: 'Catalyst NYC — Join ResearchHub',
  description:
    'Catalyst NYC attendees: claim $500 in ResearchCoin to fund science. Sign up with the email you registered with.',
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
