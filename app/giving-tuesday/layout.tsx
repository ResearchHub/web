import { Metadata } from 'next';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: 'Give to science on Giving Tuesday 2026',
    description:
      'Give to the science you care about this Giving Tuesday, from AI to cancer research. Every gift made before 2027 is matched 1:1.',
    url: '/giving-tuesday',
  }),
  title: {
    default: 'Give to science on Giving Tuesday 2026',
    template: `%s | ${SITE_CONFIG.name}`,
  },
  robots: { index: false, follow: false },
};

export default function GivingTuesdayLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-white">
      <main className="relative">{children}</main>
    </div>
  );
}
