import type { Metadata } from 'next';
import { CatalystFlow } from '@/components/events/catalyst/CatalystFlow';
import { CATALYST_NYC_EVENT } from '@/components/events/catalyst/constants';

export const metadata: Metadata = {
  title: CATALYST_NYC_EVENT.metadata.title,
  description: CATALYST_NYC_EVENT.metadata.description,
  robots: { index: false, follow: false, nocache: true },
};

export default function CatalystNycPage() {
  return <CatalystFlow />;
}
