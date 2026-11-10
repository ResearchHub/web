import { Metadata } from 'next';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: 'Give to science on Giving Tuesday 2026',
    description:
      'Fund real research this Giving Tuesday. Give to science, or pick the RFP or project you care about. Every gift is matched 1:1.',
    url: '/giving-tuesday',
  }),
  title: {
    default: 'Give to science on Giving Tuesday 2026',
    template: `%s | ${SITE_CONFIG.name}`,
  },
};

export default function GivingTuesdayLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-white">
      <main className="relative">{children}</main>
    </div>
  );
}
