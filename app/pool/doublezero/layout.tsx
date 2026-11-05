import { Metadata } from 'next';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';

const TITLE = 'Beyond Electromagnetic Communication';

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: TITLE,
    description:
      'Every signal on Earth goes around it. Neutrinos go straight through. The DoubleZero Foundation is funding the detectors, beams and protocols that turn a straight line through the planet into a working channel.',
    url: '/pool/doublezero',
    image: '/pool/doublezero/og.png',
  }),
  title: {
    default: TITLE,
    template: `%s | ${SITE_CONFIG.name}`,
  },
};

export default function DoubleZeroLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-white">
      <main className="relative">{children}</main>
    </div>
  );
}
